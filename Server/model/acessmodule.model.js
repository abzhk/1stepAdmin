import mongoose from "mongoose";

const accessmoduleSchema = new mongoose.Schema({

modules:{
    type:String,
    unique:true,
    required:true,
    lowercase: true,
},
},
{ timestamps: true } )

    const AccessModules = mongoose.model("AccessModules", accessmoduleSchema);
    export default AccessModules;