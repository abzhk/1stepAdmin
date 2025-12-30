import User from "../model/user.model.js";
import Role from "../model/role.model.js";
import bcrypt from "bcrypt";

export const createSuperAdmin = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const superAdminRole = await Role.findOne({ role: "SuperAdmin" });
    if (!superAdminRole) {
      return res.status(500).json({ message: "SuperAdmin role not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword,
      role: superAdminRole._id,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "SuperAdmin created successfully",
    });
  } catch (error) {
    console.error("Create SuperAdmin error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
