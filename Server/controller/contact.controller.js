import Contact from "../model/Help/contact.model.js";
import { errorHandler } from "../utils/error.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});


const sendUserConfirmationEmail = async (userEmail, userName, messageData) => {
  try {
    const mailOptions = {
      from: `"1Step Support" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "We've received your message - 1Step Support",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f9f9f9;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #ffffff;
            }
            .header {
              background: linear-gradient(135deg, #2d4a36 0%, #8fa797 100%);
              color: white;
              padding: 30px 20px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .content {
              padding: 30px 20px;
              background: white;
              border-radius: 0 0 10px 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .message-box {
              background-color: #f5f5f5;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #ffd333;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #2d4a36;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              padding: 20px;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #eee;
              margin-top: 20px;
            }
            .status {
              display: inline-block;
              padding: 4px 12px;
              background-color: #ffd333;
              color: #2d4a36;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
            }
            .highlight {
              color: #2d4a36;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">✨ 1Step</div>
              <p>Your journey to wellness begins here</p>
            </div>
            <div class="content">
              <h2>Hello ${userName},</h2>
              <p>Thank you for reaching out to <strong class="highlight">1Step</strong>. We have received your message and our team will review it shortly.</p>
              
              <div class="message-box">
                <h3 style="margin-top: 0;">📝 Your Message Summary</h3>
                <p><strong>Categories:</strong> ${messageData.helpCategories.join(", ")}</p>
                <p><strong>Message:</strong></p>
                <p style="background: white; padding: 10px; border-radius: 5px;">${messageData.message}</p>
                <p><strong>Status:</strong> <span class="status">${messageData.status}</span></p>
                <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Topic ID:</strong> ${messageData.topicId}</p>
              </div>
              
              <p><strong>What happens next?</strong></p>
              <ul>
                <li>✅ Our team will review your message within 24-48 hours</li>
                <li>📧 You'll receive a response via email</li>
                <li>💬 For urgent matters, please call us directly</li>
              </ul>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/my-messages/${messageData.topicId}" class="button">
                  Track Your Messages
                </a>
              </div>
              
              <p><strong>Need immediate assistance?</strong><br>
              Call us at <strong class="highlight">+91 80-1234-5678</strong><br>
              Mon - Sat: 8am - 8pm</p>
              
              <p>Warm regards,<br>
              <strong>The 1Step Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2024 1Step. All rights reserved.</p>
              <p>5th Main, 6th Cross, Papiah Grape Garden, Kamanahalli, Bangalore</p>
              <p>This is an automated message, please do not reply directly to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("User confirmation email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending user confirmation email:", error);
    return false;
  }
};

// Send admin notification email
const sendAdminNotificationEmail = async (contactData) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "care@onestep.com";
    
    const mailOptions = {
      from: `"1Step Contact Form" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `🔔 New Contact Form Submission - ${contactData.helpCategories.join(", ")}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background: #f9f9f9;
            }
            .header {
              background: linear-gradient(135deg, #2d4a36 0%, #8fa797 100%);
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              padding: 30px;
              background: white;
              border-radius: 0 0 10px 10px;
            }
            .info-box {
              background: #f5f5f5;
              padding: 15px;
              border-radius: 8px;
              margin: 15px 0;
              border-left: 4px solid #ffd333;
            }
            .label {
              font-weight: bold;
              color: #2d4a36;
              width: 100px;
              display: inline-block;
            }
            .button {
              display: inline-block;
              padding: 10px 20px;
              background: #2d4a36;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin-top: 15px;
            }
            .category-tag {
              display: inline-block;
              background: #e8f5e9;
              color: #2d4a36;
              padding: 2px 10px;
              border-radius: 12px;
              margin: 2px;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>📬 New Contact Form Submission</h2>
            </div>
            <div class="content">
              <div class="info-box">
                <p><span class="label">Name:</span> ${contactData.name}</p>
                <p><span class="label">Email:</span> ${contactData.email}</p>
                <p><span class="label">Phone:</span> ${contactData.phone || "Not provided"}</p>
                <p><span class="label">Categories:</span> ${contactData.helpCategories.map(cat => `<span class="category-tag">${cat}</span>`).join(" ")}</p>
                <p><span class="label">User Type:</span> ${contactData.isAuthenticated ? "Logged In" : "Guest"}</p>
                <p><span class="label">Topic ID:</span> <strong>${contactData.topicId}</strong></p>
                <p><span class="label">Submitted:</span> ${new Date().toLocaleString()}</p>
              </div>
              
              <div class="info-box">
                <p><strong>💬 Initial Message:</strong></p>
                <p style="background: white; padding: 10px; border-radius: 5px; margin-top: 5px;">${contactData.message}</p>
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/admin/contact/${contactData.id}" class="button">
                  📋 View in Dashboard
                </a>
                <a href="mailto:${contactData.email}" class="button" style="background: #8fa797; margin-left: 10px;">
                  ✉️ Reply Now
                </a>
              </div>
              
              <hr style="margin: 20px 0;">
              
              <p style="font-size: 12px; color: #666; text-align: center;">
                This is an automated notification from your 1Step Contact Form.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Admin notification email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending admin notification email:", error);
    return false;
  }
};


export const sendReplyNotification = async (userEmail, userName, replyMessage, originalMessage, topicId) => {
  try {
    const mailOptions = {
      from: `"1Step Support" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "Response to your inquiry - 1Step Support",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background: #f9f9f9;
            }
            .header {
              background: linear-gradient(135deg, #2d4a36 0%, #8fa797 100%);
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              padding: 30px;
              background: white;
              border-radius: 0 0 10px 10px;
            }
            .reply-box {
              background: #e8f5e9;
              padding: 15px;
              border-radius: 8px;
              margin: 15px 0;
              border-left: 4px solid #4caf50;
            }
            .original-box {
              background: #f5f5f5;
              padding: 15px;
              border-radius: 8px;
              margin: 15px 0;
              border-left: 4px solid #ffd333;
            }
            .button {
              display: inline-block;
              padding: 10px 20px;
              background: #2d4a36;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>📧 Response to Your Inquiry</h2>
            </div>
            <div class="content">
              <h3>Hello ${userName},</h3>
              <p>Thank you for reaching out to us. We have reviewed your inquiry and here's our response:</p>
              
              <div class="reply-box">
                <p><strong>💬 Our Response:</strong></p>
                <p>${replyMessage}</p>
              </div>
              
              <div class="original-box">
                <p><strong>📝 Your Original Message:</strong></p>
                <p>${originalMessage}</p>
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/my-messages/${topicId}" class="button">
                  View Full Conversation
                </a>
              </div>
              
              <p>If you need further assistance, please don't hesitate to reply to this email or call us at <strong>+91 80-1234-5678</strong>.</p>
              
              <p>Warm regards,<br>
              <strong>The 1Step Team</strong></p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Reply notification email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending reply notification email:", error);
    return false;
  }
};


export const submitContactForm = async (req, res, next) => {
  try {
    const { name, email, helpCategories, message, phone } = req.body;


    if (!name || !email || !helpCategories || !message) {
      return next(errorHandler(400, "All fields are required"));
    }


    if (!Array.isArray(helpCategories) || helpCategories.length === 0) {
      return next(errorHandler(400, "Please select at least one help category"));
    }


    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return next(errorHandler(400, "Please provide a valid email address"));
    }

   
    const isAuthenticatedUser = req.user ? true : false;
    const userRef = req.user ? req.user.id : null;

 
    const recentSubmission = await Contact.findOne({
      email: email.toLowerCase(),
      createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) },
    });

    if (recentSubmission) {
      return next(
        errorHandler(429, "Please wait a few minutes before submitting again")
      );
    }


    const contactMessage = new Contact({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      helpCategories: helpCategories,
      messages: [{
        message: message.trim(),
        isFromContact: true,
        sentAt: new Date()
      }],
      userRef,
      isAuthenticatedUser,
      phone: phone || null,
      topicId: `TOPIC-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
    });

    await contactMessage.save();

 
    sendUserConfirmationEmail(
      email, 
      name.split(' ')[0], 
      {
        helpCategories: helpCategories,
        message: message.trim(),
        status: contactMessage.status,
        topicId: contactMessage.topicId,
      }
    ).catch(err => console.error("Failed to send user email:", err));

  
    sendAdminNotificationEmail({
      id: contactMessage._id,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      helpCategories: helpCategories,
      message: message.trim(),
      phone: phone || null,
      isAuthenticated: isAuthenticatedUser,
      topicId: contactMessage.topicId,
    }).catch(err => console.error("Failed to send admin email:", err));

    res.status(201).json({
      success: true,
      message: "Your message has been sent successfully! We've sent a confirmation email to your inbox. We'll get back to you within 24-48 hours.",
      data: {
        id: contactMessage._id,
        topicId: contactMessage.topicId,
        name: contactMessage.name,
        email: contactMessage.email,
        helpCategories: contactMessage.helpCategories,
        status: contactMessage.status,
        createdAt: contactMessage.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};


export const getAllContactMessages = async (req, res, next) => {
  try {
    if (!req.user?.isAdmin) {
      return next(errorHandler(403, "Access denied. Admin only."));
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const search = req.query.search;
    const category = req.query.category;

    let query = {};
    if (status && status !== "all") {
      query.status = status;
    }
    if (category) {
      query.helpCategories = { $in: [category] };
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { topicId: { $regex: search, $options: "i" } },
        { "messages.message": { $regex: search, $options: "i" } },
      ];
    }

    const [messages, totalCount] = await Promise.all([
      Contact.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userRef", "username email profilePicture")
        .populate("messages.replies.repliedBy", "username email") // Updated path
        .populate("messages.sentBy", "username email"), // Updated path
      Contact.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: messages,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    next(error);
  }
};


export const getContactMessageById = async (req, res, next) => {
  try {
    if (req.user?.role?.role?.toLowerCase() !== "admin") {
      return next(errorHandler(403, "Access denied. Admin only."));
    }

    const message = await Contact.findById(req.params.id)
      .populate("userRef", "username email profilePicture")
      .populate("replies.repliedBy", "username email")
      .populate("messages.sentBy", "username email");

    if (!message) {
      return next(errorHandler(404, "Contact message not found"));
    }

   
    if (message.status === "pending") {
      message.status = "read";
      await message.save();
    }

    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    next(error);
  }
};


export const getContactByTopicId = async (req, res, next) => {
  try {
    const { topicId } = req.params;
    
    const message = await Contact.findOne({ topicId })
      .populate("replies.repliedBy", "username email")
      .populate("messages.sentBy", "username email");

    if (!message) {
      return next(errorHandler(404, "Topic not found"));
    }

   
    if (req.user) {
      if (message.userRef && message.userRef.toString() !== req.user.id) {
        return next(errorHandler(403, "Access denied"));
      }
    } else {
     
      const email = req.query.email;
      if (!email || message.email !== email.toLowerCase()) {
        return next(errorHandler(403, "Access denied"));
      }
    }

    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

export const addReply = async (req, res, next) => {
  try {
    if (req.user?.role?.role?.toLowerCase() !== "admin") {
      return next(errorHandler(403, "Access denied. Admin only."));
    }

    const { message, isInternal, messageId } = req.body;
    
    if (!message) {
      return next(errorHandler(400, "Reply message is required"));
    }

    if (!messageId) {
      return next(errorHandler(400, "Message ID is required to reply to a specific message"));
    }

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return next(errorHandler(404, "Contact message not found"));
    }

    // Find the specific message in the messages array
    const targetMessage = contact.messages.id(messageId);
    if (!targetMessage) {
      return next(errorHandler(404, "Message not found in conversation"));
    }

    // Add reply to the specific message's replies array
    targetMessage.replies.push({
      message: message.trim(),
      repliedBy: req.user.id,
      isInternal: isInternal || false,
      repliedAt: new Date()
    });

    // Update the message status
    targetMessage.status = "replied";
    
    // Update the main contact status
    contact.status = "replied";
    contact.adminNotes = message.trim();
    
    await contact.save();

    // Send email notification if not internal
    if (!isInternal) {
      sendReplyNotification(
        contact.email,
        contact.name.split(' ')[0],
        message,
        targetMessage.message || "No original message found",
        contact.topicId
      ).catch(err => console.error("Failed to send reply notification:", err));
    }

    // Fetch updated contact with populated fields
    const updatedContact = await Contact.findById(req.params.id)
      .populate("messages.replies.repliedBy", "username email")
      .populate("messages.sentBy", "username email");

    res.status(200).json({
      success: true,
      message: "Reply added successfully",
      data: updatedContact,
    });
  } catch (error) {
    next(error);
  }
};


export const addUserMessage = async (req, res, next) => {
  try {
    const { topicId } = req.params;
    const { message } = req.body;

    if (!message) {
      return next(errorHandler(400, "Message is required"));
    }

    const contact = await Contact.findOne({ topicId });
    if (!contact) {
      return next(errorHandler(404, "Topic not found"));
    }

  
    if (req.user) {
      if (contact.userRef && contact.userRef.toString() !== req.user.id) {
        return next(errorHandler(403, "Access denied"));
      }
    } else {
      const email = req.query.email;
      if (!email || contact.email !== email.toLowerCase()) {
        return next(errorHandler(403, "Access denied"));
      }
    }


    contact.messages.push({
      message: message.trim(),
      sentBy: req.user ? req.user.id : null,
      isFromContact: true,
    });

 
    if (contact.status === "resolved" || contact.status === "closed") {
      contact.status = "pending";
    }

    await contact.save();

  
    const adminEmail = process.env.ADMIN_EMAIL || "care@onestep.com";
    const mailOptions = {
      from: `"1Step Contact" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `📩 New reply from ${contact.name} - Topic: ${contact.topicId}`,
      html: `
        <h2>New message from ${contact.name}</h2>
        <p><strong>Topic:</strong> ${contact.topicId}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <a href="${process.env.FRONTEND_URL}/admin/contact/${contact._id}">View in Dashboard</a>
      `,
    };

    await transporter.sendMail(mailOptions).catch(err => console.error("Failed to notify admin:", err));

    res.status(200).json({
      success: true,
      message: "Message added successfully",
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};


export const updateContactStatus = async (req, res, next) => {
  try {
    if (req.user?.role?.role?.toLowerCase() !== "admin") {
      return next(errorHandler(403, "Access denied. Admin only."));
    }

    const { status, adminNotes, sendEmailNotification } = req.body;
    const updateData = {};

    if (status) {
      updateData.status = status;
      if (status === "replied") {
        updateData.repliedAt = new Date();
      }
      if (status === "resolved" || status === "closed") {
        updateData.resolvedAt = new Date();
      }
    }

    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }

    const message = await Contact.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("replies.repliedBy", "username email");

    if (!message) {
      return next(errorHandler(404, "Contact message not found"));
    }

    
    if (sendEmailNotification && status === "replied" && adminNotes) {
      sendReplyNotification(
        message.email,
        message.name.split(' ')[0],
        adminNotes,
        message.messages[0]?.message || "No original message found",
        message.topicId
      ).catch(err => console.error("Failed to send reply notification:", err));
    }

    res.status(200).json({
      success: true,
      message: "Contact message updated successfully",
      data: message,
    });
  } catch (error) {
    next(error);
  }
};


export const deleteContactMessage = async (req, res, next) => {
  try {
    if (req.user?.role?.role?.toLowerCase() !== "admin") {
      return next(errorHandler(403, "Access denied. Admin only."));
    }

    const message = await Contact.findByIdAndDelete(req.params.id);

    if (!message) {
      return next(errorHandler(404, "Contact message not found"));
    }

    res.status(200).json({
      success: true,
      message: "Contact message deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getUserContactMessages = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};

    if (req.user) {
      query = {
        $or: [{ userRef: req.user.id }, { email: req.user.email }],
      };
    } else {
      const email = req.query.email;
      if (!email) {
        return next(
          errorHandler(400, "Email is required to fetch your messages")
        );
      }
      query = { email: email.toLowerCase() };
    }

    const [messages, totalCount] = await Promise.all([
      Contact.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("replies.repliedBy", "username email")
        .populate("messages.sentBy", "username email"),
      Contact.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: messages,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    next(error);
  }
};


export const getContactStats = async (req, res, next) => {
  try {
    if (req.user?.role?.role?.toLowerCase() !== "admin") {
      return next(errorHandler(403, "Access denied. Admin only."));
    }

    const [total, pending, read, replied, resolved, closed, last24Hours] =
      await Promise.all([
        Contact.countDocuments(),
        Contact.countDocuments({ status: "pending" }),
        Contact.countDocuments({ status: "read" }),
        Contact.countDocuments({ status: "replied" }),
        Contact.countDocuments({ status: "resolved" }),
        Contact.countDocuments({ status: "closed" }),
        Contact.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        }),
      ]);

  
    const categoryStats = await Contact.aggregate([
      { $unwind: "$helpCategories" },
      {
        $group: {
          _id: "$helpCategories",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Messages with replies stats
    const messagesWithReplies = await Contact.countDocuments({
      "replies.0": { $exists: true },
    });

    // Average response time (for resolved messages)
    const responseTimeStats = await Contact.aggregate([
      {
        $match: {
          status: "resolved",
          repliedAt: { $exists: true },
          createdAt: { $exists: true },
        },
      },
      {
        $project: {
          responseTime: {
            $subtract: ["$repliedAt", "$createdAt"],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: "$responseTime" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total,
        pending,
        read,
        replied,
        resolved,
        closed,
        last24Hours,
        messagesWithReplies,
        averageResponseTime: responseTimeStats[0]?.avgResponseTime || 0,
        byCategory: categoryStats,
      },
    });
  } catch (error) {
    next(error);
  }
};


export const bulkDeleteContactMessages = async (req, res, next) => {
  try {
    if (req.user?.role?.role?.toLowerCase() !== "admin") {
      return next(errorHandler(403, "Access denied. Admin only."));
    }

    const { messageIds } = req.body;

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return next(errorHandler(400, "Please provide an array of message IDs to delete"));
    }

    const result = await Contact.deleteMany({ _id: { $in: messageIds } });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} messages deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    next(error);
  }
};


export const markMultipleAsRead = async (req, res, next) => {
  try {
    if (req.user?.role?.role?.toLowerCase() !== "admin") {
      return next(errorHandler(403, "Access denied. Admin only."));
    }

    const { messageIds } = req.body;

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return next(errorHandler(400, "Please provide an array of message IDs"));
    }

    const result = await Contact.updateMany(
      { _id: { $in: messageIds }, status: "pending" },
      { $set: { status: "read" } }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} messages marked as read`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};


export const exportContactMessages = async (req, res, next) => {
  try {
    if (req.user?.role?.role?.toLowerCase() !== "admin") {
      return next(errorHandler(403, "Access denied. Admin only."));
    }

    const { status, startDate, endDate, category } = req.query;
    let query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (category) {
      query.helpCategories = { $in: [category] };
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    const messages = await Contact.find(query)
      .sort({ createdAt: -1 })
      .populate("userRef", "username email");


    const csvHeaders = [
      "Topic ID",
      "Name",
      "Email",
      "Phone",
      "Categories",
      "Message Count",
      "Reply Count",
      "Status",
      "Created At",
      "User Type",
    ];

    const csvRows = messages.map(msg => [
      msg.topicId,
      msg.name,
      msg.email,
      msg.phone || "",
      msg.helpCategories.join("; "),
      msg.messages?.length || 0,
      msg.replies?.length || 0,
      msg.status,
      new Date(msg.createdAt).toLocaleString(),
      msg.isAuthenticatedUser ? "Registered" : "Guest",
    ]);

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map(row => row.join(",")),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=contact-messages-${Date.now()}.csv`
    );
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

export const replyToContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reply, messageId } = req.body;

    if (!reply) {
      return next(errorHandler(400, "Reply message is required"));
    }

    const contact = await Contact.findById(id);

    if (!contact) {
      return next(errorHandler(404, "Message not found"));
    }

    let targetMessage;
    if (messageId) {
      targetMessage = contact.messages.id(messageId);
    } else {
      // If no messageId provided, use the latest message
      targetMessage = contact.messages[contact.messages.length - 1];
    }

    if (!targetMessage) {
      return next(errorHandler(404, "Message not found in conversation"));
    }

    // Send email
    await transporter.sendMail({
      from: `"1Step Support" <${process.env.EMAIL_USER}>`,
      to: contact.email,
      subject: "Reply from 1Step Support",
      html: `
        <h2>Hello ${contact.name},</h2>

        <p>Thank you for contacting us.</p>

        <h3>Our Reply</h3>
        <p>${reply}</p>

        <hr/>

        <h4>Your Original Message</h4>
        <p>${targetMessage.message}</p>

        <br/>

        <p>Regards,<br/>1Step Support Team</p>
      `,
    });

    // Add reply to the specific message's replies array
    targetMessage.replies.push({
      message: reply.trim(),
      repliedBy: req.user.id,
      isInternal: false,
      repliedAt: new Date()
    });

    // Update the message status
    targetMessage.status = "replied";
    
    // Update the main contact
    contact.status = "replied";
    contact.adminNotes = reply.trim();
    
    await contact.save();

    // Fetch updated contact with populated fields
    const updatedContact = await Contact.findById(id)
      .populate("messages.replies.repliedBy", "username email")
      .populate("messages.sentBy", "username email");

    res.status(200).json({
      success: true,
      message: "Reply sent successfully",
      data: updatedContact
    });
  } catch (err) {
    next(err);
  }
};