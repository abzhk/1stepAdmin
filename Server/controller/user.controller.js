import Provider from "../models/provider.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";

import bcryptjs from "bcryptjs";

import fs from "fs";
import path from "path";

export const test = (req, res) => {
  res.json({
    message: "Made by Capztone Innovative Team",
  });
};

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(401, "You can update only your account!"));
  }
  try {
    const existingUser = await User.findOne({
      email: req.body.email,
      _id: { $ne: req.params.id },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email already exists", success: false });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          profilePicture: req.body.profilePicture,
        },
      },
      { new: true }
    ).populate("role");

    if (!updatedUser) {
      return res.status(404).json({
        message: "Can't updated your profile, try later",
        success: false,
      });
    }

    const { password, refreshToken, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const getUserProvider = async (req, res, next) => {
  if (req.user.id === req.params.id) {
    try {
      const providers = await Provider.find({ userRef: req.params.id });
      res.status(200).json(providers);
    } catch (error) {
      next(error);
    }
  } else {
    return next(errorHandler(401, "You can only view your own provider"));
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }
    const { password, ...rest } = user._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(401, "You are not authorized to view all users"));
  }
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === "asc" ? 1 : -1;

    const users = await User.find()
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const userWithoutPassword = users.map((user) => {
      const { password, ...rest } = user._doc;
      return rest;
    });

    const totalUsers = await User.countDocuments();
    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const lastMonthUsers = await User.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });
    res
      .status(200)
      .json({ users: userWithoutPassword, totalUsers, lastMonthUsers });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (!req.user.isAdmin || req.user.id === req.params.userId) {
    return next(
      errorHandler(401, "You are not authorized to delete this user")
    );
  }
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.status(200).json({ message: "User has been deleted" });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  const { password, newPassword } = req.body;
  if (password.length === 0 || newPassword.length === 0) {
    return res
      .status(400)
      .json({ message: "All field required", success: false });
  }
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }
    if (!bcryptjs.compareSync(password, user.password)) {
      return res
        .status(400)
        .json({ success: false, message: "Old password does not match" });
    }
    const isSamePassword = bcryptjs.compareSync(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        message: "New password should not be the same as the old password",
        success: false,
      });
    }
    if (bcryptjs.compareSync(password, user.password)) {
      const updateUser = await User.findByIdAndUpdate(id, {
        $set: {
          password: bcryptjs.hashSync(newPassword, 10),
        },
      });
      if (bcryptjs.compareSync(user.password, newPassword)) {
        return res.status(400).json({
          success: false,
          message: "Old Password and New Password should not be same",
        });
      }
      if (!updateUser) {
        return res
          .status(400)
          .json({ success: false, message: "Password not updated" });
      }
      res.status(200).json({ success: true, message: "Password Changed" });
    }
  } catch (error) {
    console.log("Error:", error);
    next(error);
  }
};

const __dirname = path.resolve();

const logDirectory = path.join("/tmp", "log");
const archiveDirectory = path.join(logDirectory, "archieve");

const currentDate = new Date().toISOString().split("T")[0];
const logFilePath = path.join(logDirectory, `error-${currentDate}.log`);

if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}
if (!fs.existsSync(archiveDirectory)) {
  fs.mkdirSync(archiveDirectory, { recursive: true });
}

export const saveErrorLog = async (req, res, next) => {
  const { error, stack } = req.body;
  console.log(req.body);
  try {
    const logMessage = `${new Date().toISOString()} - ERROR : ${error}\n - Stack : ${
      stack.componentStack
    }\n\n`;

    await fs.promises.appendFile(logFilePath, logMessage);

    // Rotate logs older than 7 days
    const files = await fs.promises.readdir(logDirectory, {
      withFileTypes: true,
    });
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7);
    sevenDaysAgo.setUTCHours(0, 0, 0, 0);

    for (const dirent of files) {
      if (dirent.isFile()) {
        const fileName = dirent.name;
        const dateMatch = fileName.match(/error-(\d{4}-\d{2}-\d{2})\.log$/);

        if (dateMatch) {
          const fileDate = new Date(`${dateMatch[1]}T00:00:00Z`);

          if (fileDate < sevenDaysAgo) {
            const oldPath = path.join(logDirectory, fileName);
            const newPath = path.join(archiveDirectory, fileName);

            try {
              await fs.promises.rename(oldPath, newPath);
              console.log(`Archived old log file: ${fileName}`);
            } catch (err) {
              console.error(`Error archiving ${fileName}: ${err.message}`);
            }
          }
        }
      }
    }

    res
      .status(200)
      .json({ message: "Error logged successfully", status: true });
  } catch (error) {
    next(error);
  }
};
