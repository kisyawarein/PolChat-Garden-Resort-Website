import { useState } from 'react'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import Home from './Pages/Home/Home'
import About from './Pages/About/About'
import Facilities from './Pages/Facilities/Facilities'
import Gallery from './Pages/Gallery/Gallery'
import EventsRates from './Pages/EventsRates/EventsRates'
import Directions from './Pages/Directions/Directions'
import Support from './Pages/Support/Support'
import Reservation from './Pages/Reservation/Reservation'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

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
      default:
        return <Home />
    }
  }

  return (
    <div className="app-container">
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="page-content">
        {renderPage()}
      </main>
      <Footer onNavigate={setCurrentPage} />
    </div>
  )
}

export default App
