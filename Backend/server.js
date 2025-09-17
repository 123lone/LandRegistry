// Configure environment variables FIRST. This must be at the very top.
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const connectDB = require("./config/db");

// Import all the final routes for the application
const authRoutes = require("./routes/authRoutes");
const kycRoutes = require("./routes/kycRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const verifierRoutes = require("./routes/verifierRoutes");

// Connect to the database
connectDB();

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000", // Your Next.js frontend URL
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// API Routes - These are the final, organized routes for your application
app.use("/api/verifier", verifierRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/properties", propertyRoutes);

// --- Server Listening ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
