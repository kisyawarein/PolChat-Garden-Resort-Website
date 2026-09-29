import eventsVideo from '../../../resources/EventsRates_Video.mp4'
import './styles.css'

const RESERVATION_TYPES = [
  {
    id: 'reservation-day',
    title: 'Day',
    time: '8:00 AM – 5:00 PM',
    label: 'DAY PASS',
  },
  {
    id: 'reservation-22hours',
    title: '22 hours',
    time: '2:00 PM – 12:00 PM (Next Day)',
    label: '22-HR OVERNIGHT',
  },
  {
    id: 'reservation-night',
    title: 'Night',
    time: '6:00 PM – 6:00 AM',
    label: 'NIGHT STAY',
  },
]

function EventsRates() {
  return (
    <div className="events-rates-page">
      {/* Section 1: Video Background with "INFORMATION: CENTER" at bottom middle */}
      <section className="events-rates-section-1">
        <video
          className="events-rates-hero-video"
          src={eventsVideo}
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="events-rates-hero-overlay" />
        <div className="events-rates-hero-content">
          <h1 className="events-rates-hero-title">INFORMATION: CENTER</h1>
        </div>
      </section>

      {/* Section 2: 3 Tall Images Aligned in a Row with Titles Below */}
      <section className="events-rates-section-2">
        <div className="events-rates-section-2-container">
          <div className="events-rates-section-2-cards-row">
            {RESERVATION_TYPES.map((type) => (
              <div key={type.id} className="events-rates-reservation-card">
                <div className="events-rates-tall-picture-box">
                  <span className="events-rates-picture-label">{type.label}</span>
                </div>
                <div className="events-rates-card-info">
                  <h2 className="events-rates-card-title">{type.title}</h2>
                  <span className="events-rates-card-time">{type.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Similar to Homepage Section 5 (2-Row Zigzag) with Wider Images */}
      <section className="events-rates-section-3">
        <div className="events-rates-section-3-container">
          {/* Row 1: Image Left, Content Right */}
          <div className="events-rates-section-3-row">
            <div className="events-rates-section-3-picture-box">
              <span className="events-rates-section-3-picture-label">RATES & PACKAGES</span>
            </div>
            <div className="events-rates-section-3-content">
              <h2 className="events-rates-section-3-title">STANDARD RATES</h2>
              <div className="events-rates-section-3-info-grid">
                <div className="events-rates-section-3-info-column">
                  <span className="events-rates-section-3-info-text">WEEKDAY RATES</span>
                  <span className="events-rates-section-3-info-text">SPECIAL DISCOUNTS</span>
                </div>
                <div className="events-rates-section-3-info-column">
                  <span className="events-rates-section-3-info-text">WEEKEND & HOLIDAYS</span>
                  <span className="events-rates-section-3-info-text">PEAK SEASON RATES</span>
                </div>
                <div className="events-rates-section-3-info-column">
                  <span className="events-rates-section-3-info-text">POOL & AMENITIES</span>
                  <span className="events-rates-section-3-info-text">PAVILION ACCESS</span>
                </div>
              </div>
              <a href="#rates-inquiry" className="events-rates-section-3-link">
                VIEW RATE BREAKDOWN
              </a>
            </div>
          </div>

          {/* Row 2: Content Left, Image Right */}
          <div className="events-rates-section-3-row events-rates-section-3-row-reverse">
            <div className="events-rates-section-3-content">
              <h2 className="events-rates-section-3-title">EXCLUSIVE PACKAGES</h2>
              <div className="events-rates-section-3-info-grid">
                <div className="events-rates-section-3-info-column">
                  <span className="events-rates-section-3-info-text">PRIVATE RESORT RENTAL</span>
                  <span className="events-rates-section-3-info-text">ALL FACILITY ACCESS</span>
                </div>
                <div className="events-rates-section-3-info-column">
                  <span className="events-rates-section-3-info-text">OVERNIGHT CABIN STAYS</span>
                  <span className="events-rates-section-3-info-text">TREE HOUSE ACCESS</span>
                </div>
                <div className="events-rates-section-3-info-column">
                  <span className="events-rates-section-3-info-text">CATERING SETUP AREA</span>
                  <span className="events-rates-section-3-info-text">AUDIO & LIGHTING READY</span>
                </div>
              </div>
              <a href="#package-inquiry" className="events-rates-section-3-link">
                INQUIRE FOR RESERVATIONS
              </a>
            </div>
            <div className="events-rates-section-3-picture-box">
              <span className="events-rates-section-3-picture-label">EXCLUSIVE VENUE</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Replicated Layout from Image (EVENTS Headline + 2 Staggered Blocks) */}
      <section className="events-rates-section-4">
        <div className="events-rates-section-4-container">
          {/* Headline */}
          <h2 className="events-rates-section-4-main-title">EVENTS</h2>

          {/* Block 1 */}
          <div className="events-rates-section-4-block">
            {/* Left Column: Title above tall large picture */}
            <div className="events-rates-section-4-col-large">
              <h3 className="events-rates-section-4-sample-title">SAMPLE</h3>
              <div className="events-rates-section-4-pic-large">
                <span className="events-rates-section-4-pic-label">PICTURE</span>
              </div>
            </div>

            {/* Right Column: Medium picture above paragraph */}
            <div className="events-rates-section-4-col-medium">
              <div className="events-rates-section-4-pic-medium">
                <span className="events-rates-section-4-pic-label">PICTURE</span>
              </div>
              <p className="events-rates-section-4-paragraph">
                Feel the magic and mystery distinct to each destination with
                imaginative and authentic celebrations tailored to the
                occasion. Whether hosting a landmark celebration that ignites a
                love for life and a deep appreciation of culture, or marking
                a milestone with a private ceremony, PolChat&apos;s dedicated
                event teams craft extraordinary shared experiences and nights to
                remember – bespoke to the wishes of the guest.
              </p>
            </div>
          </div>

          {/* Block 2 (Mirrored) */}
          <div className="events-rates-section-4-block">
            {/* Left Column: Medium picture above paragraph */}
            <div className="events-rates-section-4-col-medium">
              <div className="events-rates-section-4-pic-medium">
                <span className="events-rates-section-4-pic-label">PICTURE</span>
              </div>
              <p className="events-rates-section-4-paragraph">
                Feel the magic and mystery distinct to each destination with
                imaginative and authentic celebrations tailored to the
                occasion. Whether hosting a landmark celebration that ignites a
                love for life and a deep appreciation of culture, or marking
                a milestone with a private ceremony, PolChat&apos;s dedicated
                event teams craft extraordinary shared experiences and nights to
                remember – bespoke to the wishes of the guest.
              </p>
            </div>

            {/* Right Column: Title above tall large picture */}
            <div className="events-rates-section-4-col-large">
              <h3 className="events-rates-section-4-sample-title">SAMPLE</h3>
              <div className="events-rates-section-4-pic-large">
                <span className="events-rates-section-4-pic-label">PICTURE</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default EventsRates
