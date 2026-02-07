const User = require("../models/User")
const jwt = require("jsonwebtoken")
const nodemailer = require("nodemailer")
const path = require("path")
const fs = require("fs")
const multer = require("multer")

// Setup for file upload
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
    cb(null, "profile-" + uniqueSuffix + ext)
  },
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Only image files are allowed"))
    }
  },
}).single("profile_image")

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" })
}

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// For development only - bypass OTP verification
const bypassOTPVerification = process.env.NODE_ENV === "development" && process.env.BYPASS_OTP === "true"

// Send OTP via email
const sendOTPEmail = async (email, otp) => {
  try {
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

    // Email content
    const mailOptions = {
      from: `"GharKaTiffin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "GharKaTiffin - Email Verification",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #ff6b35; padding: 20px; text-align: center; color: white;">
            <h1>GharKaTiffin</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
            <h2>Email Verification</h2>
            <p>Thank you for registering with GharKaTiffin. Please use the following OTP to verify your email address:</p>
            <div style="background-color: #f5f5f5; padding: 15px; font-size: 24px; text-align: center; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
              ${otp}
            </div>
            <p>This OTP is valid for 10 minutes.</p>
            <p>If you didn't request this email, please ignore it.</p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #777; font-size: 12px;">
            <p>© ${new Date().getFullYear()} GharKaTiffin. All rights reserved.</p>
          </div>
        </div>
      `,
    }

    // Send email
    await transporter.sendMail(mailOptions)

    // For development, bypass email sending if configured
    if (bypassOTPVerification) {
      console.log(`Development mode: OTP for ${email} is ${otp}`)
      return true
    }

    return true
  } catch (error) {
    console.error("Error sending email:", error)
    return false
  }
}

// Register customer
exports.registerCustomer = async (req, res) => {
  try {
    const { name, email, mobile_no, address, password } = req.body

    // Check if user already exists
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({ message: "Email already registered" })
    }

    // Generate OTP
    const otp = generateOTP()
    const otpExpiresAt = new Date()
    otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 10) // OTP expires in 10 minutes

    // Create new customer
    const customer = await User.create({
      name,
      email,
      mobile_no,
      address,
      password,
      role: "customer",
      otp: {
        code: otp,
        expiresAt: otpExpiresAt,
      },
    })

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, otp)
    if (!emailSent && !bypassOTPVerification) {
      // Delete the created user to avoid orphaned accounts
      await User.findByIdAndDelete(customer._id)
      return res.status(500).json({ message: "Failed to send verification email" })
    }

    res.status(201).json({ message: "Registration successful. Please verify your email." })
  } catch (error) {
    console.error("Register customer error:", error)
    res.status(500).json({ message: "Registration failed. Please try again." })
  }
}

// Register provider
exports.registerProvider = (req, res) => {
  // Debug log to track function call
  console.log("Provider registration initiated")

  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      console.error("Multer error:", err)
      return res.status(400).json({ message: `Upload error: ${err.message}` })
    } else if (err) {
      console.error("Other upload error:", err)
      return res.status(400).json({ message: err.message })
    }

    try {
      console.log("File upload successful, processing provider registration")
      console.log("Request body:", req.body)

      const { mess_name, owner_name, email, mobile_no, address, password } = req.body

      // Validate required fields
      if (!mess_name || !owner_name || !email || !mobile_no || !address || !password) {
        // Remove uploaded file if exists
        if (req.file) {
          fs.unlinkSync(req.file.path)
        }
        return res.status(400).json({
          message: "All fields are required",
          received: { mess_name, owner_name, email, mobile_no, address, password: password ? "provided" : "missing" },
        })
      }

      // Check if user already exists
      const userExists = await User.findOne({ email })
      if (userExists) {
        // Remove uploaded file if exists
        if (req.file) {
          fs.unlinkSync(req.file.path)
        }
        return res.status(400).json({ message: "Email already registered" })
      }

      // Generate OTP
      const otp = generateOTP()
      const otpExpiresAt = new Date()
      otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 10) // OTP expires in 10 minutes

      // Get profile image path
      const profileImagePath = req.file ? `/uploads/${req.file.filename}` : ""
      console.log("Profile image path:", profileImagePath)

      // Create new provider
      const providerData = {
        mess_name,
        owner_name,
        email,
        mobile_no,
        address,
        password,
        role: "provider",
        profile_image: profileImagePath,
        otp: {
          code: otp,
          expiresAt: otpExpiresAt,
        },
      }

      console.log("Creating provider with data:", { ...providerData, password: "[HIDDEN]" })
      const provider = await User.create(providerData)
      console.log("Provider created with ID:", provider._id)

      // Send OTP via email
      const emailSent = await sendOTPEmail(email, otp)
      if (!emailSent && !bypassOTPVerification) {
        console.error("Failed to send verification email")
        // Delete the created user to avoid orphaned accounts
        await User.findByIdAndDelete(provider._id)
        // Remove uploaded file if exists
        if (req.file) {
          fs.unlinkSync(req.file.path)
        }
        return res.status(500).json({ message: "Failed to send verification email" })
      }

      res.status(201).json({ message: "Registration successful. Please verify your email." })
    } catch (error) {
      console.error("Register provider error:", error)

      // Remove uploaded file if exists
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path)
        } catch (unlinkError) {
          console.error("Error removing uploaded file:", unlinkError)
        }
      }

      res.status(500).json({
        message: "Registration failed. Please try again.",
        error: error.message,
      })
    }
  })
}

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp, userType } = req.body

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check if OTP is correct and not expired (with bypass option for development)
    if (!bypassOTPVerification) {
      if (!user.otp || user.otp.code !== otp) {
        return res.status(400).json({ message: "Invalid OTP" })
      }

      if (new Date() > new Date(user.otp.expiresAt)) {
        return res.status(400).json({ message: "OTP has expired" })
      }
    } else {
      console.log("Development mode: OTP verification bypassed")
    }

    // Verify user and clear OTP
    user.isVerified = true
    user.otp = undefined
    await user.save()

    // Generate token
    const token = generateToken(user._id)

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        mess_name: user.mess_name,
        email: user.email,
        mobile_no: user.mobile_no,
        address: user.address,
        role: user.role,
        profile_image: user.profile_image,
      },
    })
  } catch (error) {
    console.error("Verify OTP error:", error)
    res.status(500).json({ message: "Verification failed. Please try again." })
  }
}

