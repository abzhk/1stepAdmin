/**
 * @file seedMasterData.js
 * @author Imran
 * @created 12/01/2025
 * @lastModified 10/11/2026 by Imran
 *
 * [ChangeLog]:
 * - 12/01/2025: Initial seed master data definition.
 * - 10/11/2026: Added ourResources seed options synchronized with 1stepdev by Imran.
 */
import MasterData from "../model/Master/masterData.model.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

// ============================================
// 1. CONDITIONS (Clinical Master Data)
// ============================================
const conditions = [
  {
    code: "asd",
    label: "Autism Spectrum Disorder",
    name: "Autism Spectrum Disorder",
    category: "neurodevelopmental",
    icdCode: "F84.0",
    dsmCode: "299.00",
    description:
      "A developmental disorder affecting communication and behavior",
    ageBands: ["3-5", "6-12", "13-17"],
    metadata: {
      prevalence: "1 in 54 children",
      onsetAge: "Early childhood",
      keySymptoms: [
        "social communication deficits",
        "restricted interests",
        "repetitive behaviors",
      ],
    },
    order: 1,
  },
  {
    code: "adhd",
    label: "ADHD",
    name: "Attention-Deficit/Hyperactivity Disorder",
    category: "neurodevelopmental",
    icdCode: "F90.0",
    dsmCode: "314.00",
    description:
      "A disorder marked by an ongoing pattern of inattention and/or hyperactivity-impulsivity",
    ageBands: ["6-12", "13-17", "18+"],
    metadata: {
      prevalence: "8-12% of children",
      onsetAge: "Before age 12",
      subtypes: [
        "predominantly inattentive",
        "predominantly hyperactive-impulsive",
        "combined",
      ],
    },
    order: 2,
  },
  {
    code: "dyslexia",
    label: "Dyslexia",
    name: "Specific Learning Disorder (Reading)",
    category: "learning_disorder",
    icdCode: "F81.0",
    dsmCode: "315.00",
    description:
      "A learning disorder that affects reading and related language-based processing skills",
    ageBands: ["6-12", "13-17"],
    metadata: {
      prevalence: "5-10% of population",
      onsetAge: "School age",
    },
    order: 3,
  },
  {
    code: "anxiety",
    label: "Anxiety Disorder",
    name: "Generalized Anxiety Disorder",
    category: "emotional",
    icdCode: "F41.1",
    dsmCode: "300.02",
    description:
      "Excessive anxiety and worry about various activities or events",
    ageBands: ["6-12", "13-17", "18+"],
    order: 4,
  },
  {
    code: "depression",
    label: "Depression",
    name: "Major Depressive Disorder",
    category: "emotional",
    icdCode: "F32.9",
    dsmCode: "296.20",
    description: "Persistent feelings of sadness and loss of interest",
    ageBands: ["13-17", "18+"],
    order: 5,
  },
];

// ============================================
// 2. SYMPTOM DOMAINS
// ============================================
const symptomDomains = [
  {
    code: "social_communication",
    label: "Social Communication",
    description: "Difficulties in social interaction and communication",
    category: "neurodevelopmental",
    order: 1,
  },
  {
    code: "emotional_reciprocity",
    label: "Emotional Reciprocity",
    description: "Challenges in sharing emotions and responding to others",
    category: "neurodevelopmental",
    order: 2,
  },
  {
    code: "sensory_sensitivity",
    label: "Sensory Sensitivity",
    description: "Unusual responses to sensory input",
    category: "neurodevelopmental",
    order: 3,
  },
  {
    code: "routines_repetition",
    label: "Routines & Repetition",
    description: "Need for sameness and repetitive behaviors",
    category: "neurodevelopmental",
    order: 4,
  },
  {
    code: "inattention",
    label: "Inattention",
    description: "Difficulty sustaining attention and focus",
    category: "neurodevelopmental",
    order: 5,
  },
  {
    code: "hyperactivity",
    label: "Hyperactivity",
    description: "Excessive movement and difficulty staying still",
    category: "neurodevelopmental",
    order: 6,
  },
  {
    code: "impulsivity",
    label: "Impulsivity",
    description: "Acting without thinking, difficulty with self-control",
    category: "neurodevelopmental",
    order: 7,
  },
  {
    code: "reading_fluency",
    label: "Reading Fluency",
    description: "Difficulties with reading speed and accuracy",
    category: "learning",
    order: 8,
  },
  {
    code: "phonological_processing",
    label: "Phonological Processing",
    description: "Challenges with sound manipulation in language",
    category: "learning",
    order: 9,
  },
  {
    code: "emotional_regulation",
    label: "Emotional Regulation",
    description: "Difficulty managing emotional responses",
    category: "emotional",
    order: 10,
  },
];

// ============================================
// 3. AGE BANDS
// ============================================
const ageBands = [
  { code: "0-2", label: "Infant (0-2 years)", minAge: 0, maxAge: 2, order: 1 },
  {
    code: "3-5",
    label: "Preschool (3-5 years)",
    minAge: 3,
    maxAge: 5,
    order: 2,
  },
  {
    code: "6-9",
    label: "Early Childhood (6-9 years)",
    minAge: 6,
    maxAge: 9,
    order: 3,
  },
  {
    code: "10-13",
    label: "Pre-teen (10-13 years)",
    minAge: 10,
    maxAge: 13,
    order: 4,
  },
  {
    code: "14-17",
    label: "Adolescent (14-17 years)",
    minAge: 14,
    maxAge: 17,
    order: 5,
  },
  {
    code: "18+",
    label: "Adult (18+ years)",
    minAge: 18,
    maxAge: 100,
    order: 6,
  },
];

// ============================================
// 4. THERAPIST SPECIALIZATIONS
// ============================================
const therapistSpecializations = [
  {
    code: "child_psychologist",
    label: "Child Psychologist",
    description: "Specializes in mental health for children and adolescents",
    order: 1,
  },
  {
    code: "speech_therapist",
    label: "Speech Therapist",
    description: "Specializes in communication disorders",
    order: 2,
  },
  {
    code: "occupational_therapist",
    label: "Occupational Therapist",
    description: "Helps with daily living skills and sensory integration",
    order: 3,
  },
  {
    code: "behavior_analyst",
    label: "Behavior Analyst (BCBA)",
    description: "Specializes in ABA therapy",
    order: 4,
  },
  {
    code: "educational_therapist",
    label: "Educational Therapist",
    description: "Addresses learning disabilities",
    order: 5,
  },
];

// ============================================
// 5. SERVICE TYPES
// ============================================
const serviceTypes = [
  {
    code: "popular_search",
    label: "Popular Search",
    isDisabled: true,
    order: 0,
  },
  {
    code: "diagnostic_evaluation",
    label: "Diagnostic Evaluation",
    metadata: { durationDefault: 90, billable: true },
    order: 1,
  },
  {
    code: "occupational_therapy",
    label: "Occupational Therapy",
    metadata: { durationDefault: 60, billable: true },
    order: 2,
  },
  {
    code: "speech_therapy",
    label: "Speech Therapy",
    metadata: { durationDefault: 45, billable: true },
    order: 3,
  },
  {
    code: "aba_therapy",
    label: "ABA Therapy",
    metadata: { durationDefault: 60, billable: true },
    order: 4,
  },
  { code: "counselling", label: "Counselling", order: 5 },
  { code: "social_skills_group", label: "Social Skills Group", order: 6 },
];

// ============================================
// 6. SERVICE MODES
// ============================================
const serviceModes = [
  { code: "in_clinic", label: "In-Clinic", order: 1 },
  { code: "in_home", label: "In-Home", order: 2 },
  { code: "virtual", label: "Virtual", order: 3 },
];

// ============================================
// 7. APPOINTMENT STATUSES
// ============================================
const appointmentStatuses = [
  { code: "scheduled", label: "Scheduled", color: "#3b82f6", order: 1 },
  { code: "completed", label: "Completed", color: "#10b981", order: 2 },
  { code: "no_show", label: "No Show", color: "#f59e0b", order: 3 },
  {
    code: "cancelled_by_parent",
    label: "Cancelled by Parent",
    color: "#6b7280",
    order: 4,
  },
  {
    code: "cancelled_by_provider",
    label: "Cancelled by Provider",
    color: "#6b7280",
    order: 5,
  },
];

