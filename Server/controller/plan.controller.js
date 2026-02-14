import Plan from "../model/plan.model.js";

export const createPlan = async (req, res) => {
  try {
    const {
      plan_key,
      user_type,
      plan_name,
      slug,
      description,
      is_featured = false,
      price,
      discount = 0,
      currency,
      billing_interval,
      trial_period_days = 0,
      stripe_price_id,

      available_modules = [],
      max_messages_per_month = 0,
      max_assessments_per_month = 0,
      max_providers_allowed = 1,
      video_sessions_count = 0,
      max_parents_allowed = 1,
      video_sessions_upload_per_month = 0,
      session_duration_mins = 60,
      chat_access_level = "none",
      resource_library_access = false,
      therapist_matching_type = "auto",
      priority_support = false,
    } = req.body;

    if (
      !plan_key ||
     !user_type ||
      !plan_name ||
      !slug ||
      !description ||
      price === undefined ||
      !billing_interval ||
      !stripe_price_id
    ) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    const final_price =
      discount > 0
        ? Math.round(price - (price * discount) / 100)
        : price;

    const latestPlan = await Plan.findOne({ plan_key,user_type })
      .sort({ version_number: -1 });

    const nextVersion = latestPlan
      ? latestPlan.version_number + 1
      : 1;

    if (latestPlan) {
      await Plan.updateOne(
        { _id: latestPlan._id },
        { is_active: false }
      );
    }

    const plan = await Plan.create({
      plan_key,
      user_type,
      plan_name,
      slug: `${slug}-v${nextVersion}`, 
      description,
      is_featured,
      price,
      discount,
      final_price,
      currency,
      billing_interval,
      trial_period_days,
      stripe_price_id,

      available_modules,
      max_messages_per_month,
      max_assessments_per_month,
      max_providers_allowed,
      video_sessions_count,
      max_parents_allowed,
      video_sessions_upload_per_month ,
      session_duration_mins,
      chat_access_level,
      resource_library_access,
      therapist_matching_type,
      priority_support,

      version_number: nextVersion,
      is_active: true,
    });

    res.status(201).json({
      message: "Plan version created successfully",
      plan,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Duplicate plan or slug conflict",
      });
    }

    res.status(500).json({
      message: "Failed to create plan",
      error: error.message,
    });
  }
};


export const getPlans = async (req, res) => {
    try{
      const {search,limit=10,user_type}= req.query

      const query = {};

if (search) {
  query.plan_name = { $regex: search, $options: "i" };
}

if (user_type) {
  query.user_type = user_type;
}
        const plans =await Plan.find(query).sort({createdAt:-1}).limit(Number(limit));
         res.status(200).json({
      success: true,
      count: plans.length,
      plans,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch plans",
      error: error.message,
    });
  }
    }

    export const getPlanById = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    res.status(200).json({ success: true, plan });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch plan",
      error: error.message,
    });
  }
};


export const updatePlan = async (req, res) => {
  try {
    const updatedPlan = await Plan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedPlan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    res.status(200).json({
      success: true,
      message: "Plan updated successfully",
      plan: updatedPlan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update plan",
      error: error.message,
    });
  }
};


export const deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Plan deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete plan",
      error: error.message,
    });
  }
};
