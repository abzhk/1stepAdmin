import React, { useState } from "react";
import { api } from "../utils/api.js";
import toast from "react-hot-toast";

/**
 * DeactivateModal
 *
 * Reusable admin modal for account lifecycle actions.
 * Handles:
 *  - Deactivate  → POST /api/users/deactivate/:userId  { reason }
 *  - Reactivate  → POST /api/users/reactivate/:userId  { sendEmail, note }
 *
 * Props:
 *  - isOpen       : boolean
 *  - onClose      : () => void
 *  - user         : { _id, username, email, accountStatus, isActive }
 *  - mode         : "deactivate" | "reactivate"
 *  - onSuccess    : (updatedUser) => void   — callback after successful action
 */
function DeactivateModal({ isOpen, onClose, user, mode = "deactivate", onSuccess }) {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [sendEmail, setSendEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !user) return null;

  const isDeactivate = mode === "deactivate";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isDeactivate && reason.trim().length < 3) {
      setError("Please enter a reason (at least 3 characters).");
      return;
    }

    setLoading(true);
    try {
      const endpoint = isDeactivate
        ? `/api/users/deactivate/${user._id}`
        : `/api/users/reactivate/${user._id}`;

      const body = isDeactivate
        ? { reason: reason.trim() }
        : { sendEmail, note: note.trim() };

      const data = await api(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
      });

      toast.success(data.message || (isDeactivate ? "Account deactivated." : "Account reactivated."));
      onSuccess?.(data.user);
      handleClose();
    } catch (err) {
      setError(err.message || "Action failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason("");
    setNote("");
    setSendEmail(false);
    setError("");
    onClose();
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleClose}
    >
      {/* Modal panel */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-5 ${isDeactivate ? "bg-red-600" : "bg-green-600"}`}>
          <h2 className="text-white text-lg font-bold">
            {isDeactivate ? "Deactivate Account" : "Reactivate Account"}
          </h2>
          <p className="text-white/80 text-sm mt-1">
            {isDeactivate
              ? `You are deactivating the account for ${user.username || user.email}.`
              : `You are reactivating the account for ${user.username || user.email}.`}
          </p>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* User info summary */}
          <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 text-sm text-gray-600">
            <p><span className="font-medium text-gray-800">User:</span> {user.username}</p>
            <p><span className="font-medium text-gray-800">Email:</span> {user.email}</p>
            <p>
              <span className="font-medium text-gray-800">Current status: </span>
              <span className={`font-semibold ${user.accountStatus === "deactivated" ? "text-red-600" : "text-green-600"}`}>
                {user.accountStatus || (user.isActive ? "active" : "deactivated")}
              </span>
            </p>
          </div>

          {/* Deactivate — reason (required) */}
          {isDeactivate && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Reason for deactivation <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Terms of service violation, billing issue, admin review..."
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                maxLength={500}
                required
              />
              <p className="text-right text-xs text-gray-400 mt-1">{reason.length}/500</p>
              <p className="text-xs text-gray-500 mt-1">
                This reason will be included in the deactivation email sent to the user.
              </p>
            </div>
          )}

          {/* Reactivate — optional note + email toggle */}
          {!isDeactivate && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Admin note <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Internal note for audit log..."
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                  maxLength={300}
                />
              </div>

              {/* Email toggle */}
              <div className="flex items-start gap-3 bg-green-50 rounded-xl px-4 py-3 border border-green-100">
                <input
                  type="checkbox"
                  id="sendEmail"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="mt-0.5 accent-green-600 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="sendEmail" className="text-sm text-gray-700 cursor-pointer">
                  <span className="font-semibold text-green-700">Send reactivation email to user</span>
                  <br />
                  <span className="text-gray-500">
                    The user will receive an email confirming their account is restored with a sign-in link.
                    If unchecked, no email is sent.
                  </span>
                </label>
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-xl">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition disabled:opacity-60 ${
                isDeactivate
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading
                ? (isDeactivate ? "Deactivating..." : "Reactivating...")
                : (isDeactivate ? "Confirm Deactivate" : "Confirm Reactivate")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DeactivateModal;
