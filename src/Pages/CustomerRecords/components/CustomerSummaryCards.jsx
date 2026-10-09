import React from 'react'

function CustomerSummaryCards({ customers = [], reservations = [], inquiries = [] }) {
  // 1. Total registered accounts
  const totalCustomers = customers.length

  // 2. Active bookers (customers who have made at least one reservation)
  const bookedCustomerIds = new Set(reservations.map((r) => r.customer_id))
  const activeBookersCount = customers.filter((c) => bookedCustomerIds.has(c.customer_id)).length

  // 3. Repeat bookers (customers who made 2 or more reservations)
  const bookingCountMap = {}
  reservations.forEach((r) => {
    if (r.customer_id) {
      bookingCountMap[r.customer_id] = (bookingCountMap[r.customer_id] || 0) + 1
    }
  })
  const repeatBookersCount = Object.values(bookingCountMap).filter((cnt) => cnt > 1).length

  // 4. Inactive accounts
  const inactiveCount = Math.max(0, totalCustomers - activeBookersCount)

  return (
    <div className="dash-stats-grid cust-stats-grid">
      {/* 1. Total Customer Accounts */}
      <div className="dash-stat-card theme-forest">
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
            <div className="dash-stat-number">{totalCustomers}</div>
            <div className="dash-stat-label">Total Customer Accounts</div>
          </div>
        </div>
        <div className="dash-stat-bottom">
          <span className="dash-stat-link-text">Registered Directory</span>
        </div>
      </div>

      {/* 2. Active Bookers */}
      <div className="dash-stat-card theme-green">
        <div className="dash-stat-top">
          <div className="dash-stat-icon-wrap">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="dash-stat-text-wrap">
            <div className="dash-stat-number">{activeBookersCount}</div>
            <div className="dash-stat-label">Active Bookers</div>
          </div>
        </div>
        <div className="dash-stat-bottom">
          <span className="dash-stat-link-text">
            {totalCustomers > 0 ? Math.round((activeBookersCount / totalCustomers) * 100) : 0}% Conversion Rate
          </span>
        </div>
      </div>

      {/* 3. Repeat Guests */}
      <div className="dash-stat-card theme-gold">
        <div className="dash-stat-top">
          <div className="dash-stat-icon-wrap">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" />
              <polyline points="23 20 23 14 17 14" />
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
            </svg>
          </div>
          <div className="dash-stat-text-wrap">
            <div className="dash-stat-number">{repeatBookersCount}</div>
            <div className="dash-stat-label">Repeat Guests (2+ Bookings)</div>
          </div>
        </div>
        <div className="dash-stat-bottom">
          <span className="dash-stat-link-text">
            {activeBookersCount > 0 ? Math.round((repeatBookersCount / activeBookersCount) * 100) : 0}% Loyalty Rate
          </span>
        </div>
      </div>

      {/* 4. Inactive Accounts */}
      <div className="dash-stat-card theme-earth">
        <div className="dash-stat-top">
          <div className="dash-stat-icon-wrap">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="dash-stat-text-wrap">
            <div className="dash-stat-number">{inactiveCount}</div>
            <div className="dash-stat-label">Inactive / No Bookings</div>
          </div>
        </div>
        <div className="dash-stat-bottom">
          <span className="dash-stat-link-text">Prospect Contacts</span>
        </div>
      </div>
    </div>
  )
}

export default CustomerSummaryCards
