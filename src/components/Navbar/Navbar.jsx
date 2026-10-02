import { useState, useRef, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import './styles.css'

function Navbar({ currentPage, onNavigate, onToggleSidebar }) {
  const { user, isAuthenticated, isAdmin, logout, openAuthModal } = useAuth()

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
      {/* Left-side Sidebar Toggle Button (When user is logged in) */}
      {isAuthenticated && (
        <div className="navbar-left-actions">
          <button
            type="button"
            className="navbar-sidebar-toggle-btn"
            onClick={onToggleSidebar}
            title={isAdmin ? 'Open Admin Management Portal' : 'Open My Account Menu'}
          >
            <span className="navbar-toggle-icon">☰</span>
            <span className="navbar-toggle-label">
              {isAdmin ? 'Admin Menu' : 'Menu'}
            </span>
          </button>
        </div>
      )}

      {/* Center Navigation Pill */}
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

      {/* Right Edge Actions */}
      <div className="navbar-right-actions">
        {isAuthenticated ? (
          <div className="navbar-user-container">
            <div className="navbar-user-chip" onClick={onToggleSidebar} style={{ cursor: 'pointer' }}>
              <span className="navbar-user-name">{user?.name || user?.username}</span>
              <span className={isAdmin ? 'navbar-user-role-badge navbar-role-admin' : 'navbar-user-role-badge navbar-role-customer'}>
                {isAdmin ? 'Admin' : 'Guest'}
              </span>
            </div>
            <button
              type="button"
              className="navbar-logout-btn"
              onClick={logout}
              title="Sign Out"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="navbar-auth-buttons">
            <button
              type="button"
              className="navbar-login-btn"
              onClick={() => openAuthModal('signin')}
            >
              Log in
            </button>
            <button
              type="button"
              className="navbar-signup-btn"
              onClick={() => openAuthModal('signup')}
            >
              Sign up
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar


