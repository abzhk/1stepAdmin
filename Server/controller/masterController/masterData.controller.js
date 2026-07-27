import MasterData, { VALID_TYPES } from "../../model/Master/masterData.model.js";
import joi from "joi";

// ============================================
// GET OPTIONS BY TYPE (for dropdowns)
// ============================================
export const getOptionsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { grouped, format = "dropdown", page = 1, limit = 500 } = req.query;

    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ success: false, message: "Invalid master data type" });
    }

    if (!["dropdown", "raw"].includes(format)) {
      return res.status(400).json({ success: false, message: "Invalid format parameter" });
    }

    const limitNum = parseInt(limit) || 500;
    const skipNum = (parseInt(page) - 1) * limitNum;

    let result;

    if (grouped) {
      // Return grouped options
      result = await MasterData.getGroupedOptions(type, grouped);
    } else if (format === "dropdown") {
      // Return formatted for react-select
      result = await MasterData.formatForDropdown(type, {}, limitNum, skipNum);
    } else {
      // Return raw data
      result = await MasterData.getOptionsByType(type, {}, limitNum, skipNum);
    }

    res.status(200).json({
      success: true,
      type,
      data: result,
    });
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ success: false, message: "Validation error", error: error.message });
    }
    res.status(500).json({
      success: false,
      message: "Failed to fetch options",
      error: error.message,
    });
  }
};

// ============================================
// GET ALL TYPES (list available dropdown types)
// ============================================
export const getAllTypes = async (req, res) => {
  try {
    const types = await MasterData.distinct("type");

    res.status(200).json({
      success: true,
      data: types,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch types",
      error: error.message,
    });
  }
};

// ============================================
// CREATE OPTION (Admin only)
// ============================================
export const createOption = async (req, res) => {
  try {
    const schema = joi.object({
      type: joi.string().valid(...VALID_TYPES).required(),
      code: joi.string().required(),
      label: joi.string().required(),

      name: joi.string().allow("", null),
      description: joi.string().allow("", null),
      category: joi.string().allow("", null),
      subCategory: joi.string().allow("", null),
        metadata: joi.object().optional(),

      isActive: joi.boolean(),
      order: joi.number(),
    });

    const { error, value } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const existingOrder = await MasterData.findOne({
      type: value.type,
      order: value.order,
    });

    if (existingOrder) {
      return res.status(400).json({
        success: false,
        message: "Order already exists.",
      });
    }


    const option = new MasterData({
      ...value,
      createdBy: req.user._id,
    });

    await option.save();

    res.status(201).json({
      success: true,
      message: "Option created successfully",
      data: option,
    });
  }catch (error) {
  if (error.code === 11000) {
    const typeName = req.body.type
      ?.replace(/([A-Z])/g, " $1")
      .replace(/^./, str => str.toUpperCase());

    return res.status(400).json({
      success: false,
      message: `${typeName} code already exists.`,
    });
  }

  return res.status(400).json({
    success: false,
    message: error.message || "Failed to create option",
  });
}
};

// ============================================
// UPDATE OPTION (Admin only)
// ============================================
export const updateOption = async (req, res) => {
  try {
    const { id } = req.params;

    const option = await MasterData.findById(id);

    if (!option) {
      return res.status(404).json({
        success: false,
        message: "Option not found",
      });
    }

    // Prevent editing system-defined options
    if (option.isSystemDefined && !req.user.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: "Cannot modify system-defined options",
      });
    }

    const schema = joi.object({
      code: joi.string(),

      label: joi.string(),

      name: joi.string().allow("", null),

      description: joi.string().allow("", null),

      category: joi.string().allow("", null),

      subCategory: joi.string().allow("", null),

      metadata: joi.object().optional(),

      isActive: joi.boolean(),

      order: joi.number(),
    }).min(1);

    const { error, value } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
   
if (value.order !== undefined) {
  const existingOrder = await MasterData.findOne({
    type: option.type,
    order: value.order,
    _id: { $ne: option._id },
  });

  if (existingOrder) {
    return res.status(400).json({
      success: false,
      message: `Order ${value.order} already exists.`,
    });
  }
}

    Object.assign(option, value);

    option.updatedBy = req.user._id;

    await option.save();

    res.status(200).json({
      success: true,
      message: "Option updated successfully",
      data: option,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to update option",
      error: error.message,
    });
  }
};

// ============================================
// DELETE OPTION (Admin only)
// ============================================
export const deleteOption = async (req, res) => {
  try {
    const { id } = req.params;

    const option = await MasterData.findById(id);

    if (!option) {
      return res.status(404).json({
        success: false,
        message: "Option not found",
      });
    }

    // Prevent deleting system-defined options
    if (option.isSystemDefined) {
      return res.status(403).json({
        success: false,
        message: "Cannot delete system-defined options",
      });
    }

    await option.deleteOne();

    res.status(200).json({
      success: true,
      message: "Option deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to delete option",
      error: error.message,
    });
  }
};

// ============================================
// REORDER OPTIONS (Admin only)
// ============================================
export const reorderOptions = async (req, res) => {
  try {
    const { type, orders } = req.body; // orders: [{ id, order }, ...]

    const bulkOps = orders.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: id, type },
        update: { $set: { order } },
      },
    }));

    await MasterData.bulkWrite(bulkOps);

    res.status(200).json({
      success: true,
      message: "Options reordered successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to reorder options",
      error: error.message,
    });
  }
};

// ============================================
// BULK OPERATIONS (Admin only)
// ============================================
export const bulkToggleActive = async (req, res) => {
  try {
    const { ids, isActive } = req.body;

    await MasterData.updateMany(
      { _id: { $in: ids } },
      { $set: { isActive, updatedBy: req.user._id } }
    );

    res.status(200).json({
      success: true,
      message: `${ids.length} options ${
        isActive ? "activated" : "deactivated"
      }`,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Bulk operation failed",
      error: error.message,
    });
  }
};

//all data without isactive
export const getAllOptionsByTypeAdmin = async (req, res) => {
  try {
    const { type } = req.params;
     const { page = 1, limit = 10, search = "" } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;
     const query = {
      type,
    };

     if (search) {
      query.$or = [
        { label: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const [data, total] = await Promise.all([
      MasterData.find(query)
        .sort({ order: 1 })
        .skip(skip)
        .limit(limitNumber),

      MasterData.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data,
       pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(total / limitNumber),
        totalItems: total,
        pageSize: limitNumber,
        hasNextPage: pageNumber < Math.ceil(total / limitNumber),
        hasPrevPage: pageNumber > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin options",
      error: error.message,
    });
  }
};