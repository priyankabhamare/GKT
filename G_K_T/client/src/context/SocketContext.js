"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { io } from "socket.io-client"
import { AuthContext } from "./AuthContext"

export const SocketContext = createContext()

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const { currentUser } = useContext(AuthContext)

  useEffect(() => {
    // Initialize socket connection when user is authenticated
    if (currentUser) {
      const newSocket = io(process.env.REACT_APP_API_URL || "http://localhost:5000", {
        auth: {
          token: localStorage.getItem("token"),
        },
      })

      setSocket(newSocket)

      // Socket event listeners
      newSocket.on("connect", () => {
        console.log("Socket connected")
      })

      newSocket.on("disconnect", () => {
        console.log("Socket disconnected")
      })

      // Clean up on unmount
      return () => {
        newSocket.disconnect()
      }
    } else {
      // Disconnect socket when user logs out
      if (socket) {
        socket.disconnect()
        setSocket(null)
      }
    }
  }, [currentUser])

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>
}
