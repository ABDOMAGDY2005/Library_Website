const express = require("express");
const cors = require("cors");

// Middleware
const authMiddleware = require("./middlewares/auth");

// Routes
const bookRoutes = require("./routes/bookRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const authorRoutes = require("./routes/authorRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const statsRoutes = require("./routes/statsRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ------------------
// PUBLIC ROUTES
// ------------------
app.use("/api/auth", authRoutes);

// ------------------
// PROTECTED ROUTES
// ------------------
app.use(authMiddleware); // all routes below require authentication

app.use("/api/books", bookRoutes);
app.use("/api/users", userRoutes);
app.use("/api/stats", statsRoutes);

module.exports = app;
