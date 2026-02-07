"use client"

import React, { useState, useEffect, useContext } from "react"
import { AuthContext } from "../../context/AuthContext"
import { SocketContext } from "../../context/SocketContext"
import api from "../../services/api"
import Header from "../../components/common/Header"
import Footer from "../../components/common/Footer"
import { Calendar, Filter, Search, ChevronDown, ChevronUp, Phone, MapPin } from "lucide-react"
import toast from "react-hot-toast"

const OrderManagement = () => {
  const { currentUser } = useContext(AuthContext)
  const { socket } = useContext(SocketContext)

  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedOrderId, setExpandedOrderId] = useState(null)

  // Filter states
  const [dateFilter, setDateFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get("/provider/orders")
        setOrders(data)
        setFilteredOrders(data)
      } catch (error) {
        console.error("Error fetching orders:", error)
        toast.error("Failed to load orders")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()

    // Listen for new orders
    if (socket) {
      socket.on("new_order", (order) => {
        setOrders((prev) => [order, ...prev])
        setFilteredOrders((prev) => [order, ...prev])
        toast.success("New order received!")
      })

      socket.on("order_status_updated", ({ orderId, status }) => {
        setOrders((prev) => prev.map((order) => (order._id === orderId ? { ...order, status } : order)))
        setFilteredOrders((prev) => prev.map((order) => (order._id === orderId ? { ...order, status } : order)))
      })

      return () => {
        socket.off("new_order")
        socket.off("order_status_updated")
      }
    }
  }, [socket])

  // Apply filters
  useEffect(() => {
    let result = [...orders]

    // Date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter).setHours(0, 0, 0, 0)
      result = result.filter((order) => {
        const orderDate = new Date(order.createdAt).setHours(0, 0, 0, 0)
        return orderDate === filterDate
      })
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((order) => order.status === statusFilter)
    }

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (order) =>
          order.orderId.toLowerCase().includes(query) ||
          order.customer.name.toLowerCase().includes(query) ||
          order.customer.mobile_no.includes(query),
      )
    }

    setFilteredOrders(result)
  }, [orders, dateFilter, statusFilter, searchQuery])

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/provider/orders/${orderId}/status`, { status: newStatus })

      // Update local state
      setOrders((prev) => prev.map((order) => (order._id === orderId ? { ...order, status: newStatus } : order)))

      toast.success("Order status updated successfully")
    } catch (error) {
      console.error("Error updating order status:", error)
      toast.error("Failed to update order status")
    }
  }

  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId)
  }

  const resetFilters = () => {
    setDateFilter("")
    setStatusFilter("all")
    setSearchQuery("")
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
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-orange-500 text-white py-4 px-6">
              <h2 className="text-2xl font-bold">Order Management</h2>
              <p className="text-sm">View and manage all your orders</p>
            </div>

            {/* Filters */}
            <div className="p-6 border-b">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center text-gray-700 hover:text-orange-500 mr-4"
                  >
                    <Filter className="h-5 w-5 mr-1" />
                    <span>Filters</span>
                    {showFilters ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
                  </button>

                  <div className="text-sm text-gray-500">
                    {filteredOrders.length} {filteredOrders.length === 1 ? "order" : "orders"} found
                  </div>
                </div>

                <div className="relative">
                  <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by order ID or customer"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 w-full md:w-64"
                  />
                </div>
              </div>

              {showFilters && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                      <input
                        type="date"
                        id="date-filter"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="input-field"
                      />
                    </div>
                  </div>

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

            {/* Orders List */}
            <div className="overflow-x-auto">
              {filteredOrders.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <React.Fragment key={order._id}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <button
                              onClick={() => toggleOrderDetails(order._id)}
                              className="flex items-center text-orange-500 hover:text-orange-600"
                            >
                              #{order.orderId}
                              {expandedOrderId === order._id ? (
                                <ChevronUp className="h-4 w-4 ml-1" />
                              ) : (
                                <ChevronDown className="h-4 w-4 ml-1" />
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>{formatDate(order.createdAt)}</div>
                            <div className="text-xs text-gray-400">{formatTime(order.createdAt)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(order.totalAmount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}
                            >
                              {getStatusText(order.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                              className="border border-gray-300 rounded-md text-sm p-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
                              disabled={order.status === "delivered" || order.status === "cancelled"}
                            >
                              <option value="pending">Pending</option>
                              <option value="preparing">Preparing</option>
                              <option value="out_for_delivery">Out for Delivery</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>

                        {/* Expanded Order Details */}
                        {expandedOrderId === order._id && (
                          <tr>
                            <td colSpan={6} className="px-6 py-4 bg-gray-50">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Order Items</h4>
                                  <ul className="space-y-2">
                                    {order.items.map((item, index) => (
                                      <li key={index} className="flex justify-between text-sm">
                                        <span>{item.name}</span>
                                        <span className="text-gray-600">
                                          {item.quantity} × {formatCurrency(item.price)}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                  <div className="mt-4 pt-2 border-t border-gray-200 flex justify-between font-medium">
                                    <span>Total</span>
                                    <span>{formatCurrency(order.totalAmount)}</span>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Customer Details</h4>
                                  <div className="space-y-2 text-sm">
                                    <p>
                                      <span className="font-medium">Name:</span> {order.customer.name}
                                    </p>
                                    <p className="flex items-center">
                                      <span className="font-medium mr-1">Phone:</span>
                                      <Phone className="h-3 w-3 text-gray-400 mr-1" />
                                      <a
                                        href={`tel:${order.customer.mobile_no}`}
                                        className="text-orange-500 hover:underline"
                                      >
                                        {order.customer.mobile_no}
                                      </a>
                                    </p>
                                    <p className="flex items-start">
                                      <span className="font-medium mr-1">Address:</span>
                                      <MapPin className="h-3 w-3 text-gray-400 mr-1 mt-1" />
                                      <span>{order.deliveryAddress}</span>
                                    </p>
                                    <p>
                                      <span className="font-medium">Payment Method:</span> {order.paymentMethod}
                                    </p>
                                    <p>
                                      <span className="font-medium">Payment Status:</span> {order.paymentStatus}
                                    </p>
                                  </div>

                                  {order.notes && (
                                    <div className="mt-4">
                                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Notes</h4>
                                      <p className="text-sm text-gray-600">{order.notes}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-center text-gray-500">No orders found matching your filters.</div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default OrderManagement
