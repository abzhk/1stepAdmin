import mongoose from "mongoose";

const sessionNoteSchema = new mongoose.Schema(
    {
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            required: true,
            unique: true,
        },
        provider: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "provider",
            required: true,
        },
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        providerNote: {
            content: { type: String, default: "" },
            updatedAt: { type: Date },
            isShared: { type: Boolean, default: false },
        },
        parentNote: {
            content: { type: String, default: "" },
            updatedAt: { type: Date },
        },
    },
    { timestamps: true }
);

const SessionNote = mongoose.model("SessionNote", sessionNoteSchema);

export default SessionNote;
