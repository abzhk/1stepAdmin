import Module from "../model/acessmodule.model.js";
import { errorHandler } from "../utils/error.js";


export const createModule = async (req, res,next) => {
  try {
    const { modules } = req.body;

    if (!modules) {
      return next(errorHandler(400, "Module name is required"));
    }

    const existing = await Module.findOne({ modules });

    if (existing) {
      return next(errorHandler(409, "Module already exists"));
    }

    const module = await Module.create({ modules });

    res.status(201).json({
      message: "Module created successfully",
      module,
    });
  } catch (error) {
    return next(errorHandler(500, "Error creating module"));
  }
};


export const getModules = async (req, res,next) => {
  try {
    const modules = await Module.find().sort({ createdAt: -1 });

    res.status(200).json(modules);
  } catch (error) {
    return next(errorHandler(500, "Error fetching modules"));
  }
};



export const updateModule = async (req, res) => {
  try {
    const { id } = req.params;
    const { modules } = req.body;

    const existing = await Module.findOne({
      modules,
      _id: { $ne: id },
    });

    if (existing) {
      return res.status(409).json({
        message: "Module already exists",
      });
    }

    const updated = await Module.findByIdAndUpdate(
      id,
      { modules },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Module not found" });
    }

    res.status(200).json({
      message: "Module updated",
      updated,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


export const deleteModule = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Module.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        message: "Module not found",
      });
    }

    res.status(200).json({
      message: "Module deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
