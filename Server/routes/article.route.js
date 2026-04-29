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
import { canAccess } from '../middlewares/permission.middleware.js';
import { MODULES, ACTIONS } from '../constants/permissions.js';

const router = express.Router();

router.get('/pendingarticle',verifyAdminToken, canAccess(MODULES.ARTICLES, ACTIONS.READ),getPendingArticles)

router.put("/admin/:id/approve",verifyAdminToken ,canAccess(MODULES.ARTICLES, ACTIONS.UPDATE), approveArticle);

router.put("/admin/:id/reject",verifyAdminToken,canAccess(MODULES.ARTICLES, ACTIONS.UPDATE),rejectArticle);

router.get("/providerarticle/:providerId",verifyAdminToken, canAccess(MODULES.ARTICLES, ACTIONS.READ),getArticleByProvider);

router.put("/admin/categories/:id/status",verifyAdminToken,canAccess(MODULES.ARTICLES, ACTIONS.UPDATE),toggleArticleCategoryStatus);
//get all articles
router.get("/all",verifyAdminToken, canAccess(MODULES.ARTICLES, ACTIONS.READ), getAllArticles);
//create
router.post("/create",verifyAdminToken,canAccess(MODULES.ARTICLES, ACTIONS.CREATE),createArticle)
//featured
router.put("/featured/:id",verifyAdminToken, canAccess(MODULES.ARTICLES, ACTIONS.UPDATE), toggleFeaturedArticle);

router.put("/admin/update/:id", verifyAdminToken, canAccess(MODULES.ARTICLES, ACTIONS.UPDATE), updateArticleAdmin);

router.delete("/admin/delete/:id", verifyAdminToken, canAccess(MODULES.ARTICLES, ACTIONS.DELETE), deleteArticlebyAdmin);

router.get("/:id", verifyAdminToken, canAccess(MODULES.ARTICLES, ACTIONS.READ), getArticleById);




export default router;  