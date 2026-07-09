import mongoose from "mongoose";
import Provider from "../model/provider.model.js";
import { Booking } from "../model/booking.model.js";
import { errorHandler } from "../utils/error.js";
import nodemailer from "nodemailer";
import User from "../model/user.model.js";
import { BookedSlots } from "../model/booking.model.js";
// import Proof from "../models/proof.model.js";
// import SkilledProvider from "../models/skilledprovider.model.js";
import UserSubscription from "../model/subscription.model.js";
import Invitation from "../model/Centre/invitation.model.js";


//validator
// import { validateResource } from "../validator/resourceProvider.js";
// import ProviderResource from "../models/providerresource.model.js";

export const createProvider = async (req, res, next) => {
  const { userRef } = req.body;
  if (!userRef) {
    return res.status(400).json({
      success: false,
      message: "User not there, Logout and Try again!",
    });
  }
  if (userRef !== req.user.id) {
    return res.status(401).json({
      success: false,
      message: "Access Denied!!, Logout and try again",
    });
  }
  try {
    const existProvider = await Provider.findOne({ userRef });
    if (existProvider) {
      return res
        .status(409)
        .json({ success: false, message: "Provider already exists." });
    }
    const provider = await Provider.create(req.body);
    return res.status(201).json({ success: true, provider });
  } catch (error) {
    next(error);
  }
};

export const deleteProvider = async (req, res, next) => {
  const provider = await Provider.findById(req.params.id);
  if (!provider) {
    return next(errorHandler(404, "Provider not found"));
  }
  if (req.user.id !== provider.userRef) {
    return next(errorHandler(401, "You can delete only your provider"));
  }

  try {
    await Provider.findByIdAndDelete(req.params.id);
    res.status(200).json("Provider deleted successfully");
  } catch (error) {
    next(error);
  }
};

export const updateProvider = async (req, res, next) => {
  const provider = await Provider.findById(req.params.id);
  if (!provider) {
    return next(errorHandler(404, "Provider not found"));
  }
  if (req.user.id !== provider.userRef) {
    return next(errorHandler(401, "You can update only your provider"));
  }
  try {
    const updatedProvider = await Provider.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedProvider);
  } catch (error) {
    next(error);
  }
};

