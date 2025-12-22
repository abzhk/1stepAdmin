import express from 'express';
import { getPendingArticles,
    approveArticle,
    rejectArticle ,
    getArticleByProvider,
toggleArticleCategoryStatus,
} from '../controller/article.controller.js';
import {verifyAdminToken} from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/pendingarticle',getPendingArticles)

router.put("/admin/:id/approve",verifyAdminToken ,approveArticle);

router.put("/admin/:id/reject",verifyAdminToken,rejectArticle);

router.get("/providerarticle/:providerId",getArticleByProvider);

router.put("/admin/categories/:id/status",verifyAdminToken,toggleArticleCategoryStatus);




export default router;  