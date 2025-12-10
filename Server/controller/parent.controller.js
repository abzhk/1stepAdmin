import User from "../model/usermodel.js";
import Parent from "../model/parent.model.js";
// import Question from "../models/questionnaire.model.js";
import Like from "../model/like.model.js";
// import ProviderResource from "../models/providerresource.model.js";
import {Booking} from '../model/booking.model.js'
import Progress from '../model/Training/progress.model.js'
import mongoose from "mongoose";

export const createParent = async (req, res, next) => {
  const id = req.params.id;
  try {
    if (id === null) {
      return res.status(400).json({
        message: "User not found Logout and Signin Again",
        status: false,
      });
    }
    const userExist = await User.findById(id);
    if (!userExist) {
      return res
        .status(404)
        .json({ message: "User not Found, try again later", status: false });
    }
    let parent = await Parent.findOne({ userRef: id });
    if (parent) {
      return res.status(400).json({
        message: "You already created parent details",
        status: false,
      });
    }
    const createParent = await Parent.create({ ...req.body, userRef: id });
    if (!createParent) {
      return res
        .status(400)
        .json({ message: "could not created", status: false });
    }
    res.status(201).json({
      message: "Parent created Successfully",
      createParent,
      status: true,
    });
  } catch (error) {
    next(error);
  }
};

export const getParent = async (req, res, next) => {
  const id = req.params.id;
  try {
    if (!id) {
      return res.status(404).json({
        message: "User not found, Signout and Signin Again",
        status: false,
      });
    }
    const parentExists = await Parent.findOne({ userRef: id });
    if (!parentExists) {
      return res.status(200).json({
        message: "Could find parent Details, try again later",
        status: false,
      });
    }
    res.status(201).json(parentExists);
  } catch (error) {
    next(error);
  }
};

export const updateParent = async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ message: "User not found", status: false });
  }
  try {
    const parentExists = await Parent.findOne({ userRef: id });
    if (!parentExists) {
      return res
        .status(400)
        .json({ message: "ParentDetails not found, try again later" });
    }

    const updateParent = await Parent.findOneAndUpdate(
      { userRef: id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updateParent) {
      return res
        .status(500)
        .json({ message: "Could not update parent details, try later." });
    }
    res
      .status(200)
      .json({ message: "Parent details updated successfully", updateParent });
  } catch (error) {
    next(error);
  }
};

export const questionnaireParent = async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return res.status(404).json({ message: "User not found", status: false });
  }
  try {
    const userId = await User.findById({ _id: id });
    if (!userId) {
      return res.status(404).json({ message: "User not valid", status: false });
    }
    const existQuestion = await Question.findOne({ userId: id });
    if (existQuestion) {
      return res
        .status(404)
        .json({ message: "Questionnaire Already submitted", status: false });
    }
    const createQuestion = await Question({ ...req.body, userId: id });
    createQuestion.save();
    return res
      .status(201)
      .json({ message: "Questionnaire created", status: true });
  } catch (error) {
    next(error);
  }
};

export const toggleLikedResource = async (req, res, next) => {
  try {
    const { userId, resourceId } = req.body;
    if (!userId || !resourceId) {
      return res
        .status(400)
        .json({ message: "Invalid request", success: false });
    }

    const session = await mongoose.startSession();
    let actionType = null;

    try {
      await session.withTransaction(async () => {
        const [userExists, resourceExists] = await Promise.all([
          User.exists({ _id: userId }).session(session),
          ProviderResource.exists({ _id: resourceId }).session(session),
        ]);

        if (!userExists || !resourceExists) {
          throw new Error("USER_OR_RESOURCE_NOT_FOUND");
        }

        const existingLike = await Like.findOne({
          user: userId,
          resource: resourceId,
        }).session(session);

        if (existingLike) {
          await Like.deleteOne({ _id: existingLike._id }).session(session);
          await ProviderResource.findByIdAndUpdate(
            resourceId,
            { $inc: { "stats.liked": -1 } },
            { session }
          );
          actionType = "removed";
        } else {
          await Like.create([{ user: userId, resource: resourceId }], {
            session,
          });
          await ProviderResource.findByIdAndUpdate(
            resourceId,
            { $inc: { "stats.liked": 1 } },
            { session }
          );
          actionType = "added";
        }
      });

      return res.status(200).json({
        message: actionType === "removed" ? "Like removed" : "Liked",
        success: true,
      });
    } catch (error) {
      console.error("Transaction error:", error);

      if (error.message === "USER_OR_RESOURCE_NOT_FOUND") {
        return res.status(404).json({
          message: "User or Resource not found",
          success: false,
        });
      }
      next(error);
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("Server error:", error);
    next(error);
  }
};

export const fetchLikedResource = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "Invalid ID", success: false });
    }

    const likedResources = await Like.find({ user: userId }).select("resource");

    return res.json({
      success: true,
      likedResources: likedResources.map((r) => r.resource),
    });
  } catch (error) {
    next(error);
  }
};

