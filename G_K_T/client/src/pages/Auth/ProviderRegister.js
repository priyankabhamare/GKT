"use client"

import { useState, useContext, useRef } from "react"
import { Link } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import Header from "../../components/common/Header"
import Footer from "../../components/common/Footer"
import { Eye, EyeOff, Upload } from "lucide-react"
import toast from "react-hot-toast"

const ProviderRegister = () => {
  const { register } = useContext(AuthContext)
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    mess_name: "",
    owner_name: "",
    email: "",
    mobile_no: "",
    address: "",
    password: "",
    confirmPassword: "",
    profile_image: null,
  })

  const [previewImage, setPreviewImage] = useState(null)
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

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData({
        ...formData,
        profile_image: file,
      })

      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result)
      }
      reader.readAsDataURL(file)

      // Clear error
      if (errors.profile_image) {
        setErrors({
          ...errors,
          profile_image: "",
        })
      }
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current.click()
  }

  const validateForm = () => {
    const newErrors = {}

    // Mess name validation
    if (!formData.mess_name.trim()) {
      newErrors.mess_name = "Mess name is required"
    }

    // Owner name validation
    if (!formData.owner_name.trim()) {
      newErrors.owner_name = "Owner name is required"
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

    // Profile image validation - make it optional for now to help debug
    if (!formData.profile_image) {
      console.log("No profile image selected - continuing anyway")
      // newErrors.profile_image = "Profile image is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (validateForm()) {
      setIsSubmitting(true)

      try {
        // Create FormData object for file upload
        const providerFormData = new FormData()
        providerFormData.append("mess_name", formData.mess_name)
        providerFormData.append("owner_name", formData.owner_name)
        providerFormData.append("email", formData.email)
        providerFormData.append("mobile_no", formData.mobile_no)
        providerFormData.append("address", formData.address)
        providerFormData.append("password", formData.password)

        // Only append profile_image if it exists
        if (formData.profile_image) {
          providerFormData.append("profile_image", formData.profile_image)
        }

        // Log form data for debugging (don't include password in logs)
        console.log("Submitting provider registration with data:", {
          mess_name: formData.mess_name,
          owner_name: formData.owner_name,
          email: formData.email,
          mobile_no: formData.mobile_no,
          address: formData.address,
          has_profile_image: formData.profile_image ? true : false,
        })

        const result = await register(providerFormData, "provider")

        if (result) {
          toast.success("Registration successful! Please verify your email.")
        }
      } catch (error) {
        console.error("Registration error:", error)
        toast.error(error.response?.data?.message || "Registration failed. Please try again.")
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
              <h2 className="text-2xl font-bold">Provider Registration</h2>
              <p className="text-sm">Join GharKaTiffin as a tiffin service provider</p>
            </div>

            <form onSubmit={handleSubmit} className="py-6 px-6">
              <div className="form-group">
                <label htmlFor="mess_name" className="form-label">
                  Mess/Business Name
                </label>
                <input
                  type="text"
                  id="mess_name"
                  name="mess_name"
                  value={formData.mess_name}
                  onChange={handleChange}
                  className={`input-field ${errors.mess_name ? "border-red-500" : ""}`}
                  placeholder="Enter your mess or business name"
                />
                {errors.mess_name && <p className="text-red-500 text-xs mt-1">{errors.mess_name}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="owner_name" className="form-label">
                  Owner Name
                </label>
                <input
                  type="text"
                  id="owner_name"
                  name="owner_name"
                  value={formData.owner_name}
                  onChange={handleChange}
                  className={`input-field ${errors.owner_name ? "border-red-500" : ""}`}
                  placeholder="Enter owner's full name"
                />
                {errors.owner_name && <p className="text-red-500 text-xs mt-1">{errors.owner_name}</p>}
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
                  Business Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`input-field ${errors.address ? "border-red-500" : ""}`}
                  placeholder="Enter your business address"
                  rows="3"
                ></textarea>
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Profile Image (Optional)</label>
                <div
                  className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-gray-50 ${
                    errors.profile_image ? "border-red-500" : "border-gray-300"
                  }`}
                  onClick={triggerFileInput}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />

                  {previewImage ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={previewImage || "/placeholder.svg"}
                        alt="Profile Preview"
                        className="w-32 h-32 object-cover rounded-full mb-2"
                      />
                      <p className="text-sm text-gray-500">Click to change image</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-sm font-medium">Click to upload profile image</p>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF (Max 2MB)</p>
                    </div>
                  )}
                </div>
                {errors.profile_image && <p className="text-red-500 text-xs mt-1">{errors.profile_image}</p>}
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
                <Link to="/provider/login" className="text-orange-500 hover:underline">
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

export default ProviderRegister
