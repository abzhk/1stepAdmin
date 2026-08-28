import Help from "../model/Help/help.model.js";
import { errorHandler } from "../utils/error.js";
import nodemailer from "nodemailer";
import {ticketReplyEmail} from "../utils/emailTemplates.js"
import  User from "../model/user.model.js";
import Parent from "../model/parent.model.js";
import Provider from "../model/provider.model.js";

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

   const existingTicket = await Help.findById(req.params.id);

if (!existingTicket) {
  return next(errorHandler(404, "Ticket not found."));
}


if (existingTicket.status === "Resolved") {
  return next(
    errorHandler(400, "This ticket has already been resolved and cannot be reopened.")
  );
}

    const ticket = await Help.findByIdAndUpdate(
  req.params.id,
  { $set: update },
  { new: true }
).populate({
  path: "user",
  select: "username email profilePicture role",
  populate: {
    path: "role",
    select: "role",
  },
});
    

    if (!ticket) {
  return next(errorHandler(404, "Ticket not found."));
}

// Get parent/provider profile
const parent = await Parent.findOne({
  userRef: ticket.user?._id,
}).lean();

const provider = await Provider.findOne({
  userRef: ticket.user?._id,
}).lean();

let displayName = ticket.user?.username || "";
let displayProfilePicture = ticket.user?.profilePicture || "";

