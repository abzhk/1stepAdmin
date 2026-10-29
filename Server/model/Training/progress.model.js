import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LearningProgram",
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "provider",
      required: true,
    },
    modules: [
      {
        module: { type: mongoose.Schema.Types.ObjectId, ref: "Module" },
        completed: { type: Boolean, default: false },
        completedAt: { type: Date },

        lessons: [
          {
            lesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
            completed: { type: Boolean, default: false },
            completedAt: { type: Date },
            topics: [
              {
                topic: { type: mongoose.Schema.Types.ObjectId, ref: "Topic" },
                completed: { type: Boolean, default: false },
                completedAt: { type: Date },
              },
            ],
          },
        ],

        // Assessment Result Structure
        assessmentResult: {
          assessment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "LearningProgramAssessment",
          },

          // Attempt tracking
          attemptNumber: { type: Number, default: 0 },
          totalAttempts: { type: Number, default: 0 },

          // Status
          status: {
            type: String,
            enum: ["not_started", "in_progress", "completed", "under_review"],
            default: "not_started",
          },

          // Timestamps
          startedAt: { type: Date },
          lastAttemptAt: { type: Date },
          completedAt: { type: Date },

          // Responses
          responses: [
            {
              questionId: mongoose.Schema.Types.ObjectId,
              questionText: String,
              questionType: String,
              answer: mongoose.Schema.Types.Mixed,
              value: Number,
              domain: String,
            },
          ],

          // Scoring Results
          totalScore: { type: Number },
          maxScore: { type: Number },
          percentage: { type: Number },

          // Severity Level
          severityLevel: {
            level: String,
            label: String,
            color: String,
            description: String,
            recommendations: [String],
          },

          // Subscale Scores
          subscaleScores: [
            {
              name: String,
              domain: String,
              score: Number,
              maxScore: Number,
              percentage: Number,
              severityLevel: {
                level: String,
                label: String,
                description: String,
              },
            },
          ],

          // Clinical Flags
          clinicalFlags: [
            {
              cutoffName: String,
              score: Number,
              threshold: Number,
              met: Boolean,
              description: String,
              tags: [String],
            },
          ],

          // Metadata
          completionTime: { type: Number }, // seconds

          // Provider Review
          providerReview: {
            reviewed: { type: Boolean, default: false },
            reviewedAt: { type: Date },
            reviewedBy: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "provider",
            },
            feedback: { type: String },
            notes: { type: String },
          },

          // Pass/Fail
          passed: { type: Boolean },
          requiresRetake: { type: Boolean, default: false },
        },
      },
    ],

    // Overall progress
    overallProgress: {
      totalModules: { type: Number, default: 0 },
      completedModules: { type: Number, default: 0 },
      totalLessons: { type: Number, default: 0 },
      completedLessons: { type: Number, default: 0 },
      totalAssessments: { type: Number, default: 0 },
      completedAssessments: { type: Number, default: 0 },
      percentageComplete: { type: Number, default: 0 },
    },

    certification: {
      eligible: { type: Boolean, default: false },
      certified: { type: Boolean, default: false },
      certifiedOn: { type: Date },
      certificateUrl: { type: String },
      certificateId: { type: String },
    },
  },
  { timestamps: true }
);

// Indexes
progressSchema.index({ parent: 1, course: 1 }, { unique: true });
progressSchema.index({ provider: 1 });
progressSchema.index({ "modules.assessmentResult.status": 1 });

// Methods
progressSchema.methods.calculateProgress = function () {
  let totalModules = this.modules.length;
  let completedModules = this.modules.filter((m) => m.completed).length;

  let totalLessons = 0;
  let completedLessons = 0;
  let totalAssessments = 0;
  let completedAssessments = 0;

  this.modules.forEach((module) => {
    totalLessons += module.lessons.length;
    completedLessons += module.lessons.filter((l) => l.completed).length;

    if (module.assessmentResult?.assessment) {
      totalAssessments += 1;
      if (module.assessmentResult.passed === true) {
        completedAssessments += 1;
      }
    }
  });

  const totalItems = totalLessons + totalAssessments;
  const completedItems = completedLessons + completedAssessments;

  const percentageComplete =
    totalItems > 0
      ? Math.round((completedItems / totalItems) * 100)
      : totalModules > 0
      ? Math.round((completedModules / totalModules) * 100)
      : 0;

  this.overallProgress = {
    totalModules,
    completedModules,
    totalLessons,
    completedLessons,
    totalAssessments,
    completedAssessments,
    percentageComplete,
  };

  return this.overallProgress;
};

progressSchema.methods.checkCertificationEligibility = function () {
  const allModulesCompleted = this.modules.every((m) => m.completed);

  const allRequiredAssessmentsCompleted = this.modules.every((module) => {
    if (!module.assessmentResult?.assessment) return true;
    return module.assessmentResult.status === "completed";
  });

  const allAssessmentsPassed = this.modules.every((module) => {
    if (!module.assessmentResult?.assessment) return true;
    if (module.assessmentResult.passed === undefined) return true;
    return module.assessmentResult.passed === true;
  });

  const eligible =
    allModulesCompleted &&
    allRequiredAssessmentsCompleted &&
    allAssessmentsPassed;

  this.certification.eligible = eligible;
  return eligible;
};

// Compound index to guarantee one progress record per parent per program
progressSchema.index({ parent: 1, course: 1 }, { unique: true });

export default mongoose.models.Progress || mongoose.model("Progress", progressSchema);
