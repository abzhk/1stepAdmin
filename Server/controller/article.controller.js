import Article from "../model/Article/article.model.js";
import Provider from "../model/provider.model.js";
import Category from "../model/Article/category.model.js";
import { errorHandler } from "../utils/error.js";
import { FeaturedArticles } from "../utils/article.utils.js";

// Create new article
export const createArticle = async (req, res,next) => {
  try {

    const {
      title,
      content,
      excerpt,
      featuredImage,
      categoryId,
      tags,
      readTime,
      featured,
      position,
       metaTitle,
  metaDescription,
    } = req.body;

  // Validation
    if (!title || !content || !excerpt  || !categoryId) {
      return next(errorHandler(400, "All required fields must be provided"))
    }
  
// Check category
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (!category.isActive) {
      return next(errorHandler(400, "This category is not currently active"));
    }

    if (position !== null && position !== undefined) {
  if (position < 1 || position > 10) {
    return next(errorHandler (400, "Position must be between 1 and 10"))
  }

  const existing = await Article.findOne({ position });

  if (existing) {
    return next(errorHandler(400, `Position ${position} already assigned`));
  }
}

    let providerId = null;
    let providerName = "Admin";
    let status = "approved";

    const provider = await Provider.findOne({ userRef: req.user.id });
 // Verify provider is verified
    if (provider) {
      if (!provider.verified) {
        return next(errorHandler(403, "Only verified providers can create articles"));
      }

      providerId = provider._id;
      providerName = provider.fullName;
      status = "pending";
    }

    const authorType = req.user.role;

   if (featured) {
  await FeaturedArticles(Article);
}

 // Create article
    const article = new Article({
      title,
      content,
      excerpt,
      featuredImage:
  Array.isArray(featuredImage)
    ? featuredImage
    : featuredImage
    ? [featuredImage]
    : [],
      category: category.name,
      categoryId: category._id,
      tags: tags || [],
      readTime: readTime || Math.ceil(content.split(" ").length / 200),
      providerId,
      providerName,
      status,
      authorType,
      featured: featured || false,
        position: position || null,
         metaTitle: metaTitle ,
  metaDescription: metaDescription ,
      publishedAt: status === "approved" ? new Date() : undefined,
    });

    await article.save();

    return res.status(201).json({
      success: true,
      message:
        status === "approved"
          ? "Article published successfully"
          : "Article created and submitted for approval",
      article,
    });

  } catch (error) {
    console.error("Create article error:", error);

    return next(errorHandler(500, "Error creating article"));
  }
};

// Get all articles by provider
export const getProviderArticles = async (req, res,next) => {
  try {
    const provider = await Provider.findOne({ userRef: req.user.id });
    if (!provider) {
      return next(errorHandler(404, "Provider not found"));
    }

    const { status, page = 1, limit = 10 } = req.query;
    const query = { providerId: provider._id };

    if (status && status !== "all") {
      query.status = status;
    }

    const articles = await Article.find(query)
      .populate("categoryId", "name slug icon color")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Article.countDocuments(query);

    res.status(200).json({
      success: true,
      articles,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count,
    });
  } catch (error) {
    console.error("Get provider articles error:", error);
    return next(errorHandler(500, "Error fetching articles"));
  }
};

// Get single article by ID (for editing)
export const getArticleById = async (req, res,next) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id)
      .populate("providerId", "fullName profilePicture")
      .populate("categoryId", "name slug icon color")
      .populate("tags", "label");

    if (!article) {
      return next(errorHandler(404, "Article not found"));
    }

    // Check if user is the owner or admin
    const provider = await Provider.findOne({ userRef: req.user.id });
    if (
      provider &&
      article.providerId._id.toString() !== provider._id.toString()
    ) {
      // If not owner, check if admin (you'll need to implement admin check)
      if (!req.user.isAdmin) {
       return next(errorHandler(403, "Not authorized to view this article"));
      }
    }

    res.status(200).json({ success: true, article });
  } catch (error) {
    console.error("Get article error:", error);
    res.status(500).json({  message: error.message, });
    
  }
};

// Update article
export const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const provider = await Provider.findOne({ userRef: req.user.id });

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Check ownership
    if (article.providerId.toString() !== provider._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to update this article",
      });
    }

    // Can only update if draft or rejected
    if (article.status !== "draft" && article.status !== "rejected") {
      return res.status(400).json({
        message: "Can only update articles in draft or rejected status",
      });
    }

    const {
      title,
      content,
      excerpt,
      featuredImage,
      categoryId,
      tags,
      readTime,
    } = req.body;

    // Verify category if being changed
    if (categoryId && categoryId !== article.categoryId.toString()) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      if (!category.isActive) {
        return res.status(400).json({
          message: "This category is not currently active",
        });
      }
      article.category = category.name;
      article.categoryId = category._id;
    }

    // Update fields
    if (title) article.title = title;
    if (content) {
      article.content = content;
      article.readTime = readTime || Math.ceil(content.split(" ").length / 200);
    }
    if (excerpt) article.excerpt = excerpt;
    if (featuredImage) article.featuredImage = featuredImage;
    if (tags !== undefined) article.tags = tags;

    await article.save();

    res.status(200).json({
      success: true,
      message: "Article updated successfully",
      article,
    });
  } catch (error) {
    console.error("Update article error:", error);
    res.status(500).json({ message: "Error updating article" });
  }
};