// ============================================
// 8. ACTIVITY TYPES
// ============================================
const activityTypes = [
  { code: "game", label: "Game", icon: "🎮", order: 1 },
  { code: "worksheet", label: "Worksheet", icon: "📝", order: 2 },
  { code: "parent_homework", label: "Parent Homework", icon: "🏠", order: 3 },
  { code: "exercise", label: "Exercise", icon: "💪", order: 4 },
  { code: "reading", label: "Reading", icon: "📚", order: 5 },
  { code: "video", label: "Video", icon: "🎥", order: 6 },
];

// ============================================
// 9. CONTENT CATEGORIES
// ============================================
const contentCategories = [
  { code: "parent_education", label: "Parent Education", order: 1 },
  { code: "teacher_resources", label: "Teacher Resources", order: 2 },
  { code: "child_story", label: "Child Story", order: 3 },
  { code: "therapeutic_tips", label: "Therapeutic Tips", order: 4 },
];

// ============================================
// 9b. LEARNING PROGRAM CATEGORIES
// ============================================
const learningProgramCategories = [
  { code: "adhd", label: "ADHD", category: "neurodevelopmental", order: 1 },
  { code: "autism", label: "Autism", category: "neurodevelopmental", order: 2 },
  { code: "speech_language", label: "Speech & Language", category: "therapy", order: 3 },
  { code: "sensory_processing", label: "Sensory Processing", category: "therapy", order: 4 },
  { code: "parent_training", label: "Parent Training", category: "education", order: 5 },
  { code: "occupational_therapy", label: "Occupational Therapy", category: "therapy", order: 6 },
  { code: "behavioral_therapy", label: "Behavioral Therapy", category: "therapy", order: 7 },
  { code: "child_psychology", label: "Child Psychology", category: "mental_health", order: 8 },
  { code: "early_intervention", label: "Early Intervention", category: "developmental", order: 9 },
  { code: "physical_therapy", label: "Physical Therapy", category: "therapy", order: 10 },
];

// ============================================
// OUR SERVICES
// ============================================
const ourServices = [
  { code: "diagnostic_evaluation", label: "Diagnostic Evaluation", category: "Assessments", order: 1 },
  { code: "occupational_therapy", label: "Occupational Therapy", category: "Therapy Services", order: 2 },
  { code: "speech_therapy", label: "Speech Therapy", category: "Therapy Services", order: 3 },
  { code: "music_therapy", label: "Music Therapy", category: "Therapy Services", order: 4 },
  { code: "school_based_service", label: "School-Based Service", category: "Specialized Programs", order: 5 },
  { code: "art_as_therapy", label: "Art As Therapy", category: "Specialized Programs", order: 6 },
];

// ============================================
// ARTICLE TAGS
// ============================================
// ============================================
// OUR RESOURCES (Website Navbar Master Data)
// ============================================
// [Imran - 10/11/2026]: Synchronized ourResources default seeds (Articles, Provider Assessments, Learning Programs)
const ourResources = [
  // 1. Articles & Categories
  {
    code: "articles_all",
    label: "All Articles",
    category: "Articles",
    description: "Explore all developmental guides & clinical reads",
    order: 1,
    metadata: {
      path: "/resources/articles",
      categoryOrder: 1,
      isExternal: false,
      allowedRoles: ["guest", "parent", "provider", "centre"],
    },
  },
  {
    code: "articles_speech",
    label: "Speech Therapy",
    category: "Articles",
    description: "Articulation, fluency & communication insights",
    order: 2,
    metadata: {
      path: "/resources/articles?category=Speech+Therapy",
      categoryOrder: 1,
      isExternal: false,
      allowedRoles: ["guest", "parent", "provider", "centre"],
    },
  },
  {
    code: "articles_mental_health",
    label: "Mental Health",
    category: "Articles",
    description: "Child & adolescent emotional well-being",
    order: 3,
    metadata: {
      path: "/resources/articles?category=Mental+Health",
      categoryOrder: 1,
      isExternal: false,
      allowedRoles: ["guest", "parent", "provider", "centre"],
    },
  },
  {
    code: "articles_techniques",
    label: "Therapy Techniques",
    category: "Articles",
    description: "Evidence-based clinical intervention methods",
    order: 4,
    metadata: {
      path: "/resources/articles?category=Therapy+Techniques",
      categoryOrder: 1,
      isExternal: false,
      allowedRoles: ["guest", "parent", "provider", "centre"],
    },
  },
  {
    code: "articles_wellness",
    label: "Wellness & Self Care",
    category: "Articles",
    description: "Parenting mindfulness & burnout reduction",
    order: 5,
    metadata: {
      path: "/resources/articles?category=Wellness",
      categoryOrder: 1,
      isExternal: false,
      allowedRoles: ["guest", "parent", "provider", "centre"],
    },
  },
  {
    code: "articles_stress",
    label: "Stress Management",
    category: "Articles",
    description: "Anxiety coping strategies & regulation tools",
    order: 6,
    metadata: {
      path: "/resources/articles?category=Stress+Management",
      categoryOrder: 1,
      isExternal: false,
      allowedRoles: ["guest", "parent", "provider", "centre"],
    },
  },

  // 2. Assessments Created by Providers & Categories (skipping /resources/assessmentselectpage)
  {
    code: "assess_all",
    label: "All Assessments",
    category: "Clinical Assessments",
    description: "Standardized clinician-authored screening tools",
    order: 10,
    metadata: {
      path: "/resources/assessements",
      categoryOrder: 2,
      isExternal: false,
      allowedRoles: ["guest", "parent"],
    },
  },
  {
    code: "assess_adhd",
    label: "ADHD Screening",
    category: "Clinical Assessments",
    description: "Attention & hyperactivity symptom evaluation",
    order: 11,
    metadata: {
      path: "/resources/assessements?category=ADHD",
      categoryOrder: 2,
      isExternal: false,
      allowedRoles: ["guest", "parent"],
    },
  },
  {
    code: "assess_anxiety",
    label: "Anxiety Screener (GAD-7)",
    category: "Clinical Assessments",
    description: "Evidence-based anxiety severity screener",
    order: 12,
    metadata: {
      path: "/resources/assessements?category=Anxiety",
      categoryOrder: 2,
      isExternal: false,
      allowedRoles: ["guest", "parent"],
    },
  },
  {
    code: "assess_autism",
    label: "Autism Screener (AQ-10)",
    category: "Clinical Assessments",
    description: "Brief autism spectrum quotient tool",
    order: 13,
    metadata: {
      path: "/resources/assessements?category=Autism+(ASD)",
      categoryOrder: 2,
      isExternal: false,
      allowedRoles: ["guest", "parent"],
    },
  },
  {
    code: "assess_depression",
    label: "Depression Screener (PHQ-9)",
    category: "Clinical Assessments",
    description: "Standardized clinical mood questionnaire",
    order: 14,
    metadata: {
      path: "/resources/assessements?category=Depression",
      categoryOrder: 2,
      isExternal: false,
      allowedRoles: ["guest", "parent"],
    },
  },
  {
    code: "assess_occupational",
    label: "Occupational Therapy",
    category: "Clinical Assessments",
    description: "Sensory, fine-motor & daily functioning",
    order: 15,
    metadata: {
      path: "/resources/assessements?category=Occupational+Therapy",
      categoryOrder: 2,
      isExternal: false,
      allowedRoles: ["guest", "parent"],
    },
  },
  {
    code: "assess_speech",
    label: "Speech Therapy",
    category: "Clinical Assessments",
    description: "Verbal expression & articulation screeners",
    order: 16,
    metadata: {
      path: "/resources/assessements?category=Speech+Therapy",
      categoryOrder: 2,
      isExternal: false,
      allowedRoles: ["guest", "parent"],
    },
  },

  // 3. Learning Programs & Categories
  {
    code: "lp_all",
    label: "All Programs",
    category: "Learning Programs",
    description: "Complete catalog of guided therapy courses",
    order: 20,
    metadata: {
      path: "/resources/learning-programs",
      categoryOrder: 3,
      isExternal: false,
      allowedRoles: ["guest", "parent"],
    },
  },
  {
    code: "lp_sensory",
    label: "Sensory Processing",
    category: "Learning Programs",
    description: "Calming strategies & sensory diet routines",
    order: 21,
    metadata: {
      path: "/resources/learning-programs?category=Sensory+Processing",
      categoryOrder: 3,
      isExternal: false,
      allowedRoles: ["guest", "parent"],
    },
  },
  {
    code: "lp_speech",
    label: "Speech & Language",
    category: "Learning Programs",
    description: "Early verbal communication & vocabulary",
    order: 22,
    metadata: {
      path: "/resources/learning-programs?category=Speech+%26+Language",
      categoryOrder: 3,
      isExternal: false,
      allowedRoles: ["guest", "parent"],
    },
  },
  {
    code: "lp_adhd",
    label: "ADHD Support",
    category: "Learning Programs",
    description: "Executive functioning & focus routines",
    order: 23,
    metadata: {
      path: "/resources/learning-programs?category=ADHD",
      categoryOrder: 3,
      isExternal: false,
      allowedRoles: ["guest", "parent"],
    },
  },
  {
    code: "lp_autism",
    label: "Autism Guidance",
    category: "Learning Programs",
    description: "Social communication & behavioral support",
    order: 24,
    metadata: {
      path: "/resources/learning-programs?category=Autism",
      categoryOrder: 3,
      isExternal: false,
      allowedRoles: ["guest", "parent"],
    },
  },
  {
    code: "lp_parent_training",
    label: "Parent Training",
    category: "Learning Programs",
    description: "Hands-on caregiver intervention techniques",
    order: 25,
    metadata: {
      path: "/resources/learning-programs?category=Parent+Training",
      categoryOrder: 3,
      isExternal: false,
      allowedRoles: ["guest", "parent"],
    },
  },
  {
    code: "lp_ot",
    label: "Occupational Therapy",
    category: "Learning Programs",
    description: "Motor skills & daily living independence",
    order: 26,
    metadata: {
      path: "/resources/learning-programs?category=Occupational+Therapy",
      categoryOrder: 3,
      isExternal: false,
      allowedRoles: ["guest", "parent"],
    },
  },
];

