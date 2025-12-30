import User from "../model/user.model.js";
import Role from "../model/role.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

export const signup = async (req, res, next) => {
  const { username, email, password, roleType } = req.body;
  try {
    const roleSelect = roleType === "Provider" ? "Provider" : "Parent";
    const role = await Role.findOne({ role: roleSelect });

    if (!role) {
      return res
        .status(400)
        .json({ message: "Invalid role, try again!!", success: false });
    }
    const hashedPassword = bcryptjs.hashSync(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role._id,
    });
    await newUser.save();
    res
      .status(201)
      .json({ message: "Account created successfully", success: true });
  } catch (error) {
    if (error.name === "MongoServerError" && error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Email already registered", success: false });
    }
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const validUser = await User.findOne({ email }).populate("role");
    if (!validUser)
      return next(
        errorHandler(404, "Email not found. Please create an account first!")
      );
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(401, "wrong credentials"));

    const { role } = validUser;
    if (!role) {
      return next(errorHandler(403, "User does not have an Assigned Role"));
    }
    const accessToken = jwt.sign(
      {
        id: validUser._id,
        isAdmin: validUser.isAdmin,
        permissions: role.permissions,
        role: role.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    const refreshToken = jwt.sign(
      {
        id: validUser._id,
      },
      process.env.REFRESH_SECRET,
      {
        expiresIn: "7d",
      }
    );

    validUser.refreshToken = refreshToken;
    await validUser.save();

    const {
      password: hashedPassword,
      refreshToken: bdRefreshToken,
      ...rest
    } = validUser._doc;
    res
      .cookie("access_token", accessToken, {
        httpOnly: true,
        maxAge: 1 * 24 * 60 * 60 * 1000,
      })
      .cookie("refresh_token", refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json(rest);
  } catch (error) {
    next(error);
  }
};

export const google = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email }).populate("role");
    if (!user) {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const roleSelect =
        req.body.roleType === "Provider" ? "Provider" : "Parent";
      const roles = await Role.findOne({ role: roleSelect });

      if (!roles) {
        return next(errorHandler(403, "Invalid role, unauthorized"));
      }

      const newUser = new User({
        username: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        profilePicture: req.body.photo,
        role: roles._id,
      });

      const refreshToken = jwt.sign(
        {
          id: newUser._id,
        },
        process.env.REFRESH_SECRET,
        {
          expiresIn: "7d",
        }
      );

      const accessToken = jwt.sign(
        {
          id: newUser._id,
          isAdmin: newUser.isAdmin,
          permissions: roles.permissions,
          role: roles.role,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d",
        }
      );

      newUser.refreshToken = refreshToken;

      await newUser.save();

      const populateRole = await User.findById(newUser._id).populate("role");

      const {
        password: hashedPassword2,
        refreshToken: dbRefreshToken,
        ...rest
      } = populateRole._doc;
      res
        .cookie("access_token", accessToken, {
          httpOnly: true,
          maxAge: 1 * 24 * 60 * 60 * 1000,
        })
        .cookie("refresh_token", refreshToken, {
          httpOnly: true,
          maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .status(200)
        .json(rest);
    } else {
      const { role } = user;
      if (!role) {
        return next(
          errorHandler(403, "Account does not have role, unauthorized")
        );
      }

      const refreshToken = jwt.sign(
        {
          id: user._id,
        },
        process.env.REFRESH_SECRET
      );

      const accessToken = jwt.sign(
        {
          id: user._id,
          isAdmin: user.isAdmin,
          permissions: role.permissions,
          role: role.role,
        },
        process.env.JWT_SECRET
      );

      user.refreshToken = refreshToken;
      await user.save();

      const {
        password: hashedPassword,
        refreshToken: dbRefreshToken,
        ...rest
      } = user._doc;
      res
        .cookie("access_token", accessToken, {
          httpOnly: true,
          maxAge: 1 * 24 * 60 * 60 * 1000,
        })
        .cookie("refresh_token", refreshToken, {
          httpOnly: true,
          maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .status(200)
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
};

export const signout = async (req, res, next) => {
  try {
    // const refreshToken = req.cookies?.refresh_token;
    // if (refreshToken) {
    //   const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    //   await User.findByIdAndUpdate(decoded.id, { refreshToken: "" });
    // }

    res
      .clearCookie("access_token")
      .clearCookie("refresh_token")
      .status(200)
      .json({ message: "Account Signout" });
  } catch (error) {
    next(errorHandler(500, "Failed to Signout, Please try later"));
  }
};

export const refreshAccessToken = async (req, res, next) => {
  const refreshToken = req.cookies?.refresh_token;

  if (!refreshToken) {
    return res
      .status(401)
      .clearCookie("access_token")
      .json({ message: "Refresh Token missing" });
  }
  const accessToken = req.cookies?.access_token;
  if (accessToken) {
    return res.status(200).json({ message: "session valid" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      console.log(user.refreshToken);
      console.log(refreshToken);
      return res.status(401).json({ message: "Invalid Token" });
    }

    const role = await Role.findById(user.role);

    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin || [],
        permissions: role.permissions || [],
        role: role.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );
    res
      .cookie("access_token", accessToken, {
        httpOnly: true,
        maxAge: 1 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({ message: "new access token created" });
  } catch (error) {
    return next(errorHandler(403, "Invalid refresh Token"));
  }
};

// PASSWORD RESET

let otpStorage = {};
let hashedPasswords = {};

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });

    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

export const resetPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const validUser = await User.findOne({ email });
    if (!validUser) {
      return next(errorHandler(404, "Email not registered!"));
    }
    const generateOtp = Math.floor(Math.random() * 1000000);

    otpStorage[email] = generateOtp;
    console.log("otpStorage", otpStorage);

    const html = `<b>Your 1Step Reset Password Otp is : <i>${generateOtp}</i></b>`;
    const subject = "New OTP Generated";

    const emailSent = await sendEmail(email, subject, html);

    if (emailSent) {
      return res.json({
        status: true,
        message: "Otp sended your email, check your inbox.",
      });
    } else {
      return res.status(500).json({ message: "Error, can't send email!" });
    }
  } catch (err) {
    next(err);
  }
};

export const verifyOtpPassword = async (req, res) => {
  try {
    const { email, userEnteredOtp, newPassword } = req.body;
    console.log(req.body);
    if (!email || !userEnteredOtp || !newPassword) {
      return res
        .status(400)
        .json({ status: false, message: "All fields are required" });
    }

    if (userEnteredOtp.length !== 6) {
      return res
        .status(403)
        .json({ status: faalse, message: "OTP must 6 digit" });
    }
    const storedOtp = otpStorage[email];
    console.log(storedOtp);

    if (userEnteredOtp !== storedOtp.toString()) {
      return res.status(400).json({ message: "OTP doesn't matched!" });
    }
    if (!storedOtp) {
      return res.status(400).json({ message: "Recheck email and OTP" });
    }

    if (userEnteredOtp === storedOtp.toString()) {
      const hashedPassword = await updatePassword(email, newPassword);

      delete otpStorage[email];

      return res
        .status(200)
        .json({ status: true, message: "Password updated Successfully" });
    } else {
      return res
        .status(400)
        .json({ status: false, message: "Incorrect OTP Check your OTP Again" });
    }
  } catch (error) {
    console.error("Error in verifyOtpAndUpdatePassword:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updatePassword = async (email, newPassword) => {
  try {
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    await updatePasswordInDatabase(email, hashedPassword);

    return; // Don't return the hashed password
  } catch (error) {
    console.error("Error in updatePassword:", error);
    throw error;
  }
};

async function updatePasswordInDatabase(email, hashedPassword) {
  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      // Handle the case where the user is not found
      throw new Error("User not found.");
    }

    // Update the password field in the user document
    user.password = hashedPassword;

    // Save the updated user document
    await user.save();

    // Optionally, you can return the updated user document or any other response
    return;
  } catch (error) {
    console.error("Error in Password Updating", error);
    throw error;
  }
}
