// models/Plan.js
import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    plan_key: {
      type: String,
      required: true,
      lowercase: true,
      enum: ["free", "basic", "pro", "premium"],
    },
    plan_name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    is_featured: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "USD",
      uppercase: true,
    },
    billing_interval: {
      type: String,
      enum: ["monthly", "quarterly", "annually", "lifetime"],
      required: true,
    },
    trial_period_days: {
      type: Number,
      default: 0,
      min: 0,
    },
    stripe_price_id: {
      type: String,
      required: true,
    },

    // 🔥 MODULES UNLOCKED BY THIS PLAN
    available_modules: [
      {
        type: String,
        enum: [
          "dashboard",
          "profile",
          "messages",
          "assessment",
          "appointments",
          "video_sessions",
          "reports",
          "billing",
          "resource_library",
        ],
      },
    ],

    // 🔥 USAGE LIMITS
    max_messages_per_month: {
      type: Number,
      default: 0, // 0 = unlimited
    },
    max_assessments_per_month: {
      type: Number,
      default: 0, // 0 = unlimited
    },
    max_providers_allowed: {
      type: Number,
      default: 1,
    },
    video_sessions_count: {
      type: Number,
      default: 0, // 0 = unlimited
    },
    session_duration_mins: {
      type: Number,
      default: 60,
    },

    // 🔥 FEATURES
    chat_access_level: {
      type: String,
      enum: ["none", "limited", "unlimited"],
      default: "none",
    },
    resource_library_access: {
      type: Boolean,
      default: false,
    },
    therapist_matching_type: {
      type: String,
      enum: ["auto", "manual", "both"],
      default: "auto",
    },
    priority_support: {
      type: Boolean,
      default: false,
    },

    is_active: {
      type: Boolean,
      default: true,
    },
    version_number: {
      type: Number,
      required: true,
      default: 1,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    final_price: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

planSchema.index({ plan_key: 1, version_number: 1 }, { unique: true });
planSchema.index({ slug: 1 });
planSchema.index({ is_active: 1 });

const Plan = mongoose.model("Plan", planSchema);
export default Plan;
