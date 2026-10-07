import React from 'react'

function ReservationTypeStep({ onSelectType, onClose }) {
  return (
    <div className="resv-type-overlay">
      <div className="resv-type-card">
        {onClose && (
          <button
            type="button"
            className="resv-type-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}

        <div className="resv-type-header">
          <span className="resv-type-tag">ONLINE RESERVATION</span>
          <h2 className="resv-type-title">What would you like to reserve?</h2>
          <p className="resv-type-subtitle">
            Choose whether you would like to book a private stay package or schedule a free ocular visit.
          </p>
        </div>

        <div className="resv-type-grid">
          {/* Card 1: Resort Reservation */}
          <button
            type="button"
            className="resv-type-btn-card resv-type-btn-resort"
            onClick={() => onSelectType('resort')}
          >
            <div className="resv-type-icon-wrap resv-icon-resort">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#43593B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            
            <div className="resv-type-card-content">
              <h3 className="resv-type-card-heading">Resort Reservation</h3>
              <p className="resv-type-card-desc">
                Reserve the resort for your planned day tour, overnight stay, celebration, or private event.
              </p>
            </div>

            <div className="resv-type-card-badge resv-badge-resort">
              <span>Book Stay</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </button>

          {/* Card 2: Ocular Visit */}
          <button
            type="button"
            className="resv-type-btn-card resv-type-btn-ocular"
            onClick={() => onSelectType('ocular')}
          >
            <div className="resv-type-icon-wrap resv-icon-ocular">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#58402E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>

            <div className="resv-type-card-content">
              <h3 className="resv-type-card-heading">Ocular Visit</h3>
              <p className="resv-type-card-desc">
                Schedule a visit to view the resort grounds, pools, and amenities before making a reservation.
              </p>
            </div>

            <div className="resv-type-card-badge resv-badge-ocular">
              <span>Schedule Visit</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReservationTypeStep
