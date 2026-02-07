const User = require("../models/User")
const Menu = require("../models/Menu")
const Order = require("../models/Order")

// Update menu
exports.updateMenu = async (req, res) => {
  try {
    const { date, menuType, foodType, price, messTime, homeDelivery, items } = req.body
    const providerId = req.user._id

    // Format date to start of day
    const menuDate = new Date(date)
    menuDate.setHours(0, 0, 0, 0)

    // Check if menu already exists for this date
    let menu = await Menu.findOne({ provider: providerId, date: menuDate })

    if (menu) {
      // Update existing menu
      menu.menuType = menuType
      menu.foodType = foodType
      menu.price = price
      menu.messTime = messTime
      menu.homeDelivery = homeDelivery
      menu.items = items
    } else {
      // Create new menu
      menu = new Menu({
        provider: providerId,
        date: menuDate,
        menuType,
        foodType,
        price,
        messTime,
        homeDelivery,
        items,
      })
    }

    await menu.save()
    res.status(200).json(menu)
  } catch (error) {
    console.error("Update menu error:", error)
    res.status(500).json({ message: "Failed to update menu. Please try again." })
  }
}

// Get menu by date
exports.getMenuByDate = async (req, res) => {
  try {
    const providerId = req.user._id
    const { date } = req.query

    // Format date to start of day
    const menuDate = new Date(date)
    menuDate.setHours(0, 0, 0, 0)

    const menu = await Menu.findOne({ provider: providerId, date: menuDate })

    if (!menu) {
      return res.status(404).json({ message: "Menu not found for this date" })
    }

    res.status(200).json(menu)
  } catch (error) {
    console.error("Get menu error:", error)
    res.status(500).json({ message: "Failed to fetch menu. Please try again." })
  }
}

// Get provider stats
exports.getProviderStats = async (req, res) => {
  try {
    const providerId = req.user._id

    // Get total orders
    const totalOrders = await Order.countDocuments({ provider: providerId })

    // Get pending orders
    const pendingOrders = await Order.countDocuments({
      provider: providerId,
      status: { $in: ["pending", "preparing", "out_for_delivery"] },
    })

    // Get unique customers
    const uniqueCustomers = await Order.distinct("customer", { provider: providerId })
    const totalCustomers = uniqueCustomers.length

    // Calculate total revenue
    const orders = await Order.find({ provider: providerId, status: "delivered" })
    const totalRevenue = orders.reduce((total, order) => total + order.totalAmount, 0)

    // Get average rating
    const provider = await User.findById(providerId)
    const averageRating = provider.rating || 0

    res.status(200).json({
      totalOrders,
      pendingOrders,
      totalCustomers,
      totalRevenue,
      averageRating,
    })
  } catch (error) {
    console.error("Get provider stats error:", error)
    res.status(500).json({ message: "Failed to fetch provider stats. Please try again." })
  }
}

// Get recent orders
exports.getRecentOrders = async (req, res) => {
  try {
    const providerId = req.user._id

    const recentOrders = await Order.find({ provider: providerId })
      .populate("customer", "name mobile_no")
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
    const providerId = req.user._id

    const orders = await Order.find({ provider: providerId })
      .populate("customer", "name mobile_no")
      .sort({ createdAt: -1 })

    res.status(200).json(orders)
  } catch (error) {
    console.error("Get all orders error:", error)
    res.status(500).json({ message: "Failed to fetch orders. Please try again." })
  }
}

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const providerId = req.user._id
    const { id } = req.params
    const { status } = req.body

    // Check if order exists and belongs to this provider
    const order = await Order.findOne({ _id: id, provider: providerId })

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    // Check if status is valid for the current status
    const validStatusTransitions = {
      pending: ["preparing", "cancelled"],
      preparing: ["out_for_delivery", "cancelled"],
      out_for_delivery: ["delivered", "cancelled"],
      delivered: [],
      cancelled: [],
    }

    if (!validStatusTransitions[order.status].includes(status)) {
      return res.status(400).json({ message: `Cannot change status from ${order.status} to ${status}` })
    }

    // Update status
    order.status = status
    await order.save()

    res.status(200).json({ message: "Order status updated successfully", order })
  } catch (error) {
    console.error("Update order status error:", error)
    res.status(500).json({ message: "Failed to update order status. Please try again." })
  }
}

// Get provider profile
exports.getProviderProfile = async (req, res) => {
  try {
    const providerId = req.user._id
    const provider = await User.findById(providerId).select("-password -otp")

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" })
    }

    res.status(200).json(provider)
  } catch (error) {
    console.error("Get provider profile error:", error)
    res.status(500).json({ message: "Failed to fetch provider profile. Please try again." })
  }
}

// Update provider profile
exports.updateProviderProfile = async (req, res) => {
  try {
    const providerId = req.user._id
    const { mess_name, owner_name, mobile_no, address } = req.body

    const provider = await User.findById(providerId)
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" })
    }

    provider.mess_name = mess_name || provider.mess_name
    provider.owner_name = owner_name || provider.owner_name
    provider.mobile_no = mobile_no || provider.mobile_no
    provider.address = address || provider.address

    await provider.save()

    res.status(200).json({
      message: "Profile updated successfully",
      provider: {
        _id: provider._id,
        mess_name: provider.mess_name,
        owner_name: provider.owner_name,
        email: provider.email,
        mobile_no: provider.mobile_no,
        address: provider.address,
        profile_image: provider.profile_image,
      },
    })
  } catch (error) {
    console.error("Update provider profile error:", error)
    res.status(500).json({ message: "Failed to update profile. Please try again." })
  }
}
