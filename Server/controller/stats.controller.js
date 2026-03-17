import Stats from "../model/stats.model.js";
import User from "../model/user.model.js";
import Parent from "../model/parent.model.js";
import Provider from "../model/provider.model.js";


export const getStats = async (req, res) => {
  try {
    const stats = await Stats.findOne({});
    if (!stats) {
      return res.status(404).json({ message: "Stats not found" });
    }
    res.json(stats);
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ message: "Error fetching stats" });
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
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};