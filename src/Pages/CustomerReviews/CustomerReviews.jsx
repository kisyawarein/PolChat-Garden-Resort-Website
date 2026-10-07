import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { DataService } from '../../services/dataService'
import ReviewSummaryCards from './components/ReviewSummaryCards'
import './styles.css'

function CustomerReviews() {
  const { isAdmin, openAuthModal } = useAuth()
  const [reviews, setReviews] = useState([])
  const [filterRating, setFilterRating] = useState('all') // 'all' | '5' | '4' | '3' | '2' | '1'
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedReviewModal, setSelectedReviewModal] = useState(null)

  const loadData = async () => {
    const data = await DataService.getReviews()
    setReviews(data || [])
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredReviews = reviews.filter((r) => {
    const matchRating = filterRating === 'all' || String(r.review_stars) === filterRating
    const term = searchTerm.toLowerCase()
    const nameMatch = (r.customer_name || '').toLowerCase().includes(term)
    const commentMatch = (r.comment || '').toLowerCase().includes(term)
    const idMatch = String(r.review_id).includes(term)
    return matchRating && (nameMatch || commentMatch || idMatch)
  })

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
      {/* Header Bar */}
      <div className="reviews-header-bar">
        <div className="reviews-title-group">
          <h1 className="reviews-main-title">Customer Reviews & Feedback</h1>
        </div>

        <div className="reviews-header-meta">
          <span className="reviews-count-pill">{reviews.length} Total Submissions</span>
        </div>
      </div>

      {/* Top Review Summary Cards */}
      <div className="reviews-top-summary-wrap">
        <ReviewSummaryCards reviews={reviews} />
      </div>

      {/* Main Reviews Directory Card */}
      <div className="reviews-main-directory-card">
        {/* Search & Filter Toolbar */}
        <div className="reviews-toolbar-card">
          <div className="reviews-search-wrap">
            <span className="reviews-search-icon">🔍</span>
            <input
              type="text"
              className="reviews-search-input"
              placeholder="Search reviews by customer name, comments, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="reviews-search-clear"
                onClick={() => setSearchTerm('')}
              >
                ✕
              </button>
            )}
          </div>

          {/* Star Rating Dropdown Filter */}
          <div className="reviews-filters-wrap">
            <div className="reviews-filter-item">
              <label className="reviews-filter-label" htmlFor="reviews-star-filter">Rating Filter:</label>
              <select
                id="reviews-star-filter"
                className="reviews-select-dropdown"
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
              >
                <option value="all">All Ratings ({reviews.length})</option>
                <option value="5">★★★★★ 5 Stars ({reviews.filter((r) => r.review_stars === 5).length})</option>
                <option value="4">★★★★☆ 4 Stars ({reviews.filter((r) => r.review_stars === 4).length})</option>
                <option value="3">★★★☆☆ 3 Stars ({reviews.filter((r) => r.review_stars === 3).length})</option>
                <option value="2">★★☆☆☆ 2 Stars ({reviews.filter((r) => r.review_stars === 2).length})</option>
                <option value="1">★☆☆☆☆ 1 Star ({reviews.filter((r) => r.review_stars === 1).length})</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reviews Table Card */}
        <div className="reviews-table-card">
          <div className="reviews-table-scroll">
            <table className="reviews-data-table">
              <thead>
                <tr>
                  <th>Review ID</th>
                  <th>Customer</th>
                  <th>Rating</th>
                  <th>Review Feedback</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="reviews-empty-cell">
                      No customer reviews found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredReviews.map((rev) => (
                    <tr key={rev.review_id}>
                      <td className="rev-id-cell">#{rev.review_id}</td>
                      <td>
                        <div className="rev-cust-cell">
                          <span className="rev-avatar-circle">
                            {rev.customer_name ? rev.customer_name[0].toUpperCase() : 'G'}
                          </span>
                          <div className="rev-cust-info">
                            <span className="rev-cust-name">{rev.customer_name || 'Guest'}</span>
                            <span className="rev-verified-tag">✓ Verified Guest</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="rev-rating-pill-wrap">
                          <span className={`rev-rating-badge stars-${rev.review_stars}`}>
                            {'★'.repeat(rev.review_stars || 5)} {rev.review_stars}.0
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="rev-comment-box">
                          <p className="rev-comment-text">{rev.comment || 'No written comment provided.'}</p>
                        </div>
                      </td>
                      <td>
                        <span className="rev-date-text">
                          {rev.created_at ? rev.created_at.split('T')[0] : 'Recent'}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="rev-btn-view"
                          onClick={() => setSelectedReviewModal(rev)}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Review Details Modal */}
      {selectedReviewModal && (
        <div className="modal-backdrop" onClick={() => setSelectedReviewModal(null)}>
          <div className="modal-dialog-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-card-header">
              <h3 className="modal-card-title">Review #{selectedReviewModal.review_id}</h3>
              <button
                type="button"
                className="modal-close-x"
                onClick={() => setSelectedReviewModal(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-card-body">
              <div className="modal-info-grid">
                <div className="modal-field-unit">
                  <label className="modal-unit-label">Customer Name</label>
                  <span className="modal-unit-val">{selectedReviewModal.customer_name || 'Guest'}</span>
                </div>
                <div className="modal-field-unit">
                  <label className="modal-unit-label">Rating Given</label>
                  <span className="modal-unit-val">
                    {'★'.repeat(selectedReviewModal.review_stars || 5)} ({selectedReviewModal.review_stars} / 5 Stars)
                  </span>
                </div>
              </div>

              <div className="modal-charges-card">
                <h4 className="modal-charges-title">Customer Feedback</h4>
                <p className="rev-modal-comment-body">
                  "{selectedReviewModal.comment || 'No written comment provided.'}"
                </p>
                <div className="rev-modal-date-sub">
                  Submitted on: {selectedReviewModal.created_at || 'Recent'}
                </div>
              </div>
            </div>

            <div className="modal-card-footer">
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedReviewModal(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerReviews
