import Subscription from "../../model/subscription.model.js";

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