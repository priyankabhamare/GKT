import axios from "axios"
import toast from "react-hot-toast"

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
})

// Add a request interceptor to include the token in all requests
api.interceptors.request.use(
  (config) => {
    // Log outgoing requests in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `API Request: ${config.method.toUpperCase()} ${config.url}`,
        config.data ? (config.data instanceof FormData ? "FormData" : config.data) : "No data",
      )
    }

    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `API Response: ${response.status} ${response.config.url}`,
        response.data ? "Data received" : "No data",
      )
    }
    return response
  },
  (error) => {
    // Log error responses in development
    if (process.env.NODE_ENV === "development") {
      console.error(
        "API Error:",
        error.response
          ? {
              status: error.response.status,
              url: error.config?.url,
              data: error.response.data,
            }
          : error.message,
      )
    }

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem("token")
        if (
          window.location.pathname !== "/" &&
          !window.location.pathname.includes("/login") &&
          !window.location.pathname.includes("/register")
        ) {
          toast.error("Session expired. Please login again.")
          window.location.href = "/"
        }
      } else if (error.response.status === 403) {
        toast.error("You don't have permission to access this resource")
      } else if (error.response.status === 404) {
        // Don't show toast for 404s as they might be expected in some cases
        console.error("Resource not found:", error.config.url)
      } else if (error.response.status >= 500) {
        toast.error("Server error. Please try again later.")
      }
    } else if (error.request) {
      // The request was made but no response was received
      toast.error("Network error. Please check your connection.")
    } else {
      // Something happened in setting up the request that triggered an Error
      toast.error("An unexpected error occurred.")
    }

    return Promise.reject(error)
  },
)

export default api
