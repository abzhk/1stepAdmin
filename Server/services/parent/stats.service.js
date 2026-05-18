import mongoose from "mongoose";
import { Booking } from "../../models/booking.model.js";
import moment from "moment";

export const getParentBookingStats = async (parentId) => {
  try {
    const now = new Date();
    const currentMonthStart = moment().startOf("month").toDate();
    const nextMonthStart = moment().add(1, "month").startOf("month").toDate();
    const lastMonthStart = moment().subtract(1, "month").startOf("month").toDate();
    const lastMonthEnd = moment().subtract(1, "month").endOf("month").toDate();
    const next7Days = moment().add(7, "days").endOf("day").toDate();

    const statsPipeline = [
      {
        $match: {
          patient: new mongoose.Types.ObjectId(parentId),
        },
      },
      {
        $facet: {
          // Dashboard Stats (Current Month ONLY - as requested)
          currentMonthStats: [
            {
              $match: {
                "scheduledTime.date": { $gte: currentMonthStart, $lt: nextMonthStart }
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                approved: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
                completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
                pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
                rejected: {
                  $sum: {
                    $cond: [{ $in: ["$status", ["rejected", "cancelled", "expired"]] }, 1, 0]
                  }
                },
                virtual: { $sum: { $cond: [{ $eq: ["$sessionType", "virtual"] }, 1, 0] } },
              }
            }
          ],

          // Previous Month Stats (for trend calculation)
          lastMonthStats: [
            {
              $match: {
                "scheduledTime.date": { $gte: lastMonthStart, $lte: lastMonthEnd }
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: 1 }
              }
            }
          ],

          // Monthly Comparison (Approved/Completed sessions only for chart)
          monthlyComparisonApproved: [
            { $match: { status: { $in: ["approved", "completed"] } } },
            {
              $bucket: {
                groupBy: "$scheduledTime.date",
                boundaries: [lastMonthStart, currentMonthStart, nextMonthStart],
                default: "other",
                output: { count: { $sum: 1 } },
              },
            },
          ],

          // Global/Upcoming Stats
          otherStats: [
            {
              $group: {
                _id: null,
                totalAllTime: { $sum: 1 },
                upcomingApproved: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ["$status", "approved"] },
                          { $gte: ["$scheduledTime.date", now] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                pending7Days: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ["$status", "pending"] },
                          { $gte: ["$scheduledTime.date", now] },
                          { $lte: ["$scheduledTime.date", next7Days] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ],
        },
      },
    ];

    const [results] = await Booking.aggregate(statsPipeline);

    const monthData = results.currentMonthStats[0] || {};
    const lastMonthData = results.lastMonthStats[0] || {};
    const others = results.otherStats[0] || {};
    const monthlyApproved = results.monthlyComparisonApproved || [];

    const currentApproved = monthlyApproved.find(m => m._id instanceof Date && m._id.getTime() === currentMonthStart.getTime());
    const lastApproved = monthlyApproved.find(m => m._id instanceof Date && m._id.getTime() === lastMonthStart.getTime());

    // Calculate this month's sessions (Approved + Completed) for the dashboard card
    const thisMonthSessions = (monthData.approved || 0) + (monthData.completed || 0);

    // Calculate trend percentage (current month vs last month)
    const currentTotal = monthData.total || 0;
    const lastTotal = lastMonthData.total || 0;
    let trendPercentage = 0;

    if (lastTotal === 0 && currentTotal > 0) {
      trendPercentage = 100; // First month with bookings
    } else if (lastTotal > 0) {
      trendPercentage = Number((((currentTotal - lastTotal) / lastTotal) * 100).toFixed(1));
    }

    return {
      // Dashboard Metrics (Context: Parent Dashboard main view)
      totalSessions: thisMonthSessions,
      upcomingSessions: others.upcomingApproved || 0,
      currentMonthCount: currentApproved?.count || 0,
      lastMonthCount: lastApproved?.count || 0,
      virtualSessions: monthData.virtual || 0,

      // Bookings Page Metrics (Context: ParentBooking.jsx cards/ratio)
      totalAllTime: others.totalAllTime || 0,
      thisMonthBookings: monthData.total || 0, // ALL bookings this month (includes rejected)
      lastMonthBookings: lastTotal, // Previous month's total bookings
      trendPercentage, // Percentage change
      pending7Days: others.pending7Days || 0,
      approvedCount: monthData.approved || 0,  // This month's approved
      rejectedCount: monthData.rejected || 0,  // This month's rejected
      pendingCount: monthData.pending || 0,    // This month's pending
    };
  } catch (error) {
    throw new Error(`Unified stats fetch failed: ${error.message}`);
  }
};
