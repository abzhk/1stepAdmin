import React, { useState, useEffect, useRef } from "react";
import { FaUserEdit, FaCamera } from "react-icons/fa";
import { IoSaveOutline } from "react-icons/io5";
import { MdEmail } from "react-icons/md";
import { api } from "../../utils/api";
import toast from "react-hot-toast";
import { storage } from "../../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import PermissionGuard from "../../Components/PermissionGuard.jsx";
import { MODULES, ACTIONS } from "../../constants/permission.js";

const AdminProfile = () => {
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [edit, setEdit] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    profilePicture: "",
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  //  Fetch Profile
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api("/api/admin/profile", {
        method: "GET",
      });

      if (res.success) {
        setUser(res.user);
        setForm({
          username: res.user.username,
          email: res.user.email,
          profilePicture: res.user.profilePicture,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // IMAGE UPLOAD
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
          setForm((prev) => ({
            ...prev,
            profilePicture: downloadURL,
          }));
          toast.success("Image uploaded");
          setUploading(false);
        });
      }
    );
  };

  const handleUpdate = async () => {
    try {
      const res = await api("/api/admin/update-profile", {
        method: "PUT",
        body: JSON.stringify(form),
      });

      if (res.success) {
        toast.success("Profile updated");
        setEdit(false);
        fetchProfile();
      }
    } catch (err) {
      toast.error("Update failed");
    }
  };

  if (!user) return <div className="p-6">Loading...</div>;

 return (
  <div className="min-h-screen bg-offwhite p-4 md:p-8 text-[#2d4a36]">
    <div className=" mx-auto">

      <div className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-xl shadow-[#8fa797]/10">
      <div className=" bg-offwhite p-6 shadow-xl shadow-[#8fa797]/10">
      <div className="bg-white rounded-2xl">

        {/* HEADER SECTION */}
        <div className="relative flex flex-col items-center pb-8">

          {/* Gradient */}
           <div className="absolute inset-x-0 top-0 h-36 rounded-t-3xl bg-gradient-to-r from-[#2d4a36] to-[#426b50]" />

          {/* IMAGE */}
          <div className="relative z-10 mt-16 h-36 w-36">
            <img
              src={imagePreview || form.profilePicture}
              alt="profile"
              className="h-full w-full rounded-full border-4 border-white object-cover shadow-lg"
            />

            {edit && (
              <button
                onClick={() => fileInputRef.current.click()}
                className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full bg-yellow text-[#2d4a36] shadow-md"
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
          />

          <h2 className="mt-4 text-tabheading uppercase">
            {form.username || "Admin"}
          </h2>

          <p className="text-tab-subtext">
            Manage your profile information
          </p>
        </div>

        {/* BODY */}
        <div className="px-6 md:px-12 pb-10 pt-4">

          {/* SECTION TITLE */}
          <h2 className="mb-6 border-b border-gray-100 pb-2 text-tab-subheading">
            Admin Details
          </h2>

          {/* FORM GRID */}
          <div className="grid md:grid-cols-2 gap-6">

            {/* USERNAME */}
            <div>
              <label className="text-label">Username</label>
              <input
                type="text"
                disabled={!edit}
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
                className="w-full mt-2 p-3 rounded-xl border-2 border-greenmuted bg-white focus:border-[#ffd333] focus:ring-2 focus:ring-[#ffd333]/50 outline-none"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-label">Email</label>
              <input
                type="email"
                value={form.email}
                disabled
                className="w-full mt-2 p-3 rounded-xl border-2 border-greenmuted bg-gray-100"
              />
            </div>

            {/* ROLE */}
            <div>
              <label className="text-label">Role</label>
              <div className="mt-2 p-3 rounded-xl bg-softpeach/70  text-white font-semibold">
                {user.role}
              </div>
            </div>

          </div>

          {/* ACTION BUTTON */}
          <div className="mt-10 flex justify-end gap-4 border-t  border-gray-100 pt-6">

            {!edit ? (
             <PermissionGuard module={MODULES.SETTINGS} action={ACTIONS.UPDATE}>
  <button
    onClick={() => setEdit(true)}
    className="flex items-center gap-2 rounded-xl px-6 py-3 bg-[#2d4a36] text-white"
  >
    <FaUserEdit /> Edit
  </button>
</PermissionGuard>
            ) : (
              <PermissionGuard module={MODULES.SETTINGS} action={ACTIONS.UPDATE}>
              <button
                onClick={handleUpdate}
                className="flex items-center gap-2 rounded-xl px-6 py-3 bg-[#2d4a36] text-white shadow-lg hover:scale-105 transition"
              >
                <IoSaveOutline /> Save Changes
              </button>
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