// Login customer
exports.loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body

    // Check if user exists
    const user = await User.findOne({ email, role: "customer" })
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    // Check if password is correct
    const isPasswordMatch = await user.comparePassword(password)
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    // Check if user is verified
    if (!user.isVerified) {
      // Generate new OTP
      const otp = generateOTP()
      const otpExpiresAt = new Date()
      otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 10)

      user.otp = {
        code: otp,
        expiresAt: otpExpiresAt,
      }
      await user.save()

      // Send OTP via email
      await sendOTPEmail(email, otp)

      return res.status(403).json({ message: "Please verify your email. A new OTP has been sent." })
    }

    // Generate token
    const token = generateToken(user._id)

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile_no: user.mobile_no,
        address: user.address,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Login customer error:", error)
    res.status(500).json({ message: "Login failed. Please try again." })
  }
}

// Login provider
exports.loginProvider = async (req, res) => {
  try {
    console.log("Provider login initiated for:", req.body.email)

    const { email, password } = req.body

    // Check if user exists
    const user = await User.findOne({ email, role: "provider" })
    if (!user) {
      console.log("Provider not found with email:", email)
      return res.status(401).json({ message: "Invalid email or password" })
    }

    console.log("Provider found:", user._id)

    // Check if password is correct
    const isPasswordMatch = await user.comparePassword(password)
    if (!isPasswordMatch) {
      console.log("Password mismatch for provider:", user._id)
      return res.status(401).json({ message: "Invalid email or password" })
    }

    // Check if user is verified
    if (!user.isVerified) {
      console.log("Provider not verified, sending new OTP")

      // Generate new OTP
      const otp = generateOTP()
      const otpExpiresAt = new Date()
      otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 10)

      user.otp = {
        code: otp,
        expiresAt: otpExpiresAt,
      }
      await user.save()

      // Send OTP via email
      await sendOTPEmail(email, otp)

      return res.status(403).json({ message: "Please verify your email. A new OTP has been sent." })
    }

    // Generate token
    const token = generateToken(user._id)
    console.log("Provider login successful, token generated")

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        mess_name: user.mess_name,
        owner_name: user.owner_name,
        email: user.email,
        mobile_no: user.mobile_no,
        address: user.address,
        role: user.role,
        profile_image: user.profile_image,
        rating: user.rating,
        reviewCount: user.reviewCount,
      },
    })
  } catch (error) {
    console.error("Login provider error:", error)
    res.status(500).json({ message: "Login failed. Please try again." })
  }
}

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = req.user

    // Don't send password, OTP, etc.
    user.password = undefined
    user.otp = undefined

    res.status(200).json({ user })
  } catch (error) {
    console.error("Get current user error:", error)
    res.status(500).json({ message: "Failed to fetch user data" })
  }
}

// Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Generate new OTP
    const otp = generateOTP()
    const otpExpiresAt = new Date()
    otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 10)

    user.otp = {
      code: otp,
      expiresAt: otpExpiresAt,
    }
    await user.save()

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, otp)
    if (!emailSent && !bypassOTPVerification) {
      return res.status(500).json({ message: "Failed to send verification email" })
    }

    res.status(200).json({ message: "OTP sent successfully" })
  } catch (error) {
    console.error("Resend OTP error:", error)
    res.status(500).json({ message: "Failed to send OTP. Please try again." })
  }
}
