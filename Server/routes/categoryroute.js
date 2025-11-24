import express from 'express';
import { createCategory } from '../controller/categorycontroller.js';

const router = express.Router();

router.post('/addcategory', createCategory);



export default router;  