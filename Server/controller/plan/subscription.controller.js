import Subscription from "../../model/subscription.model.js";
import User from "../../model/user.model.js";
import { errorHandler } from "../../utils/error.js";

export const getSubscriptionStats = async (req, res, next) => {
  try {
    const total_active_subscribers = await Subscription.countDocuments({
      status: { $in: ["active", "trial"] },
    });

    return res.status(200).json({
      success: true,
      total_active_subscribers,
    });
  } catch (error) {
    next(error);
  }
};

export const getExpiredUsers = async (req, res) => {
  try {
    const { days = 0 } = req.query;
    const today = new Date();

    const subscriptions = await Subscription.find({
      status: { $in: ["expired", "past_due", "cancelled"] },
    }).populate("user", "username email");

    const result = subscriptions
      .map((sub) => {
        // expiry date fallback logic
        const expiryDate =
          sub.current_period_end || sub.trial_ends_at;

        if (!expiryDate) return null;

        const diffTime = today - new Date(expiryDate);
        const diffDays = Math.floor(
          diffTime / (1000 * 60 * 60 * 24)
        );

        return {
          user: sub.user?.username || "Unknown",
          email: sub.user?.email || "No Email",
          days: diffDays,
          status: sub.status,
        };
      })
      .filter(
        (item) => item && item.days >= Number(days)
      )
      .sort((a, b) => b.days - a.days); // most expired first

    return res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching expired users:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching expired users",
    });
  }
};