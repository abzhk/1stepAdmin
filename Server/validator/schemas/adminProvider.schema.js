import Joi from "joi";

/**
 * Joi schema for admin updating an Individual Provider.
 *
 * Rules:
 * - phone: +91 followed by 10-digit Indian mobile (starts 6-9)
 * - regularPrice: minimum ₹50, maximum ₹99,999
 * - description: minimum 100 characters (same as provider self-update in 1stepdev)
 * - experience: 0–60 years, integer
 * - unknown(false): rejects any injected fields (isVerified, userRef, role, etc.)
 * - min(1): at least one field must be sent
 */
export const adminUpdateProviderSchema = Joi.object({
  fullName: Joi.string()
    .trim()
    .max(100)
    .optional()
    .messages({ "string.max": "Full name must be less than 100 characters" }),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .trim()
    .optional()
    .messages({ "string.email": "Please provide a valid email address" }),

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

  description: Joi.string()
    .trim()
    .min(100)
    .max(2000)
    .optional()
    .allow("", null)
    .messages({
      "string.min": "Description must be at least 100 characters",
      "string.max": "Description cannot exceed 2,000 characters",
    }),

  license: Joi.string()
    .trim()
    .max(50)
    .optional()
    .allow("", null)
    .messages({ "string.max": "License number must be less than 50 characters" }),

  therapytype: Joi.array()
    .items(Joi.string().trim())
    .optional()
    .messages({ "array.base": "Therapy type must be an array" }),

  providerType: Joi.string()
    .valid("individual", "centre")
    .optional()
    .messages({ "any.only": "Provider type must be either 'individual' or 'centre'" }),
})
  .min(1)
  .unknown(false) // rejects injected fields like isVerified, userRef, role
  .messages({
    "object.min": "At least one field must be provided to update",
    "object.unknown": "Field '{{#label}}' is not allowed",
  });
