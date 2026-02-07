"use client"

import { useContext } from "react"
import { Navigate } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import LoadingSpinner from "./LoadingSpinner"

const ProtectedRoute = ({ children, userType }) => {
  const { currentUser, loading } = useContext(AuthContext)

  if (loading) {
    return <LoadingSpinner />
  }

  if (!currentUser) {
    return <Navigate to="/" replace />
  }

  // Check if the user type matches
  if (userType && currentUser.role !== userType) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
