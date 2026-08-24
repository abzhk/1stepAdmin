import React, { useState, useEffect, useRef } from "react";
import { FaUserEdit, FaCamera } from "react-icons/fa";
import { IoSaveOutline } from "react-icons/io5";
import { api } from "../../utils/api.js";
import toast from "react-hot-toast";
import { storage } from "../../firebase.js";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import PermissionGuard from "../../Components/PermissionGuard.jsx";
import { MODULES, ACTIONS } from "../../constants/permission.js";
import { setUser } from "../../redux/slice/authSlice";
import { useDispatch } from "react-redux";

// ── Upload constraints ─────────────────────────────────────────────────────────
const ALLOWED_TYPES     = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB       = 5;
const MAX_SIZE_BYTES    = MAX_SIZE_MB * 1024 * 1024;

const AdminProfile = () => {
  const fileInputRef = useRef(null);
  const dispatch     = useDispatch();

  const [profile,      setProfile]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [edit,         setEdit]         = useState(false);
  const [form,         setForm]         = useState({ username: "", email: "", profilePicture: "" });
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading,    setUploading]    = useState(false);
  const [progress,     setProgress]     = useState(0);

  // ── Fetch ──────────────────────────────────────────────────────────────────────
  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api("/api/admin/profile", { method: "GET" });
      if (res.success) {
        setProfile(res.user);
        setForm({
          username:       res.user.username,
          email:          res.user.email,
          profilePicture: res.user.profilePicture,
        });
      }
    } catch (err) {
      console.error("[AdminProfile] fetch failed:", err);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  // ── Image Upload ───────────────────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Only JPG, PNG or WebP images are allowed");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    // Validate size
    if (file.size > MAX_SIZE_BYTES) {
      toast.error(`Image must be smaller than ${MAX_SIZE_MB}MB`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setImagePreview(URL.createObjectURL(file));
    uploadImage(file);
  };

  const uploadImage = (file) => {
    setUploading(true);
    setProgress(0);

    const fileName   = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `adminProfiles/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setProgress(pct);
      },
      (err) => {
        console.error("[AdminProfile] upload error:", err);
        toast.error("Image upload failed — please try again");
        setUploading(false);
        setProgress(0);
        setImagePreview(null); // revert preview to saved picture
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setForm((prev) => ({ ...prev, profilePicture: downloadURL }));
          toast.success("Image ready — click Save Changes to apply");
          setUploading(false);
          setProgress(100);
        });
      }
    );
  };

  // ── Save ───────────────────────────────────────────────────────────────────────
  const handleUpdate = async () => {
    if (uploading) {
      toast.error("Please wait until the image upload is complete");
      return;
    }
    if (!form.username?.trim()) {
      toast.error("Username cannot be empty");
      return;
    }

    try {
      // Only send username + profilePicture — email is immutable
      const res = await api("/api/admin/update-profile", {
        method: "PUT",
        body: JSON.stringify({
          username:       form.username.trim(),
          profilePicture: form.profilePicture,
        }),
      });

      if (res.success) {
        toast.success("Profile updated successfully");
        setImagePreview(null);
        setProgress(0);
        setProfile(res.user);
        setForm({
          username:       res.user.username,
          email:          res.user.email,
          profilePicture: res.user.profilePicture,
        });
        dispatch(setUser(res.user));
        setEdit(false);
      } else {
        toast.error(res.message || "Update failed");
      }
    } catch (err) {
      console.error("[AdminProfile] update failed:", err);
      toast.error("Update failed — please try again");
    }
  };

  // ── Cancel ─────────────────────────────────────────────────────────────────────
  const handleCancel = () => {
    setForm({
      username:       profile.username,
      email:          profile.email,
      profilePicture: profile.profilePicture,
    });
    setImagePreview(null);
    setUploading(false);
    setProgress(0);
    setEdit(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Loading / Error states ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2d4a36]/20 border-t-[#2d4a36]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <p className="text-sm text-gray-500">Could not load profile.</p>
        <button
          onClick={fetchProfile}
          className="rounded-xl bg-[#2d4a36] px-4 py-2 text-sm font-bold text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite p-4 md:p-8 text-[#2d4a36]">
      <div className="mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-xl shadow-[#8fa797]/10">
          <div className="bg-offwhite p-6 shadow-xl shadow-[#8fa797]/10">
            <div className="bg-white rounded-2xl">

              {/* HEADER */}
              <div className="relative flex flex-col items-center pb-8">

                {/* Gradient bar */}
                <div className="absolute inset-x-0 top-0 h-36 rounded-t-3xl bg-gradient-to-r from-[#2d4a36] to-[#426b50]" />

                {/* Avatar */}
                <div className="relative z-10 mt-16 h-36 w-36">
                  <img
                    src={imagePreview || form.profilePicture}
                    alt="profile"
                    className="h-full w-full rounded-full border-4 border-white object-cover shadow-lg"
                  />
                  {edit && (
                    <button
                      type="button"
                      onClick={() => !uploading && fileInputRef.current?.click()}
                      disabled={uploading}
                      title={uploading ? "Upload in progress..." : "Change photo"}
                      className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full bg-yellow text-[#2d4a36] shadow-md transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaCamera />
                    </button>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp"
                />

                {/* Upload progress bar — only shown while uploading */}
                {uploading && (
                  <div className="mt-4 w-48">
                    <div className="mb-1 flex justify-between text-[11px] font-medium text-[#8fa797]">
                      <span>Uploading photo...</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#8fa797]/20">
                      <div
                        className="h-full rounded-full bg-[#2d4a36] transition-all duration-200"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <h2 className="mt-4 text-tabheading uppercase">
                  {form.username || "Admin"}
                </h2>
                <p className="text-tab-subtext">Manage your profile information</p>
              </div>

              {/* BODY */}
              <div className="px-6 md:px-12 pb-10 pt-4">

                <h2 className="mb-6 border-b border-gray-100 pb-2 text-tab-subheading">
                  Admin Details
                </h2>

                <div className="grid md:grid-cols-2 gap-6">

                  {/* USERNAME */}
                  <div>
                    <label className="text-label">Username</label>
                    <input
                      type="text"
                      disabled={!edit}
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      maxLength={30}
                      className="w-full mt-2 p-3 rounded-xl border-2 border-greenmuted bg-white focus:border-[#ffd333] focus:ring-2 focus:ring-[#ffd333]/50 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>

                  {/* EMAIL — always read-only */}
                  <div>
                    <label className="text-label">
                      Email{" "}
                      <span className="text-[10px] font-normal text-[#8fa797] ml-1">(cannot be changed)</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      disabled
                      className="w-full mt-2 p-3 rounded-xl border-2 border-greenmuted bg-gray-100 text-gray-400 cursor-not-allowed"
                    />
                  </div>

                  {/* ROLE */}
                  <div>
                    <label className="text-label">Role</label>
                    <div className="mt-2 p-3 rounded-xl bg-softpeach/70 text-white font-semibold capitalize">
                      {profile.role}
                    </div>
                  </div>

                </div>

                {/* ACTIONS */}
                <div className="mt-10 flex justify-end gap-4 border-t border-gray-100 pt-6">

                  {!edit ? (
                    <PermissionGuard module={MODULES.SETTINGS} action={ACTIONS.UPDATE}>
                      <button
                        type="button"
                        onClick={() => setEdit(true)}
                        className="flex items-center gap-2 rounded-xl px-6 py-3 bg-[#2d4a36] text-white hover:bg-[#2d4a36]/90 hover:scale-105 transition"
                      >
                        <FaUserEdit /> Edit
                      </button>
                    </PermissionGuard>
                  ) : (
                    <PermissionGuard module={MODULES.SETTINGS} action={ACTIONS.UPDATE}>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={handleCancel}
                          disabled={uploading}
                          className="rounded-xl border border-gray-300 bg-gray-100 px-6 py-3 text-gray-700 hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleUpdate}
                          disabled={uploading}
                          className="flex items-center gap-2 rounded-xl px-6 py-3 bg-[#2d4a36] text-white shadow-lg hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                          <IoSaveOutline />
                          {uploading ? "Uploading..." : "Save Changes"}
                        </button>
                      </div>
                    </PermissionGuard>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;