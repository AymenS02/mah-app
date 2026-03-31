// server/routes/announcements.js
import express from "express";
import { Announcement } from "../models/Announcement.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// GET /api/announcements
router.get("/", async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ pinned: -1, createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/announcements (admin only)
router.post("/", authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, content, pinned } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }
    const announcement = new Announcement({ title, content, author: req.user.name, pinned });
    await announcement.save();
    res.status(201).json(announcement);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/announcements/:id (admin only)
router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const deleted = await Announcement.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Announcement not found" });
    res.json({ message: "Announcement deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
