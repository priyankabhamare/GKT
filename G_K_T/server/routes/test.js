const express = require("express")
const router = express.Router()
const nodemailer = require("nodemailer")
const User = require("../models/User")
const Order = require("../models/Order")
const multer = require("multer")
const path = require("path")
const fs = require("fs")

// Only enable in development mode
if (process.env.NODE_ENV === "development") {
  // Setup for file upload testing
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, "../uploads")
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true })
      }
      cb(null, uploadPath)
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
      const ext = path.extname(file.originalname)
      cb(null, "test-" + uniqueSuffix + ext)
    },
  })

  const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  }).single("test_image")

  // Test file upload route
  router.post("/upload", (req, res) => {
    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message })
      }

      if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" })
      }

      res.status(200).json({
        success: true,
        file: {
          filename: req.file.filename,
          path: req.file.path,
          size: req.file.size,
          mimetype: req.file.mimetype,
        },
      })
    })
  })

  // Test email route
  router.post("/email", async (req, res) => {
    try {
      const { email } = req.body

      if (!email) {
        return res.status(400).json({ message: "Email is required" })
      }

      // Create a transporter
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
        },
      })

      // Verify connection
      await transporter.verify()

      // Send test email
      const info = await transporter.sendMail({
        from: `"GharKaTiffin Test" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Email Configuration Test",
        text: "If you're receiving this email, your email configuration is working correctly.",
        html: "<b>If you're receiving this email, your email configuration is working correctly.</b>",
      })

      res.status(200).json({
        message: "Test email sent successfully",
        messageId: info.messageId,
        emailUser: process.env.EMAIL_USER ? process.env.EMAIL_USER.substring(0, 3) + "..." : "not set",
      })
    } catch (error) {
      console.error("Test email error:", error)
      res.status(500).json({
        message: "Failed to send test email",
        error: error.message,
        code: error.code,
        emailUser: process.env.EMAIL_USER ? process.env.EMAIL_USER.substring(0, 3) + "..." : "not set",
      })
    }
  })

  // Test provider creation
  router.post("/create-provider", async (req, res) => {
    try {
      const { mess_name, owner_name, email, mobile_no, address, password } = req.body

      // Create provider directly without OTP verification
      const provider = await User.create({
        mess_name,
        owner_name,
        email,
        mobile_no,
        address,
        password,
        role: "provider",
        isVerified: true, // Skip verification for testing
      })

      res.status(201).json({
        success: true,
        provider: {
          _id: provider._id,
          mess_name: provider.mess_name,
          email: provider.email,
        },
      })
    } catch (error) {
      console.error("Test provider creation error:", error)
      res.status(500).json({
        success: false,
        message: error.message,
        code: error.code,
      })
    }
  })

  // Get all users
  router.get("/users", async (req, res) => {
    try {
      const users = await User.find().select("-password -otp")
      res.status(200).json(users)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  })

  // Test order creation
  router.post("/create-order", async (req, res) => {
    try {
      const { customerId, providerId, items, totalAmount, deliveryAddress } = req.body

      // Validate required fields
      if (!customerId || !providerId || !items || !totalAmount || !deliveryAddress) {
        return res.status(400).json({
          message: "Missing required fields",
          required: { customerId, providerId, items, totalAmount, deliveryAddress },
        })
      }

      // Create test order
      const order = new Order({
        customer: customerId,
        provider: providerId,
        items,
        totalAmount,
        deliveryAddress,
        paymentMethod: "cash",
        paymentStatus: "pending",
      })

      await order.save()

      res.status(201).json({
        success: true,
        order: {
          _id: order._id,
          orderId: order.orderId,
          status: order.status,
          items: order.items,
          totalAmount: order.totalAmount,
        },
      })
    } catch (error) {
      console.error("Test order creation error:", error)
      res.status(500).json({
        success: false,
        message: error.message,
        code: error.code,
        name: error.name,
        errors: error.errors,
      })
    }
  })

  // Get all orders
  router.get("/orders", async (req, res) => {
    try {
      const orders = await Order.find().populate("customer", "name email").populate("provider", "mess_name email")

      res.status(200).json(orders)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  })
}

module.exports = router
