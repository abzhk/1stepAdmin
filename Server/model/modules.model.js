import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema({

modules:{
    type:String,
    unique:true,
    required:true,
},
},
{ timestamps: true } )

    const Module = mongoose.model("Module", moduleSchema);
    export default Module;