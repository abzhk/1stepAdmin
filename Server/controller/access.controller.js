import User from '../model/user.model.js';
import Role from '../model/role.model.js';
import Provider from '../model/provider.model.js';
import mongoose from 'mongoose';
import Parent from "../model/parent.model.js";

export const searchAccessUsers = async (req, res, next) => {
  try {
    const { q = "" } = req.query;

    const regex = new RegExp(q, "i");

    const users = await User.find({
      $or: [{ username: regex }, { email: regex }],
    })
      .populate("role", "role")
      .lean();

    if (!users.length) {
      return res.status(200).json({
        success: true,
        results: [],
      });
    }

    const userIds = users.map((u) => u._id.toString());

    const parents = await Parent.find({
      userRef: { $in: userIds },
    })
      .select("_id userRef")
      .lean();


    const providers = await Provider.find({
      userRef: { $in: userIds },
    })
      .select("_id userRef")
      .lean();

    const results = [];

    parents.forEach((p) => {
      const user = users.find(
        (u) => u._id.toString() === p.userRef.toString()
      );

      if (user) {
        results.push({
          type: "parent",
          profileId: p._id,
          userId: user._id,
          username: user.username,
          email: user.email,
          role: user.role?.role,
        });
      }
    });

    providers.forEach((p) => {
      const user = users.find(
        (u) => u._id.toString() === p.userRef.toString()
      );

      if (user) {
        results.push({
          type: "provider",
          profileId: p._id,
          userId: user._id,
          username: user.username,
          email: user.email,
          role: user.role?.role,
        });
      }
    });

    res.status(200).json({
      success: true,
      results,
    });
  } catch (error) {
    next(error);
  }
};


export const getParentAccess = async (req, res, next) => {
  try {
    const { id } = req.params;

    const parent = await Parent.findById(id).populate({
      path: "userRef",
      populate: { path: "role" },
    });

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: parent,
    });
  } catch (error) {
    next(error);
  }
};


export const getProviderAccess = async (req, res, next) => {
  try {
    const { id } = req.params;

    const provider = await Provider.findById(id).lean();

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    const user = await User.findById(provider.userRef)
      .populate("role")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...provider,
        userRef: user,
      },
    });
  } catch (error) {
    next(error);
  }
};


//permission overide for user
export const updateUserOverride = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { permissions = [] } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.permissionsOverride = permissions;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Permissions updated successfully",
    });
  } catch (error) {
    next(error);
  }
};
