import { useAuth } from '../../context/AuthContext'
import './styles.css'

function Sidebar({
  isOpen,
  onClose,
  currentPage,
  onNavigate,
}) {
  const { user, isAuthenticated, isAdmin, logout, openAuthModal } = useAuth()

  if (!isOpen) return null

  const handleNav = (targetPage) => {
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
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand-box">
            <h2 className="sidebar-brand-title">Polchat Resort</h2>
            <span className="sidebar-brand-subtitle">
              {isAdmin ? 'Staff Management Portal' : 'Guest Account Portal'}
            </span>
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

        {/* User Card */}
        {isAuthenticated ? (
          <div className="sidebar-user-card">
            <div className="sidebar-user-avatar">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.name || user?.username}</span>
              <span className="sidebar-user-email">{user?.email || 'Active User'}</span>
              <span className={isAdmin ? 'sidebar-role-badge sidebar-role-admin' : 'sidebar-role-badge sidebar-role-customer'}>
                {isAdmin ? 'ADMINISTRATOR' : 'CUSTOMER ACCOUNT'}
              </span>
            </div>
          </div>
        ) : (
          <div className="sidebar-guest-card">
            <p className="sidebar-guest-text">Sign in to access specialized resort features.</p>
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

        {/* Specialized Navigation Section */}
        <div className="sidebar-nav-sections">
          {isAdmin ? (
            <div className="sidebar-section-block">
              <span className="sidebar-section-title">ADMIN MANAGEMENT</span>
              <ul className="sidebar-menu-list">
                {/* 1. Home (Top Item) */}
                <li>
                  <button
                    type="button"
                    className={`sidebar-nav-item ${currentPage === 'dashboard' ? 'sidebar-nav-item-active' : ''}`}
                    onClick={() => handleNav('dashboard')}
                  >
                    <span className="sidebar-item-icon">🏠</span>
                    <span className="sidebar-item-label">Home</span>
                  </button>
                </li>
                {/* 2. Booking Catalog */}
                <li>
                  <button
                    type="button"
                    className={`sidebar-nav-item ${currentPage === 'booking-catalog' ? 'sidebar-nav-item-active' : ''}`}
                    onClick={() => handleNav('booking-catalog')}
                  >
                    <span className="sidebar-item-icon">📋</span>
                    <span className="sidebar-item-label">Booking Catalog</span>
                  </button>
                </li>
                {/* 3. Customer Records */}
                <li>
                  <button
                    type="button"
                    className={`sidebar-nav-item ${currentPage === 'customer-records' ? 'sidebar-nav-item-active' : ''}`}
                    onClick={() => handleNav('customer-records')}
                  >
                    <span className="sidebar-item-icon">👥</span>
                    <span className="sidebar-item-label">Customer Records</span>
                  </button>
                </li>
                {/* 4. Gallery Photos */}
                <li>
                  <button
                    type="button"
                    className={`sidebar-nav-item ${currentPage === 'admin-gallery' ? 'sidebar-nav-item-active' : ''}`}
                    onClick={() => handleNav('admin-gallery')}
                  >
                    <span className="sidebar-item-icon">🖼️</span>
                    <span className="sidebar-item-label">Resort Gallery</span>
                  </button>
                </li>
                {/* 5. Customer Inquiries */}
                <li>
                  <button
                    type="button"
                    className={`sidebar-nav-item ${currentPage === 'customer-inquiries' ? 'sidebar-nav-item-active' : ''}`}
                    onClick={() => handleNav('customer-inquiries')}
                  >
                    <span className="sidebar-item-icon">💬</span>
                    <span className="sidebar-item-label">Customer Inquiries</span>
                  </button>
                </li>
                {/* 5. Reviews & Feedback */}
                <li>
                  <button
                    type="button"
                    className={`sidebar-nav-item ${currentPage === 'customer-reviews' ? 'sidebar-nav-item-active' : ''}`}
                    onClick={() => handleNav('customer-reviews')}
                  >
                    <span className="sidebar-item-icon">⭐</span>
                    <span className="sidebar-item-label">Reviews & Feedback</span>
                  </button>
                </li>
                {/* 6. Analytics & Intelligence */}
                <li>
                  <button
                    type="button"
                    className={`sidebar-nav-item ${currentPage === 'analytics' ? 'sidebar-nav-item-active' : ''}`}
                    onClick={() => handleNav('analytics')}
                  >
                    <span className="sidebar-item-icon">📈</span>
                    <span className="sidebar-item-label">Executive Analytics</span>
                  </button>
                </li>
                {/* 7. Prices & Policies */}
                <li>
                  <button
                    type="button"
                    className={`sidebar-nav-item ${currentPage === 'prices-policies' ? 'sidebar-nav-item-active' : ''}`}
                    onClick={() => handleNav('prices-policies')}
                  >
                    <span className="sidebar-item-icon">🏷️</span>
                    <span className="sidebar-item-label">Prices & Policies</span>
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <div className="sidebar-section-block">
              <span className="sidebar-section-title">MY ACCOUNT</span>
              <ul className="sidebar-menu-list">
                <li>
                  <button
                    type="button"
                    className={`sidebar-nav-item ${currentPage === 'my-reservations' ? 'sidebar-nav-item-active' : ''}`}
                    onClick={() => handleNav('my-reservations')}
                  >
                    <span className="sidebar-item-icon">📋</span>
                    <span className="sidebar-item-label">My Reservations</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className={`sidebar-nav-item ${currentPage === 'support' ? 'sidebar-nav-item-active' : ''}`}
                    onClick={() => handleNav('support')}
                  >
                    <span className="sidebar-item-icon">💬</span>
                    <span className="sidebar-item-label">My Inquiries & Support</span>
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
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
