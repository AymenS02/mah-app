// server/models/VolunteerHours.js
import mongoose from "mongoose";

const volunteerHoursSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    description: { type: String, required: true, trim: true },
    hours: { type: Number, required: true, min: 0.5, max: 24 },
    date: { type: Date, required: true },
    verified: { type: Boolean, default: false },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

export const VolunteerHours = mongoose.model("VolunteerHours", volunteerHoursSchema);
