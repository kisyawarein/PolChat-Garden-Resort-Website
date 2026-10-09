import React from 'react'

function MyReservationSummaryCards({ reservations = [] }) {
  const activeCount = reservations.filter((r) => r.reservation_status === 'confirmed').length
  const pendingCount = reservations.filter((r) => r.reservation_status === 'pending').length
  const cancelledCount = reservations.filter((r) => r.reservation_status === 'cancelled').length
  const totalCount = reservations.length

  return (
    <div className="dash-stats-grid myres-stats-grid">
      {/* 1. Active Stays */}
      <div className="dash-stat-card theme-green">
        <div className="dash-stat-top">
          <div className="dash-stat-icon-wrap">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="dash-stat-text-wrap">
            <div className="dash-stat-number">{activeCount}</div>
            <div className="dash-stat-label">Confirmed Stays</div>
          </div>
        </div>
        <div className="dash-stat-bottom">
          <span className="dash-stat-link-text">Approved Bookings</span>
        </div>
      </div>

      {/* 2. Pending Review */}
      <div className="dash-stat-card theme-gold">
        <div className="dash-stat-top">
          <div className="dash-stat-icon-wrap">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="dash-stat-text-wrap">
            <div className="dash-stat-number">{pendingCount}</div>
            <div className="dash-stat-label">Pending Approval</div>
          </div>
        </div>
        <div className="dash-stat-bottom">
          <span className="dash-stat-link-text">Under Staff Review</span>
        </div>
      </div>

      {/* 3. Total Bookings */}
      <div className="dash-stat-card theme-forest">
        <div className="dash-stat-top">
          <div className="dash-stat-icon-wrap">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
          </div>
          <div className="dash-stat-text-wrap">
            <div className="dash-stat-number">{totalCount}</div>
            <div className="dash-stat-label">Total Reservations</div>
          </div>
        </div>
        <div className="dash-stat-bottom">
          <span className="dash-stat-link-text">Booking History</span>
        </div>
      </div>

      {/* 4. Cancelled / Past */}
      <div className="dash-stat-card theme-earth">
        <div className="dash-stat-top">
          <div className="dash-stat-icon-wrap">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <div className="dash-stat-text-wrap">
            <div className="dash-stat-number">{cancelledCount}</div>
            <div className="dash-stat-label">Cancelled / Declined</div>
          </div>
        </div>
        <div className="dash-stat-bottom">
          <span className="dash-stat-link-text">Archived Records</span>
        </div>
      </div>
    </div>
  )
}

export default MyReservationSummaryCards