const articleTags = [
  { code: "trauma", label: "Trauma", order: 1 },
  { code: "cbt", label: "CBT", order: 2 },
  { code: "telehealth", label: "Telehealth", order: 3 },
  { code: "ethics", label: "Ethics", order: 4 },
  { code: "burnout", label: "Burnout", order: 5 },
  { code: "marketing", label: "Marketing", order: 6 },
  { code: "kids", label: "Kids", order: 7 },
  { code: "tech", label: "Tech", order: 8 },
  { code: "anxiety", label: "Anxiety", order: 9 },
  { code: "autism", label: "Autism", order: 10 },
  { code: "speech_therapy", label: "Speech Therapy", order: 11 },
  { code: "occupational_therapy", label: "Occupational Therapy", order: 12 },
  { code: "mental_health", label: "Mental Health", order: 13 },
  { code: "parenting", label: "Parenting", order: 14 },
  { code: "early_intervention", label: "Early Intervention", order: 15 },
];

// Keep existing assessment-related data...
const questionTypes = [
  {
    code: "frequency",
    label: "Frequency Scale",
    metadata: {
      defaultOptions: [
        { text: "Never", value: 0, weight: 1 },
        { text: "Sometimes", value: 1, weight: 1 },
        { text: "Often", value: 2, weight: 1 },
        { text: "Almost Always", value: 3, weight: 1 },
      ],
    },
    order: 1,
  },
  {
    code: "likert",
    label: "Likert Scale",
    metadata: {
      defaultOptions: [
        { text: "Strongly Disagree", value: 0, weight: 1 },
        { text: "Disagree", value: 1, weight: 1 },
        { text: "Neutral", value: 2, weight: 1 },
        { text: "Agree", value: 3, weight: 1 },
        { text: "Strongly Agree", value: 4, weight: 1 },
      ],
    },
    order: 2,
  },
  { code: "yes_no", label: "Yes/No", order: 3 },
  { code: "rating", label: "Rating Scale", order: 4 },
  { code: "text", label: "Text Input", order: 5 },
];

