import React from "react";

const ConfirmModal = ({
  action,
  reason,
  setReason,
  onConfirm,
  category,       
  setCategory,
  onCancel,
  isLoading
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl p-5 w-full max-w-sm shadow-xl">

        {action === "reject" && (
  <div className="mt-3">
    <label className="text-label ">Rejection Category</label>

    <select
      value={category}
      onChange={(e) => setCategory(e.target.value)}
      disabled={isLoading}
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
        <h3 className="text-label mt-2 mb-2 capitalize">
          {action} Confirmation
        </h3>

        <textarea
          autoFocus
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={isLoading}
          placeholder="Enter reason..."
           className="w-full resize-none rounded-lg border border-gray-300 bg-gray-50 
                 px-3 py-2 text-sm text-gray-800 
                 placeholder-gray-400
                 focus:outline-none focus:ring-2 focus:ring-yellow focus:border-yellow
                 transition-all duration-200"
    />

        <div className="flex gap-2 mt-4">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 border p-2 rounded-2xl disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-[#2d4a36] text-white p-2 rounded-2xl disabled:opacity-50"
          >
            {isLoading ? "Processing..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;