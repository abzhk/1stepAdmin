import mongoose from "mongoose";
const providerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
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
    },
    profilePicture: {
      type: String,
      default: "./src/assets/defaultprofile.jpg",
      required: true,
    },
    imageUrls: {
      type: Array,
    },
    userRef: {
      type: String,
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
  {
    "address.city": 1,
    "address.pincode": 1,
  },
  {
    name: "location_filter_index",
  }
);

providerSchema.index(
  {
    createdAt: -1,
  },
  {
    name: "created_at_index",
  }
);

providerSchema.index(
  {
    userRef: 1,
  },
  {
    name: "user_ref_index",
  }
);
providerSchema.post("save", async function () {
  try {
    const Stats = (await import("./stats.model.js")).default;
    await Stats.updateOne({}, { $inc: { totalProviders: 1 } });
  } catch (err) {
    console.error("Failed to increment Stats.totalProviders:", err);
  }
});
const provider = mongoose.model("provider", providerSchema);

export default provider;
