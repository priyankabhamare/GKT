"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../../services/api"
import Header from "../../components/common/Header"
import Footer from "../../components/common/Footer"
import { Star, MapPin, Clock, Filter, Search, ChevronDown, ChevronUp, Truck } from "lucide-react"

const MessList = () => {
  const [messes, setMesses] = useState([])
  const [filteredMesses, setFilteredMesses] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Filter states
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [foodTypeFilter, setFoodTypeFilter] = useState("all")
  const [priceRangeFilter, setPriceRangeFilter] = useState("all")
  const [homeDeliveryFilter, setHomeDeliveryFilter] = useState(false)
  const [sortBy, setSortBy] = useState("rating")

  useEffect(() => {
    const fetchMesses = async () => {
      try {
        const { data } = await api.get("/customer/messes")
        setMesses(data)
        setFilteredMesses(data)
      } catch (error) {
        console.error("Error fetching messes:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMesses()
  }, [])

  // Apply filters
  useEffect(() => {
    let result = [...messes]

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (mess) =>
          mess.mess_name.toLowerCase().includes(query) ||
          mess.foodType.toLowerCase().includes(query) ||
          mess.address.toLowerCase().includes(query),
      )
    }

    // Food type filter
    if (foodTypeFilter !== "all") {
      result = result.filter((mess) => mess.foodType === foodTypeFilter)
    }

    // Price range filter
    if (priceRangeFilter !== "all") {
      const [min, max] = priceRangeFilter.split("-").map(Number)
      if (max) {
        result = result.filter((mess) => mess.price >= min && mess.price <= max)
      } else {
        result = result.filter((mess) => mess.price >= min)
      }
    }

    // Home delivery filter
    if (homeDeliveryFilter) {
      result = result.filter((mess) => mess.homeDelivery)
    }

    // Sort
    switch (sortBy) {
      case "rating":
        result.sort((a, b) => b.rating - a.rating)
        break
      case "price_low":
        result.sort((a, b) => a.price - b.price)
        break
      case "price_high":
        result.sort((a, b) => b.price - a.price)
        break
      default:
        break
    }

    setFilteredMesses(result)
  }, [messes, searchQuery, foodTypeFilter, priceRangeFilter, homeDeliveryFilter, sortBy])

  const resetFilters = () => {
    setSearchQuery("")
    setFoodTypeFilter("all")
    setPriceRangeFilter("all")
    setHomeDeliveryFilter(false)
    setSortBy("rating")
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Find Tiffin Services</h1>
            <p className="text-gray-600">Discover the best homemade tiffin services in your area</p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div className="relative flex-grow">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, cuisine, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 w-full"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center text-gray-700 hover:text-orange-500"
              >
                <Filter className="h-5 w-5 mr-1" />
                <span>Filters</span>
                {showFilters ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
              </button>
            </div>

            {showFilters && (
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label htmlFor="food-type" className="block text-sm font-medium text-gray-700 mb-1">
                      Cuisine Type
                    </label>
                    <select
                      id="food-type"
                      value={foodTypeFilter}
                      onChange={(e) => setFoodTypeFilter(e.target.value)}
                      className="input-field"
                    >
                      <option value="all">All Cuisines</option>
                      <option value="Maharashtrian">Maharashtrian</option>
                      <option value="South Indian">South Indian</option>
                      <option value="Gujarati">Gujarati</option>
                      <option value="North Indian">North Indian</option>
                      <option value="Bengali">Bengali</option>
                      <option value="Punjabi">Punjabi</option>
                      <option value="Mixed">Mixed</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="price-range" className="block text-sm font-medium text-gray-700 mb-1">
                      Price Range
                    </label>
                    <select
                      id="price-range"
                      value={priceRangeFilter}
                      onChange={(e) => setPriceRangeFilter(e.target.value)}
                      className="input-field"
                    >
                      <option value="all">All Prices</option>
                      <option value="0-50">Under ₹50</option>
                      <option value="50-100">₹50 - ₹100</option>
                      <option value="100-150">₹100 - ₹150</option>
                      <option value="150">Above ₹150</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">
                      Sort By
                    </label>
                    <select
                      id="sort-by"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="input-field"
                    >
                      <option value="rating">Rating (High to Low)</option>
                      <option value="price_low">Price (Low to High)</option>
                      <option value="price_high">Price (High to Low)</option>
                    </select>
                  </div>

                  <div className="flex flex-col justify-between">
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={homeDeliveryFilter}
                          onChange={(e) => setHomeDeliveryFilter(e.target.checked)}
                          className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Home Delivery Only</span>
                      </label>
                    </div>

                    <button
                      onClick={resetFilters}
                      className="text-orange-500 hover:text-orange-600 text-sm font-medium mt-2"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="mb-4">
            <p className="text-gray-600">
              {filteredMesses.length} {filteredMesses.length === 1 ? "result" : "results"} found
            </p>
          </div>

          {/* Mess List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMesses.map((mess) => (
              <div
                key={mess._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <img
                    src={mess.profile_image || "/placeholder.svg"}
                    alt={mess.mess_name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-sm font-medium text-gray-800 shadow">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span>{mess.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  {mess.homeDelivery && (
                    <div className="absolute top-2 left-2 bg-green-500 px-2 py-1 rounded-full text-xs font-medium text-white shadow">
                      <div className="flex items-center">
                        <Truck className="h-3 w-3 mr-1" />
                        <span>Delivery</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg text-gray-800">{mess.mess_name}</h3>
                    <span className="font-medium text-gray-800">{formatCurrency(mess.price)}</span>
                  </div>

                  <p className="text-sm text-gray-500 mb-3">{mess.foodType} Cuisine</p>

                  <div className="flex items-start mb-3">
                    <MapPin className="h-4 w-4 text-gray-400 mr-1 mt-0.5" />
                    <p className="text-sm text-gray-600 line-clamp-2">{mess.address}</p>
                  </div>

                  <div className="flex items-center mb-4">
                    <Clock className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-600">
                      {mess.messTime.open} - {mess.messTime.close}
                    </span>
                  </div>

                  <Link
                    to={`/customer/mess/${mess._id}`}
                    className="btn-primary w-full flex items-center justify-center"
                  >
                    View Menu
                  </Link>
                </div>
              </div>
            ))}

            {filteredMesses.length === 0 && (
              <div className="col-span-full p-8 text-center text-gray-500 bg-white rounded-lg shadow-md">
                <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-700 mb-1">No results found</h3>
                <p>Try adjusting your search or filter criteria</p>
                <button onClick={resetFilters} className="text-orange-500 hover:underline mt-2">
                  Reset all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default MessList
