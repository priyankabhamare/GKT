"use client"

import { useState, useEffect, useContext } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import api from "../../services/api"
import Header from "../../components/common/Header"
import Footer from "../../components/common/Footer"
import { Star, MapPin, Clock, Phone, Calendar, ShoppingBag, Plus, Minus, Truck, ChevronRight } from "lucide-react"
import toast from "react-hot-toast"

const MessDetails = () => {
  const { id } = useParams()
  const { currentUser } = useContext(AuthContext)
  const navigate = useNavigate()

  const [mess, setMess] = useState(null)
  const [menu, setMenu] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [notes, setNotes] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [orderError, setOrderError] = useState(null)

  useEffect(() => {
    const fetchMessDetails = async () => {
      try {
        const [messRes, menuRes] = await Promise.all([
          api.get(`/customer/messes/${id}`),
          api.get(`/customer/messes/${id}/menu`),
        ])

        setMess(messRes.data)
        setMenu(menuRes.data)
        setDeliveryAddress(currentUser?.address || "")
      } catch (error) {
        console.error("Error fetching mess details:", error)
        toast.error("Failed to load mess details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessDetails()
  }, [id, currentUser])

  const addToCart = (item) => {
    const existingItem = cart.find((cartItem) => cartItem._id === item._id)

    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem._id === item._id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
        ),
      )
    } else {
      setCart([...cart, { ...item, quantity: 1 }])
    }

    toast.success(`Added ${item.name} to cart`)
  }

  const removeFromCart = (itemId) => {
    setCart(cart.filter((item) => item._id !== itemId))
  }

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId)
      return
    }

    setCart(cart.map((item) => (item._id === itemId ? { ...item, quantity: newQuantity } : item)))
  }

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.quantity * mess.price, 0)
  }

  const handleCheckout = async () => {
    // Reset previous error
    setOrderError(null)

    if (cart.length === 0) {
      toast.error("Your cart is empty")
      return
    }

    if (!deliveryAddress.trim()) {
      toast.error("Please enter a delivery address")
      return
    }

    setIsPlacingOrder(true)

    try {
      console.log("Preparing order data...")

      // Prepare order data
      const orderData = {
        providerId: mess._id,
        items: cart.map((item) => ({
          _id: item._id,
          name: item.name,
          price: mess.price,
          quantity: item.quantity,
        })),
        totalAmount: calculateTotal(),
        deliveryAddress: deliveryAddress,
        paymentMethod: paymentMethod,
        notes: notes,
      }

      console.log("Submitting order:", orderData)

      // Send order request
      const { data } = await api.post("/customer/orders", orderData)

      console.log("Order placed successfully:", data)
      toast.success("Order placed successfully!")

      // Clear cart
      setCart([])

      // Navigate to order tracking
      navigate(`/customer/order-tracking/${data._id}`)
    } catch (error) {
      console.error("Error placing order:", error)

      // Set detailed error message
      if (error.response?.data?.message) {
        setOrderError(error.response.data.message)
        toast.error(`Failed to place order: ${error.response.data.message}`)
      } else if (error.message) {
        setOrderError(error.message)
        toast.error(`Failed to place order: ${error.message}`)
      } else {
        setOrderError("Unknown error occurred")
        toast.error("Failed to place order. Please try again.")
      }
    } finally {
      setIsPlacingOrder(false)
    }
  }

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-10 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Mess Details */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="relative">
              <img
                src={mess.profile_image || "/placeholder.svg"}
                alt={mess.mess_name}
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <h1 className="text-3xl font-bold mb-1">{mess.mess_name}</h1>
                <p className="mb-2">{mess.foodType} Cuisine</p>
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 mr-1" />
                  <span className="font-medium mr-2">{mess.rating.toFixed(1)}</span>
                  <span className="text-sm">({mess.reviewCount} reviews)</span>
                </div>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium mb-2">Contact Information</h3>
                <div className="flex items-start text-sm text-gray-600 mb-2">
                  <Phone className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                  <span>{mess.mobile_no}</span>
                </div>
                <div className="flex items-start text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                  <span>{mess.address}</span>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Mess Time</h3>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  <span>
                    {mess.messTime.open} - {mess.messTime.close}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Tiffin Price</h3>
                <div className="flex items-center text-sm">
                  <span className="font-medium text-lg text-gray-800">{formatCurrency(mess.price)}</span>
                  <span className="text-gray-500 ml-2">per meal</span>
                </div>
                {mess.homeDelivery && (
                  <div className="mt-2 flex items-center text-green-600 text-sm">
                    <Truck className="h-4 w-4 mr-1" />
                    <span>Home delivery available</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Menu Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {menu ? (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6 border-b">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-gray-800">Today's Menu</h2>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Updated on {formatDate(menu.updatedAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {menu.items.map((item) => (
                      <div key={item._id} className="p-6 flex justify-between items-center hover:bg-gray-50">
                        <div>
                          <h3 className="font-medium text-gray-800">{item.name}</h3>
                          {item.description && <p className="text-sm text-gray-500 mt-1">{item.description}</p>}
                        </div>
                        <button
                          onClick={() => addToCart(item)}
                          className="flex items-center justify-center h-8 w-8 rounded-full bg-orange-100 text-orange-500 hover:bg-orange-500 hover:text-white transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {menu.items.length === 0 && (
                    <div className="p-6 text-center text-gray-500">No menu items available for today.</div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-700 mb-1">No menu available</h3>
                  <p>This tiffin provider hasn't updated their menu for today.</p>
                </div>
              )}
            </div>

            {/* Cart Section */}
            <div>
              <div className="sticky top-4">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">Your Order</h2>
                  </div>

                  {cart.length > 0 ? (
                    <div>
                      <div className="p-6 max-h-[300px] overflow-y-auto">
                        {cart.map((item) => (
                          <div key={item._id} className="flex justify-between items-center mb-4 last:mb-0">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800">{item.name}</h4>
                              <div className="flex items-center mt-1">
                                <button
                                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                  className="h-6 w-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="mx-2 text-sm min-w-[20px] text-center">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                  className="h-6 w-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{formatCurrency(item.quantity * mess.price)}</div>
                              <button
                                onClick={() => removeFromCart(item._id)}
                                className="text-xs text-red-500 hover:underline mt-1"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-gray-200 p-6">
                        <div className="flex justify-between mb-4">
                          <span className="font-medium">Total:</span>
                          <span className="font-bold text-lg">{formatCurrency(calculateTotal())}</span>
                        </div>

                        <div className="mb-4">
                          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                            Delivery Address
                          </label>
                          <textarea
                            id="address"
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            className="input-field"
                            rows="2"
                            placeholder="Enter your delivery address"
                          ></textarea>
                        </div>

                        <div className="mb-4">
                          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                            Notes (Optional)
                          </label>
                          <textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="input-field"
                            rows="2"
                            placeholder="Any special instructions?"
                          ></textarea>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                          <div className="flex space-x-4">
                            <label className="inline-flex items-center">
                              <input
                                type="radio"
                                name="paymentMethod"
                                value="cash"
                                checked={paymentMethod === "cash"}
                                onChange={() => setPaymentMethod("cash")}
                                className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300"
                              />
                              <span className="ml-2 text-gray-700 text-sm">Cash on Delivery</span>
                            </label>
                            <label className="inline-flex items-center">
                              <input
                                type="radio"
                                name="paymentMethod"
                                value="online"
                                checked={paymentMethod === "online"}
                                onChange={() => setPaymentMethod("online")}
                                className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300"
                              />
                              <span className="ml-2 text-gray-700 text-sm">Online Payment</span>
                            </label>
                          </div>
                        </div>

                        {/* Display order error if any */}
                        {orderError && (
                          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                            <p className="font-medium">Error placing order:</p>
                            <p>{orderError}</p>
                          </div>
                        )}

                        <button
                          onClick={handleCheckout}
                          className="btn-primary w-full flex items-center justify-center"
                          disabled={isPlacingOrder}
                        >
                          {isPlacingOrder ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              Place Order <ChevronRight className="h-4 w-4 ml-1" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>Your cart is empty.</p>
                      <p className="text-sm mt-1">Add some delicious items from the menu!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default MessDetails
