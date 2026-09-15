import Joi from "joi";

/**
 * Joi schema for admin updating a Centre Provider.
 *
 * Rules:
 * - phone: +91 followed by 10-digit Indian mobile (starts 6-9)
 * - regularPrice: minimum ₹50, maximum ₹99,999
 * - experience: 0–60 years, integer
 * - unknown(false): rejects any injected fields
 * - min(1): at least one field must be sent
 *
 * Note: email is disabled on CentreEdit form (read-only), so not included here.
 * Note: description is not in the CentreEdit form, so not included.
 */
export const adminUpdateCentreSchema = Joi.object({
  fullName: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .optional()
    .messages({
      "string.min": "Centre name must be at least 2 characters",
      "string.max": "Centre name must be less than 100 characters",
    }),

  phone: Joi.string()
    .pattern(/^\+91[6-9]\d{9}$/)
    .optional()
    .allow("", null)
    .messages({
      "string.pattern.base":
        "Phone must be +91 followed by a 10-digit Indian mobile number starting with 6–9",
    }),

  qualification: Joi.string()
    .trim()
    .max(100)
    .optional()
    .allow("", null)
    .messages({ "string.max": "Qualification must be less than 100 characters" }),

  experience: Joi.number()
    .integer()
    .min(0)
    .max(60)
    .optional()
    .allow(null)
    .messages({
      "number.min": "Experience cannot be negative",
      "number.max": "Experience cannot exceed 60 years",
      "number.integer": "Experience must be a whole number",
    }),

  regularPrice: Joi.number()
    .min(50)
    .max(99999)
    .optional()
    .allow(null)
    .messages({
      "number.min": "Consultation fee must be at least ₹50",
      "number.max": "Consultation fee cannot exceed ₹99,999",
    }),

  license: Joi.string()
    .trim()
    .max(50)
    .optional()
    .allow("", null)
    .messages({ "string.max": "License number must be less than 50 characters" }),

  providerType: Joi.string()
    .valid("individual", "centre")
    .optional()
    .messages({ "any.only": "Provider type must be either 'individual' or 'centre'" }),
})
  .min(1)
  .unknown(false)
  .messages({
    "object.min": "At least one field must be provided to update",
    "object.unknown": "Field '{{#label}}' is not allowed",
  });
