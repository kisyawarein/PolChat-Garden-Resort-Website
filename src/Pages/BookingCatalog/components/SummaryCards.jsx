import React from 'react'

function SummaryCards({ reservations = [], visitations = [] }) {
  // 1. Active Reservations
  const activeReservations = reservations.filter((r) => r.reservation_status === 'confirmed').length

  // 2. Pending Reservations
  const pendingReservations = reservations.filter((r) => r.reservation_status === 'pending').length

  // 3. Active Visitations
  const activeVisitations = visitations.filter((v) => v.visitation_status === 'confirmed').length

  // 4. Pending Visitations
  const pendingVisitations = visitations.filter((v) => v.visitation_status === 'pending').length

  // 5. Rejected Bookings
  const rejectedBookings =
    reservations.filter((r) => r.reservation_status === 'cancelled').length +
    visitations.filter((v) => v.visitation_status === 'cancelled').length

  return (
    <div className="dash-stats-grid summary-cards-5grid">
      {/* 1. Active Reservations */}
      <div className="dash-stat-card theme-green">
        <div className="dash-stat-top">
          <div className="dash-stat-icon-wrap">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="dash-stat-text-wrap">
            <div className="dash-stat-number">{activeReservations}</div>
            <div className="dash-stat-label">Active Reservations</div>
          </div>
        </div>
        <div className="dash-stat-bottom">
          <span className="dash-stat-link-text">Confirmed Stays</span>
        </div>
      </div>

      {/* 2. Pending Reservations */}
      <div className="dash-stat-card theme-gold">
        <div className="dash-stat-top">
          <div className="dash-stat-icon-wrap">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="dash-stat-text-wrap">
            <div className="dash-stat-number">{pendingReservations}</div>
            <div className="dash-stat-label">Pending Reservations</div>
          </div>
        </div>
        <div className="dash-stat-bottom">
          <span className="dash-stat-link-text">Action Needed</span>
        </div>
      </div>

      {/* 3. Active Visitations */}
      <div className="dash-stat-card theme-forest">
        <div className="dash-stat-top">
          <div className="dash-stat-icon-wrap">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <div className="dash-stat-text-wrap">
            <div className="dash-stat-number">{activeVisitations}</div>
            <div className="dash-stat-label">Active Visitations</div>
          </div>
        </div>
        <div className="dash-stat-bottom">
          <span className="dash-stat-link-text">Approved Oculars</span>
        </div>
      </div>

      {/* 4. Pending Visitations */}
      <div className="dash-stat-card theme-earth">
        <div className="dash-stat-top">
          <div className="dash-stat-icon-wrap">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="dash-stat-text-wrap">
            <div className="dash-stat-number">{pendingVisitations}</div>
            <div className="dash-stat-label">Pending Visitations</div>
          </div>
        </div>
        <div className="dash-stat-bottom">
          <span className="dash-stat-link-text">Awaiting Review</span>
        </div>
      </div>

      {/* 5. Rejected Bookings */}
      <div className="dash-stat-card theme-red">
        <div className="dash-stat-top">
          <div className="dash-stat-icon-wrap">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <div className="dash-stat-text-wrap">
            <div className="dash-stat-number">{rejectedBookings}</div>
            <div className="dash-stat-label">Rejected Bookings</div>
          </div>
        </div>
        <div className="dash-stat-bottom">
          <span className="dash-stat-link-text">Cancelled / Declined</span>
        </div>
      </div>
    </div>
  )
}

export default SummaryCards
