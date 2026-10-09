import React from 'react'

function ReviewAnalyticsSection({ reviews = [] }) {
  const totalReviews = reviews.length

  const star5 = reviews.filter((r) => Number(r.review_stars) === 5).length
  const star4 = reviews.filter((r) => Number(r.review_stars) === 4).length
  const star3 = reviews.filter((r) => Number(r.review_stars) === 3).length
  const star2 = reviews.filter((r) => Number(r.review_stars) === 2).length
  const star1 = reviews.filter((r) => Number(r.review_stars) === 1).length

  const starCounts = [
    { stars: 5, count: star5, color: '#7CCE17' },
    { stars: 4, count: star4, color: '#43593B' },
    { stars: 3, count: star3, color: '#E6BF5C' },
    { stars: 2, count: star2, color: '#ACAD79' },
    { stars: 1, count: star1, color: '#58402E' },
  ]

  const averageRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + (Number(r.review_stars) || 0), 0) / totalReviews).toFixed(1)
      : '0.0'

  const positiveReviewsCount = star5 + star4
  const positivePercentage = totalReviews > 0 ? Math.round((positiveReviewsCount / totalReviews) * 100) : 0
  const sentimentTag =
    totalReviews === 0
      ? 'No reviews in selected timeframe'
      : positivePercentage >= 80
      ? `Excellent (${positivePercentage}% Positive Feedback)`
      : positivePercentage >= 50
      ? `Good (${positivePercentage}% Positive Feedback)`
      : `Needs Attention (${positivePercentage}% Positive Feedback)`

  return (
    <div className="analytics-section-card">
      <div className="analytics-section-header">
        <h3 className="analytics-section-title">Customer Reviews & Sentiment Intelligence</h3>
        <span className="analytics-section-pill">Guest Satisfaction</span>
      </div>

      <div className="analytics-grid-two-col">
        {/* Left: Star Rating Distribution */}
        <div className="analytics-panel-inner">
          <div className="analytics-inner-heading">
            <h4>Star Rating Distribution (1 to 5 Stars)</h4>
          </div>
          <div className="analytics-stars-breakdown">
            {starCounts.map((s) => {
              const pct = totalReviews > 0 ? Math.round((s.count / totalReviews) * 100) : 0
              return (
                <div key={s.stars} className="analytics-star-row">
                  <span className="analytics-star-label">{'★'.repeat(s.stars)}</span>
                  <div className="analytics-star-track">
                    <div className="analytics-star-fill" style={{ width: `${pct}%`, backgroundColor: s.color }}></div>
                  </div>
                  <span className="analytics-star-count">{s.count} ({pct}%)</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Net Satisfaction Rating Banner */}
        <div className="analytics-panel-inner">
          <div className="analytics-inner-heading">
            <h4>Overall Resort Sentiment Score</h4>
          </div>
          <div className="analytics-sentiment-box">
            <div className="analytics-sentiment-score">{averageRating}</div>
            <div className="analytics-sentiment-stars">{'★'.repeat(Math.max(1, Math.round(Number(averageRating) || 5)))}</div>
            <div className="analytics-sentiment-tag">{sentimentTag}</div>
            <p className="analytics-sentiment-desc">
              Based on {totalReviews} verified guest reviews in this timeframe. Day Tour, Overnight, and 22-Hour packages evaluated.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewAnalyticsSection
