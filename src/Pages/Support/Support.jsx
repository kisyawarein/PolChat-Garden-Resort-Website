import { useState } from 'react'
import supportVideo from '../../../resources/Support_Video.mp4'
import './styles.css'

const FAQ_ITEMS = [
  {
    id: 1,
    question: 'QUESTION',
    answer: 'PolChat Garden Resort offers day tours, night stays, and 22-hour overnight packages with full access to swimming pools and amenities.',
  },
  {
    id: 2,
    question: 'QUESTION',
    answer: 'Yes, reservations are highly recommended to secure your preferred date, venue pavilion, and overnight accommodations.',
  },
  {
    id: 3,
    question: 'QUESTION',
    answer: 'Guests are welcome to bring outside food and drinks. Designated grilling and dining areas are readily accessible.',
  },
  {
    id: 4,
    question: 'QUESTION',
    answer: 'Standard check-in for day tours starts at 8:00 AM, while overnight stays begin at 2:00 PM.',
  },
  {
    id: 5,
    question: 'QUESTION',
    answer: 'We provide spacious parking spaces inside the gated resort premises for the convenience and security of our guests.',
  },
  {
    id: 6,
    question: 'QUESTION',
    answer: 'Yes, we offer exclusive private resort bookings for weddings, birthdays, reunions, and corporate retreats.',
  },
  {
    id: 7,
    question: 'QUESTION',
    answer: 'Our air-conditioned Cabin Rooms and traditional Bahay Kubo huts are fully equipped for comfortable overnight lodging.',
  },
  {
    id: 8,
    question: 'QUESTION',
    answer: 'We accept bank transfers, GCash payments, and on-site cash transactions for deposits and remaining balances.',
  },
  {
    id: 9,
    question: 'QUESTION',
    answer: 'Children below 3 feet can enter free of charge when accompanied by paying adults.',
  },
]

function Support() {
  const [openFaqIndex, setOpenFaqIndex] = useState(null)

  const toggleFaq = (index) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index))
  }

  return (
    <div className="support-page">
      {/* Section 1: Video Background with "INFORMATION: CENTER" at bottom middle */}
      <section className="support-section-1">
        <video
          className="support-hero-video"
          src={supportVideo}
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="support-hero-overlay" />
        <div className="support-hero-content">
          <h1 className="support-hero-title">INFORMATION: CENTER</h1>
        </div>
      </section>

      {/* Section 2: Huge Picture Container */}
      <section className="support-section-2">
        <div className="support-section-2-container">
          <div className="support-section-2-picture-box">
            <span className="support-section-2-picture-label">PICTURE</span>
          </div>
        </div>
      </section>

      {/* Section 3: Background Picture Holder */}
      <section className="support-section-3">
        <div className="support-section-3-picture-box">
          <span className="support-section-3-picture-label">PICTURE</span>
        </div>
      </section>

      {/* Section 4: Replicated FAQ Section from Image */}
      <section className="support-section-4">
        <div className="support-section-4-container">
          {/* Left Column: Heading + Still have questions card */}
          <div className="support-section-4-left-col">
            <h2 className="support-section-4-title">
              Frequently
              <br />
              Asked
              <br />
              Questions
            </h2>

            <div className="support-section-4-inquiries-card">
              <h3 className="support-section-4-inquiries-heading">
                Still have questions?
              </h3>
              <p className="support-section-4-inquiries-text">
                Information Information
              </p>
              <button
                type="button"
                className="support-section-4-inquiries-btn"
                onClick={() => {
                  window.location.href = '#inquiries'
                }}
              >
                Go to Inquiries
              </button>
            </div>
          </div>

          {/* Right Column: 9 Expandable Question Pills */}
          <div className="support-section-4-right-col">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openFaqIndex === index
              return (
                <div key={item.id} className="support-faq-item-wrapper">
                  <button
                    type="button"
                    className="support-faq-pill-btn"
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isOpen}
                  >
                    <span className="support-faq-question-text">
                      {item.question}
                    </span>
                    <span className="support-faq-icon">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="support-faq-answer-panel">
                      <p className="support-faq-answer-text">{item.answer}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Section 5: Distinct Background with 2 Overlapping/Overflowing Boxes */}
      <section className="support-section-5">
        {/* Upper Right Overflowing Box (overflows into Section 4 by 50% height) */}
        <div className="support-section-5-box-upper-right">
          <span className="support-section-5-box-label">PICTURE / BOX</span>
        </div>

        {/* Section 5 Center Content */}
        <div className="support-section-5-container">
          <h2 className="support-section-5-title">POLCHAT SUPPORT</h2>
          <p className="support-section-5-subtitle">
            We are dedicated to making your visit seamless, memorable, and relaxing.
          </p>
        </div>

        {/* Bottom Left Overflowing Box (overflows into Section 6 by 50% height) */}
        <div className="support-section-5-box-bottom-left">
          <span className="support-section-5-box-label">PICTURE / BOX</span>
        </div>
      </section>

      {/* Section 6: Box Container Holding a Picture (Similar to Section 2) */}
      <section className="support-section-6">
        <div className="support-section-6-container">
          <div className="support-section-6-picture-box">
            <span className="support-section-6-picture-label">PICTURE</span>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Support
