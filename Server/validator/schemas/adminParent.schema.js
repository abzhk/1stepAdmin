import Joi from "joi";

/**
 * Joi schema for admin updating a Parent record.
 *
 * The frontend sends flat dot-notation keys because the ParentEdit form
 * builds the body as:
 *   { "parentDetails.fullName": "...", "parentDetails.phoneNumber": "+91..." }
 *
 * Rules:
 * - phoneNumber: +91 followed by 10-digit Indian mobile (starts 6-9)
 * - fullName: minimum 2 characters, letters and spaces only
 * - address: max 500 characters
 * - unknown(false): rejects injected fields
 */
export const adminUpdateParentSchema = Joi.object({
  "parentDetails.fullName": Joi.string()
    .trim()
    .min(2)
    .max(100)
    .pattern(/^[A-Za-z\s]+$/)
    .optional()
    .messages({
      "string.min": "Full name must be at least 2 characters",
      "string.max": "Full name must be less than 100 characters",
      "string.pattern.base": "Full name can only contain letters and spaces",
    }),

  "parentDetails.childName": Joi.string()
    .trim()
    .max(100)
    .optional()
    .allow("", null)
    .messages({ "string.max": "Child name must be less than 100 characters" }),

  "parentDetails.phoneNumber": Joi.string()
    .pattern(/^\+91[6-9]\d{9}$/)
    .optional()
    .allow("", null)
    .messages({
      "string.pattern.base":
        "Phone must be +91 followed by a 10-digit Indian mobile number starting with 6–9",
    }),

  "parentDetails.address": Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow("", null)
    .messages({ "string.max": "Address must be less than 500 characters" }),
})
  .min(1)
  .unknown(false)
  .messages({
    "object.min": "At least one field must be provided to update",
    "object.unknown": "Field '{{#label}}' is not allowed",
  });
