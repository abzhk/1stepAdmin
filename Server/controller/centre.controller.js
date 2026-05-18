import mongoose from "mongoose";
import crypto from "crypto";
import Provider from "../model/provider.model.js";
import CentreProvider from "../model/Centre/centreprovider.model.js";
import Invitation from "../model/Centre/invitation.model.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import moment from "moment";
import { errorHandler } from "../utils/error.js";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const getInvitationEmailTemplate = (
  providerName,
  centreName,
  consultationFee,
  role,
  message,
  acceptUrl
) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #65467C 0%, #8B6FA8 100%);
          color: white;
          padding: 30px;
          border-radius: 10px 10px 0 0;
          text-align: center;
        }
        .content {
          background: #ffffff;
          padding: 30px;
          border: 1px solid #e1d3eb;
          border-top: none;
        }
        .details {
          background: #f8f6fa;
          border-left: 4px solid #65467C;
          padding: 15px;
          margin: 20px 0;
        }
        .button {
          display: inline-block;
          background: #00C9BA;
          color: white !important;
          padding: 15px 40px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
          margin: 20px 0;
        }
        .footer {
          background: #f8f6fa;
          padding: 20px;
          border-radius: 0 0 10px 10px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        .highlight {
          color: #65467C;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🏥 Centre Invitation</h1>
      </div>
      
      <div class="content">
        <h2>Hello ${providerName},</h2>
        
        <p>You've been invited to join <span class="highlight">${centreName}</span> as a healthcare provider!</p>
        
        ${message ? `<p><em>"${message}"</em></p>` : ""}
        
        <div class="details">
          <h3>📋 Invitation Details:</h3>
          <ul>
            <li><strong>Centre:</strong> ${centreName}</li>
            <li><strong>Role:</strong> ${role.charAt(0).toUpperCase() + role.slice(1)
    }</li>
            <li><strong>Consultation Fee:</strong> ₹${consultationFee}</li>
          </ul>
        </div>
        
        <p>By accepting this invitation, you'll be able to:</p>
        <ul>
          <li>✅ Manage appointments at ${centreName}</li>
          <li>✅ Access centre resources and facilities</li>
          <li>✅ Collaborate with other healthcare providers</li>
          <li>✅ Grow your practice with centre support</li>
        </ul>
        
        <center>
          <a href="${acceptUrl}" class="button">Accept Invitation</a>
        </center>
        
        <p style="margin-top: 30px; font-size: 14px; color: #666;">
          <strong>⏰ Important:</strong> This invitation will expire in 7 days. 
          Please accept it before it expires.
        </p>
        
        <p style="font-size: 14px; color: #666;">
          If you're having trouble with the button above, copy and paste this link into your browser:<br>
          <code style="background: #f0f0f0; padding: 5px 10px; display: inline-block; margin-top: 5px; word-break: break-all;">
            ${acceptUrl}
          </code>
        </p>
      </div>
      
      <div class="footer">
        <p>This is an automated email. Please do not reply to this message.</p>
        <p>If you didn't expect this invitation, you can safely ignore this email.</p>
      </div>
    </body>
    </html>
  `;
};

// Email template for successful acceptance
const getAcceptanceConfirmationTemplate = (
  providerName,
  centreName,
  centreAddress,
  centrePhone
) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #00C9BA 0%, #00A08A 100%);
          color: white;
          padding: 30px;
          border-radius: 10px 10px 0 0;
          text-align: center;
        }
        .content {
          background: #ffffff;
          padding: 30px;
          border: 1px solid #c3fcf2;
          border-top: none;
        }
        .success-badge {
          background: #c3fcf2;
          color: #00A08A;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
          margin: 20px 0;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎉 Welcome Aboard!</h1>
      </div>
      
      <div class="content">
        <h2>Congratulations ${providerName}!</h2>
        
        <div class="success-badge">
          ✅ You've successfully joined ${centreName}
        </div>
        
        <p>You are now part of the ${centreName} team. Here's what happens next:</p>
        
        <ol>
          <li><strong>Dashboard Access:</strong> Log in to your dashboard to manage appointments</li>
          <li><strong>Profile Setup:</strong> Complete your centre-specific profile</li>
          <li><strong>Schedule Setup:</strong> Set your availability for appointments</li>
          <li><strong>Start Consultations:</strong> Begin accepting patients!</li>
        </ol>
        
        <div style="background: #f8f6fa; padding: 15px; margin: 20px 0; border-radius: 8px;">
          <h3>📍 Centre Information:</h3>
          <p><strong>Name:</strong> ${centreName}</p>
          ${centreAddress
      ? `<p><strong>Address:</strong> ${centreAddress}</p>`
      : ""
    }
          ${centrePhone ? `<p><strong>Phone:</strong> ${centrePhone}</p>` : ""}
        </div>
        
        <p>If you have any questions, please contact the centre administration.</p>
      </div>
    </body>
    </html>
  `;
};

// 1. INVITE SINGLE PROVIDER
export const inviteProvider = async (req, res) => {
  try {
    const { centreId } = req.params;
    const { providerEmail, role, consultationFee, proposedSlots, message } =
      req.body;
    const userId = req.user.id;

    // Verify centre
    const centre = await Provider.findOne({
      _id: centreId,
      providerType: "centre",
      userRef: userId,
    });

    if (!centre) {
      return res.status(404).json({
        success: false,
        message: "Centre not found or unauthorized",
      });
    }

    // Find provider
    const provider = await Provider.findOne({
      email: providerEmail.toLowerCase(),
      providerType: "individual",
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found. They must register first.",
      });
    }

    // Check if already added
    const existingRelation = await CentreProvider.findOne({
      centreId,
      providerId: provider._id,
      isActive: true,
    });

    if (existingRelation) {
      return res.status(400).json({
        success: false,
        message: "Provider already added to this centre",
      });
    }

    // Check pending invitation
    const existingInvitation = await Invitation.findOne({
      centreId,
      invitedEmail: providerEmail.toLowerCase(),
      status: "pending",
    });

    if (existingInvitation) {
      return res.status(400).json({
        success: false,
        message: "Invitation already sent and pending",
      });
    }

    // Create invitation
    const token = crypto.randomBytes(32).toString("hex");

    // Generate acceptance URL
    const acceptUrl = `${process.env.FRONTEND_URL}/accept-invitation/${token}`;

    // Send invitation email
    try {
      await transporter.sendMail({
        from: `"${centre.fullName}" <${process.env.EMAIL_USER}>`,
        to: provider.email,
        subject: `Invitation to Join ${centre.fullName}`,
        html: getInvitationEmailTemplate(
          provider.fullName,
          centre.fullName,
          consultationFee,
          role || "provider",
          message || "",
          acceptUrl
        ),
      });

      console.log(`Invitation email sent to ${provider.email}`);

      const invitation = await Invitation.create({
        centreId,
        invitedEmail: providerEmail.toLowerCase(),
        invitedBy: { userId, name: centre.fullName },
        token,
        role: role || "provider",
        consultationFee,
        proposedSlots: proposedSlots || {},
        message,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      res.status(201).json({
        success: true,
        message: "Invitation sent successfully",
        data: {
          invitationId: invitation._id,
          providerName: provider.fullName,
          providerEmail: provider.email,
          expiresAt: invitation.expiresAt,
        },
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      return res.status(500).json({
        success: false,
        message: "Failed to send invitation email",
      });
    }
  } catch (error) {
    console.error("Invite provider error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. BULK INVITE MULTIPLE PROVIDERS (NEW!)
export const bulkInviteProviders = async (req, res) => {
  try {
    const { centreId } = req.params;
    const { providers } = req.body; // Array of provider objects
    const userId = req.user.id;

    // Validate input
    if (!Array.isArray(providers) || providers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Providers array is required",
      });
    }

    // Verify centre
    const centre = await Provider.findOne({
      _id: centreId,
      providerType: "centre",
      userRef: userId,
    });

    if (!centre) {
      return res.status(404).json({
        success: false,
        message: "Centre not found or unauthorized",
      });
    }

    const results = {
      success: [],
      failed: [],
      total: providers.length,
    };

    // Process each provider
    for (const providerData of providers) {
      try {
        const { email, role, consultationFee, proposedSlots, message } =
          providerData;

        // Find provider
        const provider = await Provider.findOne({
          email: email.toLowerCase(),
          providerType: "individual",
        });

        if (!provider) {
          results.failed.push({
            email,
            reason: "Provider not found in system",
          });
          continue;
        }

        // Check if already added
        const existingRelation = await CentreProvider.findOne({
          centreId,
          providerId: provider._id,
          isActive: true,
        });

        if (existingRelation) {
          results.failed.push({
            email,
            reason: "Already added to centre",
          });
          continue;
        }

        // Check pending invitation
        const existingInvitation = await Invitation.findOne({
          centreId,
          invitedEmail: email.toLowerCase(),
          status: "pending",
        });

        if (existingInvitation) {
          results.failed.push({
            email,
            reason: "Invitation already sent",
          });
          continue;
        }

        // Create invitation
        const token = crypto.randomBytes(32).toString("hex");

        const invitation = await Invitation.create({
          centreId,
          invitedEmail: email.toLowerCase(),
          invitedBy: { userId, name: req.user.name },
          token,
          role: role || "provider",
          consultationFee,
          proposedSlots: proposedSlots || {},
          message,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        results.success.push({
          email,
          providerName: provider.fullName,
          invitationId: invitation._id,
        });

        // TODO: Send email
      } catch (error) {
        results.failed.push({
          email: providerData.email,
          reason: error.message,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Invitations sent: ${results.success.length}/${results.total}`,
      data: results,
    });
  } catch (error) {
    console.error("Bulk invite error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. ACCEPT INVITATION — PUBLIC: token is the proof of identity
// The 64-byte token was sent to provider's email; only they have it.
export const acceptInvitation = async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Invitation token missing",
    });
  }
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find invitation
    const invitation = await Invitation.findOne({ token }).session(session);

    if (!invitation) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Invitation not found",
      });
    }

    if (invitation.status !== "pending") {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Invitation already ${invitation.status}`,
      });
    }

    // Check expiration
    if (new Date() > invitation.expiresAt) {
      invitation.status = "expired";
      await invitation.save({ session });
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Invitation has expired",
      });
    }

    // Look up provider by invited email — token verifies identity
    const provider = await Provider.findOne({
      email: invitation.invitedEmail,
      providerType: "individual",
    }).session(session);

    if (!provider) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Provider profile not found. Please register with the invited email first.",
      });
    }

    // Guard: already a member
    const existingRelation = await CentreProvider.findOne({
      centreId: invitation.centreId,
      providerId: provider._id,
      isActive: true,
    }).session(session);

    if (existingRelation) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "You are already a member of this centre",
      });
    }

    // Find centre
    const centre = await Provider.findById(invitation.centreId).session(
      session
    );

    if (!centre) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Centre not found",
      });
    }

    // Create centre-provider relationship
    const relation = await CentreProvider.create(
      [
        {
          centreId: invitation.centreId,
          providerId: provider._id,
          role: invitation.role,
          consultationFee: invitation.consultationFee,
          centreAvailableSlots: invitation.proposedSlots,
          addedBy: invitation.invitedBy.userId,
          isActive: true,
          joinedAt: new Date(),
        },
      ],
      { session }
    );

    // Update invitation status
    invitation.status = "accepted";
    invitation.acceptedAt = new Date();
    invitation.providerId = provider._id;
    await invitation.save({ session });

    await session.commitTransaction();

    // Send confirmation email to provider
    try {
      await transporter.sendMail({
        from: `"${centre.fullName}" <${process.env.EMAIL_USER}>`,
        to: provider.email,
        subject: `Welcome to ${centre.fullName}!`,
        html: getAcceptanceConfirmationTemplate(
          provider.fullName,
          centre.fullName,
          centre.address || "",
          centre.phone || ""
        ),
      });
    } catch (emailError) {
      console.error("Confirmation email failed:", emailError);
    }

    // Populate and return result
    const result = await CentreProvider.findById(relation[0]._id)
      .populate("centreId", "fullName email phone address profilePicture")
      .populate("providerId", "fullName email profilePicture qualification");

    res.status(200).json({
      success: true,
      message: `Successfully joined ${centre.fullName}`,
      data: result,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Accept invitation error:", error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

export const getInvitationDetails = async (req, res) => {
  try {
    const { token } = req.params;
    console.log(token);
    const invitation = await Invitation.findOne({ token })
      .populate("centreId", "fullName email phone address profilePicture")
      .lean();

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found",
      });
    }

    // Check if expired
    const isExpired = new Date() > invitation.expiresAt;

    // Don't show sensitive data
    const safeInvitation = {
      centreName: invitation.centreId.fullName,
      centreEmail: invitation.centreId.email,
      centrePhone: invitation.centreId.phone,
      centreAddress: invitation.centreId.address,
      centreProfilePicture: invitation.centreId.profilePicture,
      role: invitation.role,
      consultationFee: invitation.consultationFee,
      message: invitation.message,
      expiresAt: invitation.expiresAt,
      status: isExpired ? "expired" : invitation.status,
      isExpired,
    };

    res.status(200).json({
      success: true,
      data: safeInvitation,
    });
  } catch (error) {
    console.error("Get invitation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. GET ALL PROVIDERS IN A CENTRE
export const getCentreProviders = async (req, res) => {
  try {
    const { centreId } = req.params;
    const { page = 1, limit = 10, role, search, services } = req.query;

    // Convert centreId to ObjectId if it's a string
    const query = {
      centreId: mongoose.Types.ObjectId.isValid(centreId)
        ? new mongoose.Types.ObjectId(centreId)
        : centreId,
      isActive: true,
    };

    if (role) query.role = role;

    const skip = (page - 1) * limit;

    let pipeline = [
      { $match: query },
      {
        $lookup: {
          from: "providers",
          localField: "providerId",
          foreignField: "_id",
          as: "provider",
        },
      },
      {
        $unwind: {
          path: "$provider",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    // Search filter
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { "provider.fullName": { $regex: search, $options: "i" } },
            { "provider.email": { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    // Service filter - multiple services (OR logic)
    if (services) {
      const serviceArray = services.split(",").map((s) => s.trim());
      pipeline.push({
        $match: {
          "provider.name": {
            $in: serviceArray,
          },
        },
      });
    }

    // Get total count before pagination
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await CentreProvider.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Add sorting and pagination
    pipeline.push(
      { $sort: { joinedAt: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    );

    const relations = await CentreProvider.aggregate(pipeline);

    let allProviders = null;
    if (page == 1 && !services) {
      const allPipeline = [
        { $match: query },
        {
          $lookup: {
            from: "providers",
            localField: "providerId",
            foreignField: "_id",
            as: "provider",
          },
        },
        {
          $unwind: {
            path: "$provider",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            "provider.name": 1,
            "provider._id": 1,
          },
        },
      ];
      allProviders = await CentreProvider.aggregate(allPipeline);
    }

    res.status(200).json({
      success: true,
      data: relations,
      allProviders: allProviders, // Send all providers only on first load
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get centre providers error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. GET ALL CENTRES FOR A PROVIDER
export const getProviderCentres = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { page = 1, limit = 10, search, services } = req.query;

    // Convert providerId to ObjectId if it's a string
    const query = {
      providerId: mongoose.Types.ObjectId.isValid(providerId)
        ? new mongoose.Types.ObjectId(providerId)
        : providerId,
      isActive: true,
    };

    const skip = (page - 1) * limit;

    let pipeline = [
      { $match: query },
      {
        $lookup: {
          from: "providers",
          localField: "centreId",
          foreignField: "_id",
          as: "centre",
        },
      },
      {
        $unwind: {
          path: "$centre",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          "centre.providerType": "centre",
        },
      },
    ];

    // Search filter
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { "centre.fullName": { $regex: search, $options: "i" } },
            { "centre.email": { $regex: search, $options: "i" } },
            { "centre.address.city": { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    // Service filter - centres offering specific services
    if (services) {
      const serviceArray = services.split(",").map((s) => s.trim());
      pipeline.push({
        $match: {
          "centre.name": {
            $in: serviceArray,
          },
        },
      });
    }

    // Get total count before pagination
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await CentreProvider.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Add sorting and pagination
    pipeline.push(
      { $sort: { joinedAt: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    );

    const relations = await CentreProvider.aggregate(pipeline);

    let allCentres = null;
    if (page == 1 && !services) {
      const allPipeline = [
        { $match: query },
        {
          $lookup: {
            from: "providers",
            localField: "centreId",
            foreignField: "_id",
            as: "centre",
          },
        },
        {
          $unwind: {
            path: "$centre",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            "centre.providerType": "centre",
          },
        },
        {
          $project: {
            "centre.name": 1,
            "centre._id": 1,
            "centre.fullName": 1,
          },
        },
      ];
      allCentres = await CentreProvider.aggregate(allPipeline);
    }

    res.status(200).json({
      success: true,
      data: relations,
      allCentres: allCentres,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get provider centres error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. REMOVE PROVIDER FROM CENTRE
export const removeProvider = async (req, res) => {
  try {
    const { centreId, providerId } = req.params;
    const userId = req.user.id;

    if (
      !mongoose.Types.ObjectId.isValid(centreId) ||
      !mongoose.Types.ObjectId.isValid(providerId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid centreId or providerId",
      });
    }

    const centre = await Provider.findOne({
      _id: centreId,
      providerType: "centre",
      userRef: userId,
    });

    if (!centre) {
      return res.status(404).json({
        success: false,
        message: "Centre not found or unauthorized",
      });
    }

    const relation = await CentreProvider.findOne({
      centreId,
      providerId,
      isActive: true,
    });

    if (!relation) {
      return res.status(404).json({
        success: false,
        message: "Provider not found in centre",
      });
    }

    relation.isActive = false;
    relation.leftAt = new Date();
    await relation.save();

    res.status(200).json({
      success: true,
      message: "Provider removed successfully",
    });
  } catch (error) {
    console.error("Remove provider error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. UPDATE PROVIDER SETTINGS AT CENTRE
export const updateProviderSettings = async (req, res) => {
  try {
    const { centreId, providerId } = req.params;
    const { consultationFee, centreAvailableSlots, role, permissions } =
      req.body;
    const userId = req.user.id;

    const centre = await Provider.findOne({
      _id: centreId,
      providerType: "centre",
      userRef: userId,
    });

    if (!centre) {
      return res.status(404).json({
        success: false,
        message: "Centre not found or unauthorized",
      });
    }

    const relation = await CentreProvider.findOne({
      centreId,
      providerId,
      isActive: true,
    });

    if (!relation) {
      return res.status(404).json({
        success: false,
        message: "Provider not found in centre",
      });
    }

    if (consultationFee !== undefined)
      relation.consultationFee = consultationFee;
    if (centreAvailableSlots)
      relation.centreAvailableSlots = centreAvailableSlots;
    if (role) relation.role = role;
    if (permissions)
      relation.permissions = { ...relation.permissions, ...permissions };

    await relation.save();

    const updated = await CentreProvider.findById(relation._id).populate(
      "providerId",
      "fullName email"
    );

    res.status(200).json({
      success: true,
      message: "Settings updated",
      data: updated,
    });
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 8. GET PROVIDER STATS FOR CENTRE (Bonus!)
export const getCentreStats = async (req, res) => {
  try {
    const { centreId } = req.params;

    const stats = await CentreProvider.aggregate([
      {
        $match: {
          centreId: new mongoose.Types.ObjectId(centreId),
          isActive: true,
        },
      },
      {
        $group: {
          _id: null,
          totalProviders: { $sum: 1 },
          byRole: {
            $push: "$role",
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalProviders: 1,
          adminCount: {
            $size: {
              $filter: {
                input: "$byRole",
                cond: { $eq: ["$$this", "admin"] },
              },
            },
          },
          staffCount: {
            $size: {
              $filter: {
                input: "$byRole",
                cond: { $eq: ["$$this", "staff"] },
              },
            },
          },
          consultantCount: {
            $size: {
              $filter: {
                input: "$byRole",
                cond: { $eq: ["$$this", "consultant"] },
              },
            },
          },
          visitingCount: {
            $size: {
              $filter: {
                input: "$byRole",
                cond: { $eq: ["$$this", "visiting"] },
              },
            },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: stats[0] || { totalProviders: 0 },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET CENTRE INVITATIONS (pending invitations sent by the centre)
export const getCentreInvitations = async (req, res) => {
  try {
    const { centreId } = req.params;
    const { status = "pending" } = req.query;

    const query = { centreId };
    if (status !== "all") query.status = status;

    const invitations = await Invitation.find(query)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: invitations,
    });
  } catch (error) {
    console.error("Get centre invitations error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// REVOKE INVITATION (centre owner cancels a pending invite)
export const revokeInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const userId = req.user.id;

    const invitation = await Invitation.findById(invitationId);

    if (!invitation) {
      return res.status(404).json({ success: false, message: "Invitation not found" });
    }

    // Verify the centre belongs to the requester
    const centre = await Provider.findOne({
      _id: invitation.centreId,
      providerType: "centre",
      userRef: userId,
    });

    if (!centre) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (invitation.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot revoke an invitation with status: ${invitation.status}`,
      });
    }

    invitation.status = "cancelled";
    await invitation.save();

    res.status(200).json({
      success: true,
      message: "Invitation revoked successfully",
      data: { invitationId: invitation._id },
    });
  } catch (error) {
    console.error("Revoke invitation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// RESEND INVITATION (resets token + expiry and resends the email)
export const resendInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const userId = req.user.id;

    const invitation = await Invitation.findById(invitationId);

    if (!invitation) {
      return res.status(404).json({ success: false, message: "Invitation not found" });
    }

    // Verify the centre belongs to the requester
    const centre = await Provider.findOne({
      _id: invitation.centreId,
      providerType: "centre",
      userRef: userId,
    });

    if (!centre) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (!["pending", "expired"].includes(invitation.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot resend an invitation with status: ${invitation.status}`,
      });
    }

    // Find the invited provider
    const provider = await Provider.findOne({
      email: invitation.invitedEmail,
      providerType: "individual",
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found in the system",
      });
    }

    // Regenerate token and extend expiry by 7 days
    const newToken = crypto.randomBytes(32).toString("hex");
    invitation.token = newToken;
    invitation.status = "pending";
    invitation.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await invitation.save();

    const acceptUrl = `${process.env.FRONTEND_URL}/accept-invitation/${newToken}`;

    try {
      await transporter.sendMail({
        from: `"${centre.fullName}" <${process.env.EMAIL_USER}>`,
        to: provider.email,
        subject: `Reminder: Invitation to Join ${centre.fullName}`,
        html: getInvitationEmailTemplate(
          provider.fullName,
          centre.fullName,
          invitation.consultationFee,
          invitation.role,
          invitation.message || "",
          acceptUrl
        ),
      });
    } catch (emailError) {
      console.error("Resend email failed:", emailError);
      return res.status(500).json({ success: false, message: "Failed to resend invitation email" });
    }

    res.status(200).json({
      success: true,
      message: `Invitation resent to ${provider.email}`,
      data: { invitationId: invitation._id, expiresAt: invitation.expiresAt },
    });
  } catch (error) {
    console.error("Resend invitation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== NEW: CENTRE APPOINTMENT VISIBILITY ====================

// GET /centre/centres/:centreId/bookings
export const getCentreBookings = async (req, res) => {
  try {
    const { centreId } = req.params;
    const {
      page = 1,
      limit = 10,
      status,       // "pending" | "approved" | "completed" | "rejected" | "cancelled" | "all"
      search,       // patient name search
      providerId,   // filter by specific provider within the centre
      dateFrom,     // ISO date string
      dateTo,       // ISO date string
    } = req.query;
    const userId = req.user.id;

    // 1. Verify the requesting user owns this centre
    const centre = await Provider.findOne({
      _id: centreId,
      providerType: "centre",
      userRef: userId,
    });

    if (!centre) {
      return res.status(403).json({ success: false, message: "Unauthorized or centre not found" });
    }

    // 2. Get all active provider IDs within this centre (atomic)
    const memberRelations = await CentreProvider.find(
      { centreId, isActive: true },
      { providerId: 1 }
    ).lean();

    const providerIds = memberRelations.map((r) => r.providerId);

    if (!providerIds.length) {
      return res.status(200).json({
        success: true,
        data: [],
        stats: { total: 0, pending: 0, approved: 0, completed: 0, rejected: 0, cancelled: 0 },
        pagination: { page: 1, total: 0, pages: 0 },
      });
    }

    // 3. Build match stage (Booking model)
    const Booking = (await import("../../models/booking.model.js")).Booking;

    const matchStage = {
      provider: { $in: providerIds },
    };

    if (status && status !== "all") matchStage.status = status;
    if (providerId) matchStage.provider = new mongoose.Types.ObjectId(providerId);

    if (dateFrom || dateTo) {
      matchStage["scheduledTime.date"] = {};
      if (dateFrom) matchStage["scheduledTime.date"].$gte = new Date(dateFrom);
      if (dateTo) matchStage["scheduledTime.date"].$lte = new Date(dateTo);
    }

    if (search) {
      matchStage.$or = [
        { patientName: { $regex: search, $options: "i" } },
        { "patientSnapshot.username": { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // 4. Aggregation pipeline — join with provider + patient
    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "providers",
          localField: "provider",
          foreignField: "_id",
          as: "providerDetails",
          pipeline: [{ $project: { fullName: 1, profilePicture: 1, email: 1, qualification: 1 } }],
        },
      },
      { $unwind: { path: "$providerDetails", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "users",
          localField: "patient",
          foreignField: "_id",
          as: "patientDetails",
          pipeline: [{ $project: { username: 1, profilePicture: 1 } }],
        },
      },
      { $unwind: { path: "$patientDetails", preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
    ];

    const [bookings, totalArr, statsArr] = await Promise.all([
      Booking.aggregate([...pipeline, { $skip: skip }, { $limit: parseInt(limit) }]),
      Booking.aggregate([{ $match: matchStage }, { $count: "total" }]),
      // Stats across all providers in the centre matching the *providerId* and *date* filters (but ignoring *status* and checking all statuses)
      Booking.aggregate([
        {
          $match: {
            provider: providerId ? new mongoose.Types.ObjectId(providerId) : { $in: providerIds },
            ...(dateFrom || dateTo ? {
              "scheduledTime.date": {
                ...(dateFrom ? { $gte: new Date(dateFrom) } : {}),
                ...(dateTo ? { $lte: new Date(dateTo) } : {})
              }
            } : {})
          }
        },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    const total = totalArr[0]?.total || 0;
    const stats = { total: 0, pending: 0, approved: 0, completed: 0, rejected: 0, cancelled: 0 };

    statsArr.forEach(({ _id, count }) => {
      if (stats[_id] !== undefined) {
        stats[_id] = count;
      }
      stats.total += count;
    });

    res.status(200).json({
      success: true,
      data: bookings,
      stats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("getCentreBookings error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /centre/centres/:centreId/booking-stats
export const getCentreBookingStats = async (req, res) => {
  try {
    const { centreId } = req.params;
    const userId = req.user.id;

    // 1. Verify ownership
    const centre = await Provider.findOne({
      _id: centreId,
      providerType: "centre",
      userRef: userId,
    });

    if (!centre) {
      return res.status(403).json({ success: false, message: "Unauthorized or centre not found" });
    }

    // 2. Get active providers
    const memberRelations = await CentreProvider.find(
      { centreId, isActive: true }
    ).populate("providerId", "fullName email profilePicture").lean();

    const providerIds = memberRelations.map((r) => r.providerId._id);

    if (!providerIds.length) {
      return res.status(200).json({ success: true, data: [] });
    }

    // 3. Aggregate stats grouped by provider
    const Booking = (await import("../../models/booking.model.js")).Booking;

    const statsArr = await Booking.aggregate([
      { $match: { provider: { $in: providerIds } } },
      {
        $group: {
          _id: { provider: "$provider", status: "$status" },
          count: { $sum: 1 }
        }
      }
    ]);

    // 4. Format the result
    const providerStatsMap = {};

    // Initialize map with all active providers (even those with 0 bookings)
    memberRelations.forEach(rel => {
      if (rel.providerId) {
        providerStatsMap[rel.providerId._id.toString()] = {
          providerId: rel.providerId._id,
          providerName: rel.providerId.fullName,
          profilePicture: rel.providerId.profilePicture,
          email: rel.providerId.email,
          total: 0,
          pending: 0,
          approved: 0,
          completed: 0
        };
      }
    });

    // Populate counts
    statsArr.forEach(({ _id, count }) => {
      const pIdStr = _id.provider.toString();
      const status = _id.status;

      if (providerStatsMap[pIdStr]) {
        providerStatsMap[pIdStr].total += count;
        if (["pending", "approved", "completed"].includes(status)) {
          providerStatsMap[pIdStr][status] = count;
        }
      }
    });

    res.status(200).json({
      success: true,
      data: Object.values(providerStatsMap).sort((a, b) => b.total - a.total)
    });

  } catch (err) {
    console.error("getCentreBookingStats error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /centre/centres/:centreId/providers/:providerId/bookings
export const getCentreSpecificProviderBookings = async (req, res, next) => {
  try {
    const { centreId, providerId } = req.params;
    const userId = req.user.id;

    console.log(centreId, providerId, "centreId, providerId")

    // 1. Verify centre ownership
    const centre = await Provider.findOne({
      _id: centreId,
      providerType: "centre",
      userRef: userId,
    });

    if (!centre) {
      return res.status(403).json({ success: false, message: "Unauthorized or centre not found" });
    }

    // 2. Verify provider belongs to this centre
    const memberRelation = await CentreProvider.findOne({
      centreId,
      providerId,
      isActive: true,
    });

    console.log(memberRelation, "memberRelation")

    if (!memberRelation) {
      return res.status(403).json({ success: false, message: "Provider is not an active member of this centre" });
    }

    // 3. Replicate logic from `getBookingProvider`
    const pId = new mongoose.Types.ObjectId(providerId);
    const limit = parseInt(req.query.limit) || 8;
    const startIndex = parseInt(req.query.startIndex) || 0;
    const search = req.query.search || "";
    const status = req.query.status || "";

    const Booking = (await import("../../models/booking.model.js")).Booking;

    const startOfCurrentMonth = moment().startOf("month").toDate();
    const endOfCurrentMonth = moment().endOf("month").toDate();
    const startOfLastMonth = moment().subtract(1, "months").startOf("month").toDate();
    const endOfLastMonth = moment().subtract(1, "months").endOf("month").toDate();

    const getCounts = async (start, end) => {
      const counts = await Booking.aggregate([
        { $match: { provider: pId, createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);
      const totalCount = await Booking.countDocuments({
        provider: pId,
        createdAt: { $gte: start, $lte: end },
      });
      return {
        total: totalCount,
        pending: counts.find((c) => c._id === "pending")?.count || 0,
        completed: counts.find((c) => c._id === "completed")?.count || 0,
        approved: counts.find((c) => c._id === "approved")?.count || 0,
        rejected: counts.find((c) => c._id === "rejected")?.count || 0,
      };
    };

    const currentCounts = await getCounts(startOfCurrentMonth, endOfCurrentMonth);
    const lastCounts = await getCounts(startOfLastMonth, endOfLastMonth);

    const calculateChange = (current, previous) => {
      if (!previous) return current ? "1.00" : "0.00";
      return (current / previous).toFixed(2);
    };

    const stats = {
      totalAppointments: { count: currentCounts.total || 0, change: calculateChange(currentCounts.total || 0, lastCounts.total || 0) },
      completedAppointments: { count: currentCounts.completed || 0, change: calculateChange(currentCounts.completed || 0, lastCounts.completed || 0) },
      pendingAppointments: { count: currentCounts.pending || 0, change: calculateChange(currentCounts.pending || 0, lastCounts.pending || 0) },
      rejectedAppointments: { count: currentCounts.rejected || 0, change: calculateChange(currentCounts.rejected || 0, lastCounts.rejected || 0) },
      approveAppointments: { count: currentCounts.approved || 0, change: calculateChange(currentCounts.approved || 0, lastCounts.approved || 0) },
    };

    const matchStage = { provider: pId };
    if (status && status !== "all") matchStage.status = status;
    if (search) {
      matchStage.$or = [
        { patientName: { $regex: search, $options: "i" } },
        { "patientDetails.username": { $regex: search, $options: "i" } },
        { service: { $regex: search, $options: "i" } },
      ];
    }

    const bookingDetails = await Booking.aggregate([
      { $lookup: { from: "users", localField: "patient", foreignField: "_id", as: "patientDetails" } },
      { $unwind: { path: "$patientDetails", preserveNullAndEmptyArrays: true } },
      { $match: matchStage },
      {
        $project: {
          patient: 1,
          "patientDetails._id": 1,
          "patientDetails.profilePicture": 1,
          "patientDetails.username": 1,
          patientSnapshot: 1,
          bookingId: 1,
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

    const providerCount = await Booking.aggregate([
      { $lookup: { from: "users", localField: "patient", foreignField: "_id", as: "patientDetails" } },
      { $unwind: { path: "$patientDetails", preserveNullAndEmptyArrays: true } },
      { $match: matchStage },
      { $count: "count" }
    ]);
    const count = providerCount.length > 0 ? providerCount[0].count : 0;

    res.status(200).json({ bookingDetails, providerCount: count, stats: { ...stats, filteredCount: count }, success: true });
  } catch (error) {
    console.error("getCentreSpecificProviderBookings error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getAllInvtedProviders = async (req, res,next) => {
  try {
    const { centreId } = req.params;
    const { status = "all" } = req.query;

    if (!mongoose.Types.ObjectId.isValid(centreId)) {
      return next(errorHandler(400, "Invalid centreId"));
    }

    const matchStage = {
      centreId: new mongoose.Types.ObjectId(centreId),
    };


    if (status !== "all") {
      matchStage.status = status;
    }

    const invitations = await Invitation.aggregate([
      { $match: matchStage },

      {
        $lookup: {
          from: "providers",
          let: {
            email: "$invitedEmail",
            providerId: "$providerId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ["$_id", "$$providerId"] },
                    { $eq: ["$email", "$$email"] },
                  ],
                },
              },
            },
            {
              $project: {
                _id: 1,
                fullName: 1,
                email: 1,
                phone: 1,
                profilePicture: 1,
                qualification: 1,
              },
            },
          ],
          as: "provider",
        },
      },

      {
        $unwind: {
          path: "$provider",
          preserveNullAndEmptyArrays: true,
        },
      },


      {
        $project: {
          _id: 1,
          invitedEmail: 1,
          status: 1,
          role: 1,
          consultationFee: 1,
          message: 1,
          createdAt: 1,
          acceptedAt: 1,
          expiresAt: 1,


          providerId: "$provider._id",
          providerName: "$provider.fullName",
          providerEmail: "$provider.email",
          providerPhone: "$provider.phone",
          providerProfile: "$provider.profilePicture",
          providerQualification: "$provider.qualification",
        },
      },

      { $sort: { createdAt: -1 } },
    ]);

    return res.status(200).json({
      success: true,
      count: invitations.length,
      data: invitations,
    });
  } catch (error) {
    console.error("getCentreInvitedProviders error:", error);
     return next(errorHandler(500, "Failed to fetch invited providers"));
  }
};
