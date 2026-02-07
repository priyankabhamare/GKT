const express = require("express")
const router = express.Router()
const providerController = require("../controllers/providerController")
const { auth, checkRole } = require("../middleware/auth")

// Apply auth middleware to all routes
router.use(auth)
router.use(checkRole("provider"))

// Menu routes
router.post("/menu", providerController.updateMenu)
router.get("/menu", providerController.getMenuByDate)

// Order routes
router.get("/orders/recent", providerController.getRecentOrders)
router.get("/orders", providerController.getAllOrders)
router.put("/orders/:id/status", providerController.updateOrderStatus)

// Stats route
router.get("/stats", providerController.getProviderStats)

// Profile routes
router.get("/profile", providerController.getProviderProfile)
router.put("/profile", providerController.updateProviderProfile)

module.exports = router
