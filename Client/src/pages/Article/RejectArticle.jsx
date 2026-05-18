import React, { useState, useEffect } from "react";

const RejectArticle = ({ isOpen, onClose, onSubmit }) => {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (isOpen) setReason("");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-semibold mb-4">Reject Article</h2>
        <p className="text-gray-600 text-sm mb-3">
           provide a reason for rejection:
        </p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Type your rejection reason..."
          className="w-full border border-gray-300 rounded-lg p-3 h-28 focus:ring-2 "
        />

        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800"
          >
            Cancel
          </button>

          <button
            onClick={() => onSubmit(reason)}
            className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectArticle;
