import { useAuth } from '../../context/AuthContext'
import './styles.css'

function Footer({ onNavigate }) {
  const { isAuthenticated, isAdmin, openAuthModal } = useAuth()
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'facilities', label: 'Facilities & Amenities' },
    { id: 'gallery', label: 'Photo Gallery' },
    { id: 'events-rates', label: 'Rates & Event Packages' },
    { id: 'directions', label: 'Location & Directions' },
    { id: 'support', label: 'Customer Support' },
    ...(!isAdmin ? [{ id: 'reservation', label: 'Online Booking' }] : []),
  ]

  const handleLinkClick = (pageId) => {
    if (pageId === 'reservation') {
      if (isAdmin) return
      if (!isAuthenticated) {
        openAuthModal('signup')
        return
      }
    }
    if (onNavigate) {
      onNavigate(pageId)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <footer className="footer-wrapper">
      <div className="footer-container">
        {/* Main Footer Grid */}
        <div className="footer-grid">
          {/* Column 1: Resort Brand & Summary */}
          <div className="footer-column footer-column-brand">
            <h2 className="footer-brand-title">PolChat Garden Resort</h2>
            <p className="footer-brand-tagline">
              Your tranquil oasis for relaxing day tours, private events, overnight stays, and unforgettable garden celebrations.
            </p>
            <div className="footer-social-links">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="footer-social-icon"
                aria-label="Facebook"
              >
                <svg className="footer-svg-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="footer-social-icon"
                aria-label="Instagram"
              >
                <svg className="footer-svg-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="mailto:info@polchatresort.com"
                className="footer-social-icon"
                aria-label="Email"
              >
                <svg className="footer-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-column">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-link-list">
              {quickLinks.map((link) => (
                <li key={link.id} className="footer-link-item">
                  <button
                    type="button"
                    className="footer-nav-link"
                    onClick={() => handleLinkClick(link.id)}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Details */}
          <div className="footer-column">
            <h3 className="footer-heading">Contact Information</h3>
            <ul className="footer-contact-list">
              <li className="footer-contact-item">
                <span className="footer-contact-label">Address:</span>
                <span className="footer-contact-value">
                  PolChat Garden Resort, Bulacan, Philippines
                </span>
              </li>
              <li className="footer-contact-item">
                <span className="footer-contact-label">Phone:</span>
                <a href="tel:+639123456789" className="footer-contact-value footer-clickable-contact">
                  +63 912 345 6789
                </a>
              </li>
              <li className="footer-contact-item">
                <span className="footer-contact-label">Telephone:</span>
                <a href="tel:0441234567" className="footer-contact-value footer-clickable-contact">
                  (044) 123-4567
                </a>
              </li>
              <li className="footer-contact-item">
                <span className="footer-contact-label">Email:</span>
                <a href="mailto:info@polchatresort.com" className="footer-contact-value footer-clickable-contact">
                  info@polchatresort.com
                </a>
              </li>
              <li className="footer-contact-item">
                <span className="footer-contact-label">Reservations:</span>
                <a href="mailto:bookings@polchatresort.com" className="footer-contact-value footer-clickable-contact">
                  bookings@polchatresort.com
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Schedule & Hours */}
          <div className="footer-column">
            <h3 className="footer-heading">Resort Hours</h3>
            <ul className="footer-hours-list">
              <li className="footer-hours-item">
                <span className="footer-hours-label">Day Tour / Day Swim:</span>
                <span className="footer-hours-time">8:00 AM – 5:00 PM</span>
              </li>
              <li className="footer-hours-item">
                <span className="footer-hours-label">Night Swim / Overnight:</span>
                <span className="footer-hours-time">7:00 PM – 6:00 AM</span>
              </li>
              <li className="footer-hours-item">
                <span className="footer-hours-label">Front Desk & Inquiries:</span>
                <span className="footer-hours-time">8:00 AM – 8:00 PM Daily</span>
              </li>
            </ul>

            {!isAdmin && (
              <div className="footer-booking-cta">
                <button
                  type="button"
                  className="footer-cta-button"
                  onClick={() => handleLinkClick('reservation')}
                >
                  Book Your Stay
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom-bar">
          <p className="footer-copyright-text">
            © {currentYear} PolChat Garden Resort. All rights reserved.
          </p>
          <div className="footer-bottom-links">
            <button
              type="button"
              className="footer-bottom-button"
              onClick={() => handleLinkClick('support')}
            >
              Privacy Policy
            </button>
            <span className="footer-bottom-divider">•</span>
            <button
              type="button"
              className="footer-bottom-button"
              onClick={() => handleLinkClick('support')}
            >
              Terms of Service
            </button>
            <span className="footer-bottom-divider">•</span>
            <button
              type="button"
              className="footer-bottom-button"
              onClick={() => handleLinkClick('support')}
            >
              Resort Guidelines
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
