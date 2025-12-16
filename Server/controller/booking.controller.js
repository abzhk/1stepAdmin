import { Booking } from "../model/booking.model.js";
import { BookedSlots } from "../model/booking.model.js";
import { errorHandler } from "../utils/error.js";
import User from "../model/user.model.js";
import Provider from "../model/provider.model.js";
import mongoose from "mongoose";
import moment from "moment";
import nodemailer from "nodemailer";

//service
// import { getParentBookingStats } from "../services/parent/stats.service.js";

// import { v4 as uuidv4 } from "uuid";

export const booking = async (req, res, next) => {
  const {
    patient,
    provider,
    scheduledTime: { date, slot },
  } = req.body;
  try {
    const patientExist = await User.findById(patient);
    const providerExist = await Provider.findById(provider);
    if (!patientExist || !providerExist) {
      return next(errorHandler(404, "Patient or provider not found"));
    }

    const existBookedSlots = await BookedSlots.findOne({
      provider: provider,
      bookedSlots: { $elemMatch: { date: date, slot: slot } },
    });
    if (existBookedSlots) {
      return res
        .status(400)
        .json({ message: "Slot already booked", success: false });
    }

    //create booking unqiue id
    const bookingId = `BOOK-${new Date()
      .toISOString()
      .split("T")[0]
      .replace(/-/g, "")}-${uuidv4().slice(0, 6)}`;

    const newBooking = await Booking.create({ ...req.body, bookingId });
    const io = req.app.get("io");

    if (io) {
      const providerRoom = `booking_provider_${provider.toString()}`;

      const populatedBooking = await Booking.findById(newBooking._id)
        .populate({
          path: "provider",
          select:
            "name profilePicture fullName address.city address.state address.pincode",
        })
        .select(
          "createdAt note bookingId patientName scheduledTime status sessionType service provider"
        )
        .lean();

      if (populatedBooking) {
        populatedBooking.patientDetails = populatedBooking.provider;
        delete populatedBooking.provider;
      }

      io.to(providerRoom).emit("bookingUpdated", {
        type: "new_booking",
        booking: populatedBooking,
      });
    }
    res.status(201).json(newBooking);

    //expire slot after 24 hours
    const bookingDate = new Date(date);
    const expireDate = new Date(bookingDate);
    expireDate.setDate(bookingDate.getDate() + 1);

    await BookedSlots.create({
      provider,
      bookedSlots: { date: date, slot: slot, expireAt: expireDate },
    });
  } catch (error) {
    next(error);
  }
};

