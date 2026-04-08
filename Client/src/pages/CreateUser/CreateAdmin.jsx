import React, { useState, useRef } from "react";
import toast from "react-hot-toast";
import { api } from "../../utils/api.js";
import { storage } from "../../firebase.js";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { FaCamera, FaUser } from "react-icons/fa";

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
      () => {
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
    <div className="min-h-screen bg-Offwhite p-6 flex items-center justify-center">
      <div className="w-full ">

        {/* CARD */}
         <div className="w-full relative overflow-hidden rounded-3xl bg-white p-6 shadow-xl shadow-[#8fa797]/10">
      <div className=" w-full bg-offwhite p-6 shadow-xl shadow-[#8fa797]/10">
      <div className="w-full bg-white rounded-2xl">

          {/* HEADER */}
          <div className="relative flex flex-col items-center pb-8">
            <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-r from-[#2d4a36] to-[#426b50] rounded-t-2xl" />

            {/* AVATAR */}
            <div
              onClick={() => fileInputRef.current.click()}
              className="relative z-10 mt-16 h-32 w-32 cursor-pointer"
            >
              <div className="h-full w-full rounded-full border-4 border-white overflow-hidden shadow-lg flex items-center justify-center bg-gray-100">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUser className="text-gray-400 text-3xl" />
                )}
              </div>

              {/* CAMERA ICON */}
              <div className="absolute bottom-1 right-1 bg-yellow-400 text-[#2d4a36] p-2 rounded-full shadow">
                <FaCamera size={14} />
              </div>
            </div>

            <h2 className="mt-4 text-2xl font-bold text-[#2d4a36]">
              Create Admin
            </h2>
            <p className="text-sm text-gray-500">
              Add a new administrator account
            </p>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />

            {uploading && (
              <p className="text-sm text-gray-500 mt-2">
                Uploading... {progress.toFixed(0)}%
              </p>
            )}
          </div>

          {/* FORM */}
          <div className="px-6 pb-10 pt-4 md:px-12">
            <form onSubmit={handleSubmit}>

              {/* ROLE */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-[#2d4a36] mb-2">
                  Role
                </label>
                <input
                  value="Admin"
                  disabled
                  className="w-full rounded-xl border-2 border-gray-200 bg-gray-100 p-3 text-gray-500"
                />
              </div>

              {/* GRID */}
              <div className="grid md:grid-cols-2 gap-6">

                {/* USERNAME */}
                <div>
                  <label className="block text-sm font-bold text-[#2d4a36] mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full rounded-xl border-2 border-maincolor-sageGreen p-3 focus:ring-2 focus:ring-yellow-300"
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <label className="block text-sm font-bold text-[#2d4a36] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border-2 border-maincolor-sageGreen p-3 focus:ring-2 focus:ring-yellow-300"
                  />
                </div>

                {/* PASSWORD */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-[#2d4a36] mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full rounded-xl border-2 border-maincolor-sageGreen p-3 focus:ring-2 focus:ring-yellow-300"
                  />
                </div>
              </div>

              {/* ERROR */}
              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* BUTTON */}
              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="bg-[#2d4a36] text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:scale-105 transition disabled:opacity-60"
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
      </div>
      </div>
      </div>
    </div>
  );
};

export default CreateAdmin;