import express from 'express';
import { getPendingArticles,approveArticle,rejectArticle } from '../controller/article.controller.js';
import {verifyAdminToken} from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/pendingarticle',getPendingArticles)

router.put("/admin/:id/approve",verifyAdminToken ,approveArticle);

router.put("/admin/:id/reject",verifyAdminToken,rejectArticle);

export default router;  