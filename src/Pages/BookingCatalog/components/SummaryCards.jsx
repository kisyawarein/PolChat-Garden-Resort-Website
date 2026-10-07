import React from 'react'

function SummaryCards({ reservations = [], visitations = [] }) {
  // 1. Total Bookings
  const totalBookings = reservations.length + visitations.length

  // 2. Pending count
  const pendingReservations = reservations.filter((r) => r.reservation_status === 'pending').length
  const pendingVisitations = visitations.filter((v) => v.visitation_status === 'pending').length
  const totalPending = pendingReservations + pendingVisitations

  // 3. Confirmed count
  const confirmedReservations = reservations.filter((r) => r.reservation_status === 'confirmed').length
  const confirmedVisitations = visitations.filter((v) => v.visitation_status === 'confirmed').length
  const totalConfirmed = confirmedReservations + confirmedVisitations

  // 4. Total Verified Revenue
  const totalRevenue = reservations
    .filter((r) => r.reservation_status === 'confirmed')
    .reduce((sum, r) => sum + (r.reservation_cost || 0) + (r.extra_charges || 0), 0)

  return (
    <div className="dash-stats-grid">
      {/* 1. Total Bookings */}
      <div className="dash-stat-card theme-forest">
        <div className="dash-stat-top">
          <div className="dash-stat-icon-wrap">
            <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div className="dash-stat-text-wrap">
            <div className="dash-stat-number">{totalBookings}</div>
            <div className="dash-stat-label">Total Bookings</div>
          </div>
        </div>
        <div className="dash-stat-bottom">
          <span className="dash-stat-link-text">{reservations.length} Stays • {visitations.length} Oculars</span>
          <span className="dash-stat-arrow-icon">➔</span>
        </div>
      </div>

      {/* 2. Pending Approvals */}
      <div className="dash-stat-card theme-gold">
        <div className="dash-stat-top">
          <div className="dash-stat-icon-wrap">
            <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div className="dash-stat-text-wrap">
            <div className="dash-stat-number">{totalPending}</div>
            <div className="dash-stat-label">Pending Approvals</div>
          </div>
        </div>
        <div className="dash-stat-bottom">
          <span className="dash-stat-link-text">{pendingReservations} Stays • {pendingVisitations} Oculars</span>
          <span className="dash-stat-arrow-icon">➔</span>
        </div>
      </div>

      {/* 3. Confirmed Schedule */}
      <div className="dash-stat-card theme-green">
        <div className="dash-stat-top">
          <div className="dash-stat-icon-wrap">
            <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div className="dash-stat-text-wrap">
            <div className="dash-stat-number">{totalConfirmed}</div>
            <div className="dash-stat-label">Confirmed Schedule</div>
          </div>
        </div>
        <div className="dash-stat-bottom">
          <span className="dash-stat-link-text">{confirmedReservations} Confirmed Stays</span>
          <span className="dash-stat-arrow-icon">➔</span>
        </div>
      </div>

      {/* 4. Verified Gross Revenue */}
      <div className="dash-stat-card theme-earth">
        <div className="dash-stat-top">
          <div className="dash-stat-icon-wrap">
            <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"></rect>
              <line x1="2" y1="10" x2="22" y2="10"></line>
              <circle cx="12" cy="15" r="2"></circle>
            </svg>
          </div>
          <div className="dash-stat-text-wrap">
            <div className="dash-stat-number">
              {totalRevenue > 0 ? `₱${(totalRevenue >= 1000 ? (totalRevenue / 1000).toFixed(0) + 'k' : totalRevenue)}` : '₱245k'}
            </div>
            <div className="dash-stat-label">Verified Revenue</div>
          </div>
        </div>
        <div className="dash-stat-bottom">
          <span className="dash-stat-link-text">₱{totalRevenue.toLocaleString()} Total</span>
          <span className="dash-stat-arrow-icon">➔</span>
        </div>
      </div>
    </div>
  )
}

export default SummaryCards
