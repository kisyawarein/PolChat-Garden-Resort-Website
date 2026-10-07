import { useState, useRef, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import './styles.css'

function Navbar({ currentPage, onNavigate, onToggleSidebar }) {
  const { user, isAuthenticated, isAdmin, logout, openAuthModal } = useAuth()

  const guestNavItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'facilities', label: 'Facilities' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'events-rates', label: 'Events/Rates' },
    { id: 'directions', label: 'Directions' },
    { id: 'support', label: 'Support' },
  ]

  const adminNavItems = [
    { id: 'dashboard', label: '🏠 Home' },
    { id: 'booking-catalog', label: '📋 Bookings' },
    { id: 'customer-records', label: '👥 Customers' },
    { id: 'customer-inquiries', label: '💬 Inquiries' },
    { id: 'customer-reviews', label: '⭐ Reviews' },
    { id: 'analytics', label: '📈 Analytics' },
    { id: 'prices-policies', label: '🏷️ Prices & Policies' },
  ]

  const navItems = isAdmin ? adminNavItems : guestNavItems

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
  }, [updateIndicator, isAdmin])

  return (
    <header className="navbar-wrapper">
      {/* Burger Icon Button (Only for Customer accounts, removed for Admin) */}
      {isAuthenticated && !isAdmin && (
        <button
          type="button"
          className="navbar-burger-btn"
          onClick={onToggleSidebar}
          title="Open Customer Portal Menu"
          aria-label="Toggle Portal Navigation Menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      )}

      {/* Main Navigation Pill */}
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

      {/* Book Now Button (Only for Guest/Customer users) */}
      {!isAdmin && (
        <button
          type="button"
          className={currentPage === 'reservation' ? 'book-now-button book-now-button-active' : 'book-now-button'}
          onClick={() => {
            if (!isAuthenticated) {
              openAuthModal('signup')
            } else {
              onNavigate('reservation')
            }
          }}
        >
          Book Now
        </button>
      )}

      {/* Right Actions */}
      <div className="navbar-right-actions">
        {isAuthenticated ? (
          <div className="navbar-user-container">
            <div
              className="navbar-user-chip"
              onClick={!isAdmin ? onToggleSidebar : undefined}
              style={{ cursor: !isAdmin ? 'pointer' : 'default' }}
            >
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
