import React from "react";

const ConfirmModal = ({
  action,
  reason,
  setReason,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl p-5 w-full max-w-sm shadow-xl">
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