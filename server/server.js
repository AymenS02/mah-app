import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { connectDB } from "./db.js";
import authRouter from "./routes/auth.js";
import eventsRouter from "./routes/events.js";
import announcementsRouter from "./routes/announcements.js";
import registrationsRouter from "./routes/registrations.js";
import volunteerHoursRouter from "./routes/volunteerHours.js";

// Load env variables first
dotenv.config();

// Connect to MongoDB
connectDB();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting – auth routes (strict)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

// Rate limiting – general API
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

// Routes
app.use("/api/auth", authLimiter, authRouter);
app.use("/api/events", generalLimiter, eventsRouter);
app.use("/api/announcements", generalLimiter, announcementsRouter);
app.use("/api/registrations", generalLimiter, registrationsRouter);
app.use("/api/volunteer-hours", generalLimiter, volunteerHoursRouter);

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend working 🚀" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));