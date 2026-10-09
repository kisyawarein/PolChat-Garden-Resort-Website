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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
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
                    <span className="sidebar-item-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    </span>
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
                    <span className="sidebar-item-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                        <path d="M9 16l2 2 4-4" />
                      </svg>
                    </span>
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
                    <span className="sidebar-item-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </span>
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
                    <span className="sidebar-item-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </span>
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
                    <span className="sidebar-item-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </span>
                    <span className="sidebar-item-label">Customer Inquiries</span>
                  </button>
                </li>
                {/* 6. Reviews & Feedback */}
                <li>
                  <button
                    type="button"
                    className={`sidebar-nav-item ${currentPage === 'customer-reviews' ? 'sidebar-nav-item-active' : ''}`}
                    onClick={() => handleNav('customer-reviews')}
                  >
                    <span className="sidebar-item-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </span>
                    <span className="sidebar-item-label">Reviews & Feedback</span>
                  </button>
                </li>
                {/* 7. Analytics & Intelligence */}
                <li>
                  <button
                    type="button"
                    className={`sidebar-nav-item ${currentPage === 'analytics' ? 'sidebar-nav-item-active' : ''}`}
                    onClick={() => handleNav('analytics')}
                  >
                    <span className="sidebar-item-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="20" x2="18" y2="10" />
                        <line x1="12" y1="20" x2="12" y2="4" />
                        <line x1="6" y1="20" x2="6" y2="14" />
                      </svg>
                    </span>
                    <span className="sidebar-item-label">Executive Analytics</span>
                  </button>
                </li>
                {/* 8. Prices & Policies */}
                <li>
                  <button
                    type="button"
                    className={`sidebar-nav-item ${currentPage === 'prices-policies' ? 'sidebar-nav-item-active' : ''}`}
                    onClick={() => handleNav('prices-policies')}
                  >
                    <span className="sidebar-item-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                        <line x1="7" y1="7" x2="7.01" y2="7" />
                      </svg>
                    </span>
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
                    <span className="sidebar-item-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                        <path d="M9 16l2 2 4-4" />
                      </svg>
                    </span>
                    <span className="sidebar-item-label">My Reservations</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className={`sidebar-nav-item ${currentPage === 'support' ? 'sidebar-nav-item-active' : ''}`}
                    onClick={() => handleNav('support')}
                  >
                    <span className="sidebar-item-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </span>
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
