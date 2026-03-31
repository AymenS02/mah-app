// server/routes/events.js
import express from "express";
import { Event } from "../models/Event.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// GET /api/events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/events/:id
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/events (admin only)
router.post("/", authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, description, date, location, volunteerSlots, isVolunteerOpportunity } = req.body;
    if (!title || !description || !date) {
      return res.status(400).json({ error: "Title, description and date are required" });
    }
    const event = new Event({ title, description, date, location, volunteerSlots, isVolunteerOpportunity });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/events/:id (admin only)
router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Event not found" });
    res.json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;