export const getProvider = async (req, res, next) => {
  try {
    const listing = await Provider.findById(req.params.id);
    if (!listing) {
      return next(errorHandler(404, "Provider not found"));
    }

    const bookedSlotsProvider = await BookedSlots.find({
      provider: req.params.id,
    });

    const providerResources = await ProviderResource.find({
      provider: req.params.id,
    });

    const response = {
      ...listing.toObject(),
      bookedSlot: bookedSlotsProvider.length ? bookedSlotsProvider : [],
      resources: providerResources.length ? providerResources : [],
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const fetchProvider = async (req, res, next) => {
  console.log(req.params.id);
  try {
    const fetchProvider = await Provider.findOne({ userRef: req.params.id });

    if (!fetchProvider || fetchProvider.length === 0) {
      return res
        .status(404)
        .json({ message: "Provider not found", status: false });
    } else {
      return res.status(200).json({ status: true, fetchProvider });
    }
  } catch (error) {
    next(error);
  }
};

export const getProviderId = async (req, res, next) => {
  console.log(req.params.id);
  try {
    const fetchProvider = await Provider.findOne({ userRef: req.params.id });

    if (!fetchProvider || fetchProvider.length === 0) {
      return res
        .status(404)
        .json({ message: "Provider not found", success: false });
    } else {
      return res
        .status(200)
        .json({ success: true, fetchProvider: fetchProvider });
    }
  } catch (error) {
    next(error);
  }
};

export const getProviders = async (req, res, next) => {
  try {
    const {
      limit = 12,
      startIndex = 0,
      searchTerm = "",
      address = "",
      providerType="",
      sort = "createdAt",
      order = "desc",
    } = req.query;

    let query = {};
    const searchFilters = [];

    // Handle search term with hybrid approach
    if (searchTerm) {
      const cleanedSearchTerm = searchTerm.trim().replace(/\s+/g, " ");

      if (cleanedSearchTerm) {
        // Hybrid search: Use both text search and regex
        const textSearchFilter = { $text: { $search: cleanedSearchTerm } };
        const regexSearchFilter = {
          $or: [
            { fullName: { $regex: cleanedSearchTerm, $options: "i" } },
            { name: { $regex: cleanedSearchTerm, $options: "i" } },
            { "address.city": { $regex: cleanedSearchTerm, $options: "i" } },
            { "address.state": { $regex: cleanedSearchTerm, $options: "i" } },
            { therapytype: { $regex: cleanedSearchTerm, $options: "i" } },
          ],
        };

        // Try text search first, fallback to regex if no results
        try {
          const textSearchCount = await Provider.countDocuments(
            textSearchFilter
          );
          if (textSearchCount > 0) {
            searchFilters.push(textSearchFilter);
          } else {
            searchFilters.push(regexSearchFilter);
          }
        } catch (error) {
          // If text search fails (no text index), use regex
          searchFilters.push(regexSearchFilter);
        }
      }
    }

    // Handle address filter
    if (address) {
      const cleanedAddress = address.trim();
      if (cleanedAddress) {
        if (isNaN(cleanedAddress)) {
          searchFilters.push({
            "address.city": { $regex: new RegExp(`^${cleanedAddress}`, "i") },
          });
        } else {
          searchFilters.push({
            "address.pincode": parseInt(cleanedAddress),
          });
        }
      }
    }

    if(providerType){
      searchFilters.push({
        providerType:providerType,
      })
    }

    // Combine all filters
    if (searchFilters.length > 0) {
      query = { $and: searchFilters };
    }

    // Dynamic sort handling
    const sortQuery = {};
    sortQuery[sort] = order === "desc" ? -1 : 1;

    // Add text score only if using text search
    const isUsingTextSearch = searchFilters.some((filter) => filter.$text);
    if (isUsingTextSearch) {
      sortQuery.score = { $meta: "textScore" };
    }

    const [providers, totalCount] = await Promise.all([
      Provider.find(query)
        .collation({ locale: "en", strength: 2 })
        .sort(sortQuery)
        .limit(Number(limit))
        .skip(Number(startIndex))
        .select(
          "fullName name address email phone providerType profilePicture createdAt verified regularPrice experience therapytype ratingSummary timeSlots userRef"
        )
        .lean(),

      Provider.countDocuments(query),
    ]);

    // Batch booking counts (unchanged)
    const providerIds = providers.map((p) => p._id);
    const last48hrs = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const bookings = await Booking.aggregate([
      {
        $match: {
          provider: { $in: providerIds },
          createdAt: { $gte: last48hrs },
        },
      },
      {
        $group: {
          _id: "$provider",
          count: { $sum: 1 },
        },
      },
    ]);

    const bookingMap = new Map(
      bookings.map((b) => [b._id.toString(), b.count])
    );

   const providersWithBooking = await Promise.all(
  providers.map(async (provider) => {
    const user = await User.findById(
      new mongoose.Types.ObjectId(provider.userRef)
    ).select("isActive");

    return {
      ...provider,
      totalBookings: bookingMap.get(provider._id.toString()) || 0,
      isActive: user ? user.isActive : false,
    };
  })
);
const activeProviders = providersWithBooking.filter(
  (p) => p.isActive === true
);



    res.status(200).json({
      providers: providersWithBooking,
      totalCount,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminProviders = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.order === "asc" ? 1 : -1;
    const providers = await Provider.find(
      ...(req.query.userId && { userRef: req.query.userId })
    );
  } catch (error) {
    next(error);
  }
};

let otpStorage = {};

const otpverifyProvider = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.log("Error sending email:", error);
    return false;
  }
};

export const sendOtp = async (req, res, next) => {
  const { email } = req.body;
  try {
    const validemail = await Provider.findOne({ email });
    if (!validemail) {
      return next(errorHandler(404, "Email not found"));
    }
    const generateOtp = Math.floor(Math.random() * 900000) + 100000;

    console.log(generateOtp);

    otpStorage[email] = generateOtp;
    const html = `<b>Your 1Step Verified Provider Otp : <i>${generateOtp}</i></b>`;
    const subject = "Provider OTP Verification";

    const emailSend = await otpverifyProvider(email, subject, html);

    if (emailSend) {
      return res
        .status(200)
        .json({ success: true, message: "OTP sent successfully" });
    } else {
      return res
        .status(500)
        .json({ success: false, message: "Failed to SEND OTP" });
    }
  } catch (error) {
    return res.status(500).json("Error, cant send email!");
  }
};

export const verifyOtpProvider = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (otp.length !== 6) {
      return res
        .status(400)
        .json({ success: false, message: "Enter a valid 6-digit OTP" });
    }
    const storedOtp = otpStorage[email];
    console.log(storedOtp);
    if (!storedOtp) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }
    if (storedOtp.toString() === otp) {
      const result = await Provider.updateOne(
        {
          email: email,
        },
        {
          $set: {
            verified: true,
            status: 1,
          },
        }
      );
      if (result.modifiedCount === 0) {
        return res.status(400).json({
          success: false,
          message: "Provider not verified, try again",
        });
      }
      delete otpStorage[email];
      return res.status(200).json({ success: true, message: "OTP verified" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
  } catch (error) {
    next(error);
  }
};

export const modifiedTimeslot = async (req, res, next) => {
  const id = req.params.id;
  const timeSlots = req.body.timeSlots;
  try {
    const provider = await Provider.findById(id);
    if (!provider) {
      return next(errorHandler(404, "Provider not found"));
    }

    const mergedTimeSlots = {
      ...provider.timeSlots,
      ...timeSlots,
    };

    const updateProvider = await Provider.findByIdAndUpdate(
      id,
      {
        $set: {
          timeSlots: mergedTimeSlots,
        },
      },
      {
        new: true,
      }
    );
    res.status(200).json({
      status: true,
      message: "TimeSlots updated successfully ",
      provider: updateProvider,
    });
  } catch (error) {
    next(error);
  }
};

//exp and skill
export const uploadDocs = async (req, res, next) => {
  const { userRef, documents } = req.body;

  try {
    if (!userRef) {
      return res.status(400).json({
        success: false,
        message: "User not there, Logout and Try again!",
      });
    }
    const provider = await Provider.findOne({ userRef });
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }
    const existProof = await Proof.findOne({ userId: userRef });
    if (existProof) {
      return res.status(409).json({
        success: false,
        message: "Document already uploaded",
      });
    }
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No documents provided.",
      });
    }

    const proof = await Proof.create({
      userId: provider.userRef,
      providerId: provider._id,
      documents: documents,
      status: "pending",
    });
    return res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      proof,
    });
  } catch (error) {
    next(error);
  }
};