// Submit article for approval
export const submitArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const provider = await Provider.findOne({ userRef: req.user.id });

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    if (article.providerId.toString() !== provider._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (article.status === "pending" || article.status === "approved") {
      return res.status(400).json({
        message: "Article is already submitted or approved",
      });
    }

    article.status = "pending";
    article.rejectionReason = undefined; // Clear rejection reason
    await article.save();

    res.status(200).json({
      success: true,
      message: "Article submitted for approval",
      article,
    });
  } catch (error) {
    console.error("Submit article error:", error);
    res.status(500).json({ message: "Error submitting article" });
  }
};

// Delete article
export const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const provider = await Provider.findOne({ userRef: req.user.id });

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    if (article.providerId.toString() !== provider._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Cannot delete approved articles
    if (article.status === "approved") {
      return res.status(400).json({
        message: "Cannot delete approved articles. Please contact admin.",
      });
    }

    await Article.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Article deleted successfully",
    });
  } catch (error) {
    console.error("Delete article error:", error);
    res.status(500).json({ message: "Error deleting article" });
  }
};

// ============================================
// PUBLIC CONTROLLERS
// ============================================

// Get all published articles (public)
export const getPublishedArticles = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      sortBy = "publishedAt",
    } = req.query;

    const query = { status: "approved" };

    // Category filter
    if (category && category !== "all") {
      // Check if it's a category slug or name
      const categoryDoc = await Category.findOne({
        $or: [{ slug: category }, { name: category }],
        isActive: true,
      });

      if (categoryDoc) {
        query.category = categoryDoc.name;
      }
    }

    // Search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Sort options
    const sortOptions = {};
    if (sortBy === "views") {
      sortOptions.views = -1;
    } else if (sortBy === "publishedAt") {
      sortOptions.publishedAt = -1;
    } else {
      sortOptions.createdAt = -1;
    }

    const articles = await Article.find(query)
      .populate(
        "providerId",
        "fullName profilePicture qualification experience"
      )
      .populate("categoryId", "name slug icon color")
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Article.countDocuments(query);

    res.status(200).json({
      success: true,
      articles,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count,
    });
  } catch (error) {
    console.error("Get published articles error:", error);
    res.status(500).json({ message: "Error fetching articles" });
  }
};

// Get article by slug (public)
export const getArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const article = await Article.findOne({ slug, status: "approved" })
      .populate(
        "providerId",
        "fullName profilePicture qualification experience"
      )
      .populate("categoryId", "name slug icon color");

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Increment views
    article.views += 1;
    await article.save();

    res.status(200).json({ success: true, article });
  } catch (error) {
    console.error("Get article by slug error:", error);
    res.status(500).json({ message: "Error fetching article" });
  }
};

// Get related articles (public)
export const getRelatedArticles = async (req, res) => {
  try {
    const { slug } = req.params;
    const { limit = 3 } = req.query;

    // Find the current article
    const article = await Article.findOne({ slug, status: "approved" });

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Find related articles by category
    const relatedArticles = await Article.find({
      status: "approved",
      category: article.category,
      _id: { $ne: article._id },
    })
      .populate("providerId", "fullName profilePicture")
      .populate("categoryId", "name slug icon color")
      .sort({ publishedAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      articles: relatedArticles,
    });
  } catch (error) {
    console.error("Get related articles error:", error);
    res.status(500).json({ message: "Error fetching related articles" });
  }
};

