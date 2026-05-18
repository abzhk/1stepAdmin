import mongoose from "mongoose";

const centreProviderSchema = new mongoose.Schema(
  {
    centreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "provider",
      required: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "provider",
      required: true,
    },
    role: {
      type: String,
      enum: ["provider"],
      default: "provider",
    },
    consultationFee: {
      type: Number,
    },
    centreAvailableSlots: {
      type: Object,
      default: {},
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    leftAt: {
      type: Date,
      default: null,
    },
    addedBy: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

centreProviderSchema.index(
  { centreId: 1, providerId: 1 },
  {
    unique: true,
    name: "unique_centre_provider_pair",
  }
);

// Fast lookup: Get all providers in a centre
centreProviderSchema.index(
  { centreId: 1, isActive: 1 },
  { name: "centre_active_providers" }
);

// Fast lookup: Get all centres for a provider
centreProviderSchema.index(
  { providerId: 1, isActive: 1 },
  { name: "provider_active_centres" }
);

// Validation
centreProviderSchema.pre("save", async function (next) {
  if (this.isNew) {
    const centre = await mongoose.model("provider").findOne({
      _id: this.centreId,
      providerType: "centre",
    });

    if (!centre) {
      return next(new Error("Centre not found or invalid type"));
    }

    const provider = await mongoose.model("provider").findOne({
      _id: this.providerId,
      providerType: "individual",
    });

    if (!provider) {
      return next(new Error("Provider not found or invalid type"));
    }
  }
  next();
});

const CentreProvider = mongoose.model("CentreProvider", centreProviderSchema);

export default CentreProvider;
