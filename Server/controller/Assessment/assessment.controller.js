import Assessment from "../../model/Assessment/assessmentSchema.js";
import Question from "../../model/Assessment/assessmentQuestions.js";
import { errorHandler } from "../../utils/error.js";
import mongoose from "mongoose";
import XLSX from "xlsx";
import fs from "fs";

// Create Assessment
export const createAssessment = async (req, res, next) => {
  try {
    const { title, description, category, version } = req.body;

    // VALIDATION
    if (!title || !description || !category) {
      return next(errorHandler(400, "All fields are required"));
    }

    if (!mongoose.Types.ObjectId.isValid(category)) {
      return next(errorHandler(400, "Invalid category ID"));
    }

    if (!req.user) {
      return next(errorHandler(401, "Unauthorized"));
    }

    // DUPLICATE CHECK
    const existing = await Assessment.findOne({
      title: { $regex: `^${title}$`, $options: "i" },
    });

    if (existing) {
      return next(errorHandler(400, "Assessment already exists"));
    }

    const payload = {
      title: title.trim(),
      description,
      category,
      version: version || 1,
      totalQuestions: 0,
      status: "draft",
      createdBy: req.user.id,
    };

    const data = await Assessment.create(payload);

    res.status(201).json(data);
  } catch (err) {
    next(errorHandler(500, err.message || "Internal Server Error"));
  }
};

// Get All
export const getAssessments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10, search = "" } = req.query;

    // FILTER
    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    // PAGINATION
    const skip = (page - 1) * limit;

    const list = await Assessment.find(query)
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Assessment.countDocuments(query);

    res.json({
      data: list,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(errorHandler(500, err.message || "Internal Server Error"));
  }
};

// Get One
export const getAssessmentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(errorHandler(400, "Invalid assessment ID"));
    }

    const data = await Assessment.findById(id).populate("category", "name");

    if (!data) {
      return next(errorHandler(404, "Assessment not found"));
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
};

