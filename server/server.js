import express from "express";
import cors from "cors";
import dotenv from "dotenv";
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

// Routes
app.use("/api/auth", authRouter);
app.use("/api/events", eventsRouter);
app.use("/api/announcements", announcementsRouter);
app.use("/api/registrations", registrationsRouter);
app.use("/api/volunteer-hours", volunteerHoursRouter);

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend working 🚀" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));