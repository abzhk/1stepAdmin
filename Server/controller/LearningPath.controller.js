import mongoose from "mongoose";
import LearningPath from "../model/LearningPath.model.js";

const escapeRegex = (string = "") =>
  string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const createLearningPath = async (req, res, next) => {
  try {
    const { assessmentId, title, image, steps } = req.body;

    if (!assessmentId) {
      return res.status(400).json({
        success: false,
        message: "Assessment ID is required",
      });
    }

    let learningPath = await LearningPath.findOne({ assessmentId });

    if (learningPath) {
      learningPath.title = title || learningPath.title;
      learningPath.image = image || learningPath.image;
      learningPath.steps = steps || learningPath.steps;
      await learningPath.save();
    } else {
      learningPath = await LearningPath.create({
        assessmentId,
        title,
        image,
        steps,
      });
    }

    res.status(201).json({
      success: true,
      message: "Learning path saved successfully",
      data: learningPath,
    });
  } catch (error) {
    console.error("CREATE ERROR:", error);
    next(error);
  }
};

export const getLearningPath = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Identifier is required",
      });
    }

    let data = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      data = await LearningPath.findOne({
        $or: [{ assessmentId: id }, { _id: id }],
      })
        .populate("assessmentId", "title")
        .sort({ createdAt: -1 })
        .lean();
    }

    if (!data) {
      const decoded = decodeURIComponent(id).trim();
      const escaped = escapeRegex(decoded);

      data = await LearningPath.findOne({
        $or: [
          { title: { $regex: new RegExp(`^${escaped}$`, "i") } },
          { title: { $regex: escaped, $options: "i" } },
        ],
      })
        .populate("assessmentId", "title")
        .sort({ createdAt: -1 })
        .lean();
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Learning path not found",
      });
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const updateLearningPath = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid learning path ID",
      });
    }

    const learningPath = await LearningPath.findByIdAndUpdate(
      id,
      {
        assessmentId: req.body.assessmentId,
        title: req.body.title,
        image: req.body.image,
        steps: req.body.steps,
      },
      { new: true }
    );

    if (!learningPath) {
      return res.status(404).json({
        success: false,
        message: "Learning path not found",
      });
    }

    res.status(200).json({
      success: true,
      data: learningPath,
    });
  } catch (error) {
    next(error);
  }
};

export const getLearningPathById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let learningPath = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      learningPath = await LearningPath.findById(id).populate("assessmentId", "title");
    }

    if (!learningPath) {
      const decoded = decodeURIComponent(id).trim();
      const escaped = escapeRegex(decoded);

      learningPath = await LearningPath.findOne({
        $or: [
          { title: { $regex: new RegExp(`^${escaped}$`, "i") } },
          { title: { $regex: escaped, $options: "i" } },
        ],
      })
        .populate("assessmentId", "title")
        .sort({ createdAt: -1 });
    }

    if (!learningPath) {
      return res.status(404).json({
        success: false,
        message: "Learning Path not found",
      });
    }

    res.status(200).json({
      success: true,
      data: learningPath,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllLearningPaths = async (req, res, next) => {
  try {
    const learningPaths = await LearningPath.find()
      .populate("assessmentId", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: learningPaths,
    });
  } catch (error) {
    console.error("GET ALL ERROR:", error);
    next(error);
  }
};

export const deleteLearningPath = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid learning path ID",
      });
    }

    await LearningPath.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Learning Path Deleted",
    });
  } catch (error) {
    next(error);
  }
};