if (parent) {
  displayName =
    parent.parentDetails?.fullName || displayName;
} else if (provider) {
  displayName =
    provider.fullName || displayName;

  displayProfilePicture =
    provider.profilePicture || displayProfilePicture;
}

      try {
      await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: ticket.email,
  subject: `Status Update: ${ticket.ticketId}`,
  html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
</head>

<body style="margin:0;padding:0;background:#eceae4;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px;">
<tr>
<td align="center">

<table width="100%" cellpadding="0" cellspacing="0"
style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 30px rgba(45,74,54,.08);">

<tr>
<td style="background:#2d4a36;padding:36px 40px;">

<div style="font-size:13px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#8fa797;">
1Step Support
</div>

<div style="padding-top:14px;">
<table cellpadding="0" cellspacing="0">
<tr>
<td style="width:44px;height:44px;background:#8fa797;border-radius:50%;text-align:center;font-size:22px;color:#fff;">
&#10003;
</td>
<td style="padding-left:14px;">
<div style="font-size:22px;font-weight:700;color:#fff;">
Ticket Status Updated
</div>
</td>
</tr>
</table>
</div>

</td>
</tr>

<tr>
<td style="padding:32px 40px;">

<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#5b6b60;">
Hello <strong>${ticket.user?.username || "User"}</strong>,
</p>

<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#5b6b60;">
${
  ticket.status === "Open"
    ? "Your support request has been received and is waiting for review."
    : ticket.status === "In progress"
    ? "Good news! Our support team is currently working on your request."
    : "Your support request has been successfully resolved."
}
</p>

<table width="100%" cellpadding="0" cellspacing="0">

<tr>
<td style="padding:12px 0;border-bottom:1px solid #e8e4dd;font-size:13px;color:#7a877f;font-weight:600;width:120px;">
Ticket ID
</td>
<td style="padding:12px 0;border-bottom:1px solid #e8e4dd;font-size:14px;color:#2d4a36;font-weight:600;">
${ticket.ticketId}
</td>
</tr>

<tr>
<td style="padding:12px 0;border-bottom:1px solid #e8e4dd;font-size:13px;color:#7a877f;font-weight:600;">
Category
</td>
<td style="padding:12px 0;border-bottom:1px solid #e8e4dd;font-size:14px;color:#2d4a36;font-weight:600;">
${ticket.category}
</td>
</tr>

<tr>
  <td style="padding:16px 0;vertical-align:top;font-size:13px;color:#7a877f;font-weight:600;">
    Description
  </td>
  <td style="padding:16px 0;font-size:14px;line-height:1.8;color:#2d4a36;white-space:pre-wrap;">
    ${ticket.description}
  </td>
</tr>

<tr>
<td style="padding:12px 0;border-bottom:1px solid #e8e4dd;font-size:13px;color:#7a877f;font-weight:600;">
Priority
</td>
<td style="padding:12px 0;border-bottom:1px solid #e8e4dd;">
<span style="
display:inline-block;
background:${
  ticket.priority === "High"
    ? "#fbe9e3"
    : ticket.priority === "Medium"
    ? "#fbf3d6"
    : "#eef2ef"
};
color:${
  ticket.priority === "High"
    ? "#e07a5f"
    : ticket.priority === "Medium"
    ? "#d9a400"
    : "#8fa797"
};
padding:4px 12px;
border-radius:999px;
font-size:12px;
font-weight:700;">
${ticket.priority}
</span>
</td>
</tr>

<tr>
<td style="padding:12px 0;font-size:13px;color:#7a877f;font-weight:600;">
Status
</td>
<td style="padding:12px 0;">
<span style="
display:inline-block;
background:#f0efe9;
color:${
  ticket.status === "Resolved"
    ? "#8fa797"
    : ticket.status === "In progress"
    ? "#d9a400"
    : "#2d4a36"
};
padding:4px 12px;
border-radius:999px;
font-size:12px;
font-weight:700;">
${ticket.status}
</span>
</td>
</tr>

</table>

</td>
</tr>

<tr>
<td style="padding:20px 40px 36px;">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td style="background:#f3f6f4;border-left:4px solid #8fa797;border-radius:10px;padding:14px 18px;font-size:13px;line-height:1.6;color:#5b6b60;">
We will continue to keep you informed whenever there is another update on your support request.
</td>
</tr>
</table>

</td>
</tr>

<tr>
<td style="background:#F6F4F0;padding:24px 40px;border-top:1px solid #e8e4dd;">

<p style="margin:0;font-size:12px;color:#9aa69d;">
Thank you for choosing 1Step. We're always here to help.
</p>

<p style="margin-top:8px;font-size:12px;font-weight:600;color:#7a877f;">
— The 1Step Support Team
</p>

</td>
</tr>

</table>

<p style="margin:18px auto 0;font-size:11px;color:#a7aaa3;text-align:center;">
© ${new Date().getFullYear()} 1Step. All rights reserved.
</p>

</td>
</tr>
</table>

</body>
</html>
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
    res.status(200).json({
  success: true,
  ticket: {
    ...ticket.toObject(),
    displayName,
    displayProfilePicture,
  },
});
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

    let userIds = [];

    if (search) {
      // Search User.username
      const users = await User.find({
        username: { $regex: search, $options: "i" },
      }).select("_id");

      userIds = users.map((u) => u._id);

      query.$or = [
        { ticketId: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { user: { $in: userIds } },
      ];
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;


    const [tickets, totalTickets, stats] = await Promise.all([
      Help.find(query)
        .populate({
          path: "user",
          select: "username email profilePicture role",
          populate: {
            path: "role",
            select: "role",
          },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean(),

      Help.countDocuments(query),

      Help.aggregate([
        {
          $group: {
            _id: null,

            open: {
              $sum: {
                $cond: [{ $eq: ["$status", "Open"] }, 1, 0],
              },
            },

            inProgress: {
              $sum: {
                $cond: [{ $eq: ["$status", "In progress"] }, 1, 0],
              },
            },

            resolved: {
              $sum: {
                $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0],
              },
            },

            highPriority: {
              $sum: {
                $cond: [{ $eq: ["$priority", "High"] }, 1, 0],
              },
            },
          },
        },
      ]),
    ]);


    const ticketUserIds = tickets
      .map((ticket) => ticket.user?._id)
      .filter(Boolean);


    const [parents, providers] = await Promise.all([
      Parent.find({
        userRef: { $in: ticketUserIds },
      }).lean(),

      Provider.find({
        userRef: { $in: ticketUserIds },
      }).lean(),
    ]);


    const parentMap = new Map(
      parents.map((parent) => [
        parent.userRef.toString(),
        parent,
      ])
    );

    const providerMap = new Map(
      providers.map((provider) => [
        provider.userRef.toString(),
        provider,
      ])
    );


    const formattedTickets = tickets.map((ticket) => {
      const userId = ticket.user?._id?.toString();

      const parent = userId
        ? parentMap.get(userId)
        : null;

      const provider = userId
        ? providerMap.get(userId)
        : null;

      let displayName = ticket.user?.username || "";
       let displayProfilePicture = ticket.user?.profilePicture || "";

      // Parent
      if (parent) {
        displayName =
          parent.parentDetails?.fullName ||
          displayName;
      

      displayProfilePicture =
      ticket.user?.profilePicture || "";
  }

      // Provider / Centre
      else if (provider) {
        displayName =
          provider.fullName ||
          displayName;
      
       displayProfilePicture =
      provider.profilePicture ||
      ticket.user?.profilePicture ||
      "";
  }

      return {
        ...ticket,
        displayName,
         displayProfilePicture,
      };
    });


    res.status(200).json({
      success: true,

      tickets: formattedTickets,

      stats: stats[0] || {
        open: 0,
        inProgress: 0,
        resolved: 0,
        highPriority: 0,
      },

      pagination: {
        total: totalTickets,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(
          totalTickets / limitNumber
        ),
        hasNextPage:
          pageNumber * limitNumber < totalTickets,
        hasPrevPage:
          pageNumber > 1,
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

    const { subject, text, html } = ticketReplyEmail(ticket, message);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: ticket.email,
      subject,
      text,
      html,
    });

    res.status(200).json({
      success: true,
      messages: ticket.messages,
    });
  } catch (error) {
    next(error);
  }
};



//ticket for dashbaord 
export const getDashboardTickets = async (req, res, next) => {
  try {
    const tickets = await Help.find({})
      .populate({
        path: "user",
        select: "username email profilePicture",
      })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    const ticketUserIds = tickets
      .map((ticket) => ticket.user?._id)
      .filter(Boolean);

    const [parents, providers] = await Promise.all([
      Parent.find({
        userRef: { $in: ticketUserIds },
      })
        .select("userRef parentDetails.fullName")
        .lean(),

      Provider.find({
        userRef: { $in: ticketUserIds },
      })
        .select("userRef fullName profilePicture")
        .lean(),
    ]);

    const parentMap = new Map(
      parents.map((parent) => [
        parent.userRef.toString(),
        parent,
      ])
    );

    const providerMap = new Map(
      providers.map((provider) => [
        provider.userRef.toString(),
        provider,
      ])
    );

    const formattedTickets = tickets.map((ticket) => {
      const userId = ticket.user?._id?.toString();

      const parent = userId
        ? parentMap.get(userId)
        : null;

      const provider = userId
        ? providerMap.get(userId)
        : null;

      let displayName = ticket.user?.username || "";

      if (parent) {
        displayName =
          parent.parentDetails?.fullName ||
          displayName;
      } else if (provider) {
        displayName =
          provider.fullName ||
          displayName;
      }

      return {
        ...ticket,
        displayName,
        displayProfilePicture:
          provider?.profilePicture ||
          ticket.user?.profilePicture ||
          "",
      };
    });

    res.status(200).json({
      success: true,
      tickets: formattedTickets,
    });
  } catch (error) {
    next(error);
  }
};