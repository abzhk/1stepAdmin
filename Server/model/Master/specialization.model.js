import mongoose from "mongoose";

const specializationSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
    },


    description: String,

    isActive: {
      type: Boolean,
      default: true,
    },

    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Specialization = mongoose.model("Specialization", specializationSchema);
export default Specialization;