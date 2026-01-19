import Permission from "../model/permission.model.js";
import Role from "../model/role.model.js";


export const addPermission = async (req, res) => {
  try {
    const { permissionType } = req.body;

    if (!permissionType) {
      return res.status(400).json({ message: "Permission type is required" });
    }

    const exists = await Permission.findOne({ permissionType });
    if (exists) {
      return res.status(409).json({ message: "Permission already exists" });
    }

    const permission = await Permission.create({ permissionType });

    res.status(201).json({ success: true, permission });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPermissions = async (req, res) => {
  const permissions = await Permission.find().sort({ permissionType: 1 });
  res.json(permissions);
};

export const updateRolePermissions = async (req, res) => {
  const { roleId, permissionType, action } = req.body;


  const role = await Role.findById(roleId);
  if (!role) return res.status(404).json({ message: "Role not found" });

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
};
