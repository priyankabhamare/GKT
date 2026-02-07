const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const http = require("http")
const dotenv = require("dotenv")
const cookieParser = require("cookie-parser")
const path = require("path")
const fs = require("fs") // Import the 'fs' module
const connectDB = require("./config/db")
const setupSocket = require("./config/socket")

// Load environment variables
dotenv.config()

// Check email configuration
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.warn("WARNING: Email credentials are not properly configured. Email verification will not work.")
}

// Import routes
const authRoutes = require("./routes/auth")
const customerRoutes = require("./routes/customer")
const providerRoutes = require("./routes/provider")

// Initialize Express app
const app = express()
const server = http.createServer(app)

// Connect to MongoDB
connectDB()

// Set up Socket.io
const io = setupSocket(server)

// Middleware
app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
)

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
  console.log("Created uploads directory")
}

// Static files for profile images
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/customer", customerRoutes)
app.use("/api/provider", providerRoutes)

// Test routes (only in development)
if (process.env.NODE_ENV === "development") {
  const testRoutes = require("./routes/test")
  app.use("/api/test", testRoutes)
  console.log("Test routes enabled in development mode")
}

// Default route
app.get("/", (req, res) => {
  res.send("Welcome to GharKaTiffin API")
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: "Something went wrong!" })
})

// Start server
const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
