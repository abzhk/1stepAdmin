import mongoose from "mongoose";

const assessmentTestSchema = new mongoose.Schema(
{
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"assessmentCategory",
        required:true
    },

    code:{
        type:String,
        required:true,
        trim:true,
        uppercase:true
    },

    name:{
        type:String,
        required:true,
        trim:true
    },

    description:{
        type:String,
        default:""
    },

    isActive:{
        type:Boolean,
        default:true
    },
    specialization: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Specialization",
  required: true,
},
},
{
    timestamps:true
});

export default mongoose.model("assessmentTest",assessmentTestSchema);