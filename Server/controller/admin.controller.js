import User from '../model/user.model.js';
import Role from '../model/role.model.js';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
import Provider from '../model/provider.model.js';
import mongoose from 'mongoose';
import Parent from "../model/parent.model.js";
import { Booking, BookedSlots } from "../model/booking.model.js";
import { errorHandler } from '../utils/error.js';


export const createAdmin = async (req, res) => {
  try {
    const { username, email, password,profilePicture } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }


    const adminRole = await Role.findOne({ role: "Admin" });
    if (!adminRole) {
      return res.status(500).json({ message: "Admin role not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const adminUser = new User({
      username,
      email,
      password: hashedPassword,
      role: adminRole._id,
      profilePicture
    });

    await adminUser.save();

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
    });

  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const login = async (req, res,next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return next(errorHandler(400, "Username and password are required"));
    }

   const user = await User.findOne({ username }).populate("role");

    if (!user || !user.role) {
      return  next(errorHandler(401, "Invalid credentials"));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(errorHandler(401, "Invalid credentials"));
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role.role,
        permissions: user.role.permissions,
        isSuperAdmin: user.role.isSuperAdmin,
         profilePicture: user.profilePicture, 
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      path: "/",
    });

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        role: user.role.role,
        permissions: user.role.permissions,
        isSuperAdmin: user.role.isSuperAdmin,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
     next(errorHandler(500, "Login failed"));
  }
};

//delete provider
export const deleteProvider = async (req, res,next) => {
  try {
    const { providerId } = req.params;   

    if (!mongoose.Types.ObjectId.isValid(providerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    const providerDoc = await Provider.findOne({ userRef: providerId });

    if (!providerDoc) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    await Booking.deleteMany({ provider: providerDoc._id });

    await BookedSlots.deleteMany({ provider: providerDoc._id });

    await Provider.deleteOne({ userRef: providerId });

    await User.deleteOne({ _id: providerId });

    return res.status(200).json({
      success: true,
      message: "Provider deleted successfully",
    });
  } catch (error) {
    console.error(error);

    next(errorHandler(500, "Failed to delete provider"));
  }
};
export const logoutAdmin = async (req, res,next) => {
  try {
   res.clearCookie("token", {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "none",
  path: "/",
});

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
   next(errorHandler(500, "Logout failed"));
  }
};

export const verifyAdminSession = async (req, res) => {
  try {
    const token = req.cookies.token; 

    if (!token) {
      return res.status(401).json({ success: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).populate("role");

    if (!user) {
      return res.status(401).json({ success: false });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        role: user.role.role,
        permissions: user.role.permissions,
        profilePicture: user.profilePicture, 
      },
    });
  } catch (error) {
    return res.status(401).json({ success: false });
  }
};

//get admin 
export const getAdminProfile = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).populate("role");

    if (!user) {
      return res.status(404).json({ success: false });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role.role,
        profilePicture: user.profilePicture,
      },
    });
  } catch (err) {
    res.status(401).json({ success: false });
  }
};
//update admin profile
export const updateAdminProfile = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { username, profilePicture } = req.body;

    if (!username || username.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      decoded.id,
      {
        username: username.trim(),
        profilePicture,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture,
      },
    });
  } catch (err) {
    console.error("Update profile error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};


//updateprovider details byadmin
export const updateProvider = async (req, res,next) => {
  try {
    const { providerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(providerId)) {
      return next(errorHandler(400, "Invalid provider id"));
    }

    const providerDoc = await Provider.findById(providerId);

    if (!providerDoc) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

 
    if (req.body.email && req.body.email !== providerDoc.email) {
      const existingEmail = await Provider.findOne({
        email: req.body.email,
        _id: { $ne: providerId },
      });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already in use by another provider",
        });
      }
    }

    const updatedProvider = await Provider.findByIdAndUpdate(
      providerId,
      {
        $set: req.body,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Provider updated successfully",
      provider: updatedProvider,
    });
  } catch (error) {
    console.error("Update provider error:", error);
    return next(errorHandler(500, "Failed to update provider"));
  }
};

//fetch both parent and provider
export const getParentsAndProviders = async (req, res) => {
  try {

     const { limit = 4, startIndex = 0 } = req.query;
    const parents = await Parent.find()
      .populate("userRef", "username email profilePicture createdAt")
      .sort({ createdAt: -1 })
       .skip(Number(startIndex))
      .limit(Number(limit))

    const providers = await Provider.find()
      .sort({ createdAt: -1 })
       .skip(Number(startIndex))
      .limit(Number(limit))

      const parentsTotal = await Parent.countDocuments();
      const providersTotal = await Provider.countDocuments();

    res.status(200).json({
      success: true,
      parentsCount: parents.length,
      providersCount: providers.length,
      parents,
      providers,
      total: parentsTotal + providersTotal,
    });
  } catch (error) {
    console.error("Fetch Parents & Providers Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch parents and providers",
    });
  }
};
//delete parent
export const deleteParent = async (req, res) => {
  try {
    const { userRef } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userRef)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userRef ID",
      });
    }

    const parentDoc = await Parent.findOne({ userRef });

    if (!parentDoc) {
      return res.status(404).json({
        success: false,
        message: "Parent not found",
      });
    }
    await Booking.deleteMany({ patient: userRef });

    await Parent.findOneAndDelete({ userRef });
    await User.deleteOne({ _id: userRef });

    return res.status(200).json({
      success: true,
      message: "Parent deleted successfully",
    });
  } catch (error) {
    console.error("Delete parent error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete parent",
      error: error.message,
    });
  }
};


//update parent
export const updateParent = async (req, res ,next) => {
  try {
    const { userRef } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userRef)) {
      return next(errorHandler(400, "Invalid userRef ID"));
    }

    const parentDoc = await Parent.findOne({ userRef });

    if (!parentDoc) {
      return res.status(404).json({
        success: false,
        message: "Parent not found",
      });
    }

    const updatedParent = await Parent.findOneAndUpdate(
      { userRef },
      {
        $set: req.body,
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate("userRef", "username email profilePicture");

    return res.status(200).json({
      success: true,
      message: "Parent updated successfully",
      parent: updatedParent,
    });
  } catch (error) {
    console.error("Update parent error:", error);
    return next(errorHandler(500, "Failed to update parent"));
  }
};