// Get articles by category (public)
export const getArticlesByCategory = async (req, res) => {
  try {
    const { categorySlug } = req.params;
    const { page = 1, limit = 12, sortBy = "publishedAt" } = req.query;

    // Find category
    const category = await Category.findOne({
      slug: categorySlug,
      isActive: true,
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const query = {
      status: "approved",
      category: category.name,
    };

    const sortOptions = {};
    if (sortBy === "views") {
      sortOptions.views = -1;
    } else {
      sortOptions.publishedAt = -1;
    }

    const articles = await Article.find(query)
      .populate("providerId", "fullName profilePicture")
      .populate("categoryId", "name slug icon color")
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Article.countDocuments(query);

    res.status(200).json({
      success: true,
      category: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        icon: category.icon,
        color: category.color,
      },
      articles,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count,
    });
  } catch (error) {
    console.error("Get articles by category error:", error);
    res.status(500).json({ message: "Error fetching articles" });
  }
};

// ============================================
// ADMIN CONTROLLERS
// ============================================

// Get all articles for admin review
export const getAllArticlesAdmin = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { providerName: { $regex: search, $options: "i" } },
      ];
    }

    const articles = await Article.find(query)
      .populate("providerId", "fullName email profilePicture phone")
      .populate("categoryId", "name slug icon color")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Article.countDocuments(query);

    // Get status counts
    const statusCounts = await Article.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const stats = {
      total: count,
      draft: statusCounts.find((s) => s._id === "draft")?.count || 0,
      pending: statusCounts.find((s) => s._id === "pending")?.count || 0,
      approved: statusCounts.find((s) => s._id === "approved")?.count || 0,
      rejected: statusCounts.find((s) => s._id === "rejected")?.count || 0,
    };

    res.status(200).json({
      success: true,
      articles,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count,
      stats,
    });
  } catch (error) {
    console.error("Get all articles admin error:", error);
    res.status(500).json({ message: "Error fetching articles" });
  }
};

// Approve article
export const approveArticle = async (req, res,next) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    if (article.status === "approved") {
      return res.status(400).json({ message: "Article is already approved" });
    }

    article.status = "approved";
    article.approvedBy = req.user._id;
    article.approvedAt = new Date();
    article.publishedAt = new Date();
    article.rejectionReason = undefined;

    await article.save();

    res.status(200).json({
      success: true,
      message: "Article approved and published successfully",
      article,
    });
  } catch (error) {
    console.error("Approve article error:", error);

    return next(errorHandler(500, "Error approving article"));
  }
};

// Reject article
export const rejectArticle = async (req, res,next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim() === "") {
      return res.status(400).json({
        message: "Rejection reason is required",
      });
    }

    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    if (article.status === "rejected") {
      return res.status(400).json({ message: "Article is already rejected" });
    }

    article.status = "rejected";
    article.rejectionReason = reason;

    await article.save();

    res.status(200).json({
      success: true,
      message: "Article rejected",
      article,
    });
  } catch (error) {
    console.error("Reject article error:", error);
    return next(errorHandler(500, "Error rejecting article"));
  }
};

