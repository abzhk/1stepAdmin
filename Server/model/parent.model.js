import mongoose from "mongoose";

const ParentSchema = new mongoose.Schema(
  {
    isParent: {
      type: Boolean,
      default: false,
      required: true,
    },
    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
    },
    parentDetails: {
      fullName: {
        type: String,
        required: true,
      },
      childName: {
        type: String,
        required: true,
      },
      lookingFor: {
        type: Array,
        required: true,
      },
      dob: {
        type: Date,
        default: null,
      },
      gender: {
        type: String,
        required: true,
      },
      height: {
        type: String,
        required: true,
      },
      weight: {
        type: String,
        required: true,
      },
      bloodGroup: {
        type: String,
        required: true,
      },
      medicalHistory: {
        type: String,
        required: true,
      },
      allergies: {
        type: String,
        required: true,
      },
      emergencyContact: {
        type: String,
        required: true,
      },
      insurance: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      phoneNumber: {
        type: String,
        required: true,
      },
    },
  },
  { timestamps: true }
);

ParentSchema.index(
  {
    userRef: 1,
  },
  {
    name: "user_ref_index",
  }
);
ParentSchema.post("save", async function () {
  try {
    const Stats = (await import("./stats.model.js")).default;
    await Stats.updateOne({}, { $inc: { totalParents: 1 } });
  } catch (err) {
    console.error("Failed to increment Stats.totalParents:", err);
  }
});
const Parent = mongoose.model("Parent", ParentSchema);

export default Parent;
