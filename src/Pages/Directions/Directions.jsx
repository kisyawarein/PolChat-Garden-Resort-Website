import directionsVideo from '../../../resources/Directions_Video.mp4'
import './styles.css'

function Directions() {
  const address = 'PolChat Garden, 346 Monaco Street Antipolo Calabarzon'
  const mapsUrl = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=16&ie=UTF8&iwloc=&output=embed`
  const externalMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`

  return (
    <div className="directions-page">
      {/* Section 1: Video Background with Hero Title */}
      <section className="directions-section-1">
        <video
          className="directions-hero-video"
          src={directionsVideo}
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="directions-hero-overlay" />
        <div className="directions-hero-content">
          <p className="directions-hero-subtitle">LOCATION & GETTING HERE</p>
          <h1 className="directions-hero-title">INFORMATION: CENTER</h1>
        </div>
      </section>

      {/* Section 2: Address Info Card & Embedded Google Maps */}
      <section className="directions-section-2">
        <div className="directions-section-2-container">
          {/* Address Information Card */}
          <div className="directions-info-card">
            <div className="directions-info-header">
              <div className="directions-pin-badge">📍 RESORT LOCATION</div>
              <h2 className="directions-location-name">PolChat Garden Resort</h2>
              <p className="directions-full-address">{address}</p>
            </div>

            <div className="directions-quick-meta">
              <div className="directions-meta-item">
                <span className="directions-meta-label">Direct Line / Mobile</span>
                <a href="tel:+639534954389" className="directions-meta-value">0953 495 4389</a>
              </div>
              <div className="directions-meta-item">
                <span className="directions-meta-label">Official Email</span>
                <a href="mailto:polchat2k20@gmail.com" className="directions-meta-value">polchat2k20@gmail.com</a>
              </div>
              <div className="directions-meta-item">
                <span className="directions-meta-label">Visiting / Ocular Hours</span>
                <span className="directions-meta-value">9:00 AM – 4:00 PM Daily</span>
              </div>
            </div>

            <div className="directions-cta-row">
              <a
                href={externalMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="directions-maps-cta"
              >
                <span>Open in Google Maps App ↗</span>
              </a>
              <button
                type="button"
                className="directions-copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(address)
                  alert('Address copied to clipboard!')
                }}
              >
                <span>📋 Copy Address</span>
              </button>
            </div>
          </div>

          {/* Embedded Map Wrapper */}
          <div className="directions-map-wrapper">
            <iframe
              className="directions-map-iframe"
              title="PolChat Garden Resort Location Map"
              src={mapsUrl}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </div>
  )
}

export default Directions
