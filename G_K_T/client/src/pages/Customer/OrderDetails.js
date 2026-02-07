"use client"

import { useState, useEffect, useContext } from "react"
import { useParams, Link } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import { SocketContext } from "../../context/SocketContext"
import api from "../../services/api"
import Header from "../../components/common/Header"
import Footer from "../../components/common/Footer"
import {
  Check,
  MapPin,
  Phone,
  Clock,
  ArrowLeft,
  Truck,
  ChevronRight,
  AlertTriangle,
  MessageCircle,
  Star,
} from "lucide-react"
import toast from "react-hot-toast"

const OrderDetails = () => {
  const { id } = useParams()
  const { currentUser } = useContext(AuthContext)
  const { socket } = useContext(SocketContext)

  const [order, setOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reviewText, setReviewText] = useState("")
  const [rating, setRating] = useState(5)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const { data } = await api.get(`/customer/orders/${id}`)
        setOrder(data)
      } catch (error) {
        console.error("Error fetching order details:", error)
        toast.error("Failed to load order details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrderDetails()

    // Listen for order status updates
    if (socket) {
      socket.on("order_status_updated", ({ orderId, status }) => {
        if (orderId === id) {
          setOrder((prev) => (prev ? { ...prev, status } : null))
        }
      })

      return () => {
        socket.off("order_status_updated")
      }
    }
  }, [id, socket])

  const submitReview = async (e) => {
    e.preventDefault()

    if (order.status !== "delivered") {
      toast.error("You can only review delivered orders")
      return
    }

    if (!reviewText.trim()) {
      toast.error("Please enter a review")
      return
    }

    setIsSubmittingReview(true)

    try {
      await api.post(`/customer/orders/${id}/review`, {
        rating,
        text: reviewText,
      })

      toast.success("Review submitted successfully")
      setOrder((prev) => ({
        ...prev,
        isReviewed: true,
        review: { rating, text: reviewText },
      }))
      setReviewText("")
    } catch (error) {
      console.error("Error submitting review:", error)
      toast.error("Failed to submit review")
    } finally {
      setIsSubmittingReview(false)
    }
  }

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Format time
  const formatTime = (dateString) => {
    const options = { hour: "2-digit", minute: "2-digit" }
    return new Date(dateString).toLocaleTimeString(undefined, options)
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Get order status info
  const getStatusInfo = (status) => {
    switch (status) {
      case "pending":
        return { color: "bg-yellow-100 text-yellow-800", text: "Pending", icon: <Clock className="h-5 w-5" /> }
      case "preparing":
        return { color: "bg-blue-100 text-blue-800", text: "Preparing", icon: <Clock className="h-5 w-5" /> }
      case "out_for_delivery":
        return { color: "bg-purple-100 text-purple-800", text: "Out for Delivery", icon: <Truck className="h-5 w-5" /> }
      case "delivered":
        return { color: "bg-green-100 text-green-800", text: "Delivered", icon: <Check className="h-5 w-5" /> }
      case "cancelled":
        return {
          color: "bg-red-100 text-red-800",
          text: "Cancelled",
          icon: <AlertTriangle className="h-5 w-5" />,
        }
      default:
        return { color: "bg-gray-100 text-gray-800", text: status, icon: <Clock className="h-5 w-5" /> }
    }
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

  if (!order) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-10 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-red-500" />
              <h3 className="text-xl font-medium text-gray-800 mb-2">Order Not Found</h3>
              <p className="text-gray-600 mb-4">Sorry, we couldn't find the order you're looking for.</p>
              <Link to="/customer/order-tracking" className="btn-primary inline-flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const statusInfo = getStatusInfo(order.status)

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Link
              to="/customer/order-tracking"
              className="inline-flex items-center text-gray-600 hover:text-orange-500"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Orders
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Order Status */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-800">Order Status</h2>
                </div>

                <div className="p-6">
                  <div className="flex items-center mb-6">
                    <div className={`p-3 rounded-full ${statusInfo.color} mr-4`}>{statusInfo.icon}</div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">{statusInfo.text}</h3>
                      <p className="text-gray-500">
                        {order.status === "delivered"
                          ? "Your order has been delivered successfully."
                          : order.status === "cancelled"
                            ? "Your order has been cancelled."
                            : "Your order is being processed."}
                      </p>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="space-y-8">
                    <div className="relative pl-8">
                      <div
                        className={`absolute left-0 top-0 w-5 h-5 rounded-full border-2 ${
                          order.status !== "cancelled" ? "bg-green-500 border-green-500" : "bg-gray-300 border-gray-300"
                        } z-10`}
                      ></div>
                      {order.status !== "cancelled" && (
                        <div className="absolute left-2.5 top-5 bottom-0 w-0.5 bg-gray-300"></div>
                      )}
                      <div>
                        <h4 className="font-medium text-gray-800">Order Placed</h4>
                        <p className="text-sm text-gray-500">
                          {formatDate(order.createdAt)} at {formatTime(order.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="relative pl-8">
                      <div
                        className={`absolute left-0 top-0 w-5 h-5 rounded-full border-2 ${
                          order.status === "preparing" ||
                          order.status === "out_for_delivery" ||
                          order.status === "delivered"
                            ? "bg-green-500 border-green-500"
                            : "bg-gray-300 border-gray-300"
                        } z-10`}
                      ></div>
                      {(order.status === "preparing" ||
                        order.status === "out_for_delivery" ||
                        order.status === "delivered") && (
                        <div className="absolute left-2.5 top-5 bottom-0 w-0.5 bg-gray-300"></div>
                      )}
                      <div>
                        <h4 className="font-medium text-gray-800">Preparing</h4>
                        <p className="text-sm text-gray-500">
                          {order.status === "preparing" ||
                          order.status === "out_for_delivery" ||
                          order.status === "delivered"
                            ? "Your order is being prepared"
                            : "Waiting to be prepared"}
                        </p>
                      </div>
                    </div>

                    <div className="relative pl-8">
                      <div
                        className={`absolute left-0 top-0 w-5 h-5 rounded-full border-2 ${
                          order.status === "out_for_delivery" || order.status === "delivered"
                            ? "bg-green-500 border-green-500"
                            : "bg-gray-300 border-gray-300"
                        } z-10`}
                      ></div>
                      {(order.status === "out_for_delivery" || order.status === "delivered") && (
                        <div className="absolute left-2.5 top-5 bottom-0 w-0.5 bg-gray-300"></div>
                      )}
                      <div>
                        <h4 className="font-medium text-gray-800">Out for Delivery</h4>
                        <p className="text-sm text-gray-500">
                          {order.status === "out_for_delivery"
                            ? "Your order is on the way"
                            : order.status === "delivered"
                              ? "Your order was out for delivery"
                              : "Waiting to be dispatched"}
                        </p>
                      </div>
                    </div>

                    <div className="relative pl-8">
                      <div
                        className={`absolute left-0 top-0 w-5 h-5 rounded-full border-2 ${
                          order.status === "delivered" ? "bg-green-500 border-green-500" : "bg-gray-300 border-gray-300"
                        } z-10`}
                      ></div>
                      <div>
                        <h4 className="font-medium text-gray-800">Delivered</h4>
                        <p className="text-sm text-gray-500">
                          {order.status === "delivered" ? "Your order has been delivered" : "Waiting to be delivered"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                <div className="p-6 border-b">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Order Details</h2>
                    <span className="text-gray-500">Order #{order.orderId}</span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                    <div className="mb-4 md:mb-0">
                      <div className="flex items-center">
                        <img
                          src={order.provider.profile_image || "/placeholder.svg"}
                          alt={order.provider.mess_name}
                          className="w-12 h-12 rounded-full object-cover mr-3"
                        />
                        <div>
                          <h3 className="font-medium text-lg text-gray-800">{order.provider.mess_name}</h3>
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone className="h-3 w-3 mr-1" />
                            <span>{order.provider.mobile_no}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-gray-500">Order Date</div>
                      <div>
                        {formatDate(order.createdAt)} at {formatTime(order.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-b border-gray-200 py-4 my-4">
                    <h3 className="font-medium text-gray-800 mb-3">Items</h3>
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center mb-2 last:mb-0">
                        <div className="flex items-center">
                          <span className="text-gray-800">{item.name}</span>
                          <span className="text-gray-500 mx-2">×</span>
                          <span className="text-gray-800">{item.quantity}</span>
                        </div>
                        <div className="text-gray-800">{formatCurrency(item.price * item.quantity)}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <span className="font-medium">Total Amount</span>
                    <span className="font-bold text-xl">{formatCurrency(order.totalAmount)}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Delivery Address</h4>
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 text-gray-400 mr-1 mt-0.5" />
                        <span className="text-gray-600">{order.deliveryAddress}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Payment Information</h4>
                      <div className="text-gray-600">
                        <div>Method: {order.paymentMethod === "cash" ? "Cash on Delivery" : "Online Payment"}</div>
                        <div>Status: {order.paymentStatus}</div>
                      </div>
                    </div>
                  </div>

                  {order.notes && (
                    <div className="mt-4 bg-gray-50 p-3 rounded-md">
                      <h4 className="font-medium text-gray-700 mb-1">Order Notes</h4>
                      <p className="text-sm text-gray-600">{order.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Review Section - Only show for delivered orders */}
              {order.status === "delivered" && !order.isReviewed && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">Leave a Review</h2>
                  </div>

                  <div className="p-6">
                    <form onSubmit={submitReview}>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setRating(value)}
                              className={`h-8 w-8 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 mr-1 ${
                                value <= rating ? "bg-yellow-400" : "bg-gray-200"
                              }`}
                            >
                              {value}
                            </button>
                          ))}
                          <span className="ml-2 text-gray-600">{rating} out of 5</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-2">
                          Your Review
                        </label>
                        <textarea
                          id="review"
                          className="input-field"
                          rows="4"
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          placeholder="Share your experience with this tiffin service..."
                          required
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        className="btn-primary flex items-center"
                        disabled={isSubmittingReview || !reviewText.trim()}
                      >
                        {isSubmittingReview ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Submit Review
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Show submitted review */}
              {order.isReviewed && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">Your Review</h2>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <Star
                            key={value}
                            className={`h-5 w-5 ${
                              value <= order.review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-gray-600">{order.review.rating} out of 5</span>
                    </div>
                    <p className="text-gray-700">{order.review.text}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Support and Actions */}
            <div>
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-800">Need Help?</h2>
                </div>

                <div className="p-6">
                  <p className="text-gray-600 mb-4">If you have any issues with your order, please contact us:</p>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-500 mr-2" />
                      <span className="text-gray-800">+91 9876543210</span>
                    </div>
                    <div className="flex items-center">
                      <MessageCircle className="h-5 w-5 text-gray-500 mr-2" />
                      <span className="text-gray-800">support@gharkatiffin.com</span>
                    </div>
                  </div>

                  {order.status !== "cancelled" && order.status !== "delivered" && (
                    <div className="mt-6">
                      <button className="btn-secondary w-full flex items-center justify-center">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Cancel Order
                      </button>
                    </div>
                  )}

                  <div className="mt-4">
                    <Link
                      to={`/customer/mess/${order.provider._id}`}
                      className="text-orange-500 hover:underline flex items-center justify-center"
                    >
                      Order Again <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
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

export default OrderDetails
