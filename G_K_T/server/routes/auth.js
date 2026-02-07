const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")
const { auth } = require("../middleware/auth")

// Register routes
router.post("/customer/register", authController.registerCustomer)
router.post("/provider/register", authController.registerProvider)

// Login routes
router.post("/customer/login", authController.loginCustomer)
router.post("/provider/login", authController.loginProvider)

// Verify OTP
router.post("/verify-otp", authController.verifyOTP)

// Resend OTP
router.post("/resend-otp", authController.resendOTP)

// Get current user (protected route)
router.get("/me", auth, authController.getCurrentUser)

module.exports = router
