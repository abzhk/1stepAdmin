import express from 'express';
import { createCategory, getAllCategories,toggleCategoryStatus,
    getCategoryById,
    updateCategory,
 } from '../controller/category.controller.js';
import { verifyAdminToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/addcategory',verifyAdminToken, createCategory);
router.get('/getallcategories',getAllCategories)
router.put('/togglecategory/:id',verifyAdminToken,toggleCategoryStatus);
//categorybyid
router.get("/category/:id", getCategoryById);
//update category byid
router.put("/category/:id", updateCategory);


export default router;  