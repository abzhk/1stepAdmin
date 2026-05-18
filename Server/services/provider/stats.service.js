import mongoose from "mongoose";
import { Booking } from "../../models/booking.model.js";
import SessionNote from "../../models/sessionNote.model.js";
import moment from "moment";

/**
 * Get provider's recent booking activity for the specified time period
 * @param {string} providerId - Provider's MongoDB ObjectId
 * @param {number} limit - Maximum number of bookings to return (default: 10)
 * @param {number} days - Number of days to look back (default: 14)
 * @returns {Promise<Array>} Array of recent bookings with patient details
 */
export const getProviderRecentActivity = async (
    providerId,
    limit = 10,
    days = 14,
) => {
    try {
        const cutoffDate = moment().subtract(days, "days").startOf("day").toDate();

        const recentActivity = await Booking.aggregate([
            {
                $match: {
                    provider: new mongoose.Types.ObjectId(providerId),
                    createdAt: { $gte: cutoffDate },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "patient",
                    foreignField: "_id",
                    as: "patientDetails",
                },
            },
            {
                $unwind: {
                    path: "$patientDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $limit: limit,
            },
            {
                $project: {
                    bookingId: 1,
                    patientName: 1,
                    patientSnapshot: 1,
                    "patientDetails._id": 1,
                    "patientDetails.username": 1,
                    "patientDetails.profilePicture": 1,
                    service: 1,
                    sessionType: 1,
                    scheduledTime: 1,
                    status: 1,
                    createdAt: 1,
                },
            },
        ]);

        return recentActivity;
    } catch (error) {
        throw new Error(
            `Failed to fetch provider recent activity: ${error.message}`,
        );
    }
};

/**
 * Get provider's dashboard statistics
 * @param {string} providerId - Provider's MongoDB ObjectId
 * @returns {Promise<Object>} Statistics object
 */
export const getProviderDashboardStats = async (providerId) => {
    try {
        const id = new mongoose.Types.ObjectId(providerId);
        const todayStart = moment().startOf("day").toDate();
        const todayEnd = moment().endOf("day").toDate();

        // 1. Total Parents (Unique Patients)
        const totalPatientsResult = await Booking.aggregate([
            { $match: { provider: id } },
            { $group: { _id: "$patient" } },
            { $count: "count" },
        ]);
        const totalPatients = totalPatientsResult[0]?.count || 0;

        // 2. Sessions Today
        const sessionsToday = await Booking.countDocuments({
            provider: id,
            "scheduledTime.date": { $gte: todayStart, $lte: todayEnd },
            status: { $in: ["approved", "completed"] },
        });

        // 3. Hours Scheduled (Assuming 1 hour per today's session)
        const hoursScheduled = sessionsToday; // Simplification as requested

        // 4. Pending Notes (Completed bookings without a session note)
        const completedBookings = await Booking.find({
            provider: id,
            status: "completed",
        }).select("_id");

        const completedBookingIds = completedBookings.map((b) => b._id);
        const existingNotes = await SessionNote.find({
            booking: { $in: completedBookingIds },
        }).select("booking");

        const noteBookingIds = new Set(existingNotes.map((n) => n.booking.toString()));
        const pendingNotes = completedBookingIds.filter(
            (id) => !noteBookingIds.has(id.toString()),
        ).length;

        return {
            totalPatients,
            sessionsToday: sessionsToday.toString(),
            hoursScheduled: `${hoursScheduled}h`,
            pendingNotes: pendingNotes.toString(),
        };
    } catch (error) {
        throw new Error(
            `Failed to calculate provider dashboard stats: ${error.message}`,
        );
    }
};