export const getBookingProvider = async (req, res, next) => {
  try {
    const providerId = new mongoose.Types.ObjectId(req.params.id);

    const limit = parseInt(req.query.limit) || 8;
    const startIndex = parseInt(req.query.startIndex) || 0;

    const startOfCurrentMonth = moment().startOf("month").toDate();
    const endOfCurrentMonth = moment().endOf("month").toDate();
    const startOfLastMonth = moment()
      .subtract(1, "months")
      .startOf("month")
      .toDate();
    const endOfLastMonth = moment()
      .subtract(1, "months")
      .endOf("month")
      .toDate();

    const getCounts = async (start, end) => {
      const counts = await Booking.aggregate([
        {
          $match: {
            provider: providerId,
            createdAt: { $gte: start, $lte: end },
          },
        },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);

      const totalCount = await Booking.countDocuments({
        provider: providerId,
        createdAt: { $gte: start, $lte: end },
      });

      return {
        total: totalCount,
        pending: counts.find((c) => c._id === "pending")?.count || 0,
        completed: counts.find((c) => c._id === "completed")?.count || 0,
        approved: counts.find((c) => c._id === "approved")?.count || 0,
        rejected: counts.find((c) => c._id === "rejected")?.count || 0,
      };
    };

    const currentCounts = await getCounts(
      startOfCurrentMonth,
      endOfCurrentMonth
    );
    const lastCounts = await getCounts(startOfLastMonth, endOfLastMonth);

    const calculateChange = (current, previous) => {
      if (!previous) return current ? "1.00" : "0.00";
      const multiplier = (current / previous).toFixed(2);
      return `${multiplier}`;
    };

    const stats = {
      totalAppointments: {
        count: currentCounts.total || 0,
        change: calculateChange(
          currentCounts.total || 0,
          lastCounts.total || 0
        ),
      },
      completedAppointments: {
        count: currentCounts.completed || 0,
        change: calculateChange(
          currentCounts.completed || 0,
          lastCounts.completed || 0
        ),
      },
      pendingAppointments: {
        count: currentCounts.pending || 0,
        change: calculateChange(
          currentCounts.pending || 0,
          lastCounts.pending || 0
        ),
      },
      rejectedAppointments: {
        count: currentCounts.rejected || 0,
        change: calculateChange(
          currentCounts.rejected || 0,
          lastCounts.rejected || 0
        ),
      },
      approveAppointments: {
        count: currentCounts.approved || 0,
        change: calculateChange(
          currentCounts.approved || 0,
          lastCounts.approved || 0
        ),
      },
    };

    const bookingDetails = await Booking.aggregate([
      { $match: { provider: providerId } },
      {
        $lookup: {
          from: "users",
          localField: "patient",
          foreignField: "_id",
          as: "patientDetails",
        },
      },
      { $unwind: "$patientDetails" },
      {
        $project: {
          "patientDetails.profilePicture": 1,
          "patientDetails.username": 1,
          patientName: 1,
          createdAt: 1,
          note: 1,
          scheduledTime: 1,
          status: 1,
          sessionType: 1,
          service: 1,
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: startIndex },
      { $limit: limit },
    ]);

    const providerCount = await Booking.countDocuments({
      provider: providerId,
    });

    res.status(200).json({ bookingDetails, providerCount, stats });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const getParentBookings = async (req, res) => {
  const { parentId } = req.params;
  const { limit = 8, startIndex = 0, search = "", status } = req.query;

  try {
    const matchStage = {
      patient: new mongoose.Types.ObjectId(parentId),
    };

    if (search) {
      matchStage.$or = [
        { "providerDetails.fullName": { $regex: search, $options: "i" } },
        { service: { $regex: search, $options: "i" } },
      ];
    }

    if (status && status !== "all") {
      matchStage.status = status;
    }

    const aggregation = [
      {
        $lookup: {
          from: "providers",
          localField: "provider",
          foreignField: "_id",
          as: "providerDetails",
        },
      },
      { $unwind: "$providerDetails" },

      { $match: matchStage },

      { $sort: { createdAt: -1 } },
      { $skip: parseInt(startIndex) },
      { $limit: parseInt(limit) },

      {
        $project: {
          "providerDetails._id": 1,
          "providerDetails.name": 1,
          "providerDetails.profilePicture": 1,
          "providerDetails.fullName": 1,
          "providerDetails.address.city": 1,
          "providerDetails.address.state": 1,
          "providerDetails.address.pincode": 1,
          createdAt: 1,
          note: 1,
          bookingId: 1,
          patientName: 1,
          scheduledTime: 1,
          status: 1,
          sessionType: 1,
          service: 1,
        },
      },
    ];

    const [userBookings, countBookings] = await Promise.all([
      Booking.aggregate(aggregation),
      Booking.countDocuments(matchStage),
    ]);

    res.status(200).json({ userBookings, countBookings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const approveBooking = async (req, res, next) => {
  const { id: bookingId } = req.params;

  try {
    const bookingApprove = await Booking.findByIdAndUpdate(
      bookingId,
      { status: "approved" },
      { new: true }
    );
    if (!bookingApprove) {
      return next(errorHandler(404, "Booking not found"));
    }

    const io = req.app.get("io");

    if (io) {
      const providerRoom = `booking_provider_${bookingApprove.provider.toString()}`;
      const patientRoom = `booking_patient_${bookingApprove.patient.toString()}`;

      const updateData = {
        type: "status_change",
        bookingId: bookingApprove._id,
        status: "approved",
        updatedAt: new Date().toISOString(),
        bookingData: bookingApprove,
      };

      io.to(providerRoom).emit("bookingUpdated", updateData);
      io.to(patientRoom).emit("bookingUpdated", updateData);
    }
    res.status(200).json({ bookingApprove: bookingApprove, success: true });
  } catch (error) {
    next(error);
  }
};

export const rejectBooking = async (req, res, next) => {
  const { id: bookingId } = req.params;

  try {
    const bookingReject = await Booking.findByIdAndUpdate(
      bookingId,
      { status: "rejected" },
      { new: true }
    );
    if (!bookingReject) {
      return next(errorHandler(404, "Booking not found"));
    }
    const io = req.app.get("io");
    const providerRoom = `booking_provider_${bookingReject.provider.toString()}`;
    const patientRoom = `booking_patient_${bookingReject.patient.toString()}`;
    if (io) {
      const updateData = {
        type: "status_change",
        bookingId: bookingReject._id,
        status: "rejected",
        providerId: bookingReject.provider,
        patientId: bookingReject.patient,
        bookingData: bookingReject,
      };
      io.to(providerRoom).emit("bookingUpdated", updateData);
      io.to(patientRoom).emit("bookingUpdated", updateData);
    }
    res.status(200).json({ bookingReject: bookingReject, success: true });
  } catch (error) {
    next(error);
  }
};

export const getUpcomingSessions = async (req, res) => {
  const { parentId } = req.params;
  const { limit = 5 } = req.query;

  try {
    const aggregation = [
      {
        $match: {
          patient: new mongoose.Types.ObjectId(parentId),
          "scheduledTime.date": { $gte: new Date().toISOString() }, // only future sessions
        },
      },
      {
        $lookup: {
          from: "providers",
          localField: "provider",
          foreignField: "_id",
          as: "providerDetails",
        },
      },
      { $unwind: "$providerDetails" },

      {
        $sort: { "scheduledTime.date": 1 }, // soonest session first
      },
      {
        $limit: parseInt(limit), // apply limit
      },
      {
        $project: {
          "providerDetails._id": 1,
          "providerDetails.fullName": 1,
          "providerDetails.profilePicture": 1,
          "providerDetails.address.city": 1,
          "providerDetails.address.state": 1,
          "providerDetails.address.pincode": 1,
          scheduledTime: 1,
          sessionType: 1,
          service: 1,
          bookingId: 1,
          status: 1,
          createdAt: 1,
        },
      },
    ];

    const upcomingSessions = await Booking.aggregate(aggregation);

    res.status(200).json({ success: true, upcomingSessions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const bookingemail = async (req, res, next) => {
  const {
    email,
    subject,
    providerName,
    providerProfile,
    service,
    name,
    slot,
    date,
  } = req.body;

  try {
    let info = await transporter.sendMail({
      to: email,
      subject: subject,
      html: `
      <div style="font-family: Arial, sans-serif; padding:30px; background-color:#d4f9fa">
      <div>
      <a href="https://1step.co.in">
      <img src="https://i.ibb.co/XkLWHsZ/logo.png" alt="1step" />
      </a>
      </div>
      <p style="color: #333; font-size: 18px;">Hi, <span style="">${name}</span></p>
      <div style="text-align:center;">
      <img src="${providerProfile}" alt="Provider Profile Picture" width="100" height="100"style="border-radius:50%;"/>
      <h1 style="color: #333; font-size: 28px;">${providerName}</h1>
      <h1 style="color: #333; font-size: 18px; text-align:center;">APPOINTMENT APPROVED</h1>
      <p style="color: #333; font-size: 18px;">Service: ${service}</p>
      <p style="color: #333; font-size: 18px;">Booked Time: ${date} ${slot}</p>
      <p style="font-size: 18px;">Please arrive 10 minutes early to your appointment.</p>
      <p style="font-size: 18px;">Thank you for choosing our services.</p>
      </div>
      </div>
      `,
    });
    res.status(200).json({ success: true, message: "Email sent" });
  } catch (error) {
    next(error);
  }
};

function calculatePercentage(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return (((current - previous) / previous) * 100).toFixed(1);
}

export const getParentStats = async (req, res, next) => {
  const { parentId } = req.params;

  try {
    const stats = await getParentBookingStats(parentId);

    res.json({
      success: true,
      data: {
        totalSessions: stats.total,
        monthlyComparison: {
          current: stats.currentMonth,
          previous: stats.lastMonth,
          percentageChange: calculatePercentage(
            stats.currentMonth,
            stats.lastMonth
          ),
        },
        upcomingSessions: stats.upcoming,
        sessionTypes: {
          virtual: stats.virtualSessions,
          inPerson: stats.currentMonth - stats.virtualSessions,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const MAX_DAY_RANGE = 365;

export const getStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const providerId = req.params.providerId;

    if (!mongoose.Types.ObjectId.isValid(providerId)) {
      return res.status(400).json({ error: "Invalid provider ID" });
    }

    const dataFilter = {};

    if (startDate && endDate) {
      const diffDays = moment(endDate).diff(moment(startDate), "days");
      if (diffDays > MAX_DAY_RANGE) {
        return res.status(400).json({
          error: `Max date range exceededd (${MAX_DAY_RANGE} days)`,
          status: false,
        });
      }
      dataFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };

      const stats = await Booking.aggregate([
        {
          $match: {
            provider: mongoose.Types.ObjectId(req.params.providerId),
            ...dataFilter,
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            count: { $sum: 1 },

            completed: {
              $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
            },
            pending: {
              $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]);
    }
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: "Internal server error", status: false });
  }
};