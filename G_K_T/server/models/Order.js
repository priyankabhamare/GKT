const mongoose = require("mongoose")

const orderItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: [0, "Price cannot be negative"],
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity must be at least 1"],
  },
})

const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    text: {
      type: String,
    },
  },
  { timestamps: true },
)

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      sparse: true, // Allows null/undefined values
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Customer ID is required"],
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Provider ID is required"],
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (items) => items && items.length > 0,
        message: "At least one item is required",
      },
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },
    status: {
      type: String,
      enum: ["pending", "preparing", "out_for_delivery", "delivered", "cancelled"],
      default: "pending",
    },
    deliveryAddress: {
      type: String,
      required: [true, "Delivery address is required"],
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "online"],
      default: "cash",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    notes: {
      type: String,
    },
    review: reviewSchema,
    isReviewed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

// Generate order ID before saving
orderSchema.pre("save", async function (next) {
  try {
    // Only generate orderId if it doesn't exist
    if (!this.orderId) {
      // Generate a random order ID with current date and random number
      const date = new Date()
      const randomNum = Math.floor(1000 + Math.random() * 9000)
      this.orderId = `TF${date.getFullYear()}${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}${randomNum}`
    }
    next()
  } catch (error) {
    console.error("Error generating order ID:", error)
    next(error)
  }
})

const Order = mongoose.model("Order", orderSchema)

module.exports = Order
