import './styles.css'

function About() {
  return (
    <div className="about-page">
      {/* Section 1: Hero Picture Background with "Our Story" & Title at Bottom Middle */}
      <section className="about-section-1">
        <div className="about-section-1-picture-bg">
          <span className="about-section-1-picture-label">PICTURE</span>
        </div>
        <div className="about-section-1-overlay" />
        <div className="about-section-1-content">
          <p className="about-section-1-subtitle">Our Story</p>
          <h1 className="about-section-1-title">POLCHAT GARDEN RESORT</h1>
        </div>
      </section>

      {/* Section 2: Story Text Content (Centered) */}
      <section className="about-section-2">
        <div className="about-section-2-container">
          <h2 className="about-section-2-heading">POL + CHAT</h2>

          <p className="about-section-2-paragraph">
            Our story began with our parents' love for nature. They spent years cultivating landscaping services and planting a wide variety of flora around our property. What started with lush greenery soon expanded into a cozy retreat featuring a classic Bahay Kubo, a fun Tree House, and an inflatable pool for quick cooling off.
          </p>

          <p className="about-section-2-paragraph">
            Seeing the joy these simple elements brought to family and friends, my brother had a bigger vision: why not turn our green sanctuary into a full-fledged resort? Encouraged by his idea, we officially launched our business in 2020, and by 2021-2022, we upgraded our simple setups with a permanent swimming pool.
          </p>

          <p className="about-section-2-paragraph about-section-2-highlight">
            Today, PolChat is fully family-owned and operated:
          </p>

          <p className="about-section-2-paragraph">
            Our Parents manage the day-to-day operations on-site, ensuring every corner of the property stays welcoming, clean, and beautiful. Whether you're looking for a peaceful getaway surrounded by nature or a fun swimming day with your loved ones, our family is here to welcome yours!
          </p>
        </div>
      </section>

      {/* Section 3: Whole Section Background Picture */}
      <section className="about-section-3">
        <div className="about-section-3-picture-box">
          <span className="about-section-3-picture-label">PICTURE</span>
        </div>
      </section>

      {/* Section 4: Mirror of Homepage Section 5 (Row 1: Info Left / Pic Right, Row 2: Pic Left / Info Right) */}
      <section className="about-section-4">
        <div className="about-section-4-container">
          {/* Row 1: Info on Left, Picture on Right */}
          <div className="about-section-4-row about-section-4-row-1">
            <div className="about-section-4-content">
              <h2 className="about-section-4-title">INFORMATION:</h2>
              <div className="about-section-4-info-grid">
                <div className="about-section-4-info-column">
                  <span className="about-section-4-info-text">INFORMATION</span>
                  <span className="about-section-4-info-text">INFORMATION</span>
                </div>
                <div className="about-section-4-info-column">
                  <span className="about-section-4-info-text">INFORMATION</span>
                  <span className="about-section-4-info-text">INFORMATION</span>
                </div>
                <div className="about-section-4-info-column">
                  <span className="about-section-4-info-text">INFORMATION</span>
                  <span className="about-section-4-info-text">INFORMATION</span>
                </div>
              </div>
              <a href="#information" className="about-section-4-link">
                INFORMATION LINK
              </a>
            </div>
            <div className="about-section-4-picture-box">
              <span className="about-section-4-picture-label">PICTURE</span>
            </div>
          </div>

          {/* Row 2: Picture on Left, Info on Right */}
          <div className="about-section-4-row about-section-4-row-2">
            <div className="about-section-4-picture-box">
              <span className="about-section-4-picture-label">PICTURE</span>
            </div>
            <div className="about-section-4-content">
              <h2 className="about-section-4-title">INFORMATION:</h2>
              <div className="about-section-4-info-grid">
                <div className="about-section-4-info-column">
                  <span className="about-section-4-info-text">INFORMATION</span>
                  <span className="about-section-4-info-text">INFORMATION</span>
                </div>
                <div className="about-section-4-info-column">
                  <span className="about-section-4-info-text">INFORMATION</span>
                  <span className="about-section-4-info-text">INFORMATION</span>
                </div>
                <div className="about-section-4-info-column">
                  <span className="about-section-4-info-text">INFORMATION</span>
                  <span className="about-section-4-info-text">INFORMATION</span>
                </div>
              </div>
              <a href="#information" className="about-section-4-link">
                INFORMATION LINK
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Whole Section Background Picture */}
      <section className="about-section-5">
        <div className="about-section-5-picture-box">
          <span className="about-section-5-picture-label">PICTURE</span>
        </div>
      </section>

      {/* Section 6: Large Picture on Left, Contact Information & Social Buttons on Right */}
      <section className="about-section-6">
        <div className="about-section-6-container">
          {/* Left: Large Picture */}
          <div className="about-section-6-picture-box">
            <span className="about-section-6-picture-label">PICTURE</span>
          </div>

          {/* Right: Contact Information & Social Media Buttons */}
          <div className="about-section-6-content">
            <h2 className="about-section-6-heading">GET IN TOUCH</h2>
            <p className="about-section-6-subheading">
              Have questions, special requests, or ready to book your visit? Connect with us directly or via social media.
            </p>

            <div className="about-section-6-contact-details">
              <div className="about-section-6-contact-item">
                <span className="about-section-6-contact-label">Location:</span>
                <span className="about-section-6-contact-value">PolChat Garden Resort, Bulacan, Philippines</span>
              </div>
              <div className="about-section-6-contact-item">
                <span className="about-section-6-contact-label">Phone / Mobile:</span>
                <a href="tel:+639123456789" className="about-section-6-contact-link">+63 912 345 6789</a>
              </div>
              <div className="about-section-6-contact-item">
                <span className="about-section-6-contact-label">Email:</span>
                <a href="mailto:info@polchatresort.com" className="about-section-6-contact-link">info@polchatresort.com</a>
              </div>
            </div>

            {/* Social Media Buttons to the Right */}
            <div className="about-section-6-social-group">
              <span className="about-section-6-social-title">Follow & Message Us:</span>
              <div className="about-section-6-social-buttons">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="about-section-6-social-btn about-section-6-social-facebook"
                >
                  <svg className="about-section-6-social-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Facebook</span>
                </a>

                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="about-section-6-social-btn about-section-6-social-instagram"
                >
                  <svg className="about-section-6-social-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>Instagram</span>
                </a>

                <a
                  href="https://m.me"
                  target="_blank"
                  rel="noreferrer"
                  className="about-section-6-social-btn about-section-6-social-messenger"
                >
                  <svg className="about-section-6-social-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.096.304 2.254.464 3.443.464 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.056-3.259-5.963 3.259 6.556-6.963 3.13 3.259 5.889-3.259-6.556 6.963z"/>
                  </svg>
                  <span>Messenger</span>
                </a>

                <a
                  href="mailto:info@polchatresort.com"
                  className="about-section-6-social-btn about-section-6-social-email"
                >
                  <svg className="about-section-6-social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <span>Email Us</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
