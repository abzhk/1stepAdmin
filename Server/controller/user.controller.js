import Provider from "../model/provider.model.js";
import User from "../model/user.model.js";
import { errorHandler } from "../utils/error.js";
import Role from "../model/role.model.js";
import Parent from "../model/parent.model.js";

import bcryptjs from "bcryptjs";

import fs from "fs";
import path from "path";

import {
  sendAccountDeactivatedEmail,
  sendAccountReactivatedEmail,
} from "../services/email.service.js";

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


export const getAllUsers = async (req, res, next) => {
  try {
    const {
      search = "",
      page = 1,
      limit = 10,
      sort = "desc",
      filterType = "all",
    } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);


    const adminRoles = await Role.find({
      role: { $in: ["Admin", "Content Admin"] },
    }).select("_id");

    const superAdminRole = await Role.findOne({
      role: "Super Admin",
    }).select("_id");

    const adminRoleIds = adminRoles.map((r) => r._id);


    const filter = {
      ...(search
        ? {
            $or: [
              {
                username: {
                  $regex: search,
                  $options: "i",
                },
              },
              {
                email: {
                  $regex: search,
                  $options: "i",
                },
              },
            ],
          }
        : {}),
    };



    if (filterType === "admin") {
      filter.role = {
        $in: adminRoleIds,
      };
    } else if (
      ["parent", "provider", "centre"].includes(filterType)
    ) {
      // Parent / Provider / Centre
      const selectedRole = await Role.findOne({
        role: {
          $regex: `^${filterType}$`,
          $options: "i",
        },
      }).select("_id");

      if (selectedRole) {
        filter.role = selectedRole._id;
      } else {
        // No matching role
        filter.role = null;
      }
    } else if (filterType === "all") {
      // All users except Super Admin
      filter.role = {
        $ne: superAdminRole._id,
      };
    }


    const totalUsers = await User.countDocuments(filter);


    const users = await User.find(filter)
      .populate("role", "role")
      .select("-password -refreshToken")
      .sort({
        createdAt: sort === "asc" ? 1 : -1,
      })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);


    const usersWithExtraIds = await Promise.all(
      users.map(async (user) => {
        const obj = user.toObject();

        const roleName = obj.role?.role?.toLowerCase();


        if (roleName === "parent") {
          const parent = await Parent.findOne({
            userRef: user._id,
          }).select("_id parentDetails.fullName");

          obj.parentId = parent?._id || null;

          obj.displayName =
            parent?.parentDetails?.fullName || obj.username;
        }


        if (roleName === "provider") {
          const provider = await Provider.findOne({
            userRef: user._id,
            providerType: "individual",
          }).select("_id fullName");

          obj.providerId = provider?._id || null;

          obj.displayName =
            provider?.fullName || obj.username;
        }



        if (roleName === "centre") {
          const centre = await Provider.findOne({
            userRef: user._id,
            providerType: "centre",
          }).select("_id fullName");

          obj.centreId = centre?._id || null;

          obj.displayName =
            centre?.fullName || obj.username;
        }


        if (!obj.displayName) {
          obj.displayName = obj.username;
        }

        return obj;
      })
    );


    res.status(200).json({
      success: true,
      users: usersWithExtraIds,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(
          totalUsers / limitNumber
        ),
        totalUsers,
        limit: limitNumber,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SaaS Account Lifecycle — Admin-only endpoints
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/users/deactivate/:userId
 * Body: { reason: string }
 *
 * Admin deactivates a user account.
 * - Sets accountStatus = "deactivated" and isActive = false
 * - Records deactivationMeta + appends to accountStatusHistory
 * - Clears refreshToken (forces logout on 1stepdev immediately)
 * - If user is a Provider or Centre: sets provider.isActive = false
 * - ALWAYS sends deactivation email to the user via Resend
 * - Protected: cannot deactivate Super Admin accounts
 */
export const deactivateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id.toString();

    if (!reason || reason.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "A reason is required to deactivate an account (minimum 3 characters).",
      });
    }

    // Prevent admin deactivating themselves
    if (userId === adminId) {
      return res.status(400).json({ success: false, message: "You cannot deactivate your own account." });
    }

    const user = await User.findById(userId).populate("role");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Prevent deactivating Super Admin accounts
    if (user.role?.role?.toLowerCase() === "super admin") {
      return res.status(403).json({
        success: false,
        message: "Super Admin accounts cannot be deactivated.",
      });
    }

    if (user.accountStatus === "deactivated") {
      return res.status(400).json({
        success: false,
        message: "This account is already deactivated.",
      });
    }

    const previousStatus = user.accountStatus || "active";

    // 1. Update user record
    user.accountStatus    = "deactivated";
    user.isActive         = false;
    user.refreshToken     = null; // Force logout on 1stepdev
    user.deactivationMeta = {
      reason:          reason.trim(),
      deactivatedBy:   adminId,
      deactivatedAt:   new Date(),
      reactivatedAt:   null,
      reactivatedBy:   null,
    };

    // Append to audit history (keep last 50)
    user.accountStatusHistory.push({
      fromStatus: previousStatus,
      toStatus:   "deactivated",
      changedBy:  adminId,
      reason:     reason.trim(),
      changedAt:  new Date(),
    });
    if (user.accountStatusHistory.length > 50) {
      user.accountStatusHistory = user.accountStatusHistory.slice(-50);
    }

    await user.save();

    // 2. Deactivate associated Provider/Centre profile (isActive only — no cascade)
    const roleName = user.role?.role?.toLowerCase();
    if (roleName === "provider" || roleName === "centre") {
      await Provider.updateOne(
        { userRef: userId },
        { $set: { isActive: false } }
      );
    }

    // Strip sensitive fields before responding
    const { password, refreshToken, ...safeUser } = user.toObject();
    return res.status(200).json({
      success: true,
      message: `Account for ${user.email} has been deactivated successfully.`,
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/users/reactivate/:userId
 * Body: { sendEmail?: boolean, note?: string }
 *
 * Admin reactivates a deactivated account.
 * - Sets accountStatus = "active" and isActive = true
 * - Updates deactivationMeta with reactivation info
 * - Re-enables Provider/Centre profile if applicable
 * - Sends reactivation email ONLY if sendEmail === true
 */
export const reactivateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { sendEmail: shouldSendEmail = false, note = "" } = req.body;
    const adminId = req.user.id;

    const user = await User.findById(userId).populate("role");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (user.accountStatus !== "deactivated") {
      return res.status(400).json({
        success: false,
        message: `Cannot reactivate — account status is currently "${user.accountStatus}".`,
      });
    }

    const previousStatus = user.accountStatus;

    // 1. Restore account
    user.accountStatus = "active";
    user.isActive      = true;
    user.deactivationMeta = {
      ...user.deactivationMeta,
      reactivatedAt: new Date(),
      reactivatedBy: adminId,
    };

    user.accountStatusHistory.push({
      fromStatus: previousStatus,
      toStatus:   "active",
      changedBy:  adminId,
      reason:     note.trim() || "Reactivated by admin",
      changedAt:  new Date(),
    });
    if (user.accountStatusHistory.length > 50) {
      user.accountStatusHistory = user.accountStatusHistory.slice(-50);
    }

    await user.save();

    // 2. Re-enable Provider/Centre profile
    const roleName = user.role?.role?.toLowerCase();
    if (roleName === "provider" || roleName === "centre") {
      await Provider.updateOne(
        { userRef: userId },
        { $set: { isActive: true } }
      );
    }

    // 3. Optionally send reactivation email (admin's choice)
    if (shouldSendEmail === true || shouldSendEmail === "true") {
      sendAccountReactivatedEmail({ user }).catch((err) => {
        console.error("[reactivateUser] Email send failed:", err?.message);
      });
    }

    const { password, refreshToken, ...safeUser } = user.toObject();
    return res.status(200).json({
      success: true,
      message: `Account for ${user.email} has been reactivated successfully.${shouldSendEmail ? " Notification email sent to user." : ""}`,
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/status-history/:userId
 * Returns full accountStatusHistory for audit trail display in admin dashboard.
 */
export const getUserStatusHistory = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId)
      .select("accountStatus accountStatusHistory deactivationMeta email username")
      .populate("accountStatusHistory.changedBy", "username email")
      .populate("deactivationMeta.deactivatedBy", "username email")
      .populate("deactivationMeta.reactivatedBy", "username email")
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.status(200).json({
      success: true,
      accountStatus: user.accountStatus,
      deactivationMeta: user.deactivationMeta,
      history: (user.accountStatusHistory || []).slice().reverse(), // newest first
    });
  } catch (error) {
    next(error);
  }
};