export const fetchDocsResult = async (req, res, next) => {
  try {
    const proof = await Proof.findOne({ providerId: req.params.id });
    if (!proof) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }
    return res.status(200).json({
      success: true,
      proof: [proof],
    });
  } catch (error) {
    next(error);
  }
};

//skilledProvider
export const uploadSkilledDocs = async (req, res, next) => {
  const { userRef, documents, institutions, workHistory } = req.body;

  try {
    if (!userRef) {
      return res.status(400).json({
        success: false,
        message: "User not found. Please log out and try again!",
      });
    }

    const provider = await Provider.findOne({ userRef });
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    const existProof = await SkilledProvider.findOne({
      userId: userRef,
      providerId: provider._id,
    });
    if (existProof) {
      return res.status(409).json({
        success: false,
        message: "Documents already uploaded",
      });
    }

    const allDocuments = [
      ...(documents.testimonials || []),
      ...(documents.caseStudies || []),
      ...(documents.trainingCertificates || []),
    ];

    if (allDocuments.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one document is required.",
      });
    }

    const proof = await SkilledProvider.create({
      userId: provider.userRef,
      providerId: provider._id,
      workHistory,
      institutions,
      documents,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Documents uploaded successfully!",
      proof,
    });
  } catch (error) {
    next(error);
  }
};

export const fetchSkilledResult = async (req, res, next) => {
  try {
    const proof = await SkilledProvider.findOne({ providerId: req.params.id });
    if (!proof) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }
    return res.status(200).json({
      success: true,
      proof: [proof],
    });
  } catch (error) {
    next(error);
  }
};

