import React from 'react'

function InquirySummaryCards({ inquiries = [] }) {
  const total = inquiries.length
  const openCount = inquiries.filter((i) => i.inquiry_status === 'open').length
  const inProgressCount = inquiries.filter((i) => i.inquiry_status === 'in-progress').length
  const resolvedCount = inquiries.filter((i) => i.inquiry_status === 'resolved' || i.inquiry_status === 'closed').length

  return (
    <div className="dash-stats-grid inq-stats-grid">
      {/* 1. Total Inquiries */}
      <div className="dash-stat-card theme-forest">
        <div className="dash-stat-top">
          <div className="dash-stat-icon-wrap">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className="dash-stat-text-wrap">
            <div className="dash-stat-number">{total}</div>
            <div className="dash-stat-label">Total Inquiries</div>
          </div>
        </div>
        <div className="dash-stat-bottom">
          <span className="dash-stat-link-text">Support Tickets</span>
          <span className="dash-stat-arrow-icon">➔</span>
        </div>
      </div>

      {/* 2. Open Tickets */}
      <div className="dash-stat-card theme-gold">
        <div className="dash-stat-top">
          <div className="dash-stat-icon-wrap">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className="dash-stat-text-wrap">
            <div className="dash-stat-number">{openCount}</div>
            <div className="dash-stat-label">Open Tickets</div>
          </div>
        </div>
        <div className="dash-stat-bottom">
          <span className="dash-stat-link-text">Needs First Response</span>
          <span className="dash-stat-arrow-icon">➔</span>
        </div>
      </div>

      {/* 3. In Progress */}
      <div className="dash-stat-card theme-green">
        <div className="dash-stat-top">
          <div className="dash-stat-icon-wrap">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </div>
          <div className="dash-stat-text-wrap">
            <div className="dash-stat-number">{inProgressCount}</div>
            <div className="dash-stat-label">In Progress</div>
          </div>
        </div>
        <div className="dash-stat-bottom">
          <span className="dash-stat-link-text">Staff Assigned</span>
          <span className="dash-stat-arrow-icon">➔</span>
        </div>
      </div>

      {/* 4. Resolved Tickets */}
      <div className="dash-stat-card theme-earth">
        <div className="dash-stat-top">
          <div className="dash-stat-icon-wrap">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="dash-stat-text-wrap">
            <div className="dash-stat-number">{resolvedCount}</div>
            <div className="dash-stat-label">Resolved Tickets</div>
          </div>
        </div>
        <div className="dash-stat-bottom">
          <span className="dash-stat-link-text">Completed Inquiries</span>
          <span className="dash-stat-arrow-icon">➔</span>
        </div>
      </div>
    </div>
  )
}

export default InquirySummaryCards
