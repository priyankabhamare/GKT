"use client"

import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import { SocketContext } from "../../context/SocketContext"
import api from "../../services/api"
import Header from "../../components/common/Header"
import Footer from "../../components/common/Footer"
import { Plus, Trash2, Save, Calendar, Clock, AlertCircle } from "lucide-react"
import toast from "react-hot-toast"

const MenuUpdate = () => {
  const { currentUser } = useContext(AuthContext)
  const { socket } = useContext(SocketContext)
  const navigate = useNavigate()

  const [menuType, setMenuType] = useState("daily")
  const [foodType, setFoodType] = useState("Maharashtrian")
  const [price, setPrice] = useState("")
  const [messTime, setMessTime] = useState({
    open: "08:00",
    close: "20:00",
  })
  const [homeDelivery, setHomeDelivery] = useState(false)
  const [menuItems, setMenuItems] = useState([{ name: "", description: "" }])
  const [currentMenu, setCurrentMenu] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const now = new Date()
    return now.toISOString().split("T")[0]
  }

  const [selectedDate, setSelectedDate] = useState(getCurrentDate())

  useEffect(() => {
    const fetchCurrentMenu = async () => {
      try {
        const { data } = await api.get(`/provider/menu?date=${selectedDate}`)
        if (data) {
          setCurrentMenu(data)
          setMenuType(data.menuType)
          setFoodType(data.foodType)
          setPrice(data.price.toString())
          setMessTime({
            open: data.messTime.open,
            close: data.messTime.close,
          })
          setHomeDelivery(data.homeDelivery)
          setMenuItems(data.items.length > 0 ? data.items : [{ name: "", description: "" }])
        }
      } catch (error) {
        console.error("Error fetching menu:", error)
        // If no menu exists for today, keep default values
      } finally {
        setIsLoading(false)
      }
    }

    fetchCurrentMenu()
  }, [selectedDate])

  const handleAddMenuItem = () => {
    setMenuItems([...menuItems, { name: "", description: "" }])
  }

  const handleRemoveMenuItem = (index) => {
    const updatedItems = [...menuItems]
    updatedItems.splice(index, 1)
    setMenuItems(updatedItems.length > 0 ? updatedItems : [{ name: "", description: "" }])
  }

  const handleMenuItemChange = (index, field, value) => {
    const updatedItems = [...menuItems]
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    }
    setMenuItems(updatedItems)
  }

  const validateForm = () => {
    // Check if price is valid
    if (!price || isNaN(Number.parseFloat(price)) || Number.parseFloat(price) <= 0) {
      toast.error("Please enter a valid price")
      return false
    }

    // Check if at least one menu item has a name
    const hasValidMenuItem = menuItems.some((item) => item.name.trim() !== "")
    if (!hasValidMenuItem) {
      toast.error("Please add at least one menu item")
      return false
    }

    // Filter out empty menu items
    const validMenuItems = menuItems.filter((item) => item.name.trim() !== "")
    if (validMenuItems.length === 0) {
      toast.error("Please add at least one menu item")
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Filter out empty menu items
      const validMenuItems = menuItems.filter((item) => item.name.trim() !== "")

      const menuData = {
        date: selectedDate,
        menuType,
        foodType,
        price: Number.parseFloat(price),
        messTime,
        homeDelivery,
        items: validMenuItems,
      }

      const { data } = await api.post("/provider/menu", menuData)

      // Emit socket event for real-time updates
      if (socket) {
        socket.emit("menu_updated", {
          providerId: currentUser._id,
          menu: data,
        })
      }

      toast.success("Menu updated successfully!")
      navigate("/provider/dashboard")
    } catch (error) {
      console.error("Error updating menu:", error)
      toast.error("Failed to update menu. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-10 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-orange-500 text-white py-4 px-6">
                <h2 className="text-2xl font-bold">Update Menu</h2>
                <p className="text-sm">Add or modify your tiffin menu</p>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                {/* Date Selection */}
                <div className="mb-6">
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Date
                  </label>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <input
                      type="date"
                      id="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={getCurrentDate()}
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Menu Type */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Menu Type</label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="menuType"
                        value="daily"
                        checked={menuType === "daily"}
                        onChange={() => setMenuType("daily")}
                        className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300"
                      />
                      <span className="ml-2 text-gray-700">Daily</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="menuType"
                        value="weekly"
                        checked={menuType === "weekly"}
                        onChange={() => setMenuType("weekly")}
                        className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300"
                      />
                      <span className="ml-2 text-gray-700">Weekly</span>
                    </label>
                  </div>
                </div>

                {/* Food Type */}
                <div className="mb-6">
                  <label htmlFor="foodType" className="block text-sm font-medium text-gray-700 mb-1">
                    Food Type
                  </label>
                  <select
                    id="foodType"
                    value={foodType}
                    onChange={(e) => setFoodType(e.target.value)}
                    className="input-field"
                  >
                    <option value="Maharashtrian">Maharashtrian</option>
                    <option value="South Indian">South Indian</option>
                    <option value="Gujarati">Gujarati</option>
                    <option value="North Indian">North Indian</option>
                    <option value="Bengali">Bengali</option>
                    <option value="Punjabi">Punjabi</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Enter price per tiffin"
                    min="1"
                    step="1"
                    className="input-field"
                    required
                  />
                </div>

                {/* Mess Time */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mess Time</label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-400 mr-2" />
                      <input
                        type="time"
                        value={messTime.open}
                        onChange={(e) => setMessTime({ ...messTime, open: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>
                    <span className="text-gray-500">to</span>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-400 mr-2" />
                      <input
                        type="time"
                        value={messTime.close}
                        onChange={(e) => setMessTime({ ...messTime, close: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Home Delivery */}
                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={homeDelivery}
                      onChange={(e) => setHomeDelivery(e.target.checked)}
                      className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700">Home Delivery Available</span>
                  </label>
                </div>

                {/* Menu Items */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Menu Items</label>
                    <button
                      type="button"
                      onClick={handleAddMenuItem}
                      className="flex items-center text-sm text-orange-500 hover:text-orange-600"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Item
                    </button>
                  </div>

                  {menuItems.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-md mb-3">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-medium text-gray-700">Item #{index + 1}</h4>
                        {menuItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMenuItem(index)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor={`item-name-${index}`}
                            className="block text-xs font-medium text-gray-500 mb-1"
                          >
                            Item Name
                          </label>
                          <input
                            type="text"
                            id={`item-name-${index}`}
                            value={item.name}
                            onChange={(e) => handleMenuItemChange(index, "name", e.target.value)}
                            placeholder="Enter food item name"
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`item-desc-${index}`}
                            className="block text-xs font-medium text-gray-500 mb-1"
                          >
                            Description (Optional)
                          </label>
                          <input
                            type="text"
                            id={`item-desc-${index}`}
                            value={item.description}
                            onChange={(e) => handleMenuItemChange(index, "description", e.target.value)}
                            placeholder="Brief description"
                            className="input-field"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {menuItems.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                      <p>No menu items added. Click "Add Item" to start.</p>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button type="submit" className="btn-primary flex items-center" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update Menu
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default MenuUpdate
