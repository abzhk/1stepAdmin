import Specialization from "../model/specialization.model.js";

export const createSpecialization = async (req, res) => {
  try {
    const {
      code,
      name,
      description,
      order,
    } = req.body;

    if (order === undefined || order === null || order === "") {
      return res.status(400).json({
        success: false,
        message: "Order is required",
      });
    }

    const existingOrder = await Specialization.findOne({ order });

    if (existingOrder) {
      return res.status(400).json({
        success: false,
        message: "Order already exists",
      });
    }

    const specialization = await Specialization.create({
      code,
      name,
      description,
      order,
    });

    res.status(201).json({
      success: true,
      data: specialization,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSpecializations = async (req, res) => {
  try {

    const data = await Specialization.find()

    res.json({
      success: true,
      count: data.length,
      data,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

export const getSpecializationById = async (req, res) => {
  try {

    const specialization = await Specialization.findById(req.params.id);

    if (!specialization) {
      return res.status(404).json({
        success: false,
        message: "Specialization not found",
      });
    }

    res.json({
      success: true,
      data: specialization,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


export const updateSpecialization = async (req, res) => {
  try {

    const { order } = req.body;

      if (order === undefined || order === null || order === "") {
      return res.status(400).json({
        success: false,
        message: "Order is required",
      });
    }


    const existingOrder = await Specialization.findOne({
  order,
  _id: { $ne: req.params.id }, 
});

if (existingOrder) {
  return res.status(400).json({
    success: false,
    message: "Order already exists",
  });
}


    const specialization = await Specialization.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );


    if (!specialization) {
      return res.status(404).json({
        success: false,
        message: "Specialization not found",
      });
    }

    res.json({
      success: true,
      data: specialization,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteSpecialization = async (req, res) => {
  try {
    const specialization = await Specialization.findByIdAndDelete(req.params.id);

    if (!specialization) {
      return res.status(404).json({
        success: false,
        message: "Specialization not found",
      });
    }

    res.json({
      success: true,
      message: "Specialization deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSpecializationsWithPagination = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const search = req.query.search?.trim() || "";

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const totalRecords = await Specialization.countDocuments(filter);

    const specializations = await Specialization.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
      success: true,
      count: specializations.length,
      data: specializations,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords,
        limit,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};