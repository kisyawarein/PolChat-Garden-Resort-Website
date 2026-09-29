import directionsVideo from '../../../resources/Directions_Video.mp4'
import './styles.css'

function Directions() {
  return (
    <div className="directions-page">
      {/* Section 1: Video Background with "INFORMATION: CENTER" at bottom middle */}
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
          <h1 className="directions-hero-title">INFORMATION: CENTER</h1>
        </div>
      </section>

      {/* Section 2: Embedded Google Maps Container */}
      <section className="directions-section-2">
        <div className="directions-section-2-container">
          <div className="directions-map-wrapper">
            <iframe
              className="directions-map-iframe"
              title="Google Maps Location"
              src="https://maps.google.com/maps?q=Philippines&t=&z=13&ie=UTF8&iwloc=&output=embed"
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
