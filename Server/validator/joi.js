import Joi from "joi";

//signin
const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(50).required(),
  username: Joi.string().min(4).max(30).required(),
  roleType: Joi.string().valid("Provider", "Parent").required(),
});

export const validateUserCreate = (req, res, next) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ message: error.details[0].message, success: false });
  }
  next();
};

//login
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(50).required(),
});

export const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ message: error.details[0].message, success: false });
  }
  next();
};


//password
const passwordSchema = Joi.object({
  password: Joi.string().min(6).max(50).required(),
  newPassword: Joi.string().min(6).max(50).required(),
});

export const validatePassword = (req, res, next) => {
  const { error } = passwordSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
      success: false,
    });
  }
  next();
};
