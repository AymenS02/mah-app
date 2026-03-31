// server/seed.js – run once to seed example data: node seed.js
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "./db.js";
import { User } from "./models/User.js";
import { Event } from "./models/Event.js";
import { Announcement } from "./models/Announcement.js";

async function seed() {
  await connectDB();

  // Clear existing data
  await User.deleteMany({});
  await Event.deleteMany({});
  await Announcement.deleteMany({});

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  await User.create({
    name: "MAH Admin",
    email: "admin@mah.ca",
    password: adminPassword,
    role: "admin",
  });

  // Create sample students
  const studentPassword = await bcrypt.hash("student123", 12);
  await User.insertMany([
    { name: "Ahmed Hassan", email: "ahmed@example.com", password: studentPassword },
    { name: "Sara Khan", email: "sara@example.com", password: studentPassword },
  ]);

  // Create sample events
  await Event.insertMany([
    {
      title: "Friday Youth Night",
      description: "Join us for a fun-filled evening with activities, food, and community. Open to all high school students.",
      date: new Date("2025-04-11T19:00:00"),
      location: "MAH Community Centre – Main Hall",
      volunteerSlots: 5,
      isVolunteerOpportunity: false,
    },
    {
      title: "Ramadan Iftar Dinner",
      description: "Community Iftar dinner. Help break the fast together with friends and family.",
      date: new Date("2025-04-15T19:30:00"),
      location: "MAH Community Centre – Banquet Room",
      volunteerSlots: 10,
      isVolunteerOpportunity: false,
    },
    {
      title: "Food Bank Volunteering",
      description: "Help sort and pack donations at the Hamilton Food Share. Great opportunity to earn volunteer hours.",
      date: new Date("2025-04-20T10:00:00"),
      location: "Hamilton Food Share – 285 Barton St E",
      volunteerSlots: 8,
      isVolunteerOpportunity: true,
    },
    {
      title: "Islamic History Seminar",
      description: "A free seminar covering the Golden Age of Islam and its impact on modern civilization.",
      date: new Date("2025-04-25T14:00:00"),
      location: "MAH Community Centre – Lecture Room",
      volunteerSlots: 3,
      isVolunteerOpportunity: false,
    },
    {
      title: "Mosque Cleanup Day",
      description: "Volunteer to help clean and maintain the MAH mosque. Earn community service hours.",
      date: new Date("2025-05-03T09:00:00"),
      location: "MAH Mosque",
      volunteerSlots: 15,
      isVolunteerOpportunity: true,
    },
  ]);

  // Create sample announcements
  await Announcement.insertMany([
    {
      title: "Welcome to MAH Youth App! 🎉",
      content:
        "We are excited to launch the MAH Youth App for Hamilton's Muslim high school community. Use the app to stay updated on events, volunteer opportunities, and important announcements.",
      author: "MAH Admin",
      pinned: true,
    },
    {
      title: "Ramadan Mubarak!",
      content:
        "The Muslim Association of Hamilton wishes the entire community a blessed Ramadan. May this month be filled with peace, reflection, and blessings. Check the Events tab for Iftar dinner details.",
      author: "MAH Admin",
      pinned: false,
    },
    {
      title: "Volunteer Hours Verification",
      content:
        "All volunteer hours logged before April 30th will be reviewed and verified by the end of May. Please make sure to include a clear description when logging hours.",
      author: "MAH Admin",
      pinned: false,
    },
  ]);

  console.log("✅ Database seeded successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
