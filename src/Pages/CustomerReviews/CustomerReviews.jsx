import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { DataService } from '../../services/dataService'
import ReviewCard from './components/ReviewCard'
import './styles.css'

function CustomerReviews() {
  const { isAdmin, openAuthModal } = useAuth()
  const [reviews, setReviews] = useState([])
  const [filterRating, setFilterRating] = useState('all')

  const loadData = async () => {
    const data = await DataService.getReviews()
    setReviews(data)
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredReviews = reviews.filter((r) => {
    if (filterRating === 'all') return true
    return String(r.review_stars) === filterRating
  })

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + (r.review_stars || 0), 0) / reviews.length).toFixed(1)
      : '5.0'

  if (!isAdmin) {
    return (
      <div className="access-denied-page">
        <div className="access-denied-card">
          <div className="access-denied-badge">STAFF ONLY</div>
          <h2>Reviews Management Restricted</h2>
          <p>Please log in with an administrator account to view customer reviews.</p>
          <button
            type="button"
            className="access-denied-btn"
            onClick={() => openAuthModal('signin')}
          >
            Sign In as Admin
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="customer-reviews-page">
      {/* Header */}
      <div className="reviews-header-bar">
        <div>
          <span className="reviews-tag">GUEST FEEDBACK</span>
          <h1 className="reviews-main-title">Customer Reviews & Ratings</h1>
        </div>

        {/* Filter Pills */}
        <div className="reviews-filter-pills">
          <button
            type="button"
            className={`reviews-filter-chip ${filterRating === 'all' ? 'reviews-filter-chip-active' : ''}`}
            onClick={() => setFilterRating('all')}
          >
            All ({reviews.length})
          </button>
          {[5, 4, 3, 2, 1].map((stars) => (
            <button
              key={stars}
              type="button"
              className={`reviews-filter-chip ${filterRating === String(stars) ? 'reviews-filter-chip-active' : ''}`}
              onClick={() => setFilterRating(String(stars))}
            >
              {stars} ★
            </button>
          ))}
        </div>
      </div>

      {/* Summary Score Card */}
      <div className="reviews-score-card">
        <div className="reviews-score-block">
          <span className="reviews-big-number">{averageRating}</span>
          <div className="reviews-stars-row">★★★★★</div>
          <span className="reviews-total-sub">Verified Guest Ratings</span>
        </div>

        <div className="reviews-bars-stack">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = reviews.filter((r) => r.review_stars === stars).length
            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0
            return (
              <div key={stars} className="reviews-bar-line">
                <span className="reviews-star-label">{stars} Stars</span>
                <div className="reviews-track">
                  <div className="reviews-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="reviews-count-label">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Reviews Cards Grid */}
      <div className="reviews-cards-grid">
        {filteredReviews.length === 0 ? (
          <div className="reviews-empty-box">
            No customer reviews found for this filter.
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <ReviewCard key={rev.review_id} review={rev} />
          ))
        )}
      </div>
    </div>
  )
}

export default CustomerReviews
