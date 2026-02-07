import { Link } from "react-router-dom"
import Header from "../components/common/Header"
import Footer from "../components/common/Footer"

const NotFound = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <h1 className="text-6xl font-bold text-orange-500 mb-4">You're All Caught Up</h1>
            <h2 className="text-3xl font-semibold text-gray-800 mb-6">Thank You</h2>
            <p className="text-gray-600 mb-10 max-w-md">
               Please check back later or explore other sections of the site.
            </p>
            <Link to="/" className="btn-primary">
              Back to Home
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default NotFound
