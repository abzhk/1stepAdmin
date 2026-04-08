import React, { useState } from "react";
import { FaLock, FaBell, FaUserShield } from "react-icons/fa";
import { MdDevices, MdNotifications } from "react-icons/md";
import { IoSaveOutline } from "react-icons/io5";

const ProfileSettings = () => {
  const [settings, setSettings] = useState({
    twoFactor: false,
    loginAlerts: true,
    emailNotifications: true,
    systemAlerts: true,
    messageAccess: true,
    restrictActions: false,
  });

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="min-h-screen bg-offwhite p-6 text-[#2d4a36]">
      <div className="max-w-5xl mx-auto">

        {/* CARD */}
        <div className="bg-white rounded-3xl shadow-xl p-6">

          {/* HEADER */}
          <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

          {/* ================= SECURITY ================= */}
          <div className="mb-8">
            <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
              <FaLock /> Security
            </h2>

            <div className="space-y-4">

              {/* CHANGE PASSWORD */}
              <div className="flex justify-between items-center p-4 rounded-xl border">
                <div>
                  <p className="font-semibold">Change Password</p>
                  <p className="text-sm text-gray-500">
                    Update your account password
                  </p>
                </div>
                <button className="px-4 py-2 bg-darkgreen text-white rounded-lg">
                  Change
                </button>
              </div>

              {/* 2FA */}
              <div className="flex justify-between items-center p-4 rounded-xl border">
                <div>
                  <p className="font-semibold">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-500">
                    Add extra security to your account
                  </p>
                </div>
                <Toggle
                  enabled={settings.twoFactor}
                  onClick={() => handleToggle("twoFactor")}
                />
              </div>

              {/* LOGIN ALERT */}
              <div className="flex justify-between items-center p-4 rounded-xl border">
                <div>
                  <p className="font-semibold">Login Alerts</p>
                  <p className="text-sm text-gray-500">
                    Get notified on new login
                  </p>
                </div>
                <Toggle
                  enabled={settings.loginAlerts}
                  onClick={() => handleToggle("loginAlerts")}
                />
              </div>

            </div>
          </div>

          {/* ================= ACCESS ================= */}
          <div className="mb-8">
            <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
              <FaUserShield /> Access Control
            </h2>

            <div className="space-y-4">

              <div className="flex justify-between items-center p-4 rounded-xl border">
                <div>
                  <p className="font-semibold">Restrict Sensitive Actions</p>
                  <p className="text-sm text-gray-500">
                    Require extra verification
                  </p>
                </div>
                <Toggle
                  enabled={settings.restrictActions}
                  onClick={() => handleToggle("restrictActions")}
                />
              </div>

              <div className="flex justify-between items-center p-4 rounded-xl border">
                <div>
                  <p className="font-semibold">Active Sessions</p>
                  <p className="text-sm text-gray-500">
                    Manage logged-in devices
                  </p>
                </div>
                <button className="px-4 py-2 bg-darkgreen text-white rounded-lg">
                  View
                </button>
              </div>

            </div>
          </div>

          {/* ================= NOTIFICATIONS ================= */}
          <div className="mb-8">
            <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
              <MdNotifications /> Notifications
            </h2>

            <div className="space-y-4">

              <div className="flex justify-between items-center p-4 rounded-xl border">
                <p>Email Notifications</p>
                <Toggle
                  enabled={settings.emailNotifications}
                  onClick={() => handleToggle("emailNotifications")}
                />
              </div>

              <div className="flex justify-between items-center p-4 rounded-xl border">
                <p>System Alerts</p>
                <Toggle
                  enabled={settings.systemAlerts}
                  onClick={() => handleToggle("systemAlerts")}
                />
              </div>

            </div>
          </div>

          {/* ================= COMMUNICATION ================= */}
          <div className="mb-8">
            <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
              <FaBell /> Communication
            </h2>

            <div className="flex justify-between items-center p-4 rounded-xl border">
              <div>
                <p className="font-semibold">Message Access</p>
                <p className="text-sm text-gray-500">
                  Allow sending & receiving messages
                </p>
              </div>
              <Toggle
                enabled={settings.messageAccess}
                onClick={() => handleToggle("messageAccess")}
              />
            </div>
          </div>

          {/* SAVE BUTTON */}
          <div className="flex justify-end border-t pt-6">
            <button className="flex items-center gap-2 px-6 py-3 bg-[#2d4a36] text-white rounded-xl shadow-lg hover:scale-105 transition">
              <IoSaveOutline /> Save Settings
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;





/* ================= TOGGLE COMPONENT ================= */

const Toggle = ({ enabled, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
        enabled ? "bg-green-600" : "bg-gray-300"
      }`}
    >
      <div
        className={`w-4 h-4 bg-white rounded-full shadow transform transition ${
          enabled ? "translate-x-6" : ""
        }`}
      />
    </button>
  );
};