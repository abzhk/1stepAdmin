import Admin from '../model/adminmodel.js';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
import Provider from '../model/providermodel.js';
import mongoose from 'mongoose';

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
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'lax',
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