//resourceUpload--
export const createResource = async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User not found. Please log out and try again!",
      });
    }

    const provider = await Provider.findOne({ userRef: id });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }
    const resource = new ProviderResource({
      provider: provider._id,
      ...req.body,
      stats: { view: 0, liked: 0 },
    });
    await resource.save();
    return res
      .status(201)
      .json({ message: "Resource Submitted", success: true });
  } catch (error) {
    next(error);
  }
};

export const getProviderById = async (req, res) => {
  const provider = await Provider.findById(req.params.id);

  if (!provider) {
    return res.status(404).json({
      success: false,
      message: "Provider not found",
    });
  }

  res.status(200).json({
    success: true,
    provider,
  });
};

//provider stats 
export const getProviderStats = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid provider id" });
    }
    const providerId = new mongoose.Types.ObjectId(id);


    const now = new Date();
    const month = req.query.month ? Number(req.query.month) : now.getMonth() + 1; 
    const year = req.query.year ? Number(req.query.year) : now.getFullYear();

    const limit = Number(req.query.limit) || 8;
    const startIndex = Number(req.query.startIndex) || 0;


    const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);


    const buildStats = (rows, total) => {
      const stats = {
        total,
        pending: 0,
        approved: 0,
        completed: 0,
        rejected: 0,
        expired: 0,
      };

      rows.forEach((row) => {
        if (stats.hasOwnProperty(row._id)) {
          stats[row._id] = row.count;
        }
      });

      return stats;
    };


    const allTimeAgg = await Booking.aggregate([
      { $match: { provider: providerId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const allTimeTotal = allTimeAgg.reduce((sum, row) => sum + row.count, 0);
    const allTime = buildStats(allTimeAgg, allTimeTotal);

    const monthAgg = await Booking.aggregate([
      {
        $match: {
          provider: providerId,
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const monthTotal = monthAgg.reduce((sum, row) => sum + row.count, 0);
    const monthly = buildStats(monthAgg, monthTotal);

    const bookingDetails = await Booking.aggregate([
      {
        $match: {
          provider: providerId,
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "patient",
          foreignField: "_id",
          as: "patientDetails",
        },
      },
      { $unwind: "$patientDetails" },
      {
        $project: {
          "patientDetails.profilePicture": 1,
          "patientDetails.username": 1,
          patientName: 1,
          createdAt: 1,
          note: 1,
          scheduledTime: 1,
          status: 1,
          sessionType: 1,
          service: 1,
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: startIndex },
      { $limit: limit },
    ]);

    res.status(200).json({
      success: true,
      providerId: id,
      filter: { month, year },
      stats: {
        allTime,
        monthly,
      },
      bookings: {
        items: bookingDetails,
        total: monthTotal,
      },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
//provider status deactivate or activate
export const setProviderActiveStatus = async (req, res, next) => {
  try {
    const { providerId, isActive } = req.body;

    if (!providerId) {
      return res.status(400).json({
        success: false,
        message: "providerId is required",
      });
    }

    // find provider
    const provider = await Provider.findById(providerId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }
 const userId = new mongoose.Types.ObjectId(provider.userRef);


      if (isActive === false) {

      const subscription = await UserSubscription.findOne({
        user: userId,
        status: { $in: ["active", "trial", "past_due"] },
      });

      if (subscription) {
        return res.status(400).json({
          success: false,
          message:
            "Provider has an active subscription. Cancel subscription before deactivating.",
        });
      }
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const hasBookings = await Booking.exists({
        provider: provider._id,
        "scheduledTime.date": { $gte: startOfToday },
        status: { $nin: ["rejected", "completed", "expired"] },
      });

      if (hasBookings) {
        return res.status(400).json({
          success: false,
          message:
            "Provider has upcoming bookings. Cannot deactivate.",
        });
      }
    }

   
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Provider ${isActive ? "Activated" : "Deactivated"} successfully`,
      isActive: user.isActive,
    });
  } catch (error) {
    next(error);
  }
};
//get inactive users of provider
export const getInactiveProviders = async (req, res, next) => {
  try {
    const providers = await Provider.aggregate([
      {
        $addFields: {
          userObjId: { $toObjectId: "$userRef" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userObjId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $match: {
          "user.isActive": false,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      providers,
    });
  } catch (error) {
    next(error);
  }
};

//center appointments

export const getCentreAppointments = async (req, res, next) => {
  try {
    const { limit = 10, startIndex = 0 } = req.query;

    const appointments = await Booking.aggregate([
      {
        $lookup: {
          from: "providers",
          localField: "provider",
          foreignField: "_id",
          as: "providerDetails",
        },
      },
      { $unwind: "$providerDetails" },

      {
        $match: {
          "providerDetails.providerType": "centre",
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "patient",
          foreignField: "_id",
          as: "patientDetails",
        },
      },
      { $unwind: "$patientDetails" },

      {
        $project: {
          bookingId: 1,
          patientName: 1,
          status: 1,
          service: 1,
          sessionType: 1,
          scheduledTime: 1,
          createdAt: 1,

          "providerDetails.fullName": 1,
          "providerDetails.name": 1,

          "patientDetails.username": 1,
          "patientDetails.profilePicture": 1,
        },
      },

      { $sort: { createdAt: -1 } },
      { $skip: Number(startIndex) },
      { $limit: Number(limit) },
    ]);

    const total = await Booking.aggregate([
      {
        $lookup: {
          from: "providers",
          localField: "provider",
          foreignField: "_id",
          as: "providerDetails",
        },
      },
      { $unwind: "$providerDetails" },
      {
        $match: {
          "providerDetails.providerType": "centre",
        },
      },
      { $count: "total" },
    ]);

    res.status(200).json({
      success: true,
      appointments,
      total: total[0]?.total || 0,
    });
  } catch (error) {
    next(error);
  }
};


//get centre provider by user id

export const getCentresForAdmin = async (req, res, next) => {
  try {
    const {
      limit = 12,
      startIndex = 0,
    } = req.query;

    const totalCount = await Provider.countDocuments({
      providerType: "centre",
      isActive: true,
    });

    // 1. Get centres
    const centres = await Provider.find({
      providerType: "centre",
      isActive: true,
    })
      .populate("userRef", "isActive email profilePicture")
      .sort({ createdAt: -1 })
      .skip(Number(startIndex))
      .limit(Number(limit));

    // 2. Users
    const userIds = centres.map((c) => c.userRef);

    const users = await User.find({
      _id: { $in: userIds },
    }).select("username email profilePicture");

    const userMap = {};
    users.forEach((u) => {
      userMap[u._id.toString()] = u;
    });

    const centreIds = centres.map((c) => c._id.toString());

    const providerCounts = await Invitation.aggregate([
      {
        $addFields: {
          centreIdStr: { $toString: "$centreId" },
        },
      },
      {
        $match: {
          centreIdStr: { $in: centreIds },
          status: "accepted",
        },
      },
      {
        $group: {
          _id: "$centreIdStr",
          totalProviders: { $sum: 1 },
        },
      },
    ]);

    const countMap = {};
    providerCounts.forEach((item) => {
      countMap[item._id] = item.totalProviders;
    });

    const finalCentres = centres.map((c) => ({
      ...c.toObject(),
      user: userMap[c.userRef?.toString()] || null,
      totalProviders: countMap[c._id.toString()] || 0,
    }));

    const totalProviders = finalCentres.reduce(
      (sum, c) => sum + c.totalProviders,
      0
    );

    res.status(200).json({
      success: true,
      totalCount,
      totalCentres: finalCentres.length,
      totalProviders,
      centres: finalCentres,
    });
  } catch (error) {
    next(error);
  }
};

export const getCentreStats = async (req, res) => {
  try {
    const stats = await Provider.aggregate([
      {
        $match: {
          providerType: "centre",
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const formatted = stats.map((item) => ({
      month: monthNames[item._id - 1],
      centres: item.total,
    }));

    res.json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    console.error(err);
  }
};


export const getIndividualProviders = async (req, res, next) => {
  try {
    const {
      limit = 12,
      startIndex = 0,
      searchTerm = "",
      address = "",
      sort = "createdAt",
      order = "desc",
    } = req.query;

    let query = {
      providerType: "individual",
    };

    const searchFilters = [];

    if (searchTerm) {
      const cleanedSearchTerm = searchTerm.trim().replace(/\s+/g, " ");

      if (cleanedSearchTerm) {
        const textSearchFilter = {
          $text: { $search: cleanedSearchTerm },
        };

        const regexSearchFilter = {
          $or: [
            { fullName: { $regex: cleanedSearchTerm, $options: "i" } },
            { name: { $regex: cleanedSearchTerm, $options: "i" } },
            {
              "address.city": {
                $regex: cleanedSearchTerm,
                $options: "i",
              },
            },
            {
              "address.state": {
                $regex: cleanedSearchTerm,
                $options: "i",
              },
            },
            {
              therapytype: {
                $regex: cleanedSearchTerm,
                $options: "i",
              },
            },
          ],
        };

        try {
          const textSearchCount = await Provider.countDocuments(
            textSearchFilter
          );

          if (textSearchCount > 0) {
            searchFilters.push(textSearchFilter);
          } else {
            searchFilters.push(regexSearchFilter);
          }
        } catch {
          searchFilters.push(regexSearchFilter);
        }
      }
    }

    if (address) {
      const cleanedAddress = address.trim();

      if (cleanedAddress) {
        if (isNaN(cleanedAddress)) {
          searchFilters.push({
            "address.city": {
              $regex: new RegExp(`^${cleanedAddress}`, "i"),
            },
          });
        } else {
          searchFilters.push({
            "address.pincode": parseInt(cleanedAddress),
          });
        }
      }
    }

    if (searchFilters.length > 0) {
      query = {
        ...query,
        $and: searchFilters,
      };
    }

    const sortStage = {};
    sortStage[sort] = order === "desc" ? -1 : 1;

    const providers = await Provider.aggregate([
      {
        $match: query,
      },
      {
        $lookup: {
          from: "users",
          localField: "userRef",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $match: {
          "user.isActive": true,
        },
      },
      {
        $sort: sortStage,
      },
      {
        $facet: {
          data: [
            { $skip: Number(startIndex) },
            { $limit: Number(limit) },
            {
              $project: {
                fullName: 1,
                name: 1,
                address: 1,
                email: 1,
                phone: 1,
                providerType: 1,
                profilePicture: 1,
                createdAt: 1,
                verified: 1,
                regularPrice: 1,
                experience: 1,
                therapytype: 1,
                ratingSummary: 1,
                timeSlots: 1,
                userRef: 1,
              },
            },
          ],
          total: [{ $count: "count" }],
        },
      },
    ]);

    const providerList = providers[0].data;
    const totalCount = providers[0].total[0]?.count || 0;

    const providerIds = providerList.map((p) => p._id);

    const last48hrs = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const bookings = await Booking.aggregate([
      {
        $match: {
          provider: { $in: providerIds },
          createdAt: { $gte: last48hrs },
        },
      },
      {
        $group: {
          _id: "$provider",
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    const bookingMap = new Map(
      bookings.map((b) => [b._id.toString(), b.count])
    );

    const providersWithBooking = providerList.map((provider) => ({
      ...provider,
      totalBookings: bookingMap.get(provider._id.toString()) || 0,
      isActive: true,
    }));

    res.status(200).json({
      providers: providersWithBooking,
      totalCount,
    });
  } catch (error) {
    console.error(error);
    next(errorHandler(500, "Failed to fetch providers"));
  }
};
export const getAllCentreDashboardStats = async (req, res, next) => {
  try {

    const acceptedProviders = await Invitation.find({
      status: "accepted",
    }).select("providerId");

    const providerIds = acceptedProviders
      .map((p) => p.providerId)
      .filter(Boolean);


    if (!providerIds.length) {
      return res.json({
        success: true,
        stats: { total: 0, today: 0, week: 0, month: 0 },
        upcoming: [],
      });
    }

    const now = new Date();

   
    const IST_OFFSET = 5.5 * 60 * 60 * 1000;

    const nowIST = new Date(now.getTime() + IST_OFFSET);

    const startOfTodayIST = new Date(nowIST);
    startOfTodayIST.setHours(0, 0, 0, 0);

    const endOfTodayIST = new Date(startOfTodayIST);
    endOfTodayIST.setHours(23, 59, 59, 999);

    const startOfWeekIST = new Date(startOfTodayIST);
    startOfWeekIST.setDate(startOfTodayIST.getDate() - startOfTodayIST.getDay());

    const endOfWeekIST = new Date(startOfWeekIST);
    endOfWeekIST.setDate(startOfWeekIST.getDate() + 6);
    endOfWeekIST.setHours(23, 59, 59, 999);

    const startOfMonthIST = new Date(
      startOfTodayIST.getFullYear(),
      startOfTodayIST.getMonth(),
      1
    );

    const endOfMonthIST = new Date(
      startOfTodayIST.getFullYear(),
      startOfTodayIST.getMonth() + 1,
      0
    );
    endOfMonthIST.setHours(23, 59, 59, 999);

    const startOfToday = new Date(startOfTodayIST.getTime() - IST_OFFSET);
    const endOfToday = new Date(endOfTodayIST.getTime() - IST_OFFSET);

    const startOfWeek = new Date(startOfWeekIST.getTime() - IST_OFFSET);
    const endOfWeek = new Date(endOfWeekIST.getTime() - IST_OFFSET);

    const startOfMonth = new Date(startOfMonthIST.getTime() - IST_OFFSET);
    const endOfMonth = new Date(endOfMonthIST.getTime() - IST_OFFSET);

  
    const bookings = await Booking.find({
      provider: { $in: providerIds },
      status: { $in: ["completed", "approved"] },
    });

    let today = 0;
    let week = 0;
    let month = 0;
    let total = bookings.length;

    bookings.forEach((b) => {
      const sessionDate = new Date(b?.scheduledTime?.date);
      if (!sessionDate) return;


      if (sessionDate >= startOfToday && sessionDate <= endOfToday) {
        today++;
      }

      if (sessionDate >= startOfWeek && sessionDate <= endOfWeek) {
        week++;
      }


      if (sessionDate >= startOfMonth && sessionDate <= endOfMonth) {
        month++;
      }
    });

    const upcoming = await Booking.find({
      provider: { $in: providerIds },
      "scheduledTime.date": { $gte: now },
    })
      .populate("provider", "fullName providerType")
      .sort({ "scheduledTime.date": 1 })
      .limit(10)
      .select(
        "bookingId scheduledTime status provider patientName service sessionType providerSnapshot patientSnapshot"
      );


    res.json({
      success: true,
      stats: {
        total,
        today,
        week,
        month,
      },
      upcoming,
    });
  } catch (error) {
    console.log(error);
     return next(errorHandler(500, "Failed to fetch dashboard stats"));
  }
};


export const getMonthlyAppointments = async (req, res,next) => {
  try {

    const acceptedProviders = await Invitation.find({
      status: "accepted",
    }).select("providerId");

    const providerIds = acceptedProviders
      .map((p) => p.providerId)
      .filter(Boolean);

    if (!providerIds.length) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const data = await Booking.aggregate([
      {
        $match: {
          provider: { $in: providerIds },
          status: { $in: ["completed", "approved"] },
        },
      },
      {
        $group: {
          _id: { $month: "$scheduledTime.date" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);


    const monthNames = [
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec"
    ];

    const fullYear = monthNames.map((m, i) => {
      const found = data.find((d) => d._id === i + 1);
      return {
        month: m,
        appointments: found ? found.count : 0,
      };
    });

    res.json({
      success: true,
      data: fullYear,
    });
  } catch (err) {
    console.error(err);
    return next(errorHandler(500,"Failed to fetch monthly report"))
  }
};

export const getCentreById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const centre = await Provider.findOne({
      _id: id,
      providerType: "centre",
    });

    if (!centre) {
  return next(errorHandler(404, "Centre not found"));
}

    res.status(200).json({
      success: true,
      centre,
    });
  } catch (error) {
    console.log(error);
    return next(errorHandler(500,"cannot find centre"))
  }
};


export const getCentreFullDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

   if (!mongoose.Types.ObjectId.isValid(id)) {
  return next(errorHandler(400, "Invalid centre id"));
}

    const centre = await Provider.findOne({
      _id: id,
      providerType: "centre",
    }).lean();

    if (!centre) {
  return next(errorHandler(404, "Centre not found"));
}


    const invitations = await Invitation.find({
      centreId: id,
      status: "accepted",
    }).lean();

    const providerIds = invitations.map((i) => i.providerId);

    const providers = await Provider.find({
      _id: { $in: providerIds },
    })
      .select("fullName email phone userRef")
      .lean();


    const providerDetails = await Promise.all(
      providers.map(async (p) => {
        const user = await User.findById(p.userRef)
          .select("email isActive")
          .lean();

        const sessions = await Booking.countDocuments({
          provider: p._id,
        });

        return {
          _id: p._id,
          name: p.fullName,
          email: user?.email || "-",
          phone: p.phone,
          sessions,
          status: user?.isActive ? "Active" : "Inactive",
        };
      })
    );

    const totalSessions = await Booking.countDocuments({
      provider: { $in: providerIds },
    });

    res.status(200).json({
      success: true,
      centre,
      totalProviders: providerIds.length,
      totalSessions,
      providers: providerDetails,
    });
  } catch (error) {
   return next(errorHandler(500,"cannot find centre details"))
  }
};

export const updateCentreByAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid centre id",
      });
    }

    const centre = await Provider.findOne({
      _id: id,
      providerType: "centre",
    });

    if (!centre) {
      return res.status(404).json({
        success: false,
        message: "Centre not found",
      });
    }

    const allowedFields = [
      "fullName",
      "email",
      "phone",
      "qualification",
      "experience",
      "license",
      "regularPrice",
      "providerType",
    ];

    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const updatedCentre = await Provider.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Centre updated successfully",
      centre: updatedCentre,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCentre = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid centre id",
      });
    }

    const centre = await Provider.findOne({
      _id: id,
      providerType: "centre",
    });

    if (!centre) {
      return res.status(404).json({
        success: false,
        message: "Centre not found",
      });
    }

    const hasProviders = await Invitation.exists({
      centreId: id,
      status: "accepted",
    });

    if (hasProviders) {
      return res.status(400).json({
        success: false,
        message: "Centre has linked providers, cannot delete",
      });
    }

    const deletedCentre = await Provider.findByIdAndDelete(id);

const deletedUser = await User.findByIdAndDelete(centre.userRef);

console.log("Deleted Centre:", deletedCentre);
console.log("Deleted User:", deletedUser);

    return res.status(200).json({
      success: true,
      message: "Centre and user deleted successfully",
    });

  } catch (error) {
    next(error);
  }
};

export const setCentreActiveStatus = async (req, res, next) => {
  try {
    const { centreId, isActive } = req.body;

    if (!centreId) {
      return res.status(400).json({
        success: false,
        message: "centreId is required",
      });
    }

    const centre = await Provider.findOne({
      _id: centreId,
      providerType: "centre",
    });

    if (!centre) {
      return res.status(404).json({
        success: false,
        message: "Centre not found",
      });
    }

    if (isActive === false) {
      const hasProviders = await Invitation.exists({
        centreId,
        status: "accepted",
      });

      if (hasProviders) {
        return res.status(400).json({
          success: false,
          message:
            "Centre has linked providers. Remove providers before deactivating.",
        });
      }
    }

    // Update Provider collection
    centre.isActive = isActive;
   await Provider.findByIdAndUpdate(
  centreId,
  {
    $set: {
      isActive,
    },
  },
  {
    new: true,
  }
);

    // Update User collection
    await User.findByIdAndUpdate(
      centre.userRef,
      { isActive },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: `Centre ${
        isActive ? "Activated" : "Deactivated"
      } successfully`,
      isActive,
    });
  } catch (error) {
    next(error);
  }
};


export const getInactiveCentres = async (req, res, next) => {
  try {
    const centres = await Provider.find({
      providerType: "centre",
      isActive: false, 
    })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      centres,
    });
  } catch (error) {
    next(error);
  }
};

