// server/routes/events.js
import express from "express";
import { Event } from "../models/Event.js";

const router = express.Router();

// GET all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new event
router.post("/", async (req, res) => {
  try {
    const { title, description } = req.body;
    const event = new Event({ title, description });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;