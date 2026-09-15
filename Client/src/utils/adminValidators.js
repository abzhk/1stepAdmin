import { z } from "zod";

// ── Input filters ──────────────────────────────────────────────────────────────
// Use inside onChange handlers to block invalid characters on every keystroke.

/** Removes everything except letters and spaces */
export const allowLettersOnly = (value) => {
  if (!value) return "";
  return value.replace(/[^a-zA-Z\s]/g, "");
};

/** Removes everything except digits 0-9 */
export const allowNumbersOnly = (value) => {
  if (!value) return "";
  return value.replace(/[^0-9]/g, "");
};

// ── Reusable Zod schemas ──────────────────────────────────────────────────────

export const emailSchema = z
  .string()
  .email("Invalid email address")
  .min(1, "Email is required");

/**
 * Indian mobile number in E.164 format: +91 followed by 10 digits starting 6-9.
 * The frontend stores the 10-digit input and prepends +91 before calling this.
 */
export const indianPhoneSchema = z
  .string()
  .regex(
    /^\+91[6-9]\d{9}$/,
    "Enter a valid 10-digit Indian mobile number starting with 6–9"
  );

// ── validateForm utility ──────────────────────────────────────────────────────
/**
 * Runs a Zod schema against form data and returns a normalised result.
 *
 * @param {import("zod").ZodSchema} schema
 * @param {Record<string, unknown>} data
 * @returns {{ success: boolean; errors: Record<string, string> }}
 *
 * Usage:
 *   const { success, errors } = validateForm(mySchema, formData);
 *   if (!success) {
 *     setFieldErrors(errors);
 *     toast.error(Object.values(errors)[0]);
 *     return;
 *   }
 */
export const validateForm = (schema, data) => {
  try {
    schema.parse(data);
    return { success: true, errors: {} };
  } catch (err) {
    if (err instanceof z.ZodError) {
      const errors = {};
      (err.issues ?? []).forEach((issue) => {
        const key = issue.path.join(".");
        if (!errors[key]) {
          errors[key] = issue.message;
        }
      });
      return { success: false, errors };
    }
    return { success: false, errors: { global: "Validation failed" } };
  }
};
