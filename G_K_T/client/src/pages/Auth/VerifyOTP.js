"use client"

import React, { useState, useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import Header from "../../components/common/Header"
import Footer from "../../components/common/Footer"

const VerifyOTP = () => {
  const { verifyOTP, tempUserData } = useContext(AuthContext)
  const navigate = useNavigate()

  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes in seconds

  // References for OTP inputs
  const inputRefs = Array(6)
    .fill(0)
    .map(() => React.createRef())

  useEffect(() => {
    // Redirect if no tempUserData (user refreshed page or accessed directly)
    if (!tempUserData) {
      navigate("/")
      return
    }

    // Focus on first input
    inputRefs[0].current?.focus()

    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer)
          return 0
        }
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [tempUserData, navigate])

  const handleChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return

    // Update OTP array
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Clear error
    if (error) setError("")

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text")

    // Check if pasted content is a 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("")
      setOtp(digits)

      // Focus last input
      inputRefs[5].current?.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const otpValue = otp.join("")

    if (otpValue.length !== 6) {
      setError("Please enter a valid 6-digit OTP")
      return
    }

    setIsSubmitting(true)

    try {
      await verifyOTP(otpValue)
    } catch (error) {
      console.error("OTP verification error:", error)
      setError("Invalid OTP. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-orange-500 text-white py-4 px-6">
              <h2 className="text-2xl font-bold">Verify Your Email</h2>
              <p className="text-sm">Enter the 6-digit code sent to your email</p>
            </div>

            <form onSubmit={handleSubmit} className="py-6 px-6">
              <div className="mb-6">
                <p className="text-gray-600 text-sm mb-4">
                  We've sent a verification code to <span className="font-semibold">{tempUserData?.email}</span>
                </p>

                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={inputRefs[index]}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  ))}
                </div>

                {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}

                <p className="text-gray-500 text-sm mt-4 text-center">
                  Time remaining: <span className="font-medium">{formatTime(timeLeft)}</span>
                </p>
              </div>

              <button type="submit" className="btn-primary w-full" disabled={isSubmitting || timeLeft === 0}>
                {isSubmitting ? "Verifying..." : "Verify OTP"}
              </button>

              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Didn't receive the code?{" "}
                  <button
                    type="button"
                    className={`text-orange-500 hover:underline ${timeLeft > 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={timeLeft > 0}
                  >
                    Resend
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default VerifyOTP
