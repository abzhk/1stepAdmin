import mongoose from "mongoose";

const replySchema = new mongoose.Schema({
  message: {
    type: String,
    required: [true, "Reply message is required"],
    trim: true,
    minlength: [2, "Reply must be at least 2 characters"],
    maxlength: [2000, "Reply cannot exceed 2000 characters"],
  },
  repliedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  repliedAt: {
    type: Date,
    default: Date.now,
  },
  isInternal: {
    type: Boolean,
    default: false, 
  }
}, {
  timestamps: true,
});

const messageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: [true, "Message is required"],
    trim: true,
    minlength: [1, "Message must be at least 10 characters"],
    maxlength: [2000, "Message cannot exceed 2000 characters"],
  },
  replies: [replySchema],
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false, 
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
  isFromContact: {
    type: Boolean,
    default: true, 
  },
  status: {
    type: String,
    enum: ["pending", "in-progress", "read", "replied", "resolved", "closed"],
    default: "pending",
  },
  // NEW FIELDS FOR EMAIL TRACKING
  emailMessageId: {
    type: String,
    sparse: true,
    index: true
  },
  uniqueKey: {
    type: String,
    sparse: true,
    index: true
  },
  emailFrom: {
    type: String
  },
  emailSubject: {
    type: String
  },
  source: {
    type: String,
    enum: ["web", "email", "api"],
    default: "web"
  },
  isForwarded: {
    type: Boolean,
    default: false
  },
  foundBy: {
    type: String,
    enum: ["topicId", "email", "email-fallback"],
    default: "topicId"
  }
});

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    phone: {
      type: String,
      trim: true,
      required: false,
    },
    helpCategories: {
      type: [String],
      required: [true, "At least one help category is required"],
      validate: {
        validator: function(arr) {
          return arr && arr.length > 0;
        },
        message: "At least one help category must be selected",
      },
      enum: {
        values: [
          "Couples Counseling",
          "Individual Therapy",
          "Family Therapy",
          "General Inquiry",
          "Billing Support",
          "Technical Support",
        ],
        message: "Please select valid help categories",
      },
    },
    messages: [messageSchema],
    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    isAuthenticatedUser: {
      type: Boolean,
      default: false,
    },
    adminNotes: {
      type: String,
      trim: true,
    },
    status: { 
      type: String,
      enum: ["pending", "in-progress",  "read", "replied", "resolved", "closed"],
      default: "pending",
    },
    resolvedAt: {
      type: Date,
    },
    closedAt: {
      type: Date,
    },
    topicId: {
      type: String,
      unique: true,
      required: true,
      default: function() {
        return `TOPIC-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      }
    },
    // NEW FIELD FOR TRACKING PROCESSED EMAILS
    processedEmailIds: {
      type: [String],
      default: []
    },
    // NEW FIELD FOR LAST EMAIL CHECK 
    lastEmailCheck: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
  }
);

//  UPDATED INDEXES 
contactSchema.index({ email: 1, createdAt: -1 });
contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ userRef: 1 });
contactSchema.index({ topicId: 1 });
contactSchema.index({ "helpCategories": 1 });
// NEW INDEXES FOR EMAIL TRACKING
contactSchema.index({ "messages.emailMessageId": 1 });
contactSchema.index({ "messages.uniqueKey": 1 });
contactSchema.index({ processedEmailIds: 1 });

// ========== VIRTUALS ==========
contactSchema.virtual("formattedDate").get(function () {
  return this.createdAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

contactSchema.virtual("messageCount").get(function () {
  return this.messages ? this.messages.length : 0;
});

contactSchema.virtual("lastReply").get(function () {
  if (this.messages && this.messages.length > 0) {
    const lastMessage = this.messages[this.messages.length - 1];
    if (lastMessage.replies && lastMessage.replies.length > 0) {
      return lastMessage.replies[lastMessage.replies.length - 1];
    }
  }
  return null;
});

// ========== METHODS ==========

contactSchema.methods.addReply = function(messageId, replyData) {
  const message = this.messages.id(messageId);
  if (!message) {
    throw new Error("Message not found");
  }
  message.replies.push(replyData);
  message.status = "replied";
  this.status = "replied";
  return this.save();
};

contactSchema.methods.resolve = function() {
  this.status = "resolved";
  this.resolvedAt = new Date();

  this.messages.forEach(msg => {
    if (msg.status !== "closed") {
      msg.status = "resolved";
    }
  });
  return this.save();
};

contactSchema.methods.addMessage = function(messageData) {
  this.messages.push(messageData);
  this.status = "in-progress";
  return this.save();
};

contactSchema.methods.close = function() {
  this.status = "closed";
  this.closedAt = new Date();
  this.messages.forEach(msg => {
    msg.status = "closed";
  });
  return this.save();
};

// ========== NEW METHOD: Check if email is already processed ==========
contactSchema.methods.isEmailProcessed = function(emailId) {
  if (!emailId) return false;
  
  // Check in processedEmailIds array
  if (this.processedEmailIds && this.processedEmailIds.includes(emailId)) {
    return true;
  }
  
  // Check in messages for this email ID
  return this.messages.some(msg => 
    msg.emailMessageId === emailId || 
    msg.uniqueKey === emailId
  );
};

// ========== NEW METHOD: Add processed email ID ==========
contactSchema.methods.addProcessedEmail = function(emailId) {
  if (!emailId) return;
  
  if (!this.processedEmailIds) {
    this.processedEmailIds = [];
  }
  
  if (!this.processedEmailIds.includes(emailId)) {
    this.processedEmailIds.push(emailId);
  }
};

// ========== NEW METHOD: Add multiple processed email IDs ==========
contactSchema.methods.addProcessedEmails = function(emailIds) {
  if (!emailIds || !Array.isArray(emailIds)) return;
  
  if (!this.processedEmailIds) {
    this.processedEmailIds = [];
  }
  
  for (const id of emailIds) {
    if (id && !this.processedEmailIds.includes(id)) {
      this.processedEmailIds.push(id);
    }
  }
};

const Contact = mongoose.model("Contact", contactSchema);
export default Contact;