import { useState } from 'react'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import Sidebar from './components/Sidebar/Sidebar'
import AuthModal from './components/AuthModal/AuthModal'
import Home from './Pages/Home/Home'
import About from './Pages/About/About'
import Facilities from './Pages/Facilities/Facilities'
import Gallery from './Pages/Gallery/Gallery'
import EventsRates from './Pages/EventsRates/EventsRates'
import Directions from './Pages/Directions/Directions'
import Support from './Pages/Support/Support'
import Reservation from './Pages/Reservation/Reservation'
import BookingCatalog from './Pages/BookingCatalog/BookingCatalog'
import CustomerRecords from './Pages/CustomerRecords/CustomerRecords'
import CustomerInquiries from './Pages/CustomerInquiries/CustomerInquiries'
import CustomerReviews from './Pages/CustomerReviews/CustomerReviews'
import './App.css'

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const renderPage = () => {
    switch (currentPage) {
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
      case 'booking-catalog':
      case 'admin':
        return <BookingCatalog />
      case 'customer-records':
        return <CustomerRecords />
      case 'customer-inquiries':
        return <CustomerInquiries />
      case 'customer-reviews':
        return <CustomerReviews />
      default:
        return <Home />
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

      <Footer onNavigate={setCurrentPage} />
      <AuthModal />
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
