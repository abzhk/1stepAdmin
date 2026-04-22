import Stats from "../model/stats.model.js";
import User from "../model/user.model.js";
import Parent from "../model/parent.model.js";
import Provider from "../model/provider.model.js";
import { errorHandler } from "../utils/error.js";


export const getStats = async (req, res,next) => {
  try {
    const stats = await Stats.findOne({});
    if (!stats) {
      return next(errorHandler(404,"stats not found"))
    }
    res.json(stats);
  } catch (err) {
    console.error("Error fetching stats:", err);
    return next(errorHandler(500, "Error fetching stats"));
  }
};





export const getStatistics = async (req, res) => {
  try {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const users = await User.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      }
    ]);

    const parents = await Parent.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      }
    ]);

    const providers = await Provider.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      }
    ]);

    const result = months.map((month, index) => {
      const userItem = users.find((item) => item._id === index + 1);
      const parentItem = parents.find((item) => item._id === index + 1);
      const providerItem = providers.find((item) => item._id === index + 1);

      return {
        name: month,
        user: userItem ? userItem.count : 0,
        parent: parentItem ? parentItem.count : 0,
        provider: providerItem ? providerItem.count : 0,
      };
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return next(errorHandler(500, "Error fetching statistics"));
  }
};