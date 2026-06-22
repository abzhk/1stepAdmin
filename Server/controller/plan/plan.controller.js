import Plan from "../../model/plan.model.js";

import { errorHandler } from "../../utils/error.js";
import MasterData from "../../model/Master/masterData.model.js";

export const createPlan = async (req, res,next) => {
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
      !billing_interval 
      // !stripe_price_id
    ) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }


    const billingOption = await MasterData.findOne({
  type: "planBillingConfig",
  code: billing_interval,
  isActive: true,
});

if (!billingOption) {
  return res.status(400).json({
    message: "Invalid billing interval",
  });
}

if (!Array.isArray(available_modules)) {
  return res.status(400).json({
    message: "available_modules must be an array",
  });
}

const validModules = [
  "dashboard",
  "profile",
  "patients",
  "messages",
  "assessment",
  "appointments",
  "video_sessions",
  "reports",
  "billing",
  "resource_library",
  "settings",
  "article",
  "courses",
  "plans"
];

const invalidModules = available_modules.filter(
  (module) => !validModules.includes(module)
);

if (invalidModules.length > 0) {
  return res.status(400).json({
    message: "Invalid modules selected",
  });
}

    const normalizedPrice = Number(price);
    const normalizedDiscount = Number(discount);
    const normalizedTrial = Number(trial_period_days);

    if (isNaN(normalizedPrice)) {
      return res.status(400).json({ message: "Price must be a number" });
    }

    if (normalizedPrice < 0) {
      return res.status(400).json({ message: "Price cannot be negative" });
    }

    if (plan_key !== "free" && normalizedPrice === 0) {
      return res.status(400).json({
        message: "Paid plans must have price greater than 0",
      });
    }


    const final_price =
      normalizedDiscount > 0
        ? Math.round(
            normalizedPrice - (normalizedPrice * normalizedDiscount) / 100
          )
        : normalizedPrice;


    const latestPlan = await Plan.findOne({
      plan_key,
      user_type,
    }).sort({ version_number: -1 });


    if (latestPlan) {
      const incomingNormalized = {
        plan_key,
        user_type,
        plan_name,
        description,
        is_featured,
        price: normalizedPrice,
        discount: normalizedDiscount,
        final_price,
        currency,
        billing_interval,
        trial_period_days: normalizedTrial,
        stripe_price_id,
        available_modules: [...available_modules].sort(),
        max_messages_per_month: Number(max_messages_per_month),
        max_assessments_per_month: Number(max_assessments_per_month),
        max_providers_allowed: Number(max_providers_allowed),
        video_sessions_count: Number(video_sessions_count),
        max_parents_allowed: Number(max_parents_allowed),
        video_sessions_upload_per_month: Number(
          video_sessions_upload_per_month
        ),
        session_duration_mins: Number(session_duration_mins),
        chat_access_level,
        resource_library_access,
        therapist_matching_type,
        priority_support,
      };

      const existingNormalized = {
        plan_key: latestPlan.plan_key,
        user_type: latestPlan.user_type,
        plan_name: latestPlan.plan_name,
        description: latestPlan.description,
        is_featured: latestPlan.is_featured,
        price: latestPlan.price,
        discount: latestPlan.discount,
        final_price: latestPlan.final_price,
        currency: latestPlan.currency,
        billing_interval: latestPlan.billing_interval,
        trial_period_days: latestPlan.trial_period_days,
        stripe_price_id: latestPlan.stripe_price_id,
        available_modules: [...latestPlan.available_modules].sort(),
        max_messages_per_month: latestPlan.max_messages_per_month,
        max_assessments_per_month:
          latestPlan.max_assessments_per_month,
        max_providers_allowed: latestPlan.max_providers_allowed,
        video_sessions_count: latestPlan.video_sessions_count,
        max_parents_allowed: latestPlan.max_parents_allowed,
        video_sessions_upload_per_month:
          latestPlan.video_sessions_upload_per_month,
        session_duration_mins: latestPlan.session_duration_mins,
        chat_access_level: latestPlan.chat_access_level,
        resource_library_access:
          latestPlan.resource_library_access,
        therapist_matching_type:
          latestPlan.therapist_matching_type,
        priority_support: latestPlan.priority_support,
      };

      const isSame =
        JSON.stringify(incomingNormalized) ===
        JSON.stringify(existingNormalized);

      if (isSame) {
        return res.status(400).json({
          message: "No changes detected. Version not created.",
        });
      }
    }

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
      slug: `${slug}-${user_type}`,
      description,
      is_featured,
      price: normalizedPrice,
      discount: normalizedDiscount,
      final_price,
      currency,
      billing_interval,
      trial_period_days: normalizedTrial,
      stripe_price_id,
      available_modules,
      max_messages_per_month,
      max_assessments_per_month,
      max_providers_allowed,
      video_sessions_count,
      max_parents_allowed,
      video_sessions_upload_per_month,
      session_duration_mins,
      chat_access_level,
      resource_library_access,
      therapist_matching_type,
      priority_support,
      version_number: nextVersion,
      is_active: true,
    });

    return res.status(201).json({
      message: "Plan version created successfully",
      plan,
    });
  } catch (error) {
    console.error("CREATE PLAN ERROR:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Duplicate plan or slug conflict",
      });
    }

    return res.status(500).json({
      message: error.message,
    });
  }
};


export const getPlans = async (req, res) => {
  try {
    const {
      search,
      user_type,
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    if (search) {
      query.plan_name = { $regex: search, $options: "i" };
    }

    if (user_type) {
      query.user_type = user_type;
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const skip = (pageNumber - 1) * limitNumber;

    const totalPlans = await Plan.countDocuments(query);

    const plans = await Plan.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    res.status(200).json({
      success: true,
      totalPlans,
      totalPages: Math.ceil(totalPlans / limitNumber),
      currentPage: pageNumber,
      plans,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch plans",
      error: error.message,
    });
  }
};
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
    const { plan_name, description, is_featured ,available_modules,} = req.body;

    const updatedPlan = await Plan.findByIdAndUpdate(
      req.params.id,
      {
        plan_name,
        description,
        is_featured,
       available_modules,
      },
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
  console.error("UPDATE PLAN ERROR:", error);

  res.status(500).json({
    success: false,
    message: error.message,
    error: error,
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


export const getFeaturedPlan = async (req, res) => {
  try {
    const { user_type } = req.query;

    const query = {
      is_featured: true,
      is_active: true,
    };

    if (user_type) {
      query.user_type = user_type;
    }

    const plan = await Plan.findOne(query)
      .sort({ version_number: -1 }); 

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "No featured plan found",
      });
    }

    res.status(200).json({
      success: true,
      plan,
    });
  } catch (error) {
    console.error("GET FEATURED PLAN ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch featured plan",
      error: error.message,
    });
  }
};