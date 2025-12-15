import Article from "../model/Article/article.model.js";
import Provider from "../model/providermodel.js";
import Category from "../model/categorymodel.js";

// ============================================
// PUBLIC CONTROLLERS
// ============================================

// Get all categories (Public)
export const getAllCategories = async (req, res) => {
  try {
    // const { includeInactive } = req.query;

    // const query = includeInactive === "true" ? {} : { isActive: true };

    const categories = await Category.find().sort({ order: 1, name: 1 });

    res.status(200).json({
      success: true,
      categories,
      total: categories.length,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      message: "Error fetching categories",
    });
  }
};

// Get active categories with article count (Public)
export const getActiveCategoriesWithCount = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({
      order: 1,
      name: 1,
    });

    // Get article count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const count = await Article.countDocuments({
          category: category.name,
          status: "approved",
        });

        return {
          _id: category._id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          icon: category.icon,
          color: category.color,
          articleCount: count,
          order: category.order,
        };
      })
    );

    res.status(200).json({
      success: true,
      categories: categoriesWithCount,
    });
  } catch (error) {
    console.error("Get categories with count error:", error);
    res.status(500).json({
      message: "Error fetching categories",
    });
  }
};

// Get single category by slug (Public)
export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({ slug, isActive: true });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    // Get article count
    const articleCount = await Article.countDocuments({
      category: category.name,
      status: "approved",
    });

    res.status(200).json({
      success: true,
      category: {
        ...category.toObject(),
        articleCount,
      },
    });
  } catch (error) {
    console.error("Get category error:", error);
    res.status(500).json({
      message: "Error fetching category",
    });
  }
};

// ============================================
// ADMIN CONTROLLERS
// ============================================

// Create new category (Admin only)
export const createCategory = async (req, res) => {
  try {
    const { name, description, icon, color, order } = req.body;

    // Validation
    if (!name || !description) {
      return res.status(400).json({
        message: "Name and description are required",
      });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existingCategory) {
      return res.status(400).json({
        message: "Category already exists",
      });
    }

    const category = new Category({
      name,
      description,
      icon: icon || "📝",
      color: color || "#65467C",
      order: order || 0,
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({
      message: "Error creating category",
      error: error.message,
    });
  }
};

// Update category (Admin only)
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, color, order, isActive } = req.body;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    // If name is being changed, check for duplicates
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
        _id: { $ne: id },
      });

      if (existingCategory) {
        return res.status(400).json({
          message: "Category name already exists",
        });
      }

      // Update articles with old category name to new name
      await Article.updateMany({ category: category.name }, { category: name });
    }

    // Update fields
    if (name) category.name = name;
    if (description) category.description = description;
    if (icon !== undefined) category.icon = icon;
    if (color !== undefined) category.color = color;
    if (order !== undefined) category.order = order;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({
      message: "Error updating category",
      error: error.message,
    });
  }
};

// Delete category (Admin only)
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    // Check if category has articles
    const articleCount = await Article.countDocuments({
      category: category.name,
    });

    if (articleCount > 0) {
      return res.status(400).json({
        message: `Cannot delete category. It has ${articleCount} article(s). Please reassign or delete articles first.`,
        articleCount,
      });
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({
      message: "Error deleting category",
    });
  }
};

// Toggle category active status (Admin only)
export const toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    category.isActive = !category.isActive;
    await category.save();

    res.status(200).json({
      success: true,
      message: `Category ${
        category.isActive ? "activated" : "deactivated"
      } successfully`,
      category,
    });
  } catch (error) {
    console.error("Toggle category status error:", error);
    res.status(500).json({
      message: "Error toggling category status",
    });
  }
};

// Reorder categories (Admin only)
export const reorderCategories = async (req, res) => {
  try {
    const { categoryOrders } = req.body;
    // categoryOrders should be array of { id, order }

    if (!Array.isArray(categoryOrders)) {
      return res.status(400).json({
        message: "Invalid data format",
      });
    }

    // Update all categories with new order
    const updatePromises = categoryOrders.map(({ id, order }) =>
      Category.findByIdAndUpdate(id, { order })
    );

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: "Categories reordered successfully",
    });
  } catch (error) {
    console.error("Reorder categories error:", error);
    res.status(500).json({
      message: "Error reordering categories",
    });
  }
};

// Get category statistics (Admin only)
export const getCategoryStats = async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1 });

    const stats = await Promise.all(
      categories.map(async (category) => {
        const totalArticles = await Article.countDocuments({
          category: category.name,
        });

        const approvedArticles = await Article.countDocuments({
          category: category.name,
          status: "approved",
        });

        const pendingArticles = await Article.countDocuments({
          category: category.name,
          status: "pending",
        });

        const rejectedArticles = await Article.countDocuments({
          category: category.name,
          status: "rejected",
        });

        const totalViews = await Article.aggregate([
          { $match: { category: category.name, status: "approved" } },
          { $group: { _id: null, total: { $sum: "$views" } } },
        ]);

        return {
          category: {
            _id: category._id,
            name: category.name,
            slug: category.slug,
            isActive: category.isActive,
            icon: category.icon,
            color: category.color,
          },
          totalArticles,
          approvedArticles,
          pendingArticles,
          rejectedArticles,
          totalViews: totalViews[0]?.total || 0,
        };
      })
    );

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Get category stats error:", error);
    res.status(500).json({
      message: "Error fetching category statistics",
    });
  }
};

// Get all categories --
export const getViewAllCategories = async (req, res) => {
  try {
    const { 
      isActive, 
      sortBy = "order", 
      sortOrder = "asc",
      page,
      limit 
    } = req.query;


    const filter = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;


    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 0; 
    const skip = (pageNumber - 1) * pageSize;

    const categories = await Category.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(pageSize)
      .select("-__v");

    const totalCategories = await Category.countDocuments(filter);
    const totalPages = pageSize > 0 ? Math.ceil(totalCategories / pageSize) : 1;

    res.status(200).json({
      success: true,
      count: categories.length,
      total: totalCategories,
      page: pageNumber,
      pages: totalPages,
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      message: "Error fetching categories",
      error: error.message,
    });
  }
};
