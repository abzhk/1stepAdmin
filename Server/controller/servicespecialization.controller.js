import ServiceSpecialization from "../model/Master/servicespecialization.model.js";
import MasterData from "../model/Master/masterData.model.js";
import Specialization from "../model/Master/specialization.model.js";


// CREATE RELATION

export const createServiceSpecialization = async (req, res) => {
  try {
    let {
      serviceId,
      specializationId,
      isPrimary = false,
      displayOrder,
    } = req.body;
    // Validate required fields

    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: "Service is required.",
      });
    }

    if (!specializationId) {
      return res.status(400).json({
        success: false,
        message: "Specialization is required.",
      });
    }

    if (
      displayOrder === undefined ||
      displayOrder === null ||
      displayOrder === "" ||
      isNaN(displayOrder)
    ) {
      return res.status(400).json({
        success: false,
        message: "Display Order is required.",
      });
    }

    displayOrder = Number(displayOrder);

    // Validate Service
    const service = await MasterData.findOne({
      _id: serviceId,
      type: "serviceType",
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found.",
      });
    }

    // Validate Specialization

    const specialization = await Specialization.findById(specializationId);

    if (!specialization) {
      return res.status(404).json({
        success: false,
        message: "Specialization not found.",
      });
    }


    // Check Duplicate Mapping

    const existingMapping = await ServiceSpecialization.findOne({
      serviceId,
      specializationId,
    });

    if (existingMapping) {
      return res.status(400).json({
        success: false,
        message: "This specialization is already mapped to this service.",
      });
    }

    // Check Duplicate Display Order

    const existingDisplayOrder = await ServiceSpecialization.findOne({
      serviceId,
      displayOrder,
    });

    if (existingDisplayOrder) {
      return res.status(400).json({
        success: false,
        message: `Display Order ${displayOrder} is already used for this service.`,
      });
    }


    // Create Mapping
    const relation = await ServiceSpecialization.create({
      serviceId,
      specializationId,
      isPrimary,
      displayOrder,
    });

    const populated = await ServiceSpecialization.findById(relation._id)
      .populate("serviceId", "label code")
      .populate("specializationId", "name code");

    return res.status(201).json({
      success: true,
      message: "Service specialization mapped successfully.",
      data: populated,
    });

  } catch (error) {


    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "This mapping already exists.",
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET ALL RELATIONSHIPS

export const getServiceSpecializations = async (req, res) => {
  try {

    const data = await ServiceSpecialization.find()
      .populate("serviceId", "label code")
      .populate("specializationId", "name code")
      .sort({ displayOrder: 1 });

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


// GET BY ID

export const getServiceSpecializationById = async (req, res) => {
  try {

    const data = await ServiceSpecialization.findById(req.params.id)
      .populate("serviceId", "label code")
      .populate("specializationId", "name code");

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Relationship not found.",
      });
    }

    res.json({
      success: true,
      data,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// GET SPECIALIZATIONS BY SERVICE

export const getSpecializationsByService = async (req, res) => {
  try {

    const relations = await ServiceSpecialization.find({
      serviceId: req.params.serviceId,
      isActive: true,
    })
      .populate("specializationId")
      .sort({ displayOrder: 1 });

    res.json({
      success: true,
      count: relations.length,
      data: relations,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// GET SERVICES BY SPECIALIZATION

export const getServicesBySpecialization = async (req, res) => {
  try {

    const relations = await ServiceSpecialization.find({
      specializationId: req.params.specializationId,
      isActive: true,
    }).populate("serviceId", "label code");

    res.json({
      success: true,
      count: relations.length,
      data: relations,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// UPDATE

// UPDATE
export const updateServiceSpecialization = async (req, res) => {
  try {
    const {
      serviceId,
      specializationId,
      isPrimary,
      displayOrder,
      isActive,
    } = req.body;

    const relation = await ServiceSpecialization.findById(req.params.id);

    if (!relation) {
      return res.status(404).json({
        success: false,
        message: "Relationship not found.",
      });
    }


    if (typeof displayOrder !== "undefined") {
  if (
    displayOrder === null ||
    displayOrder === "" ||
    isNaN(displayOrder)
  ) {
    return res.status(400).json({
      success: false,
      message: "Display Order must be a valid number.",
    });
  }

  const existingDisplayOrder = await ServiceSpecialization.findOne({
    _id: { $ne: req.params.id },
    serviceId: serviceId || relation.serviceId,
    displayOrder: Number(displayOrder),
  });

  if (existingDisplayOrder) {
  return res.status(400).json({
    success: false,
    message: `Display Order ${displayOrder} is already used.`,
  });
}

  relation.displayOrder = Number(displayOrder);
}

    // Validate service
    if (serviceId) {
      const service = await MasterData.findOne({
        _id: serviceId,
        type: "serviceType",
      });

      if (!service) {
        return res.status(404).json({
          success: false,
          message: "Service not found.",
        });
      }

      relation.serviceId = serviceId;
    }

    // Validate specialization
    if (specializationId) {
      const specialization = await Specialization.findById(specializationId);

      if (!specialization) {
        return res.status(404).json({
          success: false,
          message: "Specialization not found.",
        });
      }

      // Prevent duplicate mapping
      const duplicate = await ServiceSpecialization.findOne({
        _id: { $ne: req.params.id },
        serviceId: serviceId || relation.serviceId,
        specializationId,
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: "This mapping already exists.",
        });
      }

      relation.specializationId = specializationId;
    }

    if (typeof isPrimary !== "undefined")
      relation.isPrimary = isPrimary;

    if (typeof displayOrder !== "undefined")
      relation.displayOrder = displayOrder;

    if (typeof isActive !== "undefined")
      relation.isActive = isActive;

    await relation.save();

    const updated = await ServiceSpecialization.findById(relation._id)
      .populate("serviceId", "label code")
      .populate("specializationId", "name code");

    res.json({
      success: true,
      message: "Relationship updated successfully.",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// DELETE

export const deleteServiceSpecialization = async (req, res) => {
  try {

    const relation = await ServiceSpecialization.findByIdAndDelete(
      req.params.id
    );

    if (!relation) {
      return res.status(404).json({
        success: false,
        message: "Relationship not found.",
      });
    }

    res.json({
      success: true,
      message: "Relationship deleted successfully.",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};