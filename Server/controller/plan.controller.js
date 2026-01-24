import Plan from "../model/plan.model.js";

export const createPlan = async (req, res) => {
  try {
    const {
      plan_key,
      plan_name,
      slug,
      description,
      is_featured,
      price,
      discount = 0,
      currency,
      billing_interval,
      trial_period_days,
      stripe_price_id,
      video_sessions_count,
      session_duration_mins,
      chat_access_level,
      resource_library_access,
      therapist_matching_type,
    } = req.body;

    if (
      !plan_key ||
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

    const latestPlan = await Plan.findOne({ plan_key })
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
      plan_name,
      slug,
      description,
      is_featured,
      price,
      discount,
      final_price,
      currency,
      billing_interval,
      trial_period_days,
      stripe_price_id,
      video_sessions_count,
      session_duration_mins,
      chat_access_level,
      resource_library_access,
      therapist_matching_type,
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
        message: "Version conflict. Please retry.",
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
        const plans =await Plan.find().sort({createdAt:-1});
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
