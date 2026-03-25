import React, { useEffect, useState } from "react";
import { api } from "../../utils/api.js";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { storage } from "../../firebase.js";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useSelector } from "react-redux";
import Editor from "../../utils/Editor.jsx";

const AddArticle = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [categories, setCategories] = useState([]);
  const role = useSelector((state) => state.auth.user?.role);
  console.log(role);
  const [tags, setTags] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    featuredImage: "",
    categoryId: "",
    tags: "",
    featured: false,
    position: "",
    metaTitle: "",
    metaDescription: "",
  });

  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await api("/api/services/articleTag?format=raw");
        setTags(res.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load tags");
      }
    };

    fetchTags();
  }, []);

  const handleTagSelect = (tag) => {
    const exists = selectedTags.find((t) => t._id === tag._id);

    if (exists) {
      setSelectedTags(selectedTags.filter((t) => t._id !== tag._id));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    uploadImage(file);
  };

  const uploadImage = (file) => {
    setUploading(true);

    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, "articles/" + fileName);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(prog);
      },
      (error) => {
        console.error(error);
        toast.error("Image upload failed");
        setUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormData((prev) => ({
            ...prev,
            featuredImage: downloadURL,
          }));

          toast.success("Image uploaded");
          setUploading(false);
        });
      },
    );
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api("/api/category/getallcategories");
        setCategories(data.categories || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load categories");
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };
  const tagInputValue = selectedTags
    .map((t) => t.articleTag || t.label)
    .join(", ");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = {
        ...formData,
        tags: selectedTags.map((t) => t._id),
      };

      const endpoint = id
        ? `/api/article/admin/update/${id}`
        : `/api/article/create`;

      const method = id ? "PUT" : "POST";

      const data = await api(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      if (!data.success) {
        toast.error(data.message || "Operation failed");
        return;
      }

      toast.success(id ? "Article updated" : "Article created");

      navigate("/list-view-article");
      window.location.reload();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!id) return;

    const fetchArticle = async () => {
      try {
        const data = await api(`/api/article/${id}`);

        const article = data.article;

        setFormData({
          title: article.title,
          excerpt: article.excerpt,
          content: article.content,
          featuredImage: article.featuredImage,
          categoryId: article.categoryId?._id || "",
          tags: article.tags,
          featured: article.featured || false,
          position: article.position || "",
          metaTitle: article.metaTitle || "",
  metaDescription: article.metaDescription || "",
        });

        setSelectedTags(article.tags || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load article");
      }
    };

    fetchArticle();
  }, [id]);

  return (
    <div className="min-h-screen bg-offwhite py-8 px-4 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={() => navigate("/viewarticle")}
        className="flex gap-2 items-center mb-6 text-darkgreen hover:text-green-700"
      >
        <IoIosArrowRoundBack size={22} />
        Back
      </button>
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-8 py-6 bg-darkgreen">
            <h2 className="text-xl font-semibold text-white">
              {id ? "Edit Article" : "Create New Article"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-8">
              <div className="space-y-2">
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full  bg-offwhite border rounded-lg px-3 py-2 focus:ring-2 focus:ring-darkgreen outline-none"
                />
              </div>

              <div className=" gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Excerpt
                  </label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleChange}
                    rows="4"
                    required
                    className="w-full bg-offwhite border rounded-lg px-3 py-2 focus:ring-2 focus:ring-darkgreen outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Meta Title 
                  </label>
                  <input
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleChange}
                    className="w-full bg-offwhite border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Meta Description 
                  </label>
                  <textarea
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleChange}
                    rows="3"
                    className="w-full bg-offwhite border rounded-lg px-3 py-2"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Category
                    </label>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                      required
                      className="w-full  bg-offwhite border rounded-lg px-3 py-2 focus:ring-2 focus:ring-darkgreen outline-none"
                    >
                      <option value="">Select Category</option>

                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Position (1–10)
                    </label>

                    <input
                      type="number"
                      name="position"
                      min="1"
                      max="10"
                      value={formData.position || ""}
                      onChange={handleChange}
                      className="w-full bg-offwhite border rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Featured Image
                    </label>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full border rounded-lg px-3 py-2 bg-offwhite"
                    />

                    {uploading && (
                      <p className="text-sm text-gray-500">
                        Uploading... {progress.toFixed(0)}%
                      </p>
                    )}
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium mb-1">
                      Tags
                    </label>

                    <input
                      value={tagInputValue}
                      readOnly
                      onFocus={() => setShowDropdown(true)}
                      onBlur={() =>
                        setTimeout(() => setShowDropdown(false), 200)
                      }
                      placeholder="Select tags"
                      className="w-full bg-offwhite border rounded-lg px-3 py-2 cursor-pointer focus:ring-2 focus:ring-darkgreen outline-none"
                    />

                    {showDropdown && (
                      <div className="absolute w-full bg-white border rounded-lg mt-1 max-h-40 overflow-y-auto shadow z-10">
                        {tags.map((tag) => {
                          const selected = selectedTags.some(
                            (t) => t._id === tag._id,
                          );

                          return (
                            <div
                              key={tag._id}
                              onClick={() => handleTagSelect(tag)}
                              className={`px-3 py-2 cursor-pointer text-sm ${
                                selected
                                  ? "bg-offwhite text-black"
                                  : "hover:bg-gray-100"
                              }`}
                            >
                              {tag.label}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-2">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="w-4 h-4 accent-darkgreen"
                />

                <label className="text-sm font-medium text-gray-700">
                  Mark as Featured Article
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Content
                </label>

                <Editor
                  value={formData.content}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      content: value,
                    }))
                  }
                />
              </div>

              <button
                type="submit"
                disabled={loading || uploading}
                className="w-full bg-darkgreen text-white py-3 rounded-lg font-medium hover:opacity-90 transition"
              >
                {loading
                  ? id
                    ? "Updating..."
                    : "Creating..."
                  : uploading
                    ? "Uploading Image..."
                    : id
                      ? "Update Article"
                      : "Create Article"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddArticle;
