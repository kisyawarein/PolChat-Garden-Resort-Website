import { useState } from 'react'
import supportVideo from '../../../resources/Support_Video.mp4'
import InquirySection from './components/InquirySection'
import './styles.css'

const FAQ_ITEMS = [
  {
    id: 1,
    question: 'What are the day tour and overnight operating hours?',
    answer: 'Day Tour runs from 9:00 AM to 5:00 PM (8 Hours). Overnight runs from 8:00 PM to 6:00 AM (10 Hours). We also offer 22-Hour packages (8:00 AM - 6:00 AM or 8:00 PM - 6:00 PM).',
  },
  {
    id: 2,
    question: 'How much is the security deposit for reservations?',
    answer: 'A refundable Security Deposit of PHP 2,000 is required upon booking confirmation and returned during checkout inspection.',
  },
  {
    id: 3,
    question: 'Are outside food and drinks allowed without corkage?',
    answer: 'Guests are welcome to bring outside food, drinks, and catering setups. Designated grilling and dining areas are readily accessible.',
  },
  {
    id: 4,
    question: 'What is an Ocular Visitation and how do I schedule one?',
    answer: 'Ocular Visitations allow guests to inspect our resort facilities beforehand. Available slots are Morning (9:00 AM - 11:00 AM) and Afternoon (2:00 PM - 4:00 PM).',
  },
  {
    id: 5,
    question: 'What are the rates for exceeding guests and extension hours?',
    answer: 'Extra guests exceeding the maximum pax limit are charged PHP 200 per head. Time extensions are PHP 700 to PHP 800 per hour depending on the package.',
  },
  {
    id: 6,
    question: 'What payment methods does Polchat Resort accept?',
    answer: 'We accept GCash, direct bank transfer (BDO/BPI), and on-site cash payments. Proof of payment is verified by our admin team.',
  },
  {
    id: 7,
    question: 'Can we book exclusive private resort stays for special events?',
    answer: 'Yes, our entire resort pavilion and private pool amenities can be booked for weddings, birthdays, team buildings, and reunions.',
  },
]

function Support() {
  const [openFaqIndex, setOpenFaqIndex] = useState(null)

  const toggleFaq = (index) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index))
  }

  const scrollToInquiries = () => {
    const el = document.getElementById('inquiries')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
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
                Chat directly with Polchat resort staff for questions and booking support.
              </p>
              <button
                type="button"
                className="support-section-4-inquiries-btn"
                onClick={scrollToInquiries}
              >
                Go to Inquiries
              </button>
            </div>
          </div>

          {/* Right Column: Expandable Question Pills */}
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

      {/* Interactive Customer Inquiry Live Helpdesk Section */}
      <InquirySection />
    </div>
  )
}

export default Support