// Get article statistics (Admin)
export const getArticleStats = async (req, res) => {
  try {
    // Total articles by status
    const statusStats = await Article.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Articles by category
    const categoryStats = await Article.aggregate([
      {
        $match: { status: "approved" },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalViews: { $sum: "$views" },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Top providers by article count
    const topProviders = await Article.aggregate([
      {
        $match: { status: "approved" },
      },
      {
        $group: {
          _id: "$providerId",
          providerName: { $first: "$providerName" },
          articleCount: { $sum: 1 },
          totalViews: { $sum: "$views" },
        },
      },
      {
        $sort: { articleCount: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // Total views
    const totalViews = await Article.aggregate([
      {
        $match: { status: "approved" },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$views" },
        },
      },
    ]);

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivity = await Article.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    res.status(200).json({
      success: true,
      stats: {
        statusBreakdown: statusStats,
        categoryBreakdown: categoryStats,
        topProviders,
        totalViews: totalViews[0]?.total || 0,
        recentActivity,
      },
    });
  } catch (error) {
    console.error("Get article stats error:", error);
    res.status(500).json({ message: "Error fetching statistics" });
  }
};

// Bulk approve articles (Admin)
export const bulkApproveArticles = async (req, res) => {
  try {
    const { articleIds } = req.body;

    if (!Array.isArray(articleIds) || articleIds.length === 0) {
      return res.status(400).json({
        message: "Article IDs array is required",
      });
    }

    const result = await Article.updateMany(
      {
        _id: { $in: articleIds },
        status: "pending",
      },
      {
        $set: {
          status: "approved",
          approvedBy: req.user.id,
          approvedAt: new Date(),
          publishedAt: new Date(),
        },
      }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} articles approved successfully`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Bulk approve error:", error);
    res.status(500).json({ message: "Error approving articles" });
  }
};

// Delete article (Admin)
export const deleteArticleAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    await Article.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Article deleted successfully",
    });
  } catch (error) {
    console.error("Delete article admin error:", error);
    res.status(500).json({ message: "Error deleting article" });
  }
};
//pending article
export const getPendingArticles = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    
    const query = { status: "pending" }; 

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { providerName: { $regex: search, $options: "i" } },
      ];
    }

    const articles = await Article.find(query)
      .populate("providerId", "fullName email profilePicture phone")
      .populate("categoryId", "name slug icon color")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Article.countDocuments(query);


    const pendingCount = await Article.countDocuments({ status: "pending" });

    res.status(200).json({
      success: true,
      articles,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count,
      pendingCount: pendingCount, 
    });
  } catch (error) {
    console.error("Get pending articles error:", error);
    return next(errorHandler(500, "Error fetching pending articles"));
  }
};

//article by provider

export const getArticleByProvider = async (req,res)=>{
try{
  const {providerId}=  req.params
  const {limit=10,startIndex=0} = req.query

  const query={providerId};
  const[articles,total]= await Promise.all([
Article.find(query)
.populate("providerId","providerName profilePicture")
 .populate("categoryId", "name slug icon color")
        .sort({ createdAt: -1 })
        .skip(Number(startIndex))
        .limit(Number(limit)),
      Article.countDocuments(query),
  ])
  res.status(200).json({
      success: true,
      total,
      articles,
    });
  } catch (error) {
    console.error("Get provider articles error:", error);
    res.status(500).json({ message: "Error fetching provider articles" });
  }
};

// article category Activate and deactive 
export const toggleArticleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    let newStatus;

    if (category.isActive === true) {
      newStatus = false;
    } else {
      newStatus = true;
    }

    await Category.findByIdAndUpdate(id, { isActive: newStatus });

    res.status(200).json({
      success: true,
      message: newStatus
        ? "Category Activated"
        : "Category Deactivated",
      isActive: newStatus,
    });
  } catch (error) {
    console.error("Toggle category status error:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getAllArticles = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    const articles = await Article.find(filter)
      .populate("providerId", "fullName email profilePicture")
      .populate("categoryId", "name slug icon color")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((page - 1) * limit);

    const total = await Article.countDocuments(filter);

    res.status(200).json({
      success: true,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      articles,
    });
  } catch (error) {
    console.error("Get all articles error:", error);
    res.status(500).json({ message: "Error fetching articles" });
  }
};
//featured article
export const toggleFeaturedArticle = async (req, res) => {
  try {

    const { id } = req.params;

    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({
        message: "Article not found",
      });
    }

    if (article.featured) {
      article.featured = false;
      await article.save();

      return res.status(200).json({
        success: true,
        featured: false,
        message: "Featured removed",
      });
    }

    await FeaturedArticles(Article);


    article.featured = true;
    await article.save();

    res.status(200).json({
      success: true,
      featured: true,
      message: "Article marked as featured",
    });

  } catch (error) {
    console.error("Toggle featured error:", error);

    res.status(500).json({
      message: "Error updating featured article",
    });
  }
};

//update article created by admin

export const updateArticleAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({
        message: "Article not found",
      });
    }

    if (
  !["Admin", "Super Admin", "content_admin"].includes(article.authorType)
) {
  return res.status(403).json({
    message: "Only admin-created articles can be edit",
  });
}

    const {
      title,
      content,
      excerpt,
      featuredImage,
      categoryId,
      tags,
      position,
      readTime,
       metaTitle,
  metaDescription,
    } = req.body;

    if (!title || !content || !excerpt || !featuredImage || !categoryId) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }
    if (position !== undefined) {
  // Allow null (to remove position)
  if (position !== null) {
    if (position < 1 || position > 10) {
      return res.status(400).json({
        message: "Position must be between 1 and 10",
      });
    }

    // Check duplicate (exclude current article)
    const existing = await Article.findOne({
      position,
      _id: { $ne: id },
    });

    if (existing) {
      return res.status(400).json({
        message: `Position ${position} already assigned`,
      });
    }
  }

  // Assign position (can be null)
  article.position = position;
}

    const category = await Category.findById(categoryId);

    if (!category || !category.isActive) {
      return res.status(400).json({
        message: "Invalid or inactive category",
      });
    }

    article.title = title;
    article.content = content;
    article.excerpt = excerpt;
    article.featuredImage = featuredImage;
    article.category = category.name;
    article.categoryId = category._id;
    article.tags = tags || [];
    article.readTime =
      readTime || Math.ceil(content.split(" ").length / 200);
      if (metaTitle !== undefined) article.metaTitle = metaTitle;
if (metaDescription !== undefined) article.metaDescription = metaDescription;

    await article.save();

    res.status(200).json({
      success: true,
      message: "Article updated successfully",
      article,
    });
  } catch (error) {
    console.error("Admin update article error:", error);

    res.status(500).json({
      message: "Error updating article",
    });
  }
};
//delete article by admin
export const deleteArticlebyAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({
        message: "Article not found",
      });
    }

   if (article.authorType !== "Admin" && article.authorType !== "Super Admin") {
  return res.status(403).json({
    message: "Only admin-created articles can be edited here",
  });
}

    await Article.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Article deleted successfully",
    });
  } catch (error) {
    console.error("Delete article admin error:", error);

    res.status(500).json({
      message: "Error deleting article",
    });
  }
};