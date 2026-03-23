import mongoose, { Schema } from "mongoose";

const masterDataSchema = new mongoose.Schema(
  {
    // ============================================
    // CORE FIELDS
    // ============================================
    type: {
      type: String,
      required: true,
      enum: [
        // Clinical / Diagnosis
        "condition",
        "symptomDomain",

        // Assessment related
        "questionType",
        "domain",
        "severityLevel",
        "scoringMethod",
        "assessmentStatus",
        "diagnosticSystem",
        "clinicalCutoff",

        // Provider & Service
        "therapistSpecialization",
        "serviceType",
        "serviceMode",
        "therapyType",

        // Programs & Content
        "programCategory",
        "activityType",
        "contentCategory",

        // Operational
        "ageBand",
        "role",
        "appointmentStatus",
        "notificationTemplate",
        "consentTemplate",

        // Generic
        "specialization",
        "condition",
        "articleTag"
      ],
      index: true,
    },

    code: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    label: {
      type: String,
      required: true,
      trim: true,
    },

    name: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    // ============================================
    // CLINICAL CODES (for conditions, diagnoses)
    // ============================================
    icdCode: {
      type: String,
      trim: true,
      uppercase: true,
      // e.g., "F84.0" for Autism
    },

    dsmCode: {
      type: String,
      trim: true,
      uppercase: true,
      // e.g., "299.00" for ASD
    },

    // ============================================
    // CATEGORIZATION & TAGGING
    // ============================================
    category: {
      type: String,
      // e.g., "neurodevelopmental", "emotional", "behavioral"
    },

    subCategory: {
      type: String,
      // More specific categorization
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    // ============================================
    // AGE-RELATED FIELDS
    // ============================================
    ageBands: [
      {
        type: String,
        // e.g., "3-5", "6-12", "13-17"
      },
    ],

    minAge: {
      type: Number,
      min: 0,
    },

    maxAge: {
      type: Number,
      min: 0,
    },

    // ============================================
    // RELATIONSHIPS
    // ============================================
    parentType: {
      type: String,
      default: null,
    },

    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MasterData",
    },

    // For linking conditions to domains, specializations, etc.
    relatedRefs: [
      {
        refType: {
          type: String,
          // "condition", "symptomDomain", "specialization"
        },
        refId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MasterData",
        },
      },
    ],

    // Condition references (for domains, activities, etc.)
    conditionRefs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MasterData",
      },
    ],

    // ============================================
    // DISPLAY & BEHAVIOR
    // ============================================
    isDisabled: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },

    order: {
      type: Number,
      default: 0,
    },

    color: {
      type: String,
      default: null,
    },

    icon: {
      type: String,
      default: null,
    },

    // ============================================
    // TYPE-SPECIFIC METADATA
    // ============================================
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
      /*
      Examples by type:
      
      questionType: {
        defaultOptions: [{ text, value, weight }]
      }
      
      condition: {
        prevalence: "1 in 54",
        onsetAge: "early childhood"
      }
      
      severityLevel: {
        scorePercentage: { min: 0, max: 25 },
        recommendations: ["..."]
      }
      
      serviceType: {
        durationDefault: 60,
        billable: true,
        priceDefault: 150
      }
      
      ageBand: {
        developmentalStage: "early childhood"
      }
      
      notificationTemplate: {
        channel: "email",
        subjectTemplate: "...",
        bodyTemplate: "...",
        variables: ["childName", "therapistName"]
      }
      
      consentTemplate: {
        locale: "en-US",
        version: "1.0",
        body: "...",
        requiresSignature: true
      }
      
      activityType: {
        estimatedDurationMinutes: 30,
        mediaUrls: ["..."]
      }
      */
    },

    // ============================================
    // VERSIONING & COMPLIANCE
    // ============================================
    version: {
      type: String,
      default: "1.0",
    },

    effectiveDate: {
      type: Date,
      default: Date.now,
    },

    expiryDate: {
      type: Date,
    },

    // For consent templates, clinical standards
    isCompliant: {
      type: Boolean,
      default: true,
    },

    complianceNotes: {
      type: String,
    },

    // ============================================
    // AUDIT & ADMIN
    // ============================================
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    isSystemDefined: {
      type: Boolean,
      default: false,
    },

    // Change history for critical data
    changeHistory: [
      {
        field: String,
        oldValue: Schema.Types.Mixed,
        newValue: Schema.Types.Mixed,
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        reason: String,
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
masterDataSchema.index({ type: 1, code: 1 }, { unique: true });
masterDataSchema.index({ type: 1, isActive: 1, order: 1 });
masterDataSchema.index({ type: 1, category: 1 });
masterDataSchema.index({ type: 1, parentType: 1 });
masterDataSchema.index({ tags: 1 });
masterDataSchema.index({ icdCode: 1 });
masterDataSchema.index({ dsmCode: 1 });
masterDataSchema.index({ conditionRefs: 1 });
masterDataSchema.index({ ageBands: 1 });

// ============================================
// VALIDATION
// ============================================
masterDataSchema.pre("save", function (next) {
  // Validate clinical codes format
  if (this.icdCode && !/^[A-Z]\d{2}(\.\d{1,2})?$/.test(this.icdCode)) {
    return next(new Error("Invalid ICD code format"));
  }

  // Validate age bands
  if (this.minAge !== undefined && this.maxAge !== undefined) {
    if (this.minAge > this.maxAge) {
      return next(new Error("minAge cannot be greater than maxAge"));
    }
  }

  // Auto-generate name from label if not provided
  if (!this.name && this.label) {
    this.name = this.label;
  }

  next();
});

// ============================================
// STATICS: GET OPTIONS BY TYPE
// ============================================
masterDataSchema.statics.getOptionsByType = async function (
  type,
  filters = {}
) {
  const query = {
    type,
    isActive: true,
    ...filters,
  };

  return await this.find(query)
    .sort({ order: 1, label: 1 })
    .populate("conditionRefs", "code label")
    .lean();
};

// ============================================
// STATICS: FORMAT FOR DROPDOWN
// ============================================
masterDataSchema.statics.formatForDropdown = async function (
  type,
  filters = {}
) {
  const items = await this.getOptionsByType(type, filters);

  return items.map((item) => ({
    value: item.code,
    label: item.label,
    isDisabled: item.isDisabled,
    color: item.color,
    icon: item.icon,
    metadata: item.metadata,
    icdCode: item.icdCode,
    dsmCode: item.dsmCode,
  }));
};

// ============================================
// STATICS: GET BY AGE BAND
// ============================================
masterDataSchema.statics.getByAgeBand = async function (type, age) {
  return await this.find({
    type,
    isActive: true,
    $or: [
      { ageBands: { $exists: false } },
      { ageBands: { $size: 0 } },
      {
        $and: [{ minAge: { $lte: age } }, { maxAge: { $gte: age } }],
      },
    ],
  })
    .sort({ order: 1 })
    .lean();
};

// ============================================
// STATICS: GET CONDITIONS BY CODE
// ============================================
masterDataSchema.statics.getConditionByClinicalCode = async function (
  codeType,
  code
) {
  const query = {
    type: "condition",
    isActive: true,
  };

  if (codeType === "ICD") {
    query.icdCode = code.toUpperCase();
  } else if (codeType === "DSM") {
    query.dsmCode = code.toUpperCase();
  }

  return await this.findOne(query).lean();
};

// ============================================
// STATICS: BULK INSERT WITH HISTORY
// ============================================
masterDataSchema.statics.bulkInsertOptions = async function (
  type,
  options,
  userId = null
) {
  const operations = options.map((opt, index) => ({
    updateOne: {
      filter: { type, code: opt.code },
      update: {
        $set: {
          ...opt,
          type,
          order: opt.order !== undefined ? opt.order : index,
          updatedBy: userId,
        },
        $setOnInsert: {
          createdBy: userId,
        },
      },
      upsert: true,
    },
  }));

  return await this.bulkWrite(operations);
};

// ============================================
// METHODS: TRACK CHANGE
// ============================================
masterDataSchema.methods.trackChange = function (
  field,
  oldValue,
  newValue,
  userId,
  reason
) {
  this.changeHistory.push({
    field,
    oldValue,
    newValue,
    changedBy: userId,
    reason,
  });
};

// ============================================
// METHODS: TO DROPDOWN OPTION
// ============================================
masterDataSchema.methods.toDropdownOption = function () {
  return {
    value: this.code,
    label: this.label,
    isDisabled: this.isDisabled,
    color: this.color,
    icon: this.icon,
    icdCode: this.icdCode,
    dsmCode: this.dsmCode,
  };
};

const MasterData = mongoose.model("MasterData", masterDataSchema);

export default MasterData;
