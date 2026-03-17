import React, { useState, useRef } from "react";
import toast from "react-hot-toast";
import { api } from "../../utils/api.js";
import { storage } from "../../firebase.js";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { FaCamera,FaUser } from "react-icons/fa";

const CreateAdmin = () => {
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    profilePicture: "",
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    uploadImage(file);
  };

  const uploadImage = (file) => {
    setUploading(true);

    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, "adminProfiles/" + fileName);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const prog =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
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
            profilePicture: downloadURL,
          }));

          toast.success("Image uploaded");
          setUploading(false);
        });
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.email || !formData.password) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);

      const data = await api("/api/admin/create-admin", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (!data.success) {
        throw new Error(data.message || "Failed to create admin");
      }

      toast.success("Admin created successfully");

      setFormData({
        username: "",
        email: "",
        password: "",
        profilePicture: "",
      });

      setImagePreview(null);
    } catch (err) {
      toast.error(err.message || "Failed to create admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-offwhite flex justify-center items-center">
      <div className="w-full max-w-3xl bg-offwhite rounded-2xl p-10">

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 shadow bg-white rounded-2xl"
        >

          {/* ROLE */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Role
            </label>

            <select
              disabled
              className="w-full border border-gray-200 bg-gray-100 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
            >
              <option>Admin</option>
            </select>
          </div>


          {/* AVATAR UPLOAD */}
          <div className="md:col-span-2 flex flex-col items-center gap-3">

            <div
              onClick={() => fileInputRef.current.click()}
              className="relative w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer overflow-hidden border"
            >

              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaUser className="text-gray-400 text-2xl" />
              )}

              <div className="absolute bottom-0 right-4 bg-darkgreen text-white p-2 rounded-full shadow">
                <FaCamera size={12} />
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Click avatar to upload profile picture
            </p>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />

            {uploading && (
              <p className="text-sm text-gray-500">
                Uploading... {progress.toFixed(0)}%
              </p>
            )}
          </div>


          {/* USERNAME */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Username
            </label>

            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
              className="w-full border border-gray-200 bg-offwhite rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>


          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Email 
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              className="w-full border border-gray-200 bg-offwhite rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>


          {/* PASSWORD */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="w-full border border-gray-200 bg-offwhite rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>


          {/* ERROR */}
          {error && (
            <div className="md:col-span-2">
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            </div>
          )}


          {/* SUBMIT */}
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={loading || uploading}
              className="bg-peach text-white font-medium px-10 py-3 rounded-xl shadow-md hover:shadow-lg transition disabled:opacity-60"
            >
              {loading
                ? "Creating..."
                : uploading
                ? "Uploading Image..."
                : "Create Admin"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateAdmin;