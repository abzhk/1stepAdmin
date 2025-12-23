import mongoose from "mongoose";
import Provider from "../model/provider.model.js";
import { Booking } from "../model/booking.model.js";
import { errorHandler } from "../utils/error.js";
import nodemailer from "nodemailer";
// import { BookedSlots } from "../models/booking.model.js";
// import Proof from "../models/proof.model.js";
// import SkilledProvider from "../models/skilledprovider.model.js";

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
          "fullName name address profilePicture createdAt verified regularPrice experience therapytype ratingSummary timeSlots"
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

    const providersWithBooking = providers.map((provider) => ({
      ...provider,
      totalBookings: bookingMap.get(provider._id.toString()) || 0,
    }));

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
