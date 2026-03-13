import express from 'express';
import { getPendingArticles,
    approveArticle,
    rejectArticle ,
    getArticleByProvider,
toggleArticleCategoryStatus,
 getAllArticles,
 createArticle,
 toggleFeaturedArticle,
 updateArticleAdmin,
 deleteArticlebyAdmin,
 getArticleById
} from '../controller/article.controller.js';
import {verifyAdminToken} from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/pendingarticle',getPendingArticles)

router.put("/admin/:id/approve",verifyAdminToken ,approveArticle);

router.put("/admin/:id/reject",verifyAdminToken,rejectArticle);

router.get("/providerarticle/:providerId",getArticleByProvider);

router.put("/admin/categories/:id/status",verifyAdminToken,toggleArticleCategoryStatus);
//get all articles
router.get("/all", getAllArticles);
//create
router.post("/create",verifyAdminToken,createArticle)
//featured
router.put("/featured/:id",verifyAdminToken, toggleFeaturedArticle);

router.put("/admin/update/:id", verifyAdminToken, updateArticleAdmin);

router.delete("/admin/delete/:id", verifyAdminToken, deleteArticlebyAdmin);

router.get("/:id", verifyAdminToken, getArticleById);




export default router;  