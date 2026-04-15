import React, { useEffect, useState } from "react";
import { api } from "../../utils/api.js";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { storage } from "../../firebase.js";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useSelector } from "react-redux";
import Editor from "../../utils/Editor.jsx";
import { MdDelete, MdCloudUpload } from "react-icons/md";

const AddArticle = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [categories, setCategories] = useState([]);
  const role = useSelector((state) => state.auth.user?.role);
  const [tags, setTags] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    featuredImage: [],
    categoryId: "",
    tags: "",
    featured: false,
    position: "",
    metaTitle: "",
    metaDescription: "",
  });

  const [loading, setLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);

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
  const files = Array.from(e.target.files);
  if (!files.length) return;

  const remainingSlots = 3 - imagePreviews.length;

  if (remainingSlots <= 0) {
    toast.error("Maximum 3 images allowed");
    return;
  }

  if (files.length > remainingSlots) {
    toast.error(`You can only upload ${remainingSlots} more image(s)`);
    files.splice(remainingSlots); // limit files
  }

  const newPreviews = files.map(file => ({
    id: Date.now() + Math.random(),
    file: file,
    preview: URL.createObjectURL(file),
    uploading: true,
    progress: 0,
    url: null
  }));

  setImagePreviews(prev => [...prev, ...newPreviews]);

  newPreviews.forEach(preview => {
    uploadImage(preview.file, preview.id);
  });
};

  const uploadImage = (file, previewId) => {
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, "articles/" + fileName);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImagePreviews(prev =>
          prev.map(preview =>
            preview.id === previewId
              ? { ...preview, progress: progress }
              : preview
          )
        );
      },
      (error) => {
        console.error(error);
        toast.error(`Failed to upload ${file.name}`);
        setImagePreviews(prev => prev.filter(preview => preview.id !== previewId));
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImagePreviews(prev =>
            prev.map(preview =>
              preview.id === previewId
                ? { ...preview, uploading: false, url: downloadURL, progress: 100 }
                : preview
            )
          );

          setFormData(prev => ({
            ...prev,
            featuredImage: [...prev.featuredImage, downloadURL]
          }));

          toast.success(`${file.name} uploaded successfully`);
        });
      },
    );
  };

  const removeImage = (previewId, imageUrl) => {
    setImagePreviews(prev => prev.filter(preview => preview.id !== previewId));
    
    if (imageUrl) {
      setFormData(prev => ({
        ...prev,
        featuredImage: prev.featuredImage.filter(url => url !== imageUrl)
      }));
    } else {
      const previewToRemove = imagePreviews.find(p => p.id === previewId);
      if (previewToRemove && previewToRemove.preview) {
        URL.revokeObjectURL(previewToRemove.preview);
      }
    }
    
    toast.success("Image removed");
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api("/api/category/active");
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
      [name]:
        name === "position"
          ? value === ""
            ? ""
            : Number(value)
          : type === "checkbox"
          ? checked
          : value,
    });
  };
  
  const tagInputValue = selectedTags
    .map((t) => t.articleTag || t.label)
    .join(", ");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const stillUploading = imagePreviews.some(preview => preview.uploading);
    if (stillUploading) {
      toast.error("Please wait for all images to finish uploading");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...formData,
        position: formData.position === "" ? null : Number(formData.position),
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
      toast.error(err?.message || "Something went wrong");
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
          featuredImage: article.featuredImage || [],
          categoryId: article.categoryId?._id || "",
          tags: article.tags,
          featured: article.featured || false,
          position: article.position || "",
          metaTitle: article.metaTitle || "",
          metaDescription: article.metaDescription || "",
        });

        setSelectedTags(article.tags || []);
        
        if (article.featuredImage && article.featuredImage.length > 0) {
          const existingPreviews = article.featuredImage.map((url, index) => ({
            id: `existing-${Date.now()}-${index}`,
            preview: url,
            uploading: false,
            progress: 100,
            url: url,
            isExisting: true
          }));
          setImagePreviews(existingPreviews);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load article");
      }
    };

    fetchArticle();
  }, [id]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => {
        if (preview.preview && preview.preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview.preview);
        }
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-offwhite py-8 px-4 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={() => navigate(id ? "/list-view-article" : "/viewarticle")}
        className="flex gap-2 items-center mb-6 text-darkgreen hover:text-green-700"
      >
        <IoIosArrowRoundBack size={22} />
        Back
      </button>
      
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Side - Form */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="px-8 py-6 bg-darkgreen">
                <h2 className="text-outerheader  text-white">
                  {id ? "Edit Article" : "Create New Article"}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-8">
                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className=" text-label mb-1">Title </label>
                    <input
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow"
                    />
                  </div>

                  <div>
                    <label className=" text-label mb-1">Excerpt </label>
                    <textarea
                      name="excerpt"
                      value={formData.excerpt}
                      onChange={handleChange}
                      rows="4"
                      required
                      className="w-full border border-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-label mb-1">Meta Title</label>
                      <input
                        name="metaTitle"
                        value={formData.metaTitle}
                        onChange={handleChange}
                        className="w-full border border-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow"
                      />
                    </div>

                    <div>
                      <label className="text-label mb-1">Meta Description</label>
                      <textarea
                        name="metaDescription"
                        value={formData.metaDescription}
                        onChange={handleChange}
                        rows="3"
                        className="w-full border border-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-label mb-1">Category </label>
                      <select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow"
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
                      <label className="text-label mb-1">Position (1–10)</label>
                      <input
                        type="number"
                        name="position"
                        min="1"
                        max="10"
                        value={formData.position || ""}
                        onChange={handleChange}
                        className="w-full border border-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow"
                      />
                    </div>

                    <div>
                      <label className="text-label mb-1">Featured Images</label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={imagePreviews.length >= 3}
                        onChange={handleImageChange}
                        className="w-full border border-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow "
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        You can select multiple images
                      </p>
                    </div>

                    <div className="relative">
                      <label className="text-label mb-1">Tags</label>
                      <input
                        value={tagInputValue}
                        readOnly
                        onFocus={() => setShowDropdown(true)}
                        onBlur={() =>
                          setTimeout(() => setShowDropdown(false), 200)
                        }
                        placeholder="Select tags"
                        className="w-full border border-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow"
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
                                    ? " text-black"
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

                  <div className="flex items-center gap-3">
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
                    <label className="text-label mb-1">Content *</label>
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
                    disabled={loading || imagePreviews.some(p => p.uploading)}
                    className="w-full bg-darkgreen text-white py-3 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
                  >
                    {loading
                      ? id
                        ? "Updating..."
                        : "Creating..."
                      : imagePreviews.some(p => p.uploading)
                      ? `Uploading Images (${imagePreviews.filter(p => p.uploading).length} left)...`
                      : id
                      ? "Update Article"
                      : "Create Article"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Side - Multiple Image Previews */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden sticky top-8">
              <div className="px-6 py-4 bg-darkgreen">
                <h3 className="text-outerheader text-white">
                  Image Previews ({imagePreviews.length})
                </h3>
              </div>
              
              <div className="p-6">
                {imagePreviews.length > 0 ? (
                  <div className="space-y-4">
                    {imagePreviews.map((preview) => (
                      <div
                        key={preview.id}
                        className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="relative">
                          <img
                            src={preview.preview}
                            alt="Preview"
                            className="w-full h-48 object-cover"
                          />
                          {preview.uploading && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center">
                             
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(preview.id, preview.url)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition shadow-lg"
                          >
                            <MdDelete size={18} />
                          </button>
                          {!preview.uploading && preview.url && (
                            <div className="absolute bottom-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                              Uploaded
                            </div>
                          )}
                        </div>
                        <div className="p-3 bg-gray-50">
                          <p className="text-xs text-gray-600 truncate">
                            {preview.file?.name || "Image"}
                          </p>
                         
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MdCloudUpload className="mx-auto text-5xl text-gray-300 mb-3" />
                    <p className="text-tab-subtext">
                      No images uploaded yet
                    </p>
                    <p className="text-cardfooter mt-1">
                      Select images to see previews here
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddArticle;