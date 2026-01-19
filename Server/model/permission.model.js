import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema({
    permissionType: {
    type: String,
    required: true,
  },
})
const Permission = mongoose.model("Permission", permissionSchema);

export default Permission;
