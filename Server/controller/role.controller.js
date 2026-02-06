import Role from "../model/role.model.js";
import { enforceBasePermissions } from "../utils/rolepermission.js";

export const createRole = async (req, res) => {
  try {
    const {
      role,
      description = "",
      permissions = [],
      defaultModules = [],
      isSuperAdmin = false,
    } = req.body;

    if (!role) {
      return res.status(400).json({ message: "Role name is required" });
    }

    if (!Array.isArray(permissions)) {
      return res.status(400).json({ message: "Permissions must be an array" });
    }

    const exists = await Role.findOne({ role });
    if (exists) {
      return res.status(409).json({ message: "Role already exists" });
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
    return res.status(500).json({
      success: false,
      message: "Failed to create role",
    });
  }
};


export const getRoles = async (req, res) => {
  const roles = await Role.find();
  res.json({ success: true, roles });
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
      return res.status(404).json({ message: "Role not found" });
    }

    if (existingRole.isSuperAdmin) {
      return res.status(403).json({
        message: "Super admin role cannot be modified",
      });
    }


    if (permissions && !Array.isArray(permissions)) {
      return res.status(400).json({
        message: "Permissions must be an array",
      });
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
    res.status(500).json({
      success: false,
      message: "Failed to update role",
    });
  }
};