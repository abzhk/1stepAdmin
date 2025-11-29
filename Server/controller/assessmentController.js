import assessmentCategory from "../model/Assessment/assessmentCategory.js";
import providerAssessment from "../model/Assessment/providerAssessment.js";
// import assessmentResponse from "../../models/Assessment/assessmentReponse.js";

//Assessment Category Controllers
export const createCategory = async (req, res) => {
  try {
    const { name, description, icon, order } = req.body;

    const existingCategory = await assessmentCategory.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = new assessmentCategory({
      name,
      description,
      icon,
      order,
    });

    await category.save();
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await assessmentCategory
      .find({ status: true })
      .sort({ order: 1 });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, status, order } = req.body;

    const category = await assessmentCategory.findByIdAndUpdate(
      id,
      { name, description, icon, status, order },
      { new: true }
    );

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await assessmentCategory.findByIdAndUpdate(id, { status: false });
    res.status(200).json({ success: true, message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Provider Assessment Controllers

export const createProviderAssessment = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      questions,
      duration,
      instructions,
      providerId,
    } = req.body;

    console.log(req.body);
    const newAssessment = new providerAssessment({
      title,
      description,
      category,
      provider: providerId,
      questions,
      duration,
      instructions,
      status: "draft",
    });

    await newAssessment.save();
    await newAssessment.populate("category");

    res.status(201).json({ success: true, data: newAssessment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProviderAssessments = async (req, res) => {
  try {
    const { providerId } = req.params;

    const assessments = await providerAssessment
      .find({ provider: providerId })
      .populate("category")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: assessments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all published assessments for public view
export const getPublicAssessments = async (req, res) => {
  try {
    const { category, search, featured } = req.query;

    let query = { status: "published", isPublished: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    let assessments = await providerAssessment
      .find(query)
      .populate("category")
      .populate("provider", "fullName profilePicture")
      .sort({ createdAt: -1 })
      .limit(100);

    // Get featured assessments (most responded to)
    if (featured === "true") {
      assessments = assessments
        .sort((a, b) => b.responses.length - a.responses.length)
        .slice(0, 3);
    }

    res.status(200).json({ success: true, data: assessments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get categories for filter
export const getPublicCategories = async (req, res) => {
  try {
    const categories = await assessmentCategory
      .find({ status: true })
      .sort({ order: 1 });

    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get assessment by ID for taking
export const getAssessmentForTaking = async (req, res) => {
  try {
    const { slug } = req.params;
    const assessment = await providerAssessment
      .findOne({ slug, status: "published" })
      .populate("category")
      .populate("provider", "fullName profilePicture email phone");

    if (!assessment) {
      return res
        .status(404)
        .json({ message: "Assessment not found or not published" });
    }

    res.status(200).json({ success: true, data: assessment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProviderAssessmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await providerAssessment
      .findById(id)
      .populate("category")
      .populate("responses");

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProviderAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, questions, duration, instructions } =
      req.body;

    const updated = await providerAssessment
      .findByIdAndUpdate(
        id,
        { title, description, category, questions, duration, instructions },
        { new: true }
      )
      .populate("category");

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const publishProviderAssessment = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await providerAssessment
      .findByIdAndUpdate(
        id,
        { status: "published", isPublished: true, publishedAt: new Date() },
        { new: true }
      )
      .populate("category");

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProviderAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    await providerAssessment.findByIdAndUpdate(id, { status: "archived" });
    res.status(200).json({ success: true, message: "Assessment archived" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const submitProviderAssessmentResponse = async (req, res) => {
  try {
    const { assessmentId, respondentId, answers, providerId } = req.body;

    const assessmentData = await providerAssessment.findById(assessmentId);

    let totalScore = 0;
    const processedAnswers = answers.map((ans) => {
      const question = assessmentData.questions.find(
        (q) => q._id.toString() === ans.questionId
      );
      let score = 0;

      if (question.questionType === "rating") {
        score = (ans.answer / question.scale) * 100;
      } else if (question.questionType === "yesNo") {
        score = ans.answer === "yes" ? 100 : 0;
      } else if (question.questionType === "multipleChoice") {
        score = ans.isCorrect ? 100 : 0;
      }

      totalScore += score;
      return { questionId: ans.questionId, answer: ans.answer, score };
    });

    const response = new assessmentResponse({
      assessment: assessmentId,
      respondent: respondentId,
      provider: providerId,
      answers: processedAnswers,
      totalScore: Math.round(totalScore / answers.length),
      percentage: Math.round(totalScore / answers.length),
      status: "submitted",
      completedAt: new Date(),
    });

    await response.save();
    await providerAssessment.findByIdAndUpdate(assessmentId, {
      $push: { responses: response._id },
    });

    res.status(201).json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProviderAssessmentResponses = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    const responses = await assessmentResponse
      .find({ assessment: assessmentId })
      .populate("respondent")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: responses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProviderAssessmentAnalytics = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    const responses = await assessmentResponse.find({
      assessment: assessmentId,
    });

    const totalResponses = responses.length;
    const avgScore =
      responses.length > 0
        ? Math.round(
            responses.reduce((sum, r) => sum + r.totalScore, 0) /
              responses.length
          )
        : 0;

    const scoreDistribution = {
      excellent: responses.filter((r) => r.percentage >= 80).length,
      good: responses.filter((r) => r.percentage >= 60 && r.percentage < 80)
        .length,
      average: responses.filter((r) => r.percentage >= 40 && r.percentage < 60)
        .length,
      poor: responses.filter((r) => r.percentage < 40).length,
    };

    res.status(200).json({
      success: true,
      data: { totalResponses, avgScore, scoreDistribution, responses },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get all assessment categories

export const getAllCategories = async (req, res) => {
  try {
    const categories = await assessmentCategory
      .find()             
      .sort({ order: 1 });   

    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//active and inactive status for assessment category for admin
export const toggleCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await assessmentCategory.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    let newStatus;
    
    if (category.status === true) {
      newStatus = false;
    } else {
      newStatus = true;
    }

    await assessmentCategory.findByIdAndUpdate(id, { status: newStatus });

    res.status(200).json({
      success: true,
      message: newStatus ? "Category Activated" : "Category Deactivated",
      status: newStatus,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//admin get all assessment
export const adminGetAllAssessments = async (req, res) => {
    try{
       const assessment = await providerAssessment.find({})
       .populate("category")
       .populate("provider", "fullName")
       .sort({ createdAt: -1 });
       res.status(200).json({ success: true, data: assessment });
    }catch{
    console.error("Admin get all assessments error:", error);
    res.status(500).json({ message: error.message });
    }
}