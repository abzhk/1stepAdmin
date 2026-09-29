import LearningPath from "../model/LearningPath.model.js";

export const createLearningPath =
async (req,res,next) => {

 try {
 console.log(
   "CREATE API HIT"
  );

  console.log(
   req.body
  );
  const learningPath =
   await LearningPath.create({

    assessmentId:
     req.body.assessmentId,

    title:
     req.body.title,

    image:
     req.body.image,

    steps:
     req.body.steps
   });

  res.status(201)
  .json({

   success: true,

   data:
    learningPath
  });

 } catch (error) {

  console.error("CREATE ERROR:");
  console.error(error);

  next(error);
}
};

export const getLearningPath = async (req, res, next) => {
  try {

    console.log("Requested ID:", req.params.id);

    const data = await LearningPath.findOne({
      assessmentId: req.params.id,
    });

    console.log("Found:", data);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Learning path not found",
      });
    }

    res.json({
      success: true,
      data,
    });

  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const updateLearningPath = async (req, res, next) => {
  try {
    console.log("UPDATE BODY:", req.body);
    const learningPath = await LearningPath.findByIdAndUpdate(
      req.params.id,
      {
         assessmentId:req.body.assessmentId,
        title: req.body.title,
        image: req.body.image,
        steps: req.body.steps
      },
      {
        new: true
      }
    );
console.log("UPDATED DOCUMENT:", learningPath);

    res.status(200).json({
      success: true,
      data: learningPath
    });

  } catch (error) {
    next(error);
  }
};

export const getLearningPathById = async (req, res, next) => {

  try {

    const learningPath = await LearningPath.findById(req.params.id)
      .populate(
        "assessmentId",
        "title description category test version status"
      );

    if (!learningPath) {
      return res.status(404).json({
        success: false,
        message: "Learning Path not found"
      });
    }

    res.status(200).json({
      success: true,
      data: learningPath
    });

  } catch (error) {
    next(error);
  }

};

export const getAllLearningPaths = async (req, res, next) => {

  try {

    console.log("GET ALL API HIT");

     const { page = 1, limit = 10 } = req.query;


    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const skip = (pageNumber - 1) * limitNumber;

    const [learningPaths, total] = await Promise.all([ LearningPath
      .find()
      .populate("assessmentId", "title")
      .sort({ createdAt: -1 })
      .skip(skip)
        .limit(limitNumber),
         LearningPath.countDocuments(),
    ]);

    console.log("DATA:", learningPaths);

    res.status(200).json({
      success: true,
      data: learningPaths,
        pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });

  } catch (error) {

    console.log("GET ALL ERROR");
    console.log(error);

    next(error);

  }

};
export const deleteLearningPath = async (
  req,
  res,
  next
) => {

  try {

    await LearningPath.findByIdAndDelete(
      req.params.id
    );

    res.status(200).json({

      success: true,

      message:
        "Learning Path Deleted"

    });

  } catch (error) {

    next(error);

  }

};