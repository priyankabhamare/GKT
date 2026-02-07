const { Server } = require("socket.io")
const jwt = require("jsonwebtoken")
const User = require("../models/User")

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      credentials: true,
    },
  })

  // Socket.io middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token
      if (!token) {
        return next(new Error("Authentication error"))
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.id)

      if (!user) {
        return next(new Error("User not found"))
      }

      socket.user = {
        _id: user._id,
        role: user.role,
      }

      next()
    } catch (error) {
      next(new Error("Authentication error"))
    }
  })

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id)

    // Join room based on user role
    if (socket.user) {
      socket.join(`${socket.user.role}-${socket.user._id}`)
      console.log(`User ${socket.user._id} joined ${socket.user.role} room`)
    }

    // Handle menu updates
    socket.on("menu_updated", (data) => {
      // Broadcast to all customers
      io.emit("menu_updated", data)
    })

    // Handle order status updates
    socket.on("order_status_updated", (data) => {
      const { orderId, status, customerId, providerId } = data

      // Emit to specific customer
      io.to(`customer-${customerId}`).emit("order_status_updated", { orderId, status })

      // Emit to specific provider
      io.to(`provider-${providerId}`).emit("order_status_updated", { orderId, status })
    })

    // Handle new order
    socket.on("new_order", (data) => {
      // Emit to specific provider
      io.to(`provider-${data.providerId}`).emit("new_order", data)
    })

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id)
    })
  })

  return io
}

module.exports = setupSocket
