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
    {
      id: 'dashboard',
      label: 'Home',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      id: 'booking-catalog',
      label: 'Bookings',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <path d="M9 16l2 2 4-4" />
        </svg>
      ),
    },
    {
      id: 'customer-records',
      label: 'Customers',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      id: 'admin-gallery',
      label: 'Gallery',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      ),
    },
    {
      id: 'customer-inquiries',
      label: 'Inquiries',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      id: 'customer-reviews',
      label: 'Reviews',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
    {
      id: 'analytics',
      label: 'Dashboard',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    {
      id: 'prices-policies',
      label: 'Prices & Policies',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      ),
    },
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

  // Only show the first part of the first name (e.g. "Raishawn" from "Raishawn Alejandro")
  const getShortFirstName = () => {
    if (isAdmin) return 'Admin'
    const raw = user?.first_name || user?.name || user?.username || 'User'
    const firstPart = raw.trim().split(/\s+/)[0]
    return firstPart || 'User'
  }

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
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
                {item.icon && <span className="navbar-item-icon-wrap">{item.icon}</span>}
                <span>{item.label}</span>
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
              <span className="navbar-user-name">{getShortFirstName()}</span>
              {isAdmin && (
                <span className="navbar-user-role-badge navbar-role-admin">
                  Admin
                </span>
              )}
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
