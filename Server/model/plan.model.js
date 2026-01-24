import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    plan_key: {
      type: String,
      required: true,
      lowercase: true,
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
      enum: ["monthly", "quarterly", "annually"],
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

    video_sessions_count: {
      type: Number,
      default: 0,
    },

    session_duration_mins: {
      type: Number,
      default: 60,
    },

    chat_access_level: {
      type: String,
      enum: ["none", "limited_hours", "24/7_unlimited"],
      default: "none",
    },

    resource_library_access: {
      type: Boolean,
      default: false,
    },

    therapist_matching_type: {
      type: String,
      enum: ["Algorithm Match", "Manual Selection"],
      default: "Algorithm Match",
    },

    is_active: {
      type: Boolean,
      default: true,
    },

    version_number: {
      type: Number,
      required: true,
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
  { timestamps: true }
);
planSchema.index(
  { plan_key: 1, version_number: 1 },
  { unique: true }
);
const Plan = mongoose.model("Plan", planSchema);

export default Plan;
