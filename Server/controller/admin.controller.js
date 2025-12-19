import Admin from '../model/adminmodel.js';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
import Provider from '../model/provider.model.js';
import mongoose from 'mongoose';
import Parent from "../model/parent.model.js";

export const createAdmin = async (req,res)=> {
try{
    const{
        username,password
    }=req.body
    const existingAdmin = await Admin.findOne({username});
    if(existingAdmin){
        return res.status(400).json({message:"Admin already exists"});
    }
    const saltRounds=10;
    const hashedpassword =await bcrypt.hash(password,saltRounds);

    const newAdmin = new Admin({
        username,
        password:hashedpassword
    });
    await newAdmin.save();
    res.status(201).json({
         success: true,
            message: 'Admin created successfully',
    });
             } catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
}
}
export const loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;

        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const token = jwt.sign(
            { 
                id: admin._id, 
                username: admin.username,
                role: admin.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
         res.cookie('adminToken', token, {
      httpOnly: true,
      secure:false, 
      sameSite: 'lax',
      path:'/',
      maxAge: 24 * 60 * 60 * 1000, 
    });

       res.status(200).json({
  success: true,
  message: 'Login successful',
  admin: {
    id: admin._id,
    username: admin.username,
    role: admin.role
  },
  token: token
});

    } catch (error) {
        console.error('Error logging in admin:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

//delete provider
export const deleteProvider = async (req, res) => {
  try {
    const { providerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(providerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid provider id",
      });
    }

    const providerDoc = await Provider.findById(providerId);

    if (!providerDoc) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    await Provider.findByIdAndDelete(providerId);

    return res.status(200).json({
      success: true,
      message: "Provider deleted successfully",
    });
  } catch (error) {
    console.error("Delete provider error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete provider",
      error: error.message,
    });
  }
};
export const logoutAdmin = async (req, res) => {
  try {
    res.clearCookie("adminToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path:'/',
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};

export const verifyAdminSession = async (req, res) => {
  try {
    const token = req.cookies.adminToken;
    if (!token) {
      return res.status(401).json({ valid: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ valid: true });
  } catch (error) {
    return res.status(401).json({ valid: false });
  }
};


//updateprovider details byadmin
export const updateProvider = async (req, res) => {
  try {
    const { providerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(providerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid provider id",
      });
    }

    const providerDoc = await Provider.findById(providerId);

    if (!providerDoc) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

 
    if (req.body.email && req.body.email !== providerDoc.email) {
      const existingEmail = await Provider.findOne({
        email: req.body.email,
        _id: { $ne: providerId },
      });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already in use by another provider",
        });
      }
    }
    if (
      req.body.providerType === "centre" &&
      !req.body.locationUrl
    ) {
      return res.status(400).json({
        success: false,
        message: "locationUrl is required for centre providers",
      });
    }


    const updatedProvider = await Provider.findByIdAndUpdate(
      providerId,
      {
        $set: req.body,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Provider updated successfully",
      provider: updatedProvider,
    });
  } catch (error) {
    console.error("Update provider error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update provider",
      error: error.message,
    });
  }
};

//fetch both parent and provider
export const getParentsAndProviders = async (req, res) => {
  try {

     const { limit = 4, startIndex = 0 } = req.query;
    const parents = await Parent.find()
      .populate("userRef", "username email profilePicture createdAt")
      .sort({ createdAt: -1 })
       .skip(Number(startIndex))
      .limit(Number(limit))

    const providers = await Provider.find()
      .sort({ createdAt: -1 })
       .skip(Number(startIndex))
      .limit(Number(limit))

      const parentsTotal = await Parent.countDocuments();
      const providersTotal = await Provider.countDocuments();

    res.status(200).json({
      success: true,
      parentsCount: parents.length,
      providersCount: providers.length,
      parents,
      providers,
      total: parentsTotal + providersTotal,
    });
  } catch (error) {
    console.error("Fetch Parents & Providers Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch parents and providers",
    });
  }
};
//delete parent
export const deleteParent = async (req, res) => {
  try {
    const { userRef } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userRef)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userRef ID",
      });
    }

    const parentDoc = await Parent.findOne({ userRef });

    if (!parentDoc) {
      return res.status(404).json({
        success: false,
        message: "Parent not found",
      });
    }

    await Parent.findOneAndDelete({ userRef });

    return res.status(200).json({
      success: true,
      message: "Parent deleted successfully",
    });
  } catch (error) {
    console.error("Delete parent error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete parent",
      error: error.message,
    });
  }
};


//update parent
export const updateParent = async (req, res) => {
  try {
    const { userRef } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userRef)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userRef ID",
      });
    }

    const parentDoc = await Parent.findOne({ userRef });

    if (!parentDoc) {
      return res.status(404).json({
        success: false,
        message: "Parent not found",
      });
    }

    const updatedParent = await Parent.findOneAndUpdate(
      { userRef },
      {
        $set: req.body,
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate("userRef", "username email profilePicture");

    return res.status(200).json({
      success: true,
      message: "Parent updated successfully",
      parent: updatedParent,
    });
  } catch (error) {
    console.error("Update parent error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update parent",
      error: error.message,
    });
  }
};
