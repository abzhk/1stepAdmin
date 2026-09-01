import Stats from "../model/stats.model.js";
import User from "../model/user.model.js";
import Parent from "../model/parent.model.js";
import Provider from "../model/provider.model.js";
import { errorHandler } from "../utils/error.js";


export const getStats = async (req, res, next) => {
  try {
    const [stats, totalParents] = await Promise.all([
      Stats.findOne({}).lean(),
      Parent.countDocuments(),
    ]);

    if (!stats) {
      return next(errorHandler(404, "stats not found"));
    }

    res.status(200).json({
      ...stats,
      totalParents,
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
    return next(errorHandler(500, "Error fetching stats"));
  }
};





export const getStatistics = async (req, res, next) => {
  try {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const [users, parents, providers] = await Promise.all([
      User.aggregate([
        {
          $group: {
            _id: { $month: "$createdAt" },
            count: { $sum: 1 }
          }
        }
      ]),

      Parent.aggregate([
        {
          $group: {
            _id: { $month: "$createdAt" },
            count: { $sum: 1 }
          }
        }
      ]),

      Provider.aggregate([
        {
          $group: {
            _id: { $month: "$createdAt" },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const userMap = new Map(
      users.map((item) => [item._id, item.count])
    );

    const parentMap = new Map(
      parents.map((item) => [item._id, item.count])
    );

    const providerMap = new Map(
      providers.map((item) => [item._id, item.count])
    );

    const result = months.map((month, index) => {
      const monthNumber = index + 1;

      return {
        name: month,
        user: userMap.get(monthNumber) || 0,
        parent: parentMap.get(monthNumber) || 0,
        provider: providerMap.get(monthNumber) || 0,
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