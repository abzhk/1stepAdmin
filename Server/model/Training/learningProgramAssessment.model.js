import mongoose from "mongoose";

const learningProgramAssessmentSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LearningProgram",
      required: true,
      index: true,
    },

    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
      index: true,
    },

    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "provider",
      required: true,
      index: true,
    },

    // ============================================
    // BASIC INFO
    // ============================================
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    instructions: {
      type: String,
      default:
        "Please answer all questions honestly based on your observations.",
    },

    // ============================================
    // QUESTIONS ARRAY
    // ============================================
    questions: [
      {
        questionText: {
          type: String,
          required: true,
        },

        questionType: {
          type: String,
          enum: [
            "frequency", // Never/Sometimes/Often/Almost Always
            "likert", // Strongly Disagree to Strongly Agree
            "multipleChoice",
            "singleChoice",
            "yesNo",
            "rating",
            "text",
            "multiSelect",
          ],
          required: true,
        },

        // Options with scoring values
        options: [
          {
            text: {
              type: String,
              required: true,
            },
            value: {
              type: Number,
              required: true,
            },
            weight: {
              type: Number,
              default: 1,
            },
          },
        ],

        // For rating scales
        scale: {
          type: Number,
          default: 5,
        },

        // Domain for subscale scoring
        domain: {
          type: String,
          enum: [
            "general",
            "social_communication",
            "emotional_reciprocity",
            "sensory_sensitivity",
            "routines_repetition",
            "restricted_interests",
            "emotional_regulation",
            "masking_adaptation",
            "inattention",
            "hyperactivity",
            "impulsivity",
            "functional_impact",
            "reading_fluency",
            "spelling_writing",
            "phonological_processing",
            "reading_comprehension",
            "learning_impact",
          ],
          default: "general",
        },

        required: {
          type: Boolean,
          default: true,
        },

        reverseScored: {
          type: Boolean,
          default: false,
        },

        order: {
          type: Number,
          required: true,
        },
      },
    ],

    // ============================================
    // SCORING CONFIGURATION
    // ============================================
    scoringConfig: {
      method: {
        type: String,
        enum: ["sum", "average", "weighted", "custom"],
        default: "sum",
      },

      minScore: {
        type: Number,
        default: 0,
      },

      maxScore: {
        type: Number,
        required: true,
      },

      // Severity levels with ranges
      severityLevels: [
        {
          level: {
            type: String,
            enum: [
              "minimal",
              "mild",
              "moderate",
              "moderately_severe",
              "severe",
              "high",
            ],
            required: true,
          },
          label: {
            type: String,
            required: true,
          },
          minScore: {
            type: Number,
            required: true,
          },
          maxScore: {
            type: Number,
            required: true,
          },
          color: {
            type: String,
            required: true,
          },
          description: {
            type: String,
            required: true,
          },
          recommendations: [String],
        },
      ],

      // Subscale scoring
      subscales: [
        {
          name: {
            type: String,
            required: true,
          },
          domain: {
            type: String,
            required: true,
          },
          weight: {
            type: Number,
            default: 1,
          },
          maxScore: {
            type: Number,
            required: true,
          },
          severityLevels: [
            {
              level: String,
              label: String,
              minScore: Number,
              maxScore: Number,
              description: String,
            },
          ],
        },
      ],

      // Clinical cutoff scores
      clinicalCutoffs: [
        {
          name: {
            type: String,
            required: true,
          },
          score: {
            type: Number,
            required: true,
          },
          description: {
            type: String,
            required: true,
          },
          tags: [String],
        },
      ],

      passingScore: {
        type: Number,
        default: null,
      },
    },

    // ============================================
    // COURSE-SPECIFIC SETTINGS
    // ============================================
    isRequired: {
      type: Boolean,
      default: true,
    },

    affectsCertification: {
      type: Boolean,
      default: true,
    },

    allowMultipleAttempts: {
      type: Boolean,
      default: false,
    },

    maxAttempts: {
      type: Number,
      default: 1,
    },

    showResultsImmediately: {
      type: Boolean,
      default: true,
    },

    duration: {
      type: Number,
      default: 15, // minutes
    },

    interpretationGuide: {
      type: String,
    },

    // ============================================
    // STATISTICS
    // ============================================
    stats: {
      totalAttempts: {
        type: Number,
        default: 0,
      },

      totalCompletions: {
        type: Number,
        default: 0,
      },

      avgScore: {
        type: Number,
        default: 0,
      },

      avgCompletionTime: {
        type: Number,
        default: 0,
      },

      scoreDistribution: {
        minimal: { type: Number, default: 0 },
        mild: { type: Number, default: 0 },
        moderate: { type: Number, default: 0 },
        moderatelySevere: { type: Number, default: 0 },
        severe: { type: Number, default: 0 },
        high: { type: Number, default: 0 },
      },

      lastAttemptAt: Date,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ============================================
// INDEXES
// ============================================
learningProgramAssessmentSchema.index({ course: 1, module: 1 });
learningProgramAssessmentSchema.index({ isActive: 1 });

// ============================================
// METHODS
// ============================================
learningProgramAssessmentSchema.methods.calculateMaxScore = function () {
  let maxScore = 0;

  this.questions.forEach((question) => {
    if (question.questionType === "rating") {
      maxScore += question.scale * (question.options[0]?.weight || 1);
    } else if (question.options && question.options.length > 0) {
      const maxOption = Math.max(...question.options.map((o) => o.value || 0));
      maxScore += maxOption * (question.options[0]?.weight || 1);
    }
  });

  return maxScore;
};

learningProgramAssessmentSchema.methods.validateAssessment = function () {
  const errors = [];

  if (!this.questions || this.questions.length === 0) {
    errors.push("Assessment must have at least one question");
  }

  if (!this.scoringConfig || !this.scoringConfig.maxScore) {
    errors.push("Scoring configuration with maxScore is required");
  }

  if (
    !this.scoringConfig.severityLevels ||
    this.scoringConfig.severityLevels.length === 0
  ) {
    errors.push("Severity levels must be configured");
  }

  this.questions.forEach((q, index) => {
    if (
      ["frequency", "likert", "singleChoice", "multipleChoice"].includes(
        q.questionType
      )
    ) {
      if (!q.options || q.options.length === 0) {
        errors.push(`Question ${index + 1} must have options`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ============================================
// STATICS
// ============================================
learningProgramAssessmentSchema.statics.getFrequencyOptions = function () {
  return [
    { text: "Never", value: 0, weight: 1 },
    { text: "Sometimes", value: 1, weight: 1 },
    { text: "Often", value: 2, weight: 1 },
    { text: "Almost Always", value: 3, weight: 1 },
  ];
};

learningProgramAssessmentSchema.statics.generateDefaultSeverityLevels = function (
  maxScore,
  type = "general"
) {
  if (type === "neurodevelopmental") {
    return [
      {
        level: "minimal",
        label: "Minimal Traits",
        minScore: 0,
        maxScore: Math.floor(maxScore * 0.25),
        color: "#10b981",
        description: "Few traits present",
        recommendations: [
          "Monitor over time",
          "Re-screen if concerns increase",
        ],
      },
      {
        level: "mild",
        label: "Mild Traits",
        minScore: Math.floor(maxScore * 0.25) + 1,
        maxScore: Math.floor(maxScore * 0.5),
        color: "#3b82f6",
        description: "Some traits present, manageable",
        recommendations: [
          "Discuss with healthcare provider",
          "Implement support strategies",
        ],
      },
      {
        level: "moderate",
        label: "Moderate Traits",
        minScore: Math.floor(maxScore * 0.5) + 1,
        maxScore: Math.floor(maxScore * 0.7),
        color: "#f59e0b",
        description: "Multiple traits requiring attention",
        recommendations: [
          "Recommend comprehensive evaluation",
          "Consider professional assessment",
        ],
      },
      {
        level: "high",
        label: "High Traits",
        minScore: Math.floor(maxScore * 0.7) + 1,
        maxScore: maxScore,
        color: "#ef4444",
        description: "Strong presence affecting daily functioning",
        recommendations: [
          "Strongly recommend diagnostic evaluation",
          "Consult with specialists",
        ],
      },
    ];
  }

  return [
    {
      level: "minimal",
      label: "Minimal",
      minScore: 0,
      maxScore: Math.floor(maxScore * 0.2),
      color: "#10b981",
      description: "Minimal or no symptoms",
      recommendations: ["Continue regular self-care practices"],
    },
    {
      level: "mild",
      label: "Mild",
      minScore: Math.floor(maxScore * 0.2) + 1,
      maxScore: Math.floor(maxScore * 0.4),
      color: "#3b82f6",
      description: "Mild symptoms requiring monitoring",
      recommendations: ["Monitor symptoms", "Consider lifestyle adjustments"],
    },
    {
      level: "moderate",
      label: "Moderate",
      minScore: Math.floor(maxScore * 0.4) + 1,
      maxScore: Math.floor(maxScore * 0.6),
      color: "#f59e0b",
      description: "Moderate symptoms requiring attention",
      recommendations: [
        "Consult healthcare provider",
        "Consider therapeutic interventions",
      ],
    },
    {
      level: "moderately_severe",
      label: "Moderately Severe",
      minScore: Math.floor(maxScore * 0.6) + 1,
      maxScore: Math.floor(maxScore * 0.8),
      color: "#f97316",
      description: "Moderately severe symptoms",
      recommendations: [
        "Seek professional help promptly",
        "Regular monitoring recommended",
      ],
    },
    {
      level: "severe",
      label: "Severe",
      minScore: Math.floor(maxScore * 0.8) + 1,
      maxScore: maxScore,
      color: "#ef4444",
      description: "Severe symptoms requiring immediate attention",
      recommendations: [
        "Seek immediate professional help",
        "Consider intensive treatment",
      ],
    },
  ];
};

const LearningProgramAssessment =
  mongoose.models.LearningProgramAssessment ||
  mongoose.model(
    "LearningProgramAssessment",
    learningProgramAssessmentSchema,
    "courseassessments"
  );

export default LearningProgramAssessment;
