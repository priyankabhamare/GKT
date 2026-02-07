import { Link } from "react-router-dom"
import { Facebook, Twitter, Instagram, Mail, Phone } from "lucide-react"
import logo from './images/logo1.png'

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white pt-10 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div>
            <Link to="/" className="flex items-center mb-4">
              <img
                src={logo}
                alt="GharKaTiffin Logo"
                className="h-10 w-10 mr-2 bg-white rounded-full p-1"
              />
              <span className="text-xl font-bold text-orange-500">GharKaTiffin</span>
            </Link>
            <p className="text-gray-300 text-sm">
              Connecting you with homemade tiffin services in your area. Enjoy healthy, homemade food delivered to your
              doorstep.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-orange-500 pb-2">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-orange-500 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/customer/register" className="text-gray-300 hover:text-orange-500 transition-colors">
                  Register as Customer
                </Link>
              </li>
              <li>
                <Link to="/provider/register" className="text-gray-300 hover:text-orange-500 transition-colors">
                  Register as Provider
                </Link>
              </li>
              <li>
                <Link to="/customer/mess-list" className="text-gray-300 hover:text-orange-500 transition-colors">
                  Find Tiffin Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-orange-500 pb-2">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Mail size={16} className="mr-2 text-orange-500" />
                <a
                  href="gharkatiffinservices@gmail.com"
                  className="text-gray-300 hover:text-orange-500 transition-colors"
                >
                  gharkatiffinservices@gmail.com
                </a>
              </li>
              <li className="flex items-center">
                <Phone size={16} className="mr-2 text-orange-500" />
                <a href="tel:+919876543210" className="text-gray-300 hover:text-orange-500 transition-colors">
                  +91 9876543210
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-orange-500 pb-2">Follow Us</h3>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-orange-500 transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-orange-500 transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-orange-500 transition-colors"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-gray-700 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} GharKaTiffin. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
