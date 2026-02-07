import { Clock, Filter, Star, TruckIcon, Utensils } from "lucide-react"
import { Link } from "react-router-dom"
import Footer from "../../components/common/Footer"
import Header from "../../components/common/Header"

const HomePage = () => {
  // Sample food images for the carousel
  const foodImages = [
    { id: 1, src: "https://cookwithrenu.com/wp-content/uploads/2020/09/Gujarati-Thali_Featured-Image.jpg", alt: "Homemade Thali" },
    { id: 2, src: "https://www.archanaskitchen.com/images/archanaskitchen/0-Affiliate-Articles/RESTAURANT_STYLE_SOUTH_INDIAN_THALI_original.jpg", alt: "South Indian Meal" },
    { id: 3, src: "https://thepinevintahotel.com/images/gujarati-thali/01.png", alt: "Gujarati Thali" },
    { id: 4, src: "https://img.freepik.com/premium-photo/maharashtrian-food-thali-platter-mumbai-style-meal-from-indian_466689-5452.jpg?w=2000", alt: "Maharashtrian Special" },
  ]

  // Features list
  const features = [
    {
      icon: <Utensils className="h-10 w-10 text-orange-500" />,
      title: "Homemade Food",
      description: "Enjoy authentic homemade meals prepared with love and care.",
    },
    {
      icon: <Clock className="h-10 w-10 text-orange-500" />,
      title: "Daily Updates",
      description: "Get daily or weekly menu updates from your favorite tiffin providers.",
    },
    {
      icon: <Star className="h-10 w-10 text-orange-500" />,
      title: "Quality Assured",
      description: "All our providers maintain high standards of hygiene and quality.",
    },
    {
      icon: <TruckIcon className="h-10 w-10 text-orange-500" />,
      title: "Home Delivery",
      description: "Get your meals delivered right to your doorstep.",
    },
    {
      icon: <Filter className="h-10 w-10 text-orange-500" />,
      title: "Customized Search",
      description: "Find tiffin services based on cuisine type, price range, and location.",
    },
  ]

  // Testimonials
  const testimonials = [
    {
      id: 1,
      name: "Rahul Sharma",
      role: "Customer",
      image: "https://delhiupscsecrets.in/wp-content/uploads/2024/12/indian-students-isolated-white-background_988871-9.jpg",
      quote:
        "GharKaTiffin has made my life so much easier. I get delicious homemade food every day without any hassle.",
    },
    {
      id: 2,
      name: "Priya Patel",
      role: "Tiffin Provider",
      image: "https://img.freepik.com/premium-photo/photo-young-indian-woman-her-mid-20s-college-student-holding-book-her-chest_878783-7283.jpg?w=2000",
      quote:
        "This platform has helped me grow my small tiffin business. Now I have regular customers who love my food!",
    },
    {
      id: 3,
      name: "Amit Verma",
      role: "Customer",
      image: "https://img.freepik.com/premium-photo/poised-indian-college-boy-tailored-formal-suit_878783-15102.jpg",
      quote: "The variety of food options available is amazing. I can choose from different cuisines every day.",
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Homemade Tiffin Service At Your Fingertips</h1>
                <p className="text-lg mb-6">
                  Connect with local tiffin providers and enjoy delicious homemade meals delivered to your doorstep.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/customer/register"
                    className="bg-white text-orange-600 hover:bg-gray-100 font-bold py-3 px-6 rounded-lg transition-all"
                  >
                    Register as Customer
                  </Link>
                  <Link
                    to="/provider/register"
                    className="bg-transparent hover:bg-white hover:text-orange-600 text-white font-bold py-3 px-6 rounded-lg border-2 border-white transition-all"
                  >
                    Register as Provider
                  </Link>
                </div>
              </div>
              <div className="md:w-1/2">
                <img src="https://www.pinclipart.com/picdir/big/62-626908_gate-clip-art.png" alt="Delicious Tiffin Food" className="w-48 h-auto rounded-lg shadow-xl ml-auto" />
              </div>
            </div>
          </div>
        </section>

        {/* Food Showcase */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Delicious Homemade Food</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {foodImages.map((food) => (
                <div key={food.id} className="card hover:shadow-lg transition-shadow">
                  <img src={food.src || "/placeholder.svg"} alt={food.alt} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg">{food.alt}</h3>
                    <p className="text-gray-600 text-sm">Authentic homemade goodness</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose GharKaTiffin?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="card p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="card p-6 text-center">
                <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-orange-500 text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Register</h3>
                <p className="text-gray-600">Sign up as a customer or tiffin provider in just a few steps.</p>
              </div>
              <div className="card p-6 text-center">
                <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-orange-500 text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Browse & Order</h3>
                <p className="text-gray-600">
                  Browse through various tiffin services, check menus, and place your order.
                </p>
              </div>
              <div className="card p-6 text-center">
                <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-orange-500 text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Enjoy</h3>
                <p className="text-gray-600">Receive your delicious homemade food and enjoy your meal!</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="card p-6">
                  <div className="flex flex-col items-center text-center">
                    <img
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="w-20 h-20 rounded-full object-cover mb-4"
                    />
                    <p className="text-gray-600 italic mb-4">"{testimonial.quote}"</p>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-orange-500 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Join GharKaTiffin today and discover the convenience of homemade tiffin services.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/customer/register"
                className="bg-white text-orange-600 hover:bg-gray-100 font-bold py-3 px-6 rounded-lg transition-all"
              >
                Register as Customer
              </Link>
              <Link
                to="/provider/register"
                className="bg-transparent hover:bg-white hover:text-orange-600 text-white font-bold py-3 px-6 rounded-lg border-2 border-white transition-all"
              >
                Register as Provider
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default HomePage
