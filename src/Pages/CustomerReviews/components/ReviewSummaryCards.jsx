import React from 'react'

function ReviewSummaryCards({ reviews = [] }) {
  const totalReviews = reviews.length

  const averageRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + (r.review_stars || 0), 0) / totalReviews).toFixed(1)
      : '0.0'

  const fiveStarReviews = reviews.filter((r) => r.review_stars === 5).length
  const criticalReviews = reviews.filter((r) => (r.review_stars || 0) <= 2).length

  return (
    <div className="dash-stats-grid rev-stats-grid">
      {/* 1. Overall Average Rating */}
      <div className="dash-stat-card theme-gold">
        <div className="dash-stat-top">
          <div className="dash-stat-icon-wrap">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <div className="dash-stat-text-wrap">
            <div className="dash-stat-number">{averageRating} ★</div>
            <div className="dash-stat-label">Average Guest Rating</div>
          </div>
        </div>
        <div className="dash-stat-bottom">
          <span className="dash-stat-link-text">Customer Satisfaction</span>
          <span className="dash-stat-arrow-icon">➔</span>
        </div>
      </div>

      {/* 2. 5-Star Reviews */}
      <div className="dash-stat-card theme-green">
        <div className="dash-stat-top">
          <div className="dash-stat-icon-wrap">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
            </svg>
          </div>
          <div className="dash-stat-text-wrap">
            <div className="dash-stat-number">{fiveStarReviews}</div>
            <div className="dash-stat-label">5-Star Ratings</div>
          </div>
        </div>
        <div className="dash-stat-bottom">
          <span className="dash-stat-link-text">
            {totalReviews > 0 ? Math.round((fiveStarReviews / totalReviews) * 100) : 0}% Perfect Score
          </span>
          <span className="dash-stat-arrow-icon">➔</span>
        </div>
      </div>

      {/* 3. Critical Feedback */}
      <div className="dash-stat-card theme-red">
        <div className="dash-stat-top">
          <div className="dash-stat-icon-wrap">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className="dash-stat-text-wrap">
            <div className="dash-stat-number">{criticalReviews}</div>
            <div className="dash-stat-label">Critical Reviews (1-2★)</div>
          </div>
        </div>
        <div className="dash-stat-bottom">
          <span className="dash-stat-link-text">Needs Review</span>
          <span className="dash-stat-arrow-icon">➔</span>
        </div>
      </div>

      {/* 4. Total Verified Reviews */}
      <div className="dash-stat-card theme-forest">
        <div className="dash-stat-top">
          <div className="dash-stat-icon-wrap">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className="dash-stat-text-wrap">
            <div className="dash-stat-number">{totalReviews}</div>
            <div className="dash-stat-label">Total Verified Reviews</div>
          </div>
        </div>
        <div className="dash-stat-bottom">
          <span className="dash-stat-link-text">Feedback Directory</span>
          <span className="dash-stat-arrow-icon">➔</span>
        </div>
      </div>
    </div>
  )
}

export default ReviewSummaryCards
