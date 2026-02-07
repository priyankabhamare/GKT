"use client"

import { createContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import toast from "react-hot-toast"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tempUserData, setTempUserData] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is logged in
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem("token")

        if (token) {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`
          const { data } = await api.get("/auth/me")
          setCurrentUser(data.user)
        }
      } catch (error) {
        console.error("Authentication error:", error)
        localStorage.removeItem("token")
        delete api.defaults.headers.common["Authorization"]
      } finally {
        setLoading(false)
      }
    }

    checkLoggedIn()
  }, [])

  const login = async (email, password, userType) => {
    try {
      setLoading(true)
      const { data } = await api.post(`/auth/${userType}/login`, { email, password })

      localStorage.setItem("token", data.token)
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`

      setCurrentUser(data.user)
      toast.success("Login successful!")

      navigate(`/${userType}/dashboard`)
      return true
    } catch (error) {
      console.error("Login error:", error)
      toast.error(error.response?.data?.message || "Login failed. Please try again.")
      return false
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData, userType) => {
    try {
      setLoading(true)
      console.log(
        `Registering ${userType} with data:`,
        userType === "provider" ? "FormData object (contains file)" : userData,
      )

      // Check if we're dealing with FormData (for provider with image)
      const isFormData = userData instanceof FormData

      // Set the correct content type for the request
      const headers = isFormData ? { "Content-Type": "multipart/form-data" } : { "Content-Type": "application/json" }

      const { data } = await api.post(`/auth/${userType}/register`, userData, { headers })

      // Store email for OTP verification
      const email = isFormData ? userData.get("email") : userData.email

      setTempUserData({
        email,
        userType,
      })

      toast.success("Registration successful! Please verify your email.")
      navigate("/verify-otp")
      return true
    } catch (error) {
      console.error("Registration error:", error)

      // More detailed error logging
      if (error.response) {
        console.error("Error response data:", error.response.data)
        console.error("Error response status:", error.response.status)
      }

      toast.error(error.response?.data?.message || "Registration failed. Please try again.")
      return false
    } finally {
      setLoading(false)
    }
  }

  const verifyOTP = async (otp) => {
    try {
      setLoading(true)
      if (!tempUserData) {
        toast.error("Session expired. Please register again.")
        navigate("/")
        return false
      }

      const { data } = await api.post("/auth/verify-otp", {
        email: tempUserData.email,
        otp,
        userType: tempUserData.userType,
      })

      localStorage.setItem("token", data.token)
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`

      setCurrentUser(data.user)
      setTempUserData(null)

      toast.success("Email verified successfully!")
      navigate(`/${tempUserData.userType}/dashboard`)
      return true
    } catch (error) {
      console.error("OTP verification error:", error)
      toast.error(error.response?.data?.message || "Verification failed. Please try again.")
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    delete api.defaults.headers.common["Authorization"]
    setCurrentUser(null)
    toast.success("Logged out successfully!")
    navigate("/")
  }

  const value = {
    currentUser,
    loading,
    tempUserData,
    login,
    register,
    verifyOTP,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
