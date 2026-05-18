import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "assessment",
      required: true,
    },

    questionKey: {
      type: String, 
      required: true,
    },

    questionText: {
       type: String,
        required: true ,
    },

    type: {
      type: String,
      enum: [ "multi_choice", "scale", "slider"],
      required: true,
    },

    order: {
      type: Number,
      required: true,
    },

    isRequired: {
      type: Boolean,
      default: true,
    },

    options: [
      {
        key: String, 
        label: String,
        score: Number,
      },
    ],

    scale: {
      min: Number,
      max: Number,
      step: Number,
    },

    validation: {
      minLength: Number,
      maxLength: Number,
    },

    conditionalLogic: {
      dependsOn: String,
      value: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);
questionSchema.index({
  assessmentId: 1,
  order: 1,
});

questionSchema.index(
  {
    assessmentId: 1,
    questionKey: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.model("assessment_questions", questionSchema);