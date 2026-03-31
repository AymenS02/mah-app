// server/models/Registration.js
import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    status: { type: String, enum: ["registered", "cancelled"], default: "registered" },
  },
  { timestamps: true }
);

// Prevent duplicate registrations
registrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export const Registration = mongoose.model("Registration", registrationSchema);
