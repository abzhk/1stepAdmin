import mongoose from "mongoose";
import { capitalizeName } from "../utils/stringUtils.js";


const providerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      set: capitalizeName
    },
    providerType: {
      type: String,
      enum: ["individual", "centre"],
      required: true,
    },
    locationUrl: {
      type: String,
      required: function () {
        return this.providerType === "centre";
      },
    },
    openTime: {
      type: String,
      default: "08:00",
    },
    closeTime: {
      type: String,
      default: "18:00",
    },
    name: {
      type: Array,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    qualification: {
      type: String,
      required: true,
    },
    license: {
      type: String,
      required: true,
    },
    experience: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      addressLine1: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      street: {
        type: String,
        required: true,
      },
      pincode: {
        type: Number,
        required: true,
      },
    },
    therapytype: {
      type: Array,
      required: true,
    },
    regularPrice: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
      minlength: [100, "Description must be at least 100 characters"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    profilePicture: {
      type: String,
      default: "./src/assets/defaultprofile.jpg",
      required: true,
    },
    specialization: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Specialization",
      }
    ],
    imageUrls: {
      type: Array,
    },
    uploadedFileKeys: {
      type: Array,
    },
    operatingHours: {
      type: Map,
      of: new mongoose.Schema({
        enabled: { type: Boolean, default: false },
        openTime: { type: String, default: "09:00" },
        closeTime: { type: String, default: "18:00" }
      }, { _id: false }),
      default: {}
    },

    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: Number,
      default: 0,
    },
    timeSlots: {
      Monday: {
        type: Array,
        default: [],
      },
      Tuesday: {
        type: Array,
        default: [],
      },
      Wednesday: {
        type: Array,
        default: [],
      },
      Thursday: {
        type: Array,
        default: [],
      },
      Friday: {
        type: Array,
        default: [],
      },
      Saturday: {
        type: Array,
        default: [],
      },
      Sunday: {
        type: Array,
        default: [],
      },
    },
    ratingSummary: {
      count: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      average: { type: Number, default: 0 },
      breakdown: {
        1: { type: Number, default: 0 },
        2: { type: Number, default: 0 },
        3: { type: Number, default: 0 },
        4: { type: Number, default: 0 },
        5: { type: Number, default: 0 },
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

providerSchema.index(
  {
    fullName: "text",
    name: "text",
    "address.city": "text",
  },
  {
    name: "provider_search_index",
    weights: {
      fullName: 10,
      name: 8,
      "address.city": 5,
    },
    default_language: "english",
  }
);

providerSchema.index(
  { "address.city": 1, "address.pincode": 1 },
  { name: "location_filter_index" }
);

providerSchema.index({ createdAt: -1 }, { name: "created_at_index" });

providerSchema.index({ userRef: 1 }, { name: "user_ref_index" });

providerSchema.index({providerType: 1,isActive: 1,createdAt: -1,_id: 1, },{name: "provider_admin_active_list_index",});


providerSchema.post("save", async function (doc) {

  if (!doc.isNew) return;  

  try {
    const Stats = (await import("../model/stats.model.js")).default;

    const update = {
      $inc: { totalProviders: 1 },
    };

    if (doc.providerType === "individual") {
      update.$inc.totalIndividualProviders = 1;
    }

    if (doc.providerType === "centre") {
      update.$inc.totalCentreProviders = 1;
    }

    await Stats.updateOne({}, update, { upsert: true });

  } catch (err) {
    console.error("Failed to increment provider stats:", err);
  }
});

providerSchema.post("findOneAndDelete", async function (doc) {
  if (!doc) return;

  try {
    const Stats = (await import("../model/stats.model.js")).default;

    const update = {
      $inc: { totalProviders: -1 },
    };

    if (doc.providerType === "individual") {
      update.$inc.totalIndividualProviders = -1;
    }

    if (doc.providerType === "centre") {
      update.$inc.totalCentreProviders = -1;
    }

    await Stats.updateOne({}, update);

  } catch (err) {
    console.error("Failed to decrement provider stats:", err);
  }
});

const provider = mongoose.model("provider", providerSchema);

export default provider;