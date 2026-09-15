/**
 * Generic Joi validation middleware factory.
 *
 * Usage in routes:
 *   import { validate } from "../validator/validate.middleware.js";
 *   import { adminUpdateProviderSchema } from "../validator/schemas/adminProvider.schema.js";
 *
 *   router.put("/providers/:id", verifyAdminToken, validate(adminUpdateProviderSchema), updateProvider);
 *
 * @param {import("joi").Schema} schema  - Joi schema to validate against
 * @param {"body"|"query"|"params"} source - which part of the request to validate (default: "body")
 */
export const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const data = req[source];

    const { error, value } = schema.validate(data, {
      abortEarly: false,    // return ALL errors at once, not just the first
      stripUnknown: true,   // silently remove any keys not in the schema (prevents mass-assignment)
      convert: true,        // coerce types where safe (e.g. "5" → 5 for Joi.number())
    });

    if (error) {
      const messages = error.details.map((d) => d.message.replace(/['"]/g, ""));
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
        errors: messages,
      });
    }

    // Replace req[source] with the sanitised, stripped value so controllers
    // never receive unknown fields (prevents mass-assignment vulnerabilities).
    req[source] = value;
    next();
  };
};

/**
 * Validates a Mongo ObjectId string.
 * Use as a route-level guard for any :id param that must be a valid ObjectId.
 *
 * Usage:
 *   router.get("/:id", validateObjectId("id"), getProvider);
 *
 * @param {string} paramName - the req.params key to validate
 */
export const validateObjectId = (paramName = "id") => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id || !/^[a-f\d]{24}$/i.test(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ID format for param '${paramName}'`,
      });
    }
    next();
  };
};
