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
                href="https://www.facebook.com/Polchatgarden"
                target="_blank"
                rel="noreferrer"
                className="footer-social-icon footer-social-facebook"
                aria-label="Facebook"
              >
                <svg className="footer-svg-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@dianaventures"
                target="_blank"
                rel="noreferrer"
                className="footer-social-icon footer-social-tiktok"
                aria-label="TikTok"
              >
                <svg className="footer-svg-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.46V11.83a8.16 8.16 0 0 0 5.77 2.35v-3.44a4.85 4.85 0 0 1-3.77-1.44 4.83 4.83 0 0 1-1.23-2.61z"/>
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
                  PolChat Garden, 346 Monaco Street Antipolo Calabarzon
                </span>
              </li>
              <li className="footer-contact-item">
                <span className="footer-contact-label">Phone:</span>
                <span className="footer-contact-value">  +63 953 495 4389</span>
              </li>
              <li className="footer-contact-item">
                <span className="footer-contact-label">Telephone:</span>
                <span className="footer-contact-value">  044 123 4567</span>
              </li>
             <li className="footer-contact-item">
  <span className="footer-contact-label">Email:</span>
  <span className="footer-contact-value">
    polchat2k20@gmail.com
  </span>
</li>
             <li className="footer-contact-item">
  <span className="footer-contact-label">Reservations:</span>
  <span className="footer-contact-value">
    polchat2k20@gmail.com
  </span>
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
