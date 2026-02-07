"use client"

import { useState, useContext } from "react"
import { Link } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import Header from "../../components/common/Header"
import Footer from "../../components/common/Footer"
import { Eye, EyeOff } from "lucide-react"

const CustomerRegister = () => {
  const { register } = useContext(AuthContext)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile_no: "",
    address: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    // Mobile validation
    if (!formData.mobile_no) {
      newErrors.mobile_no = "Mobile number is required"
    } else if (!/^\d{10}$/.test(formData.mobile_no)) {
      newErrors.mobile_no = "Mobile number must be 10 digits"
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = "Address is required"
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (validateForm()) {
      setIsSubmitting(true)

      try {
        // Remove confirmPassword before sending to API
        const { confirmPassword, ...customerData } = formData
        await register(customerData, "customer")
      } catch (error) {
        console.error("Registration error:", error)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-orange-500 text-white py-4 px-6">
              <h2 className="text-2xl font-bold">Customer Registration</h2>
              <p className="text-sm">Join GharKaTiffin to find the best tiffin services</p>
            </div>

            <form onSubmit={handleSubmit} className="py-6 px-6">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`input-field ${errors.name ? "border-red-500" : ""}`}
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input-field ${errors.email ? "border-red-500" : ""}`}
                  placeholder="Enter your email"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="mobile_no" className="form-label">
                  Mobile Number
                </label>
                <input
                  type="text"
                  id="mobile_no"
                  name="mobile_no"
                  value={formData.mobile_no}
                  onChange={handleChange}
                  className={`input-field ${errors.mobile_no ? "border-red-500" : ""}`}
                  placeholder="Enter your 10-digit mobile number"
                />
                {errors.mobile_no && <p className="text-red-500 text-xs mt-1">{errors.mobile_no}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="address" className="form-label">
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`input-field ${errors.address ? "border-red-500" : ""}`}
                  placeholder="Enter your full address"
                  rows="3"
                ></textarea>
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`input-field ${errors.password ? "border-red-500" : ""}`}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input-field ${errors.confirmPassword ? "border-red-500" : ""}`}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              <button type="submit" className="btn-primary w-full mt-4" disabled={isSubmitting}>
                {isSubmitting ? "Registering..." : "Register"}
              </button>

              <p className="text-center mt-4 text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/customer/login" className="text-orange-500 hover:underline">
                  Login here
                </Link>
              </p>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default CustomerRegister
