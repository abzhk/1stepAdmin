import Role from "../model/role.model.js";
import { errorHandler } from "../utils/error.js";
import { enforceBasePermissions } from "../utils/rolepermission.js";

export const createRole = async (req, res ,next) => {
  try {
    const {
      role,
      description = "",
      permissions = [],
      defaultModules = [],
      isSuperAdmin = false,
    } = req.body;

    if (!role) {
      return next(errorHandler(400, "Role name is required" ));
    }

    if (!Array.isArray(permissions)) {
      return next(errorHandler (400, "Permissions must be an array" ));
    }

    const exists = await Role.findOne({ role });
    if (exists) {
      return next(errorHandler (409, "Role already exists" ));
    }

    const normalizedPermissions = isSuperAdmin
  ? []
  : enforceBasePermissions(defaultModules, permissions);

    const newRole = await Role.create({
      role,
      description,
      permissions: normalizedPermissions,
      defaultModules,
      isSuperAdmin,
    });

    return res.status(201).json({
      success: true,
      role: newRole,
    });
  } catch (error) {
    console.error("Create role error:", error);
     return next(errorHandler(500, "Failed to create role"));
  }
};


export const getRoles = async (req, res, next) => {
  try {
    const roles = await Role.find();

    return res.status(200).json({
      success: true,
      roles,
    });

  } catch (error) {
    console.error("Get roles error:", error);
    return next(errorHandler(500, "Failed to fetch roles"));
  }
};


export const updateRole = async (req, res) => {
  try {
    const { role } = req.params; 
    const {
      description,
      defaultModules,
      permissions,
    } = req.body;

    const existingRole = await Role.findOne({ role });

    if (!existingRole) {
      return next(errorHandler (404, "Role not found" ));
    }

    if (existingRole.isSuperAdmin) {
      return next(errorHandler(403,"Super admin role cannot be modified",)) 

    }


    if (permissions && !Array.isArray(permissions)) {
      return next(errorHandler(400, "Permissions must be an array",))

    }

    if (description !== undefined) existingRole.description = description;
    if (defaultModules !== undefined)
      existingRole.defaultModules = defaultModules;
    if (permissions !== undefined) existingRole.permissions = permissions;

    await existingRole.save();

    res.json({
      success: true,
      message: "Role updated successfully",
      role: existingRole,
    });
  } catch (error) {
    console.error("Update role error:", error);
     return next(errorHandler(500, "Failed to update role"));
  }
};