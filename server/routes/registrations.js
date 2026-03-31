// server/routes/registrations.js
import express from "express";
import { Registration } from "../models/Registration.js";
import { Event } from "../models/Event.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// POST /api/registrations – register a student for an event
router.post("/", authenticate, async (req, res) => {
  try {
    const { eventId } = req.body;
    if (!eventId) {
      return res.status(400).json({ error: "eventId is required" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const existing = await Registration.findOne({ userId: req.user.id, eventId });
    if (existing) {
      return res.status(409).json({ error: "Already registered for this event" });
    }

    const registration = new Registration({ userId: req.user.id, eventId });
    await registration.save();
    res.status(201).json(registration);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/registrations – all registrations for the logged-in student
router.get("/", authenticate, async (req, res) => {
  try {
    const query = req.user.role === "admin" ? {} : { userId: req.user.id };
    const registrations = await Registration.find(query)
      .populate("eventId", "title date location")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/registrations/:id – cancel a registration
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id);
    if (!reg) return res.status(404).json({ error: "Registration not found" });
    if (String(reg.userId) !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorised" });
    }
    await Registration.findByIdAndDelete(req.params.id);
    res.json({ message: "Registration cancelled" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
