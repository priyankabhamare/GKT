const mongoose = require("mongoose")

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
})

const menuSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    menuType: {
      type: String,
      enum: ["daily", "weekly"],
      default: "daily",
    },
    foodType: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    items: [menuItemSchema],
    messTime: {
      open: { type: String, required: true },
      close: { type: String, required: true },
    },
    homeDelivery: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

// Create a compound index on provider and date
menuSchema.index({ provider: 1, date: 1 }, { unique: true })

const Menu = mongoose.model("Menu", menuSchema)

module.exports = Menu
