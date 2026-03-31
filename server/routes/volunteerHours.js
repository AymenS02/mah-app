// server/routes/volunteerHours.js
import express from "express";
import { VolunteerHours } from "../models/VolunteerHours.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// POST /api/volunteer-hours – log volunteer hours
router.post("/", authenticate, async (req, res) => {
  try {
    const { description, hours, date } = req.body;
    if (!description || !hours || !date) {
      return res.status(400).json({ error: "Description, hours and date are required" });
    }
    const parsedHours = parseFloat(hours);
    if (isNaN(parsedHours) || parsedHours < 0.5 || parsedHours > 24) {
      return res.status(400).json({ error: "Hours must be between 0.5 and 24" });
    }
    const entry = new VolunteerHours({
      userId: req.user.id,
      description,
      hours: parsedHours,
      date: new Date(date),
    });
    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/volunteer-hours – fetch hours for logged-in student (admin sees all)
router.get("/", authenticate, async (req, res) => {
  try {
    const query = req.user.role === "admin" ? {} : { userId: req.user.id };
    const hours = await VolunteerHours.find(query)
      .populate("userId", "name email")
      .sort({ date: -1 });
    res.json(hours);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/volunteer-hours/:id/verify (admin only)
router.patch("/:id/verify", authenticate, requireAdmin, async (req, res) => {
  try {
    const entry = await VolunteerHours.findByIdAndUpdate(
      req.params.id,
      { verified: true, verifiedBy: req.user.id },
      { new: true }
    );
    if (!entry) return res.status(404).json({ error: "Entry not found" });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
