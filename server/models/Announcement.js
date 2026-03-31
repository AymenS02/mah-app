// server/models/Announcement.js
import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    author: { type: String, default: "MAH Admin" },
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Announcement = mongoose.model("Announcement", announcementSchema);