// Update
export const updateAssessment = async (req, res) => {
  try {
    const data = await Assessment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete
export const deleteAssessment = async (req, res) => {
  try {
    await Assessment.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// QUESTIONS
const DEFAULT_MCQ_OPTIONS = [
  { key: "A", label: "Never", score: 0 },
  { key: "B", label: "Rarely", score: 1 },
  { key: "C", label: "Sometimes", score: 2 },
  { key: "D", label: "Often", score: 3 },
  { key: "E", label: "Always", score: 4 },
];

// Add Question
export const addQuestion = async (req, res) => {
  try {
    const { assessmentId, type } = req.body;

    const lastQuestion = await Question.findOne({ assessmentId }).sort({
      order: -1,
    });

    const nextOrder = lastQuestion ? lastQuestion.order + 1 : 1;

    let options = req.body.options;

    

    const payload = {
      ...req.body,
      options,
      order: nextOrder,
      questionKey: `Q${nextOrder}`,
    };

    const q = await Question.create(payload);

    await Assessment.findByIdAndUpdate(assessmentId, {
      $inc: { totalQuestions: 1 },
    });

    res.status(201).json(q);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get Questions by Assessment
export const getQuestionsByAssessment = async (req, res) => {
  try {
    const list = await Question.find({
      assessmentId: req.params.id,
    }).sort({ order: 1 });

    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE QUESTION
export const updateQuestion = async (req, res) => {
  try {
    let payload = { ...req.body };

   

    const data = await Question.findByIdAndUpdate(req.params.id, payload, {
      new: true,
    });

    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
// DELETE QUESTION
export const deleteQuestion = async (req, res) => {
  try {
    const q = await Question.findByIdAndDelete(req.params.id);

    await Assessment.findByIdAndUpdate(q.assessmentId, {
      $inc: { totalQuestions: -1 },
    });

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const publishAssessmentVersion = async (req, res, next) => {
  try {
    const currentAssessment = await Assessment.findById(req.params.id);

    if (!currentAssessment) {
      return next(errorHandler(404, "Assessment not found"));
    }

    const { assessment, questions } = req.body;

    const existingQuestions = await Question.find({
      assessmentId: currentAssessment._id,
    }).sort({ order: 1 });

    const assessmentChanged =
      currentAssessment.title !== assessment.title ||
      currentAssessment.description !== assessment.description ||
      String(currentAssessment.category) !== String(assessment.category) ||
      currentAssessment.scoringType !== assessment.scoringType ||
      currentAssessment.status !== assessment.status;

    const oldQuestions = existingQuestions.map((q) => ({
      questionText: q.questionText,

      type: q.type,

      options: q.options,

      isRequired: q.isRequired,

      order: q.order,
    }));

    const newQuestionsPayload = questions.map((q, index) => ({
      questionText: q.questionText,

      type: q.type,

      options: q.options,

      isRequired: q.isRequired,

      order: index + 1,
    }));

    const questionsChanged =
      JSON.stringify(oldQuestions) !== JSON.stringify(newQuestionsPayload);

    if (!assessmentChanged && !questionsChanged) {
      return res.status(200).json({
        message: "No changes detected",

        data: currentAssessment,
      });
    }

    if (
      currentAssessment.version === 1 &&
      currentAssessment.status === "draft" &&
      !currentAssessment.AssessmentId
    ) {
      currentAssessment.title = assessment.title;

      currentAssessment.description = assessment.description;

      currentAssessment.category = assessment.category;

      currentAssessment.scoringType = assessment.scoringType;

      currentAssessment.status = assessment.status;

      currentAssessment.totalQuestions = questions.length;

      currentAssessment.isLatestVersion = true;

      await currentAssessment.save();

      return res.status(200).json({
        message: "Assessment updated successfully",

        data: currentAssessment,
      });
    }

    // ARCHIVE OLD VERSION

    await Assessment.findByIdAndUpdate(currentAssessment._id, {
      status: "archived",
      isLatestVersion: false,
    });

    // CREATE NEW VERSION

    const newAssessment = await Assessment.create({
      title: assessment.title,

      description: assessment.description,

      category: assessment.category,

      scoringType: assessment.scoringType,

      totalQuestions: questions.length,

      version: currentAssessment.version + 1,

      status: assessment.status,

      isLatestVersion: true,

      createdBy: req.user.id,

      AssessmentId: currentAssessment.AssessmentId || currentAssessment._id,
    });

    // CREATE QUESTIONS

    const newQuestions = questions.map((q, index) => ({
      assessmentId: newAssessment._id,

      questionKey: q.questionKey || `Q${index + 1}`,

      questionText: q.questionText,

      type: q.type,

      order: index + 1,

      isRequired: q.isRequired,

      options: q.options,

      scale: q.scale,

      validation: q.validation,

      conditionalLogic: q.conditionalLogic,
    }));

    await Question.insertMany(newQuestions);

    res
      .status(201)
      .json({ message: "Version published successfully", data: newAssessment });
  } catch (err) {
    next(errorHandler(500, err.message));
  }
};

//bulk-import questions from excel
export const bulkImportQuestions = async (req, res) => {
  try {
    const { assessmentId } = req.body;

    // CHECK FILE
   if (!req.file) {
  return res.status(400).json({
    message: "Excel or CSV file required",
  });
}

const allowedTypes = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
];

if (!allowedTypes.includes(req.file.mimetype)) {
  return res.status(400).json({
    message: "Only Excel or CSV files allowed",
  });
}

    // READ EXCEL
    const workbook = XLSX.readFile(req.file.path);

    // FIRST SHEET
    const sheetName = workbook.SheetNames[0];

    const sheet = workbook.Sheets[sheetName];

    // CONVERT ROWS
    const rows = XLSX.utils.sheet_to_json(sheet);

    // FIND LAST QUESTION
    const lastQuestion = await Question.findOne({
      assessmentId,
    }).sort({ order: -1 });

    let nextOrder = lastQuestion ? lastQuestion.order + 1 : 1;

    // CREATE QUESTIONS
    const payload = rows.map((row, index) => {

  let options = [];

  for (let i = 1; i <= 10; i++) {

    if (row[`option${i}`]) {

      options.push({
        key: String.fromCharCode(64 + i),

        label: row[`option${i}`],

        score: Number(row[`score${i}`]) || 0,
      });
    }
  }

  // DEFAULT OPTIONS
  if (options.length === 0) {

    options = DEFAULT_MCQ_OPTIONS;
  }

  return {
    assessmentId,

    questionKey: `Q${nextOrder + index}`,

    order: nextOrder + index,

    type: row.type || "multi_choice",

    questionText: row.questionText,

    options,
  };
});

    // INSERT ALL
    await Question.insertMany(payload);

    // UPDATE COUNT
    await Assessment.findByIdAndUpdate(assessmentId, {
      $inc: {
        totalQuestions: payload.length,
      },
    });

    // DELETE FILE
    fs.unlinkSync(req.file.path);

    res.status(201).json({
      message: "Questions imported",

      total: payload.length,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
