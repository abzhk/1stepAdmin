// models/Role.js
import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      unique: true,
      enum: ["Parent", "Provider", "Admin", "super_admin"],
    },
    description: String,

    isSuperAdmin: {
      type: Boolean,
      default: false,
    },

    // 🔥 DEFAULT MODULES (given on signup)
    defaultModules: [
      {
        type: String,
        default: ["dashboard", "profile"],
      },
    ],

    // 🔥 MODULE-ACTION PERMISSIONS
    permissions: [
      {
        module: {
          type: String,
          required: true,
        },
        actions: [String], // ["read", "create", "update", "delete"]
      },
    ],
  },
  { timestamps: true },
);

const Role = mongoose.model("Role", roleSchema);
export default Role;
