import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import Sidebar from './components/Sidebar/Sidebar'
import AuthModal from './components/AuthModal/AuthModal'
import Dashboard from './Pages/Dashboard/Dashboard'
import Home from './Pages/Home/Home'
import About from './Pages/About/About'
import Facilities from './Pages/Facilities/Facilities'
import Gallery from './Pages/Gallery/Gallery'
import EventsRates from './Pages/EventsRates/EventsRates'
import Directions from './Pages/Directions/Directions'
import Support from './Pages/Support/Support'
import Reservation from './Pages/Reservation/Reservation'
import MyReservations from './Pages/MyReservations/MyReservations'
import BookingCatalog from './Pages/BookingCatalog/BookingCatalog'
import CustomerRecords from './Pages/CustomerRecords/CustomerRecords'
import CustomerInquiries from './Pages/CustomerInquiries/CustomerInquiries'
import CustomerReviews from './Pages/CustomerReviews/CustomerReviews'
import Analytics from './Pages/Analytics/Analytics'
import PricesPolicies from './Pages/PricesPolicies/PricesPolicies'
import EmailNotificationToast from './components/EmailNotificationToast/EmailNotificationToast'
import './App.css'

function AppContent() {
  const { isAdmin, isAuthenticated } = useAuth()
  const [currentPage, setCurrentPage] = useState(() => {
    try {
      const savedUser = localStorage.getItem('polchat_auth_user')
      if (savedUser) {
        const parsed = JSON.parse(savedUser)
        if (parsed?.role === 'admin') return 'dashboard'
      }
    } catch {
      // fallback
    }
    return 'home'
  })
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Redirect admin to dashboard if they are currently on a guest page
  useEffect(() => {
    if (isAdmin) {
      const publicPages = ['home', 'about', 'facilities', 'gallery', 'events-rates', 'directions', 'support', 'reservation', 'my-reservations']
      if (publicPages.includes(currentPage)) {
        setCurrentPage('dashboard')
      }
    }
  }, [isAdmin, currentPage])

  // When logged out, exit from admin or customer-protected pages and default to visitor home
  useEffect(() => {
    if (!isAuthenticated) {
      const protectedPages = [
        'dashboard',
        'booking-catalog',
        'customer-records',
        'customer-inquiries',
        'customer-reviews',
        'analytics',
        'prices-policies',
        'admin',
        'my-reservations',
        'reservation',
      ]
      if (protectedPages.includes(currentPage)) {
        setCurrentPage('home')
      }
    }
  }, [isAuthenticated, currentPage])

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />
      case 'home':
        return <Home />
      case 'about':
        return <About />
      case 'facilities':
        return <Facilities />
      case 'gallery':
        return <Gallery />
      case 'events-rates':
        return <EventsRates />
      case 'directions':
        return <Directions />
      case 'support':
        return <Support />
      case 'reservation':
        return <Reservation />
      case 'my-reservations':
        return <MyReservations onNavigate={setCurrentPage} />
      case 'booking-catalog':
      case 'admin':
        return <BookingCatalog />
      case 'customer-records':
        return <CustomerRecords />
      case 'customer-inquiries':
        return <CustomerInquiries />
      case 'customer-reviews':
        return <CustomerReviews />
      case 'analytics':
        return <Analytics />
      case 'prices-policies':
        return <PricesPolicies />
      default:
        return isAdmin ? <Dashboard onNavigate={setCurrentPage} /> : <Home />
    }
  }

  return (
    <div className="app-container">
      <Navbar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onToggleSidebar={() => setIsSidebarOpen(true)}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />

      <main className="page-content">
        {renderPage()}
      </main>

      {/* Hide footer for Admin users on staff management portals */}
      {!isAdmin && <Footer onNavigate={setCurrentPage} />}
      
      <AuthModal onAdminLoggedIn={() => setCurrentPage('dashboard')} />
      <EmailNotificationToast />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
