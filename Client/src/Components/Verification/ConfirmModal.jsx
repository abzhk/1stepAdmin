import React from "react";

const ConfirmModal = ({
  action,
  reason,
  setReason,
  onConfirm,
  category,       
  setCategory,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl p-5 w-full max-w-sm shadow-xl">

        {action === "reject" && (
  <div className="mt-3">
    <label className="text-xs font-semibold">Rejection Category</label>

    <select
      value={category}
      onChange={(e) => setCategory(e.target.value)}
      className="w-full mt-1 border rounded-lg p-2 text-sm"
    >
      <option value="">Select category</option>
      <option value="invalid_document">Invalid document</option>
      <option value="blurry_image">Blurry image</option>
      <option value="registration_mismatch">Registration mismatch</option>
      <option value="incomplete_profile">Incomplete profile</option>
      <option value="duplicate_account">Duplicate account</option>
      <option value="other">Other</option>
    </select>
  </div>
)}
        <h3 className="text-sm font-bold mb-3 capitalize">
          {action} Confirmation
        </h3>

        <textarea
          autoFocus
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter reason..."
          className="w-full border p-2 rounded mb-4 outline-none"
        />

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 border p-2 rounded"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 bg-[#2d4a36] text-white p-2 rounded"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;