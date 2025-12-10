import express from 'express';
import { createCategory, getAllCategories,toggleCategoryStatus } from '../controller/category.controller.js';
import { verifyAdminToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/addcategory',verifyAdminToken, createCategory);
router.get('/getallcategories',getAllCategories)
router.put('/togglecategory/:id',verifyAdminToken,toggleCategoryStatus);



export default router;  