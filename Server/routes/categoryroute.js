import express from 'express';
import { createCategory, getAllCategories } from '../controller/categorycontroller.js';

const router = express.Router();

router.post('/addcategory', createCategory);
router.get('/getallcategories',getAllCategories)



export default router;  