import mongoose from "mongoose";


const serviceSpecializationSchema = new mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MasterData",
    required: true,
  },

  specializationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Specialization",
    required: true,
  },

  isPrimary: {
    type: Boolean,
    default: false,
  },

  displayOrder: {
    type: Number,
    default: 0,
  },

  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

serviceSpecializationSchema.index(
  {
    serviceId: 1,
    specializationId: 1,
  },
  {
    unique: true,
  }
);

const ServiceSpecialization = mongoose.model("ServiceSpecialization", serviceSpecializationSchema);
export default ServiceSpecialization;