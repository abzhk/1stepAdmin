import Role from "../model/role.model.js";

export const createRole = async (req, res) => {
  const { role, permissions } = req.body;

  if (!role || !Array.isArray(permissions) || permissions.length === 0) {
    return res.status(400).json({ message: "Role and permissions required" });
  }

  const exists = await Role.findOne({ role });
  if (exists) {
    return res.status(409).json({ message: "Role already exists" });
  }

  const newRole = await Role.create({
    role,
    permissions, 
  });

  res.status(201).json({ success: true, role: newRole });
};


export const getRoles = async (req, res) => {
  const roles = await Role.find().populate("permissions");
  res.json({ success: true, roles });
}; 

