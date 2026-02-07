"use client"

import { useContext, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import { Menu, X } from "lucide-react"
import logo from './images/logo1.png'

const Header = () => {
  const { currentUser, logout } = useContext(AuthContext)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={logo} alt="GharKaTiffin Logo" className="h-12 w-12 bg-black rounded-full  mr-2 object-cover" />
            <span className="text-xl font-bold text-orange-500">GharKaTiffin</span>
          </Link>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-gray-700 focus:outline-none" onClick={toggleMenu}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              <>
                {currentUser.role === "customer" && (
                  <>
                    <Link to="/customer/dashboard" className="text-gray-700 hover:text-orange-500">
                      Dashboard
                    </Link>
                    <Link to="/customer/mess-list" className="text-gray-700 hover:text-orange-500">
                      Find Mess
                    </Link>
                    <Link to="/customer/order-tracking" className="text-gray-700 hover:text-orange-500">
                      My Orders
                    </Link>
                  </>
                )}

                {currentUser.role === "provider" && (
                  <>
                    <Link to="/provider/dashboard" className="text-gray-700 hover:text-orange-500">
                      Dashboard
                    </Link>
                    <Link to="/provider/menu-update" className="text-gray-700 hover:text-orange-500">
                      Update Menu
                    </Link>
                    <Link to="/provider/orders" className="text-gray-700 hover:text-orange-500">
                      Orders
                    </Link>
                  </>
                )}

                <button onClick={handleLogout} className="btn-secondary">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/customer/login" className="text-gray-700 hover:text-orange-500">
                  Customer Login
                </Link>
                <Link to="/provider/login" className="text-gray-700 hover:text-orange-500">
                  Provider Login
                </Link>
                <Link to="/customer/register" className="btn-secondary">
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-3">
              {currentUser ? (
                <>
                  {currentUser.role === "customer" && (
                    <>
                      <Link to="/customer/dashboard" className="text-gray-700 hover:text-orange-500 py-2">
                        Dashboard
                      </Link>
                      <Link to="/customer/mess-list" className="text-gray-700 hover:text-orange-500 py-2">
                        Find Mess
                      </Link>
                      <Link to="/customer/order-tracking" className="text-gray-700 hover:text-orange-500 py-2">
                        My Orders
                      </Link>
                    </>
                  )}

                  {currentUser.role === "provider" && (
                    <>
                      <Link to="/provider/dashboard" className="text-gray-700 hover:text-orange-500 py-2">
                        Dashboard
                      </Link>
                      <Link to="/provider/menu-update" className="text-gray-700 hover:text-orange-500 py-2">
                        Update Menu
                      </Link>
                      <Link to="/provider/orders" className="text-gray-700 hover:text-orange-500 py-2">
                        Orders
                      </Link>
                    </>
                  )}

                  <button onClick={handleLogout} className="btn-secondary w-full">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/customer/login" className="text-gray-700 hover:text-orange-500 py-2">
                    Customer Login
                  </Link>
                  <Link to="/provider/login" className="text-gray-700 hover:text-orange-500 py-2">
                    Provider Login
                  </Link>
                  <Link to="/customer/register" className="btn-secondary w-full">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}

export default Header
