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
import Admin from './Pages/Admin/Admin'
import './App.css'

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home')
  const [adminTab, setAdminTab] = useState('overview')
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
      case 'admin':
        return <Admin activeTab={adminTab} onSelectTab={setAdminTab} />
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
        adminTab={adminTab}
        onNavigate={setCurrentPage}
        onSelectAdminTab={setAdminTab}
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
