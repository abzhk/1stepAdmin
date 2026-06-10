import mongoose from "mongoose";

const providerAssessmentSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "assessmentCategory",
      required: true,
    },

    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "provider",
      required: true,
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

        // For reverse scoring (positively worded questions)
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
    // SCORING CONFIGURATION/
    // ============================================
    scoringConfig: {
      // Scoring method
      method: {
        type: String,
        enum: ["sum", "average", "weighted", "custom"],
        default: "sum",
      },

      // Score range
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

      // Subscale scoring configuration
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

          linkedDiagnosticReferences: [
            {
              system: {
                type: String,
                enum: ["DSM-5", "DSM-5-TR", "ICD-10", "ICD-11"],
              },
              code: String,
            },
          ],
        },
      ],

      passingScore: {
        type: Number,
        default: null,
      },
    },

    // ============================================
    // ASSESSMENT METADATA
    // ============================================
    duration: {
      type: Number,
      default: 10, // minutes default
    },

    instructions: {
      type: String,
      default: "",
    },

    interpretationGuide: {
      type: String,
    },

    validity: {
      validated: Boolean,
      validationStudy: String,
      reliability: Number,
      sensitivity: Number,
      specificity: Number,
    },

    stats: {
      totalResponses: {
        type: Number,
        default: 0,
      },

      lastResponseAt: Date,

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

      subscaleAverages: {
        type: Map,
        of: Number,
      },
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    publishedAt: Date,

    // Version control
    version: {
      type: Number,
      default: 1,
    },

    previousVersions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "providerAssessment",
      },
    ],
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
providerAssessmentSchema.index({ provider: 1, status: 1 });
providerAssessmentSchema.index({ status: 1, category: 1 });
providerAssessmentSchema.index({ "stats.totalResponses": -1 });
providerAssessmentSchema.index({ publishedAt: -1 });

// ============================================
// PRE-SAVE MIDDLEWARE: AUTO-GENERATE SLUG
// ============================================
providerAssessmentSchema.pre("validate", async function (next) {
  if (!this.title) return next();

  const baseSlug = this.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const regex = new RegExp(`^${baseSlug}(-\\d+)?$`);

  const existing = await mongoose.models.providerAssessment
    .find({ slug: regex })
    .select("slug");

  if (existing.length === 0) {
    this.slug = baseSlug;
    return next();
  }

  // Extract slug numbers
  const numbers = existing
    .map((doc) => {
      const match = doc.slug.match(/-(\d+)$/);
      return match ? parseInt(match[1]) : 0;
    })
    .sort((a, b) => b - a);

  const nextNumber = numbers[0] + 1;

  this.slug = `${baseSlug}-${nextNumber}`;

  next();
});

// ============================================
// METHODS: CALCULATE MAX SCORE
// ============================================
providerAssessmentSchema.methods.calculateMaxScore = function () {
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

// ============================================
// METHODS: VALIDATE ASSESSMENT
// ============================================
providerAssessmentSchema.methods.validateAssessment = function () {
  const errors = [];

  // Check questions exist
  if (!this.questions || this.questions.length === 0) {
    errors.push("Assessment must have at least one question");
  }

  // Check scoring config
  if (!this.scoringConfig || !this.scoringConfig.maxScore) {
    errors.push("Scoring configuration with maxScore is required");
  }

  // Check severity levels
  if (
    !this.scoringConfig.severityLevels ||
    this.scoringConfig.severityLevels.length === 0
  ) {
    errors.push("Severity levels must be configured");
  }

  // Validate each question
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
// STATICS: GET DEFAULT FREQUENCY OPTIONS
// ============================================
providerAssessmentSchema.statics.getFrequencyOptions = function () {
  return [
    { text: "Never", value: 0 },
    { text: "Sometimes", value: 1 },
    { text: "Often", value: 2 },
    { text: "Almost Always", value: 3 },
  ];
};

// ============================================
// STATICS: GENERATE DEFAULT SEVERITY LEVELS
// ============================================
providerAssessmentSchema.statics.generateDefaultSeverityLevels = function (
  maxScore,
  type = "general"
) {
  // For neurodevelopmental screenings (4 levels)
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

  // General 5-level severity (default)
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
      level: "moderately-severe",
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

const providerAssessment = mongoose.model(
  "providerAssessment",
  providerAssessmentSchema
);
export default providerAssessment;