export const viewCountResource = async (req, res, next) => {};

export const getallparents = async(req,res,next)=>{
 try{
const{
    limit=9,
    startIndex=0,
    searchTerm='',
    sort='createdAt',
    order='desc'
}= req.query;

 const query = { isParent: true };
    const searchFilters = [];

      if (searchTerm) {
      const cleanedSearchTerm = searchTerm.trim().replace(/\s+/g, " ");

      if (cleanedSearchTerm) {
        const regex = new RegExp(cleanedSearchTerm, "i");

        searchFilters.push({
          $or: [
            { "parentDetails.fullName": regex },
            { "parentDetails.childName": regex },
            { "parentDetails.phoneNumber": regex },
            { "parentDetails.address": regex },
          ],
        });
      }
    }
   if (searchFilters.length > 0) {
      query.$and = searchFilters;
    }

    const sortQuery = {};
    sortQuery[sort] = order === "desc" ? -1 : 1;

    const numericLimit = Number(limit);
    const numericStartIndex = Number(startIndex);

    const [parents, totalCount] = await Promise.all([
      Parent.find(query)
        .populate({
          path: "userRef",
          select: "username email profilePicture",
        })
        .sort(sortQuery)
        .skip(numericStartIndex)
        .limit(numericLimit)
        .lean(),
      Parent.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      parents,
      totalParents: totalCount,
      totalPages: Math.ceil(totalCount / numericLimit),
      currentPage: Math.floor(numericStartIndex / numericLimit) + 1,
      limit: numericLimit,
    });
  } catch (error) {
    next(error);
  }
};

//stats for booking--
export const parentstats = async (req, res, next) => {
  try {
    const { parentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(parentId)) {
      return res.status(400).json({ message: "invalid user", success: false });
    }

    const [totalBookings, likedResources, progressDocs] = await Promise.all([
      Booking.countDocuments({ patient: parentId }),
      Like.countDocuments({ user: parentId }),
      Progress.find({ parent: parentId })
        .select("modules certification")
        .lean(),
    ]);

    let totalCourses = 0;
    let completedCourses = 0;
    let activeCourses = 0;
    let avgCourseProgress = 0;
    let totalAssessmentsAttempted = 0;

    if (progressDocs.length > 0) {
      totalCourses = progressDocs.length;

      const courseProgressList = [];

      progressDocs.forEach((record) => {
        const modules = record.modules || [];
        const totalModules = modules.length;
        const completedModules = modules.filter((m) => m.completed).length;

        const progress =
          totalModules > 0
            ? Math.round((completedModules / totalModules) * 100)
            : 0;

        courseProgressList.push(progress);

        if (record.certification?.certified || progress === 100) {
          completedCourses += 1;
        }

        modules.forEach((m) => {
          if (m.assessment?.attempted) {
            totalAssessmentsAttempted += 1;
          }
        });
      });

      activeCourses = totalCourses - completedCourses;

      avgCourseProgress =
        courseProgressList.length > 0
          ? Math.round(
              courseProgressList.reduce((a, b) => a + b, 0) /
                courseProgressList.length
            )
          : 0;
    }

    return res.status(200).json({
      success: true,
      data: {
        totalBookings,
        likedResources,
        totalCourses,
        completedCourses,
        activeCourses,
        avgCourseProgress,
        totalAssessmentsAttempted,  
      },
    });
  } catch (error) {
    console.error("parentstats error:", error);
    next(error);
  }
};


