import Assessment from "../../model/Assessment/assessmentSchema.js";
import Question from "../../model/Assessment/assessmentQuestions.js";
import { errorHandler } from "../../utils/error.js";
import mongoose from "mongoose";
import XLSX from "xlsx";
import fs from "fs";

// Create Assessment
export const createAssessment = async (req, res, next) => {
  try {
    const { title, description, category,  test, version,image  } = req.body;

    // VALIDATION
    if (!title || !description || !category || !test) {
      return next(errorHandler(400, "All fields are required"));
    }

    if (!mongoose.Types.ObjectId.isValid(category)) {
      return next(errorHandler(400, "Invalid category ID"));
    }
    if (!mongoose.Types.ObjectId.isValid(test)) {
  return next(errorHandler(400, "Invalid test ID"));
}

    if (!req.user) {
      return next(errorHandler(401, "Unauthorized"));
    }

   // DUPLICATE TEST CHECK
const existingTest = await Assessment.findOne({ test });

if (existingTest) {
  return next(
    errorHandler(400, "An assessment already exists for this test")
  );
}

    const payload = {
      title: title.trim(),
      description,
      category,
      test,
       image,
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
      .populate("test", "name code")
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

    const data = await Assessment.findById(id).populate("category", "name").populate("test", "name code");

    if (!data) {
      return next(errorHandler(404, "Assessment not found"));
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
};

// Update
export const updateAssessment = async (req, res, next) => {
  try {
    const { test } = req.body;

    // Check if another assessment already uses this test
    const existingTest = await Assessment.findOne({
      test,
      _id: { $ne: req.params.id }, // Exclude current assessment
    });

    if (existingTest) {
      return next(
        errorHandler(400, "An assessment already exists for this test")
      );
    }

    const data = await Assessment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(data);
  } catch (err) {
    next(errorHandler(500, err.message));
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

    const { assessment } = req.body;

    const assessmentChanged =
      currentAssessment.title !== assessment.title ||
      currentAssessment.description !== assessment.description ||
      currentAssessment.image !== assessment.image ||
      String(currentAssessment.category) !== String(assessment.category) ||
      currentAssessment.scoringType !== assessment.scoringType ||
      currentAssessment.status !== assessment.status;

    if (!assessmentChanged) {
      return res.status(200).json({
        message: "No changes detected",
        data: currentAssessment,
      });
    }

    const totalQuestions = await Question.countDocuments({
      assessmentId: currentAssessment._id,
    });

    // First publish of draft assessment
    if (
      currentAssessment.version === 1 &&
      currentAssessment.status === "draft" &&
      !currentAssessment.AssessmentId
    ) {
      currentAssessment.title = assessment.title;
      currentAssessment.description = assessment.description;
      currentAssessment.image = assessment.image;
      currentAssessment.category = assessment.category;
      currentAssessment.scoringType = assessment.scoringType;
      currentAssessment.status = assessment.status;
      currentAssessment.totalQuestions = totalQuestions;
      currentAssessment.isLatestVersion = true;

      await currentAssessment.save();

      return res.status(200).json({
        message: "Assessment updated successfully",
        data: currentAssessment,
      });
    }

    // Archive current version
    await Assessment.findByIdAndUpdate(currentAssessment._id, {
      status: "archived",
      isLatestVersion: false,
    });

    // Create new version
    const newAssessment = await Assessment.create({
      title: assessment.title,
      description: assessment.description,
      image: assessment.image,
      category: assessment.category,
      scoringType: assessment.scoringType,
      totalQuestions,
      version: currentAssessment.version + 1,
      status: assessment.status,
      isLatestVersion: true,
      createdBy: req.user.id,
      AssessmentId:
        currentAssessment.AssessmentId || currentAssessment._id,
    });

const oldQuestions = await Question.find({
  assessmentId: currentAssessment._id,
}).lean();

if (oldQuestions.length > 0) {
  const clonedQuestions = oldQuestions.map(
    ({ _id, createdAt, updatedAt, __v, ...question }) => ({
      ...question,
      assessmentId: newAssessment._id, 
    })
  );

  await Question.insertMany(clonedQuestions);
}

    return res.status(201).json({
      message: "Version published successfully",
      data: newAssessment,
    });
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
