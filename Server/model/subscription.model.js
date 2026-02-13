// models/UserSubscription.js
import mongoose from "mongoose";

const userSubscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: false, // null = free tier
    },
    status: {
      type: String,
      enum: ["free", "trial", "active", "past_due", "expired", "cancelled"],
      default: "free",
    },

    // 🔥 PLAN SNAPSHOT (locked at subscription time)
    plan_snapshot: {
      plan_name: String,
      available_modules: [String],
      max_messages_per_month: Number,
      max_assessments_per_month: Number,
      max_providers_allowed: Number,
      video_sessions_count: Number,
    },

    // 🔥 MONTHLY USAGE TRACKING
    usage: {
      messages_sent_this_month: {
        type: Number,
        default: 0,
      },
      assessments_created_this_month: {
        type: Number,
        default: 0,
      },
      video_sessions_used: {
        type: Number,
        default: 0,
      },
      last_reset_date: {
        type: Date,
        default: Date.now,
      },
    },

    // 🔥 PROVIDER MESSAGING TRACKING
    providers_messaged: [
      {
        provider: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        first_message_at: Date,
      },
    ],

    // Dates
    started_at: {
      type: Date,
      default: Date.now,
    },
    trial_ends_at: Date,
    current_period_start: Date,
    current_period_end: Date,
    cancelled_at: Date,

    // Stripe
    stripe_subscription_id: String,
    stripe_customer_id: String,

    auto_renew: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

userSubscriptionSchema.index({ user: 1 });
userSubscriptionSchema.index({ status: 1 });

// 🔥 METHODS
userSubscriptionSchema.methods.hasReachedMessageLimit = function () {
  const limit = this.plan_snapshot?.max_messages_per_month || 2; // Free tier default: 2
  if (limit === 0) return false; // unlimited
  return this.usage.messages_sent_this_month >= limit;
};

userSubscriptionSchema.methods.hasReachedAssessmentLimit = function () {
  const limit = this.plan_snapshot?.max_assessments_per_month || 1; // Free tier default: 1
  if (limit === 0) return false; // unlimited
  return this.usage.assessments_created_this_month >= limit;
};

userSubscriptionSchema.methods.canMessageProvider = function (providerId) {
  const maxProviders = this.plan_snapshot?.max_providers_allowed || 1;
  if (maxProviders === 999) return true; // unlimited

  const alreadyMessaged = this.providers_messaged.some(
    (p) => p.provider.toString() === providerId.toString(),
  );

  if (alreadyMessaged) return true;
  return this.providers_messaged.length < maxProviders;
};

userSubscriptionSchema.methods.resetMonthlyUsage = function () {
  this.usage.messages_sent_this_month = 0;
  this.usage.assessments_created_this_month = 0;
  this.usage.last_reset_date = new Date();
  return this.save();
};

const UserSubscription = mongoose.model(
  "UserSubscription",
  userSubscriptionSchema,
);
export default UserSubscription;
