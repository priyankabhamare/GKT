import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { AuthProvider } from "./context/AuthContext"
import { SocketProvider } from "./context/SocketContext"

// Pages
import HomePage from "./pages/Home/HomePage"
import CustomerLogin from "./pages/Auth/CustomerLogin"
import CustomerRegister from "./pages/Auth/CustomerRegister"
import ProviderLogin from "./pages/Auth/ProviderLogin"
import ProviderRegister from "./pages/Auth/ProviderRegister"
import VerifyOTP from "./pages/Auth/VerifyOTP"
import CustomerDashboard from "./pages/Customer/CustomerDashboard"
import ProviderDashboard from "./pages/Provider/ProviderDashboard"
import MenuUpdate from "./pages/Provider/MenuUpdate"
import OrderManagement from "./pages/Provider/OrderManagement"
import MessList from "./pages/Customer/MessList"
import MessDetails from "./pages/Customer/MessDetails"
import OrderTracking from "./pages/Customer/OrderTracking"
import NotFound from "./pages/NotFound"

// Protected Routes
import ProtectedRoute from "./components/common/ProtectedRoute"

function App() {
  return (
        <Router>
    <AuthProvider>
      <SocketProvider>
          <Toaster position="top-center" />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/customer/login" element={<CustomerLogin />} />
            <Route path="/customer/register" element={<CustomerRegister />} />
            <Route path="/provider/login" element={<ProviderLogin />} />
            <Route path="/provider/register" element={<ProviderRegister />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />

            {/* Protected Customer Routes */}
            <Route
              path="/customer/dashboard"
              element={
                <ProtectedRoute userType="customer">
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/mess-list"
              element={
                <ProtectedRoute userType="customer">
                  <MessList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/mess/:id"
              element={
                <ProtectedRoute userType="customer">
                  <MessDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/order-tracking"
              element={
                <ProtectedRoute userType="customer">
                  <OrderTracking />
                </ProtectedRoute>
              }
            />

            {/* Protected Provider Routes */}
            <Route
              path="/provider/dashboard"
              element={
                <ProtectedRoute userType="provider">
                  <ProviderDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider/menu-update"
              element={
                <ProtectedRoute userType="provider">
                  <MenuUpdate />
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider/orders"
              element={
                <ProtectedRoute userType="provider">
                  <OrderManagement />
                </ProtectedRoute>
              }
            />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
      </SocketProvider>
    </AuthProvider>
        </Router>
  )
}

export default App
