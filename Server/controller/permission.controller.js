import Permission from "../model/permission.model.js";
import Role from "../model/role.model.js";
import { errorHandler } from "../utils/error.js";


export const addPermission = async (req, res,next) => {
  try {
    const { permissionType } = req.body;

    if (!permissionType) {
      return next(errorHandler(400, "Permission type is required"));
    }

    const exists = await Permission.findOne({ permissionType });
    if (exists) {
      return next(errorHandler(409, "Permission already exists"));
    }

    const permission = await Permission.create({ permissionType });

    res.status(201).json({ success: true, permission });
  } catch (error) {
    console.log(error);
    
    return next(errorHandler(500, "Failed to create permission"));
  }
};

export const getPermissions = async (req, res, next) => {
  try {
    const permissions = await Permission.find().sort({ permissionType: 1 });

    res.json({ success: true, permissions });
  } catch (error) {
    console.error(error);
    return next(errorHandler(500, "Failed to fetch permissions"));
  }
};

export const updateRolePermissions = async (req, res, next) => {
  try {
    const { roleId, permissionType, action } = req.body;

    if (!roleId || !permissionType || !action) {
      return next(errorHandler(400, "Missing required fields"));
    }

    const role = await Role.findById(roleId);
    if (!role) {
      return next(errorHandler(404, "Role not found"));
    }

    if (!role.permissions) {
      role.permissions = [];
    }

    if (action === "add") {
      if (!role.permissions.includes(permissionType)) {
        role.permissions.push(permissionType);
      }
    } else {
      role.permissions = role.permissions.filter(
        (p) => p !== permissionType
      );
    }

    await role.save();

    res.json({ success: true, role });
  } catch (error) {
    console.error(error);

    if (error.statusCode) return next(error);

    return next(errorHandler(500, "Failed to update role permissions"));
  }
};
