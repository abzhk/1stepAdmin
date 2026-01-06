import User from "../model/user.model.js";
import Role from "../model/role.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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

export const loginSuperAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    const superAdminRole = await Role.findOne({ role: "SuperAdmin" });
    if (!superAdminRole) {
      return res.status(500).json({
        success: false,
        message: "SuperAdmin role not found",
      });
    }


    const user = await User.findOne({
      username,
      role: superAdminRole._id,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }


    const token = jwt.sign(
      {
        id: user._id,
        role: "SuperAdmin",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: "SuperAdmin",
      },
    });
  } catch (error) {
    console.error("SuperAdmin login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
