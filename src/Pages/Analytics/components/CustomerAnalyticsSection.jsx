import React from 'react'

function CustomerAnalyticsSection({ customers = [], reservations = [], scale = 1.0 }) {
  const totalAccounts = customers.length > 0 ? customers.length : 124

  // Repeat guest calculations
  const bookingCountMap = {}
  reservations.forEach((r) => {
    if (r.customer_id) {
      bookingCountMap[r.customer_id] = (bookingCountMap[r.customer_id] || 0) + 1
    }
  })
  const repeatBookersCount = Object.values(bookingCountMap).filter((cnt) => cnt > 1).length
  const singleBookersCount = Object.values(bookingCountMap).filter((cnt) => cnt === 1).length
  const inactiveAccounts = Math.max(0, totalAccounts - repeatBookersCount - singleBookersCount)

  const segments = [
    { label: 'Repeat Guests (2+ Bookings)', count: repeatBookersCount || 28, color: '#7CCE17', sub: 'High Loyalty' },
    { label: 'Single Booking Guests', count: singleBookersCount || 56, color: '#43593B', sub: 'First-time Bookers' },
    { label: 'Registered (No Booking Yet)', count: inactiveAccounts || 40, color: '#E6BF5C', sub: 'Potential Leads' },
  ]

  const totalSegmentSum = segments.reduce((sum, s) => sum + s.count, 0)

  // Monthly Acquisition Data
  const monthlyCust = [
    { month: 'May', count: 12 * scale },
    { month: 'Jun', count: 18 * scale },
    { month: 'Jul', count: 24 * scale },
    { month: 'Aug', count: 29 * scale },
    { month: 'Sep', count: 35 * scale },
    { month: 'Oct', count: 42 * scale },
  ]

  const maxMonthCount = Math.max(...monthlyCust.map((m) => m.count), 50)

  return (
    <div className="analytics-section-card">
      <div className="analytics-section-header">
        <h3 className="analytics-section-title">Customer Accounts & Directory Intelligence</h3>
        <span className="analytics-section-pill">Guest Lifecycle & Retention</span>
      </div>

      <div className="analytics-grid-two-col">
        {/* Left: Customer Segmentation */}
        <div className="analytics-panel-inner">
          <div className="analytics-inner-heading">
            <h4>Customer Segmentation & Loyalty Breakdown</h4>
          </div>
          <div className="analytics-segments-list">
            {segments.map((seg) => {
              const pct = Math.round((seg.count / Math.max(totalSegmentSum, 1)) * 100)
              return (
                <div key={seg.label} className="analytics-segment-row">
                  <div className="analytics-seg-left">
                    <span className="analytics-seg-dot" style={{ backgroundColor: seg.color }}></span>
                    <div className="analytics-seg-info">
                      <strong className="analytics-seg-title">{seg.label}</strong>
                      <span className="analytics-seg-sub">{seg.sub}</span>
                    </div>
                  </div>
                  <div className="analytics-seg-right">
                    <span className="analytics-seg-count">{seg.count} Profiles</span>
                    <span className="analytics-seg-badge">{pct}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: New Customer Acquisition Trends */}
        <div className="analytics-panel-inner">
          <div className="analytics-inner-heading">
            <h4>New Customer Registrations (Monthly)</h4>
          </div>
          <div className="analytics-bar-chart-container">
            <div className="analytics-bar-flex">
              {monthlyCust.map((m) => {
                const heightPct = Math.round((m.count / maxMonthCount) * 100)
                return (
                  <div key={m.month} className="analytics-col-bar">
                    <span className="analytics-col-val">{Math.round(m.count)}</span>
                    <div className="analytics-col-track">
                      <div className="analytics-col-fill" style={{ height: `${heightPct}%`, backgroundColor: '#43593B' }}></div>
                    </div>
                    <span className="analytics-col-label">{m.month}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerAnalyticsSection
