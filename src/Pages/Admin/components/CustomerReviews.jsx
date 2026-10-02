import { useState } from 'react'

function CustomerReviews({ reviews }) {
  const [filterRating, setFilterRating] = useState('all') // 'all' | '5' | '4' | '3' | '2' | '1'

  const filteredReviews = reviews.filter((r) => {
    if (filterRating === 'all') return true
    return String(r.review_stars) === filterRating
  })

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + (r.review_stars || 0), 0) / reviews.length).toFixed(1)
      : '5.0'

  const renderStars = (count) => {
    return '★'.repeat(count) + '☆'.repeat(5 - count)
  }

  return (
    <div className="admin-reviews-container">
      {/* Top Rating Summary Card */}
      <div className="admin-reviews-summary-card">
        <div className="admin-rating-score-box">
          <span className="admin-big-score">{averageRating}</span>
          <div className="admin-stars-display">★★★★★</div>
          <span className="admin-total-reviews-count">Based on {reviews.length} Verified Reviews</span>
        </div>

        <div className="admin-rating-bars-breakdown">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = reviews.filter((r) => r.review_stars === stars).length
            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0
            return (
              <div key={stars} className="admin-rating-bar-row">
                <span className="admin-bar-star-num">{stars} Stars</span>
                <div className="admin-star-track">
                  <div className="admin-star-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="admin-star-count">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="admin-toolbar-row">
        <div className="admin-pill-selector">
          <span className="admin-selector-label">Filter by Rating:</span>
          <button
            type="button"
            className={filterRating === 'all' ? 'admin-filter-pill admin-filter-pill-active' : 'admin-filter-pill'}
            onClick={() => setFilterRating('all')}
          >
            All ({reviews.length})
          </button>
          {[5, 4, 3, 2, 1].map((stars) => (
            <button
              key={stars}
              type="button"
              className={filterRating === String(stars) ? 'admin-filter-pill admin-filter-pill-active' : 'admin-filter-pill'}
              onClick={() => setFilterRating(String(stars))}
            >
              {stars} ★
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="admin-reviews-grid">
        {filteredReviews.length === 0 ? (
          <div className="admin-empty-table-cell">
            No reviews found matching this filter.
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div key={rev.review_id} className="admin-review-card">
              <div className="admin-review-card-header">
                <div className="admin-review-user-info">
                  <span className="admin-cust-avatar-circle">
                    {rev.customer_name ? rev.customer_name[0] : 'G'}
                  </span>
                  <div>
                    <h4 className="admin-review-author">{rev.customer_name || 'Guest User'}</h4>
                    <span className="admin-review-date">
                      {rev.date_submitted ? new Date(rev.date_submitted).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                </div>
                <span className="admin-review-stars-pill">
                  {renderStars(rev.review_stars || 5)}
                </span>
              </div>
              <p className="admin-review-comment-text">"{rev.review_comment}"</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default CustomerReviews
