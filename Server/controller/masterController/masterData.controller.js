import MasterData from "../../model/Master/masterData.model.js";

// ============================================
// GET OPTIONS BY TYPE (for dropdowns)
// ============================================
export const getOptionsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { grouped, format = "dropdown" } = req.query;

    let result;

    if (grouped) {
      // Return grouped options
      result = await MasterData.getGroupedOptions(type, grouped);
    } else if (format === "dropdown") {
      // Return formatted for react-select
      result = await MasterData.formatForDropdown(type);
    } else {
      // Return raw data
      result = await MasterData.getOptionsByType(type);
    }

    res.status(200).json({
      success: true,
      type,
      data: result,
    });
  } catch (error) {
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

    const option = new MasterData({
      ...req.body,
      createdBy: req.user.id
    });

    await option.save();

    res.status(201).json({
      success: true,
      message: "Option created successfully",
      data: option,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create option",
      error: error.message,
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

    Object.assign(option, req.body);
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
