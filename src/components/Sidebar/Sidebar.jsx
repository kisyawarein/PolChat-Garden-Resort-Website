import { useAuth } from '../../context/AuthContext'
import './styles.css'

function Sidebar({
  isOpen,
  onClose,
  currentPage,
  adminTab,
  onNavigate,
  onSelectAdminTab,
}) {
  const { user, isAuthenticated, isAdmin, logout, openAuthModal } = useAuth()

  if (!isOpen) return null

  const handleAdminNav = (tabId) => {
    onSelectAdminTab(tabId)
    onNavigate('admin')
    onClose()
  }

  const handleCustomerNav = (targetPage) => {
    onNavigate(targetPage)
    onClose()
  }

  return (
    <div className="sidebar-backdrop" onClick={onClose}>
      <aside
        className="sidebar-drawer"
        onClick={(e) => e.stopPropagation()}
        aria-label="User Navigation Sidebar"
      >
        {/* Sidebar Header with Close Button */}
        <div className="sidebar-header">
          <div className="sidebar-brand-box">
            <h2 className="sidebar-brand-title">Polchat Resort</h2>
            <span className="sidebar-brand-subtitle">Portal Navigation</span>
          </div>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        {/* User Profile Card */}
        {isAuthenticated ? (
          <div className="sidebar-user-card">
            <div className="sidebar-user-avatar">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.name || user?.username}</span>
              <span className="sidebar-user-email">{user?.email || 'Registered User'}</span>
              <span className={isAdmin ? 'sidebar-role-badge sidebar-role-admin' : 'sidebar-role-badge sidebar-role-customer'}>
                {isAdmin ? 'ADMINISTRATOR' : 'CUSTOMER ACCOUNT'}
              </span>
            </div>
          </div>
        ) : (
          <div className="sidebar-guest-card">
            <p className="sidebar-guest-text">Sign in to access your resort account and bookings.</p>
            <div className="sidebar-guest-buttons">
              <button
                type="button"
                className="sidebar-guest-login-btn"
                onClick={() => {
                  onClose()
                  openAuthModal('signin')
                }}
              >
                Log In
              </button>
              <button
                type="button"
                className="sidebar-guest-signup-btn"
                onClick={() => {
                  onClose()
                  openAuthModal('signup')
                }}
              >
                Sign Up
              </button>
            </div>
          </div>
        )}

        {/* Navigation Sections */}
        <div className="sidebar-nav-sections">
          {/* Admin Navigation Menu (Separated individual subviews) */}
          {isAdmin && (
            <div className="sidebar-section-block">
              <span className="sidebar-section-title">ADMIN MANAGEMENT</span>
              <ul className="sidebar-menu-list">
                <li>
                  <button
                    type="button"
                    className={`sidebar-nav-item ${currentPage === 'admin' && adminTab === 'overview' ? 'sidebar-nav-item-active' : ''}`}
                    onClick={() => handleAdminNav('overview')}
                  >
                    <span className="sidebar-item-icon">📊</span>
                    <span className="sidebar-item-label">Dashboard Overview</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className={`sidebar-nav-item ${currentPage === 'admin' && adminTab === 'bookings' ? 'sidebar-nav-item-active' : ''}`}
                    onClick={() => handleAdminNav('bookings')}
                  >
                    <span className="sidebar-item-icon">📋</span>
                    <span className="sidebar-item-label">Booking Catalog</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className={`sidebar-nav-item ${currentPage === 'admin' && adminTab === 'calendar' ? 'sidebar-nav-item-active' : ''}`}
                    onClick={() => handleAdminNav('calendar')}
                  >
                    <span className="sidebar-item-icon">📅</span>
                    <span className="sidebar-item-label">Calendar View</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className={`sidebar-nav-item ${currentPage === 'admin' && adminTab === 'customers' ? 'sidebar-nav-item-active' : ''}`}
                    onClick={() => handleAdminNav('customers')}
                  >
                    <span className="sidebar-item-icon">👥</span>
                    <span className="sidebar-item-label">Customer Records</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className={`sidebar-nav-item ${currentPage === 'admin' && adminTab === 'inquiries' ? 'sidebar-nav-item-active' : ''}`}
                    onClick={() => handleAdminNav('inquiries')}
                  >
                    <span className="sidebar-item-icon">💬</span>
                    <span className="sidebar-item-label">Customer Inquiries</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className={`sidebar-nav-item ${currentPage === 'admin' && adminTab === 'reviews' ? 'sidebar-nav-item-active' : ''}`}
                    onClick={() => handleAdminNav('reviews')}
                  >
                    <span className="sidebar-item-icon">⭐</span>
                    <span className="sidebar-item-label">Reviews & Feedback</span>
                  </button>
                </li>
              </ul>
            </div>
          )}

          {/* Customer Navigation Menu */}
          {isAuthenticated && !isAdmin && (
            <div className="sidebar-section-block">
              <span className="sidebar-section-title">MY ACCOUNT</span>
              <ul className="sidebar-menu-list">
                <li>
                  <button
                    type="button"
                    className={`sidebar-nav-item ${currentPage === 'reservation' ? 'sidebar-nav-item-active' : ''}`}
                    onClick={() => handleCustomerNav('reservation')}
                  >
                    <span className="sidebar-item-icon">🎫</span>
                    <span className="sidebar-item-label">Book a Reservation</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className={`sidebar-nav-item ${currentPage === 'support' ? 'sidebar-nav-item-active' : ''}`}
                    onClick={() => handleCustomerNav('support')}
                  >
                    <span className="sidebar-item-icon">💬</span>
                    <span className="sidebar-item-label">My Inquiries & Support</span>
                  </button>
                </li>
              </ul>
            </div>
          )}

          {/* General Resort Pages */}
          <div className="sidebar-section-block">
            <span className="sidebar-section-title">RESORT PAGES</span>
            <ul className="sidebar-menu-list">
              <li>
                <button
                  type="button"
                  className={`sidebar-nav-item ${currentPage === 'home' ? 'sidebar-nav-item-active' : ''}`}
                  onClick={() => handleCustomerNav('home')}
                >
                  <span className="sidebar-item-icon">🏠</span>
                  <span className="sidebar-item-label">Home Page</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`sidebar-nav-item ${currentPage === 'about' ? 'sidebar-nav-item-active' : ''}`}
                  onClick={() => handleCustomerNav('about')}
                >
                  <span className="sidebar-item-icon">🌿</span>
                  <span className="sidebar-item-label">About Us</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`sidebar-nav-item ${currentPage === 'facilities' ? 'sidebar-nav-item-active' : ''}`}
                  onClick={() => handleCustomerNav('facilities')}
                >
                  <span className="sidebar-item-icon">🏊</span>
                  <span className="sidebar-item-label">Facilities & Amenities</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`sidebar-nav-item ${currentPage === 'gallery' ? 'sidebar-nav-item-active' : ''}`}
                  onClick={() => handleCustomerNav('gallery')}
                >
                  <span className="sidebar-item-icon">📸</span>
                  <span className="sidebar-item-label">Photo Gallery</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`sidebar-nav-item ${currentPage === 'events-rates' ? 'sidebar-nav-item-active' : ''}`}
                  onClick={() => handleCustomerNav('events-rates')}
                >
                  <span className="sidebar-item-icon">🏷️</span>
                  <span className="sidebar-item-label">Events & Rates</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`sidebar-nav-item ${currentPage === 'directions' ? 'sidebar-nav-item-active' : ''}`}
                  onClick={() => handleCustomerNav('directions')}
                >
                  <span className="sidebar-item-icon">📍</span>
                  <span className="sidebar-item-label">Directions & Map</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`sidebar-nav-item ${currentPage === 'support' ? 'sidebar-nav-item-active' : ''}`}
                  onClick={() => handleCustomerNav('support')}
                >
                  <span className="sidebar-item-icon">ℹ️</span>
                  <span className="sidebar-item-label">Support Center</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Sidebar Footer */}
        {isAuthenticated && (
          <div className="sidebar-footer">
            <button
              type="button"
              className="sidebar-logout-btn"
              onClick={() => {
                logout()
                onClose()
              }}
            >
              Sign Out Account
            </button>
          </div>
        )}
      </aside>
    </div>
  )
}

export default Sidebar
