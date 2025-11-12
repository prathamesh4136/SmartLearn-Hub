import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subject: { type: String },
    className: { type: String },
    uploadedBy: {
      uid: { type: String },
      email: { type: String },
      name: { type: String },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    isFile: { type: Boolean, default: false },
    fileId: { type: mongoose.Schema.Types.ObjectId }, // Reference to GridFS file
    fileOriginalName: { type: String },
    fileMime: { type: String },
    fileSize: { type: Number }, // File size in bytes
    textContent: { type: String },
    visibility: { type: String, enum: ["public", "private"], default: "public" },
  },
  { timestamps: true }
);

// Index for better performance
NoteSchema.index({ "uploadedBy.uid": 1, createdAt: -1 });
NoteSchema.index({ visibility: 1, createdAt: -1 });

export default mongoose.models.Note || mongoose.model("Note", NoteSchema);