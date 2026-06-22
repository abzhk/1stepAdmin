import Help from "../model/Help/help.model.js";
import { errorHandler } from "../utils/error.js";
import nodemailer from "nodemailer";

const VALID_CATEGORIES = [
  "Account & Access",
  "Payment & Billing",
  "Booking & Scheduling",
  "Technical Support",
  "Report a Bug",
  "General Inquiry",
];
const VALID_PRIORITIES = ["Low", "Medium", "High"];

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});


export const createTicket = async (req, res, next) => {
  try {
    const { email, category, description, priority, title, attachment } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return next(errorHandler(400, "A valid email address is required."));
    }
    if (!category || !VALID_CATEGORIES.includes(category)) {
      return next(errorHandler(400, "Please select a valid category."));
    }
    if (!description || !description.trim()) {
      return next(errorHandler(400, "Please describe your issue."));
    }
    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return next(errorHandler(400, "Invalid priority level."));
    }

    const ticket = await Help.create({
      user: req.user?.id,
      email: email.toLowerCase(),
      title: title?.trim() || description.trim().slice(0, 60),
      category,
      description: description.trim(),
      priority: priority || "Medium",
      attachment,
    });

    res.status(201).json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
};


export const getMyTickets = async (req, res, next) => {
  try {
    const { search, status } = req.query;

    const query = {
      $or: [{ user: req.user.id }, { email: req.user.email }],
    };

    if (status && status !== "All") {
      query.status = status;
    }

    if (search) {
      const term = search.trim();
      query.$and = [
        {
          $or: [
            { title: { $regex: term, $options: "i" } },
            { ticketId: { $regex: term, $options: "i" } },
          ],
        },
      ];
    }

    const tickets = await Help.find(query).sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, tickets });
  } catch (error) {
    next(error);
  }
};

export const getTicket = async (req, res, next) => {
  try {
    const ticket = await Help.findById(req.params.id).lean();
    if (!ticket) {
      return next(errorHandler(404, "Ticket not found."));
    }
    res.status(200).json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
};


export const updateTicket = async (req, res, next) => {
  try {
    const { status, priority } = req.body;
    const update = {};

    if (status) {
      if (!["Open", "In progress", "Resolved"].includes(status)) {
        return next(errorHandler(400, "Invalid status."));
      }
      update.status = status;
    }
    if (priority) {
      if (!VALID_PRIORITIES.includes(priority)) {
        return next(errorHandler(400, "Invalid priority level."));
      }
      update.priority = priority;
    }

    const ticket = await Help.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true }
    );

    if (!ticket) {
      return next(errorHandler(404, "Ticket not found."));
    }

      try {
      await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: ticket.email,
  subject: `Status Update: ${ticket.ticketId} - ${ticket.status}`,
  html: `
    <h2>Support Ticket Update</h2>

    <p>Hello ${ticket.user?.username || "User"},</p>

    <p>
      ${
        ticket.status === "Open"
          ? "Your support ticket has been received and is awaiting review by our support team."
          : ticket.status === "In progress"
          ? "Your support ticket has been reviewed and is currently being worked on by our technical team."
          : ticket.status === "Resolved"
          ? "We are pleased to inform you that your reported issue has been resolved."
          : "Your support ticket has been updated."
      }
    </p>

    <h3>Ticket Details</h3>

    <ul>
      <li><strong>Ticket ID:</strong> ${ticket.ticketId}</li>
      <li><strong>Title:</strong> ${ticket.title}</li>
      <li><strong>Category:</strong> ${ticket.category}</li>
      <li><strong>Description:</strong> ${ticket.description}</li>
      <li><strong>Status:</strong> ${ticket.status}</li>
      <li><strong>Priority:</strong> ${ticket.priority}</li>
    </ul>

    <p>
      We will keep you informed of further updates regarding this ticket.
    </p>

    <br/>

    <p>Best Regards,</p>
    <p><strong>1STEP Support Team</strong></p>
  `,
});

      console.log(
        `Ticket update email sent to ${ticket.email}`
      );
    } catch (emailError) {
      console.error(
        "Failed to send ticket update email:",
        emailError
      );
    }
    res.status(200).json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
};


export const deleteTicket = async (req, res, next) => {
  try {
    const ticket = await Help.findByIdAndDelete(req.params.id);
    if (!ticket) {
      return next(errorHandler(404, "Ticket not found."));
    }
    res.status(200).json({ success: true, message: "Ticket deleted." });
  } catch (error) {
    next(error);
  }
};

export const getAllTickets = async (req, res, next) => {
  try {
    const {
      search,
      status,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    if (status && status !== "All") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { ticketId: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const [tickets, totalTickets] = await Promise.all([
      Help.find(query)
      .populate("user", "username email profilePicture")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      Help.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      tickets,
      pagination: {
        total: totalTickets,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalTickets / limitNumber),
        hasNextPage: pageNumber * limitNumber < totalTickets,
        hasPrevPage: pageNumber > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};


export const replyTicket = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message?.trim()) {
      return next(errorHandler(400, "Message is required"));
    }

    const ticket = await Help.findById(req.params.id);

    if (!ticket) {
      return next(errorHandler(404, "Ticket not found"));
    }

    ticket.messages.push({
      sender: "Admin",
      message,
    });

    await ticket.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: ticket.email,
      subject: `Reply for ${ticket.ticketId}`,
      html: `
        <h2>1STEP Team Response</h2>

        <p>${message}</p>

        <hr />

        <p>Ticket ID: ${ticket.ticketId}</p>
      `,
    });

    res.status(200).json({
      success: true,
      messages: ticket.messages,
    });
  } catch (error) {
    next(error);
  }
};