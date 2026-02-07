"use client"

import { useState, useEffect, useContext } from "react"
import { Link } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import { SocketContext } from "../../context/SocketContext"
import api from "../../services/api"
import Header from "../../components/common/Header"
import Footer from "../../components/common/Footer"
import { Calendar, Clock, Users, ShoppingBag, TrendingUp, Star, ChevronRight } from "lucide-react"

const ProviderDashboard = () => {
  const { currentUser } = useContext(AuthContext)
  const { socket } = useContext(SocketContext)

  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    averageRating: 0,
  })

  const [recentOrders, setRecentOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          api.get("/provider/stats"),
          api.get("/provider/orders/recent"),
        ])

        setStats(statsRes.data)
        setRecentOrders(ordersRes.data)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()

    // Listen for new orders
    if (socket) {
      socket.on("new_order", (order) => {
        setRecentOrders((prev) => [order, ...prev].slice(0, 5))
        setStats((prev) => ({
          ...prev,
          totalOrders: prev.totalOrders + 1,
          pendingOrders: prev.pendingOrders + 1,
        }))
      })

      return () => {
        socket.off("new_order")
      }
    }
  }, [socket])

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
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Welcome, {currentUser?.mess_name}!</h1>
            <p className="text-gray-600">Here's what's happening with your tiffin service today.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="bg-orange-100 p-3 rounded-full">
                  <ShoppingBag className="h-6 w-6 text-orange-500" />
                </div>
                <div className="ml-4">
                  <h3 className="text-gray-500 text-sm font-medium">Total Orders</h3>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-500" />
                </div>
                <div className="ml-4">
                  <h3 className="text-gray-500 text-sm font-medium">Pending Orders</h3>
                  <p className="text-2xl font-bold text-gray-800">{stats.pendingOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-green-500" />
                </div>
                <div className="ml-4">
                  <h3 className="text-gray-500 text-sm font-medium">Total Customers</h3>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalCustomers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-4">
                  <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
                  <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalRevenue)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Star className="h-6 w-6 text-purple-500" />
                </div>
                <div className="ml-4">
                  <h3 className="text-gray-500 text-sm font-medium">Average Rating</h3>
                  <p className="text-2xl font-bold text-gray-800">{stats.averageRating.toFixed(1)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Quick Actions</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  to="/provider/menu-update"
                  className="flex items-center p-4 border rounded-lg hover:bg-orange-50 transition-colors"
                >
                  <div className="bg-orange-100 p-3 rounded-full">
                    <Calendar className="h-5 w-5 text-orange-500" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium">Update Today's Menu</h3>
                    <p className="text-sm text-gray-500">Add or modify today's food items</p>
                  </div>
                  <ChevronRight className="ml-auto h-5 w-5 text-gray-400" />
                </Link>

                <Link
                  to="/provider/orders"
                  className="flex items-center p-4 border rounded-lg hover:bg-orange-50 transition-colors"
                >
                  <div className="bg-orange-100 p-3 rounded-full">
                    <ShoppingBag className="h-5 w-5 text-orange-500" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium">Manage Orders</h3>
                    <p className="text-sm text-gray-500">View and update order status</p>
                  </div>
                  <ChevronRight className="ml-auto h-5 w-5 text-gray-400" />
                </Link>

                <Link
                  to="/provider/profile"
                  className="flex items-center p-4 border rounded-lg hover:bg-orange-50 transition-colors"
                >
                  <div className="bg-orange-100 p-3 rounded-full">
                    <Users className="h-5 w-5 text-orange-500" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium">Update Profile</h3>
                    <p className="text-sm text-gray-500">Edit your business details</p>
                  </div>
                  <ChevronRight className="ml-auto h-5 w-5 text-gray-400" />
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Recent Orders</h2>
              <Link to="/provider/orders" className="text-orange-500 hover:underline text-sm font-medium">
                View All
              </Link>
            </div>
            <div className="overflow-x-auto">
              {recentOrders.length > 0 ? (
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
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order.orderId}
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
                          <Link to={`/provider/orders/${order._id}`} className="text-orange-500 hover:underline">
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-center text-gray-500">No recent orders found.</div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default ProviderDashboard
