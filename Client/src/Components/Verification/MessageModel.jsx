import React, { useState } from "react";
import Backdrop from "./Backdrop";

const MessageModal = ({ applicant, onClose, onSend }) => {
  const [msg, setMsg] = useState("");
  const [channel, setChannel] = useState("email");

  return (
    <Backdrop>
      <div className="bg-white rounded-2xl shadow-xl border border-[#8fa797]/20 w-full max-w-sm p-6">
        <h3 className="text-sm font-bold text-[#2d4a36] mb-1">
          Message applicant
        </h3>

        <p className="text-xs text-[#8fa797] mb-4">
          {applicant.name} · {applicant.email}
        </p>

       <div className="flex gap-2 mb-3">
  {["email", "sms"].map((c) => {
    const isDisabled = c === "sms";

    return (
      <button
        key={c}
        type="button"
        disabled={isDisabled}
        onClick={() => {
          if (!isDisabled) {
            setChannel(c);
          }
        }}
        className={`flex-1 py-1.5 text-xs font-bold rounded-lg uppercase tracking-wide transition border
          ${
            isDisabled
              ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
              : channel === c
              ? "bg-[#2d4a36] text-[#F6F4F0] border-[#2d4a36]"
              : "border-[#8fa797]/30 text-[#2d4a36]/60 hover:bg-[#F6F4F0]"
          }`}
      >
        {c}
      </button>
    );
  })}
</div>

        <textarea
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          rows={4}
          placeholder={
            channel === "email"
              ? "Write your message to the applicant…"
              : "Short SMS (max 160 chars)"
          }
          maxLength={channel === "sms" ? 160 : undefined}
          className="w-full px-3 py-2 text-sm rounded-xl border border-[#8fa797]/30 resize-none"
        />

        {channel === "sms" && (
          <p className="text-[10px] text-[#8fa797] mt-1">
            {msg.length}/160
          </p>
        )}

        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2 border rounded-xl"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              onSend(channel, msg);
              onClose();
            }}
            disabled={!msg.trim()}
            className="flex-1 py-2 bg-[#2d4a36] text-white rounded-xl disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </div>
    </Backdrop>
  );
};

export default MessageModal;