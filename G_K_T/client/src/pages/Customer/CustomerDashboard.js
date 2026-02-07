"use client"

import { useState, useEffect, useContext } from "react"
import { Link } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import { SocketContext } from "../../context/SocketContext"
import api from "../../services/api"
import Header from "../../components/common/Header"
import Footer from "../../components/common/Footer"
import { ShoppingBag, Clock, Star, ChevronRight, MapPin, Search } from "lucide-react"

const CustomerDashboard = () => {
  const { currentUser } = useContext(AuthContext)
  const { socket } = useContext(SocketContext)

  const [recentOrders, setRecentOrders] = useState([])
  const [nearbyMesses, setNearbyMesses] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersRes, messesRes] = await Promise.all([
          api.get("/customer/orders/recent"),
          api.get("/customer/messes/nearby"),
        ])

        setRecentOrders(ordersRes.data)
        setNearbyMesses(messesRes.data)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()

    // Listen for order status updates
    if (socket) {
      socket.on("order_status_updated", ({ orderId, status }) => {
        setRecentOrders((prev) => prev.map((order) => (order._id === orderId ? { ...order, status } : order)))
      })

      return () => {
        socket.off("order_status_updated")
      }
    }
  }, [socket])

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

  // Get order status color
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "preparing":
        return "bg-blue-100 text-blue-800"
      case "out_for_delivery":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Get formatted status text
  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Pending"
      case "preparing":
        return "Preparing"
      case "out_for_delivery":
        return "Out for Delivery"
      case "delivered":
        return "Delivered"
      case "cancelled":
        return "Cancelled"
      default:
        return status
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

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Welcome, {currentUser?.name}!</h1>
            <p className="text-gray-600">Find and order delicious homemade tiffin meals.</p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for tiffin services, cuisines, or dishes..."
                    className="pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 w-full"
                  />
                </div>
                <Link to="/customer/mess-list" className="btn-primary whitespace-nowrap">
                  Find Tiffin
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Recent Orders</h2>
              <Link to="/customer/order-tracking" className="text-orange-500 hover:underline text-sm font-medium">
                View All
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {recentOrders.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <div key={order._id} className="p-4 hover:bg-gray-50">
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="mb-2 md:mb-0">
                          <div className="flex items-center">
                            <img
                              src={order.provider.profile_image || "/placeholder.svg"}
                              alt={order.provider.mess_name}
                              className="w-10 h-10 rounded-full object-cover mr-3"
                            />
                            <div>
                              <h3 className="font-medium text-gray-800">{order.provider.mess_name}</h3>
                              <p className="text-sm text-gray-500">
                                Order #{order.orderId} • {formatDate(order.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-6">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getStatusColor(order.status)}`}
                          >
                            {getStatusText(order.status)}
                          </span>
                          <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
                          <Link
                            to={`/customer/order-tracking/${order._id}`}
                            className="text-orange-500 hover:underline text-sm"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>You haven't placed any orders yet.</p>
                  <Link to="/customer/mess-list" className="text-orange-500 hover:underline mt-2 inline-block">
                    Browse tiffin services
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Nearby Messes */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Nearby Tiffin Services</h2>
              <Link to="/customer/mess-list" className="text-orange-500 hover:underline text-sm font-medium">
                View All
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nearbyMesses.map((mess) => (
                <div
                  key={mess._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={mess.profile_image || "/placeholder.svg"}
                      alt={mess.mess_name}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-sm font-medium text-gray-800 shadow">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span>{mess.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-800">{mess.mess_name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{mess.foodType} Cuisine</p>

                    <div className="flex items-start mb-3">
                      <MapPin className="h-4 w-4 text-gray-400 mr-1 mt-0.5" />
                      <p className="text-sm text-gray-600 line-clamp-2">{mess.address}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-600">
                          {mess.messTime.open} - {mess.messTime.close}
                        </span>
                      </div>
                      <span className="font-medium text-gray-800">{formatCurrency(mess.price)}</span>
                    </div>

                    <Link
                      to={`/customer/mess/${mess._id}`}
                      className="btn-primary w-full mt-4 flex items-center justify-center"
                    >
                      View Menu
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </div>
              ))}

              {nearbyMesses.length === 0 && (
                <div className="col-span-full p-6 text-center text-gray-500 bg-white rounded-lg shadow-md">
                  <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No tiffin services found in your area.</p>
                  <Link to="/customer/mess-list" className="text-orange-500 hover:underline mt-2 inline-block">
                    Browse all tiffin services
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default CustomerDashboard
