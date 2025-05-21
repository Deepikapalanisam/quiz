require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const User = require("./models/User");
const Marks = require("./models/Marks");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Debug all incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, req.body);
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// Route: Register new user with language
app.post("/register", async (req, res) => {
  const { username, language } = req.body;
  if (!username || !language) return res.status(400).json({ message: "Username and language required" });

  try {
    const existing = await User.findOne({ username });
    if (existing) return res.status(409).json({ message: "Username already exists" });

    const user = new User({ username, language });
    await user.save();

    res.status(201).json({ message: "User registered" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route: Login using only username
app.post("/login", async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ message: "Username required" });

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ message: "Login successful", token, language: user.language });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route: Store marks
app.post("/marks", async (req, res) => {
  const { id, totalMarks } = req.body;
  if (!id || totalMarks === undefined) return res.status(400).json({ message: "ID and totalMarks required" });

  try {
    const mark = new Marks({ id, totalMarks });
    await mark.save();
    res.json({ message: "Marks stored" });
  } catch (err) {
    console.error("Store marks error:", err);
    res.status(500).json({ message: "Error storing marks" });
  }
});

// Route: Get marks
app.get("/marks/:id", async (req, res) => {
  try {
    const record = await Marks.findOne({ id: req.params.id });
    if (!record) return res.status(404).json({ message: "No marks found" });
    res.json(record);
  } catch (err) {
    console.error("Get marks error:", err);
    res.status(500).json({ message: "Error fetching marks" });
  }
});

// Start the server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
