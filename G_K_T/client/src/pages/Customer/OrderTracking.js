"use client"

import { useState, useEffect, useContext } from "react"
import { Link } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import { SocketContext } from "../../context/SocketContext"
import api from "../../services/api"
import Header from "../../components/common/Header"
import Footer from "../../components/common/Footer"
import { ShoppingBag, Filter, ChevronDown, ChevronUp, Clock, ChevronRight } from "lucide-react"

const OrderTracking = () => {
  const { currentUser } = useContext(AuthContext)
  const { socket } = useContext(SocketContext)

  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("")

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get("/customer/orders")
        setOrders(data)
        setFilteredOrders(data)
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()

    // Listen for order status updates
    if (socket) {
      socket.on("order_status_updated", ({ orderId, status }) => {
        setOrders((prev) => prev.map((order) => (order._id === orderId ? { ...order, status } : order)))
        setFilteredOrders((prev) => prev.map((order) => (order._id === orderId ? { ...order, status } : order)))
      })

      return () => {
        socket.off("order_status_updated")
      }
    }
  }, [socket])

  useEffect(() => {
    let result = [...orders]

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((order) => order.status === statusFilter)
    }

    // Date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter).setHours(0, 0, 0, 0)
      result = result.filter((order) => {
        const orderDate = new Date(order.createdAt).setHours(0, 0, 0, 0)
        return orderDate === filterDate
      })
    }

    setFilteredOrders(result)
  }, [orders, statusFilter, dateFilter])

  const resetFilters = () => {
    setStatusFilter("all")
    setDateFilter("")
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
            <p className="text-gray-600">Track your orders and view order history</p>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center text-gray-700 hover:text-orange-500"
                  >
                    <Filter className="h-5 w-5 mr-1" />
                    <span>Filters</span>
                    {showFilters ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
                  </button>
                  <div className="ml-4 text-sm text-gray-500">
                    {filteredOrders.length} {filteredOrders.length === 1 ? "order" : "orders"} found
                  </div>
                </div>
              </div>

              {showFilters && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      id="status-filter"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="input-field"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="preparing">Preparing</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-1">
                      Order Date
                    </label>
                    <input
                      type="date"
                      id="date-filter"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={resetFilters}
                      className="text-orange-500 hover:text-orange-600 text-sm font-medium"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            {filteredOrders.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <div key={order._id} className="p-6 hover:bg-gray-50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
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
                              <span className="mr-2">Order #{order.orderId}</span>
                              <Clock className="h-3 w-3 mr-1" />
                              <span>
                                {formatDate(order.createdAt)} at {formatTime(order.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row items-start md:items-center md:space-x-4 space-y-2 md:space-y-0">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}
                        >
                          {getStatusText(order.status)}
                        </span>
                        <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
                        <Link
                          to={`/customer/order-tracking/${order._id}`}
                          className="flex items-center text-orange-500 hover:underline text-sm font-medium"
                        >
                          View Details <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </div>
                    </div>

                    <div className="border-t border-dashed border-gray-200 pt-4 mt-2">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Order Items:</h4>
                      <div className="flex flex-wrap gap-2">
                        {order.items.map((item, index) => (
                          <div
                            key={index}
                            className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700 flex items-center"
                          >
                            <span>
                              {item.name} × {item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-700 mb-1">No orders found</h3>
                <p>You haven't placed any orders yet.</p>
                <Link to="/customer/mess-list" className="text-orange-500 hover:underline mt-2 inline-block">
                  Browse tiffin services
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default OrderTracking
