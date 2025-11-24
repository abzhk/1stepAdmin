import Stats from "../model/stats.js";

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
