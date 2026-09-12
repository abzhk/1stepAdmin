import mongoose from "mongoose";

const stepSchema =
new mongoose.Schema({

 title: String,

 desc: String,

 practices: [String]

});

const learningPathSchema =
new mongoose.Schema({

 assessmentId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "assessment",
  required: true,
  unique: true
 },

 title: String,

 image: String,

 steps: [stepSchema]

},
{
 timestamps:true
});

export default mongoose.model(
 "LearningPath",   
 learningPathSchema
);