const severityLevels = [
  { code: "minimal", label: "Minimal", color: "#10b981", order: 1 },
  { code: "mild", label: "Mild", color: "#3b82f6", order: 2 },
  { code: "moderate", label: "Moderate", color: "#f59e0b", order: 3 },
  {
    code: "moderately_severe",
    label: "Moderately Severe",
    color: "#f97316",
    order: 4,
  },
  { code: "severe", label: "Severe", color: "#ef4444", order: 5 },
  { code: "high", label: "High", color: "#dc2626", order: 6 },
];

const diagnosticSystems = [
  { code: "dsm_5", label: "DSM-5", order: 1 },
  { code: "dsm_5_tr", label: "DSM-5-TR", order: 2 },
  { code: "icd_10", label: "ICD-10", order: 3 },
  { code: "icd_11", label: "ICD-11", order: 4 },
];

// ============================================
// PLAN BILLING CONFIG (Admin-managed intervals)
// ============================================
const planBillingConfigs = [
  {
    code: "monthly",
    label: "Monthly",
    order: 1,
    metadata: {
      discount_percent: 0,
      badge_text: null,
      is_enabled: true,
    },
  },
  {
    code: "quarterly",
    label: "Quarterly",
    order: 2,
    metadata: {
      discount_percent: 10,
      badge_text: "Save 10%",
      is_enabled: true,
    },
  },
  {
    code: "annually",
    label: "Yearly",
    order: 3,
    metadata: {
      discount_percent: 20,
      badge_text: "Save 20%",
      is_enabled: true,
    },
  },
];

// ============================================
// MAIN SEED FUNCTION
// ============================================
async function seedMasterData() {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("🌱 Starting master data seeding...");

    // Clinical data
    await MasterData.bulkInsertOptions("condition", conditions);
    console.log("✅ Conditions seeded");

    await MasterData.bulkInsertOptions("symptomDomain", symptomDomains);
    console.log("✅ Symptom domains seeded");

    await MasterData.bulkInsertOptions("ageBand", ageBands);
    console.log("✅ Age bands seeded");

    // Provider data
    await MasterData.bulkInsertOptions(
      "therapistSpecialization",
      therapistSpecializations
    );
    console.log("✅ Therapist specializations seeded");

    await MasterData.bulkInsertOptions("serviceType", serviceTypes);
    console.log("✅ Service types seeded");

    await MasterData.bulkInsertOptions("serviceMode", serviceModes);
    console.log("✅ Service modes seeded");

    // Operational data
    await MasterData.bulkInsertOptions(
      "appointmentStatus",
      appointmentStatuses
    );
    console.log("✅ Appointment statuses seeded");

    await MasterData.bulkInsertOptions("activityType", activityTypes);
    console.log("✅ Activity types seeded");

    await MasterData.bulkInsertOptions("contentCategory", contentCategories);
    console.log("✅ Content categories seeded");

    await MasterData.bulkInsertOptions("learningProgramCategory", learningProgramCategories);
    console.log("✅ Learning program categories seeded");

    await MasterData.bulkInsertOptions("ourServices", ourServices);
    console.log("✅ Our services seeded");

    // [Imran - 10/11/2026]: Seed ourResources
    await MasterData.bulkInsertOptions("ourResources", ourResources);
    console.log("✅ Our resources seeded");

    await MasterData.bulkInsertOptions("articleTag", articleTags);
    console.log("✅ Article tags seeded");

    // Assessment data
    await MasterData.bulkInsertOptions("questionType", questionTypes);
    console.log("✅ Question types seeded");

    await MasterData.bulkInsertOptions("severityLevel", severityLevels);
    console.log("✅ Severity levels seeded");

    await MasterData.bulkInsertOptions("diagnosticSystem", diagnosticSystems);
    console.log("✅ Diagnostic systems seeded");

    // Subscription billing config
    await MasterData.bulkInsertOptions("planBillingConfig", planBillingConfigs);
    console.log("✅ Plan billing configs seeded");

    console.log("🎉 Master data seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding master data:", error);
    throw error;
  }
}

export default seedMasterData;
