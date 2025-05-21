const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB Atlas URI with database name 'quizApp'
const MONGO_URI = 'mongodb+srv://nithinithish271:nithish1230@cluster0.cbw99.mongodb.net/quizApp?retryWrites=true&w=majority&appName=Cluster0';

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Atlas connected!"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// Middleware setup
app.use(cors({
  origin: "http://localhost:3000",  // frontend URL, change if different
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
  credentials: true,
}));
app.use(bodyParser.json());

// Debug log for incoming requests
app.use((req, res, next) => {
  console.log(`🔎 ${req.method} ${req.url} --`, req.body);
  next();
});

// Mongoose schemas and models
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  language: { type: String, required: true }
});
const User = mongoose.model("User", userSchema);

const marksSchema = new mongoose.Schema({
  id: { type: String, required: true },
  totalMarks: { type: Number, required: true }
});
const Marks = mongoose.model("Marks", marksSchema);

// Routes

// Test route to check backend and CORS
app.get("/test", (req, res) => {
  res.json({ message: "✅ Backend is working and CORS is okay!" });
});

// Register a new user
app.post("/register", async (req, res) => {
  const { username, language } = req.body;
  if (!username || !language) {
    return res.status(400).json({ message: "Username and language are required" });
  }
  try {
    const user = new User({ username, language });
    await user.save();
    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Error registering user" });
  }
});

// Login user by checking username and language
app.post("/login", async (req, res) => {
  const { username, language } = req.body;
  if (!username || !language) {
    return res.status(400).json({ message: "Username and language are required" });
  }
  try {
    const user = await User.findOne({ username, language });
    if (user) {
      res.json({ message: "Login successful" });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Error logging in" });
  }
});

// Store marks for a user or test
app.post("/marks", async (req, res) => {
  const { id, totalMarks } = req.body;
  if (!id || totalMarks === undefined) {
    return res.status(400).json({ message: "ID and totalMarks are required" });
  }
  try {
    const mark = new Marks({ id, totalMarks });
    await mark.save();
    res.json({ message: "Marks stored successfully" });
  } catch (err) {
    console.error("Store marks error:", err);
    res.status(500).json({ message: "Error storing marks" });
  }
});

// Get marks by ID
app.get("/marks/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const record = await Marks.findOne({ id });
    if (record) {
      res.json(record);
    } else {
      res.status(404).json({ message: "Record not found" });
    }
  } catch (err) {
    console.error("Get marks error:", err);
    res.status(500).json({ message: "Error retrieving marks" });
  }
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
