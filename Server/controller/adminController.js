import Admin from '../model/adminmodel.js';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';

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