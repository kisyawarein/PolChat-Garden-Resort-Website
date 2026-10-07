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
            ✕
          </button>
        )}

        <h2 className="resv-type-title">What would you like to reserve?</h2>

        <div className="resv-type-grid">
          {/* Card 1: Resort Reservation */}
          <button
            type="button"
            className="resv-type-btn-card resv-type-btn-resort"
            onClick={() => onSelectType('resort')}
          >
            <div className="resv-type-card-header">
              <h3 className="resv-type-card-heading">Resort Reservation</h3>
            </div>
            <p className="resv-type-card-desc">
              Reserve the resort for your planned stay, celebration, or private event.
            </p>
            <div className="resv-type-card-badge">
              Book Stay →
            </div>
          </button>

          {/* Card 2: Ocular Visit */}
          <button
            type="button"
            className="resv-type-btn-card resv-type-btn-ocular"
            onClick={() => onSelectType('ocular')}
          >
            <div className="resv-type-card-header">
              <h3 className="resv-type-card-heading">Ocular Visit</h3>
            </div>
            <p className="resv-type-card-desc">
              Schedule a visit to view the resort grounds and amenities before making a reservation.
            </p>
            <div className="resv-type-card-badge">
              Schedule Visit →
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReservationTypeStep
