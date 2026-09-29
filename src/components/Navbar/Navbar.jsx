import { useState, useRef, useEffect, useCallback } from 'react'
import './styles.css'

function Navbar({ currentPage, onNavigate }) {
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'facilities', label: 'Facilities' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'events-rates', label: 'Events/Rates' },
    { id: 'directions', label: 'Directions' },
    { id: 'support', label: 'Support' },
  ]

  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 })
  const buttonRefs = useRef({})

  const updateIndicator = useCallback(() => {
    const activeButton = buttonRefs.current[currentPage]
    if (activeButton) {
      setIndicatorStyle({
        left: activeButton.offsetLeft,
        width: activeButton.offsetWidth,
        opacity: 1,
      })
    } else {
      setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }))
    }
  }, [currentPage])

  useEffect(() => {
    updateIndicator()
    window.addEventListener('resize', updateIndicator)
    return () => window.removeEventListener('resize', updateIndicator)
  }, [updateIndicator])

  return (
    <header className="navbar-wrapper">
      <nav className="navbar-pill">
        <div
          className="navbar-indicator"
          style={{
            transform: `translateX(${indicatorStyle.left}px)`,
            width: `${indicatorStyle.width}px`,
            opacity: indicatorStyle.opacity,
          }}
        />

        <ul className="navbar-menu">
          {navItems.map((item) => (
            <li key={item.id} className="navbar-item">
              <button
                ref={(el) => (buttonRefs.current[item.id] = el)}
                type="button"
                className={currentPage === item.id ? 'navbar-button navbar-button-active' : 'navbar-button'}
                onClick={() => onNavigate(item.id)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <button
        type="button"
        className={currentPage === 'reservation' ? 'book-now-button book-now-button-active' : 'book-now-button'}
        onClick={() => onNavigate('reservation')}
      >
        Book Now
      </button>
    </header>
  )
}

export default Navbar
