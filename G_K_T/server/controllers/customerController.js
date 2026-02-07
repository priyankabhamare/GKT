const User = require("../models/User")
const Menu = require("../models/Menu")
const Order = require("../models/Order")

// Get nearby messes
exports.getNearbyMesses = async (req, res) => {
  try {
    // For demonstration, we'll simply return all providers
    // In a real application, we would use geospatial queries to find nearby messes
    const messes = await User.find({ role: "provider", isVerified: true })
      .select("_id mess_name address mobile_no profile_image rating reviewCount")
      .limit(6)

    // Get today's menu for each mess
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const messesWithMenu = await Promise.all(
      messes.map(async (mess) => {
        const menu = await Menu.findOne({
          provider: mess._id,
          date: today,
        })

        return {
          _id: mess._id,
          mess_name: mess.mess_name,
          address: mess.address,
          mobile_no: mess.mobile_no,
          profile_image: mess.profile_image,
          rating: mess.rating,
          reviewCount: mess.reviewCount,
          price: menu ? menu.price : 0,
          foodType: menu ? menu.foodType : "Not Available",
          messTime: menu ? menu.messTime : { open: "N/A", close: "N/A" },
          homeDelivery: menu ? menu.homeDelivery : false,
        }
      }),
    )

    res.status(200).json(messesWithMenu.filter((mess) => mess.price > 0))
  } catch (error) {
    console.error("Get nearby messes error:", error)
    res.status(500).json({ message: "Failed to fetch nearby messes. Please try again." })
  }
}

// Get all messes
exports.getAllMesses = async (req, res) => {
  try {
    const messes = await User.find({ role: "provider", isVerified: true }).select(
      "_id mess_name address mobile_no profile_image rating reviewCount",
    )

    // Get today's menu for each mess
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const messesWithMenu = await Promise.all(
      messes.map(async (mess) => {
        const menu = await Menu.findOne({
          provider: mess._id,
          date: today,
        })

        return {
          _id: mess._id,
          mess_name: mess.mess_name,
          address: mess.address,
          mobile_no: mess.mobile_no,
          profile_image: mess.profile_image,
          rating: mess.rating,
          reviewCount: mess.reviewCount,
          price: menu ? menu.price : 0,
          foodType: menu ? menu.foodType : "Not Available",
          messTime: menu ? menu.messTime : { open: "N/A", close: "N/A" },
          homeDelivery: menu ? menu.homeDelivery : false,
        }
      }),
    )

    res.status(200).json(messesWithMenu.filter((mess) => mess.price > 0))
  } catch (error) {
    console.error("Get all messes error:", error)
    res.status(500).json({ message: "Failed to fetch messes. Please try again." })
  }
}

// Get mess details
exports.getMessDetails = async (req, res) => {
  try {
    const { id } = req.params

    const mess = await User.findOne({ _id: id, role: "provider", isVerified: true }).select(
      "_id mess_name address mobile_no profile_image rating reviewCount",
    )

    if (!mess) {
      return res.status(404).json({ message: "Mess not found" })
    }

    // Get today's menu
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const menu = await Menu.findOne({
      provider: mess._id,
      date: today,
    })

    const messDetails = {
      _id: mess._id,
      mess_name: mess.mess_name,
      address: mess.address,
      mobile_no: mess.mobile_no,
      profile_image: mess.profile_image,
      rating: mess.rating,
      reviewCount: mess.reviewCount,
      price: menu ? menu.price : 0,
      foodType: menu ? menu.foodType : "Not Available",
      messTime: menu ? menu.messTime : { open: "N/A", close: "N/A" },
      homeDelivery: menu ? menu.homeDelivery : false,
    }

    res.status(200).json(messDetails)
  } catch (error) {
    console.error("Get mess details error:", error)
    res.status(500).json({ message: "Failed to fetch mess details. Please try again." })
  }
}

// Get mess menu
exports.getMessMenu = async (req, res) => {
  try {
    const { id } = req.params

    // Check if mess exists
    const mess = await User.findOne({ _id: id, role: "provider", isVerified: true })
    if (!mess) {
      return res.status(404).json({ message: "Mess not found" })
    }

    // Get today's menu
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const menu = await Menu.findOne({
      provider: mess._id,
      date: today,
    })

    if (!menu) {
      return res.status(404).json({ message: "Menu not available for today" })
    }

    res.status(200).json(menu)
  } catch (error) {
    console.error("Get mess menu error:", error)
    res.status(500).json({ message: "Failed to fetch menu. Please try again." })
  }
}

// Place order
exports.placeOrder = async (req, res) => {
  try {
    console.log("Order placement initiated by customer:", req.user._id)
    console.log("Order data received:", req.body)

    const customerId = req.user._id
    const { providerId, items, totalAmount, deliveryAddress, paymentMethod, notes } = req.body

    // Validate required fields
    if (!providerId) {
      return res.status(400).json({ message: "Provider ID is required" })
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" })
    }

    if (!totalAmount || isNaN(Number(totalAmount)) || Number(totalAmount) <= 0) {
      return res.status(400).json({ message: "Valid total amount is required" })
    }

    if (!deliveryAddress) {
      return res.status(400).json({ message: "Delivery address is required" })
    }

    // Check if provider exists
    const provider = await User.findOne({ _id: providerId, role: "provider", isVerified: true })
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" })
    }

    console.log("Provider found:", provider._id)

    // Create order
    const order = new Order({
      customer: customerId,
      provider: providerId,
      items,
      totalAmount,
      deliveryAddress,
      paymentMethod: paymentMethod || "cash", // Default to cash if not provided
      paymentStatus: paymentMethod === "cash" ? "pending" : "pending", // Both are pending for now
      notes,
    })

    console.log("Order created, saving to database...")
    await order.save()
    console.log("Order saved successfully with ID:", order._id)

    // Populate customer and provider details for the response
    const populatedOrder = await Order.findById(order._id)
      .populate("customer", "name mobile_no")
      .populate("provider", "mess_name profile_image mobile_no")

    console.log("Order placement successful")
    res.status(201).json(populatedOrder)
  } catch (error) {
    console.error("Place order error:", error)

    // More detailed error logging
    if (error.name === "ValidationError") {
      console.error("Validation error details:", error.errors)
      return res.status(400).json({
        message: "Validation error",
        details: Object.values(error.errors).map((err) => err.message),
      })
    }

    if (error.name === "CastError") {
      console.error("Cast error details:", error)
      return res.status(400).json({
        message: "Invalid ID format",
        details: error.message,
      })
    }

    res.status(500).json({ message: "Failed to place order. Please try again." })
  }
}

// Get recent orders
exports.getRecentOrders = async (req, res) => {
  try {
    const customerId = req.user._id

    const recentOrders = await Order.find({ customer: customerId })
      .populate("provider", "mess_name profile_image")
      .sort({ createdAt: -1 })
      .limit(5)

    res.status(200).json(recentOrders)
  } catch (error) {
    console.error("Get recent orders error:", error)
    res.status(500).json({ message: "Failed to fetch recent orders. Please try again." })
  }
}

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const customerId = req.user._id

    const orders = await Order.find({ customer: customerId })
      .populate("provider", "mess_name profile_image mobile_no")
      .sort({ createdAt: -1 })

    res.status(200).json(orders)
  } catch (error) {
    console.error("Get all orders error:", error)
    res.status(500).json({ message: "Failed to fetch orders. Please try again." })
  }
}

// Get order details
exports.getOrderDetails = async (req, res) => {
  try {
    const customerId = req.user._id
    const { id } = req.params

    const order = await Order.findOne({ _id: id, customer: customerId })
      .populate("provider", "mess_name profile_image mobile_no address")
      .populate("customer", "name mobile_no")

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    res.status(200).json(order)
  } catch (error) {
    console.error("Get order details error:", error)
    res.status(500).json({ message: "Failed to fetch order details. Please try again." })
  }
}

// Submit review
exports.submitReview = async (req, res) => {
  try {
    const customerId = req.user._id
    const { id } = req.params
    const { rating, text } = req.body

    // Check if order exists and belongs to this customer
    const order = await Order.findOne({ _id: id, customer: customerId })

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    // Check if order is delivered
    if (order.status !== "delivered") {
      return res.status(400).json({ message: "You can only review delivered orders" })
    }

    // Check if order is already reviewed
    if (order.isReviewed) {
      return res.status(400).json({ message: "You have already reviewed this order" })
    }

    // Add review to order
    order.review = { rating, text }
    order.isReviewed = true
    await order.save()

    // Update provider rating
    const provider = await User.findById(order.provider)
    const totalRating = provider.rating * provider.reviewCount + rating
    provider.reviewCount += 1
    provider.rating = totalRating / provider.reviewCount
    await provider.save()

    res.status(200).json({ message: "Review submitted successfully", order })
  } catch (error) {
    console.error("Submit review error:", error)
    res.status(500).json({ message: "Failed to submit review. Please try again." })
  }
}

// Get customer profile
exports.getCustomerProfile = async (req, res) => {
  try {
    const customerId = req.user._id
    const customer = await User.findById(customerId).select("-password -otp")

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" })
    }

    res.status(200).json(customer)
  } catch (error) {
    console.error("Get customer profile error:", error)
    res.status(500).json({ message: "Failed to fetch customer profile. Please try again." })
  }
}

// Update customer profile
exports.updateCustomerProfile = async (req, res) => {
  try {
    const customerId = req.user._id
    const { name, mobile_no, address } = req.body

    const customer = await User.findById(customerId)
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" })
    }

    customer.name = name || customer.name
    customer.mobile_no = mobile_no || customer.mobile_no
    customer.address = address || customer.address

    await customer.save()

    res.status(200).json({
      message: "Profile updated successfully",
      customer: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        mobile_no: customer.mobile_no,
        address: customer.address,
      },
    })
  } catch (error) {
    console.error("Update customer profile error:", error)
    res.status(500).json({ message: "Failed to update profile. Please try again." })
  }
}
