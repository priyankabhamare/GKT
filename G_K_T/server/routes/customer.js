const express = require("express")
const router = express.Router()
const customerController = require("../controllers/customerController")
const { auth, checkRole } = require("../middleware/auth")

// Apply auth middleware to all routes
router.use(auth)
router.use(checkRole("customer"))

// Mess routes
router.get("/messes/nearby", customerController.getNearbyMesses)
router.get("/messes", customerController.getAllMesses)
router.get("/messes/:id", customerController.getMessDetails)
router.get("/messes/:id/menu", customerController.getMessMenu)

// Order routes
router.post("/orders", customerController.placeOrder)
router.get("/orders/recent", customerController.getRecentOrders)
router.get("/orders", customerController.getAllOrders)
router.get("/orders/:id", customerController.getOrderDetails)
router.post("/orders/:id/review", customerController.submitReview)

// Profile routes
router.get("/profile", customerController.getCustomerProfile)
router.put("/profile", customerController.updateCustomerProfile)

module.exports = router
