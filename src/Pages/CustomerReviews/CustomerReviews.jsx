import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { DataService } from '../../services/dataService'
import ReviewSummaryCards from './components/ReviewSummaryCards'
import './styles.css'

function CustomerReviews() {
  const { isAdmin, openAuthModal } = useAuth()
  const [reviews, setReviews] = useState([])
  const [filterRating, setFilterRating] = useState('all') // 'all' | '5' | '4' | '3' | '2' | '1'
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState('date') // 'id' | 'customer' | 'rating' | 'date'
  const [sortDirection, setSortDirection] = useState('desc') // 'asc' | 'desc'
  const [openDropdown, setOpenDropdown] = useState(null) // 'rating' | null
  const [selectedReviewModal, setSelectedReviewModal] = useState(null)

  const headerRef = useRef(null)

  const loadData = async () => {
    const data = await DataService.getReviews()
    setReviews(data || [])
  }

  useEffect(() => {
    loadData()
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection(field === 'customer' ? 'asc' : 'desc')
    }
  }

  // Consistent Chevron Icon
  const renderChevron = (isOpenOrUp) => (
    <svg
      className={`col-chevron-icon ${isOpenOrUp ? 'col-chevron-up' : 'col-chevron-down'}`}
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )

  const filteredReviews = reviews.filter((r) => {
    const matchRating = filterRating === 'all' || String(r.review_stars) === filterRating
    const term = searchTerm.toLowerCase().trim()
    const nameMatch = (r.customer_name || '').toLowerCase().includes(term)
    const commentMatch = (r.comment || '').toLowerCase().includes(term)
    const idMatch = String(r.review_id).includes(term)
    const matchSearch = !term || (nameMatch || commentMatch || idMatch)
    return matchRating && matchSearch
  })

  // Sort reviews
  filteredReviews.sort((a, b) => {
    let res = 0
    if (sortField === 'customer') {
      res = (a.customer_name || '').localeCompare(b.customer_name || '')
    } else if (sortField === 'rating') {
      res = (a.review_stars || 0) - (b.review_stars || 0)
    } else if (sortField === 'date') {
      const dateA = a.created_at || ''
      const dateB = b.created_at || ''
      res = dateA.localeCompare(dateB)
    } else {
      res = a.review_id - b.review_id
    }
    return sortDirection === 'asc' ? res : -res
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
      {/* Top Review Summary Cards */}
      <div className="catalog-top-summary-wrap">
        <ReviewSummaryCards reviews={reviews} />
      </div>

      {/* Main Section */}
      <div className="rev-main-section">
        {/* Header Container Card (66px) */}
        <div className="catalog-panel-header-card">
          <div className="rev-header-title-wrap">
            <h2 className="catalog-panel-title">Customer Reviews & Feedback</h2>
            <span className="rev-count-badge">{filteredReviews.length}</span>
          </div>

          <div className="catalog-header-controls">
            {/* Search Bar */}
            <div className="schedule-search-wrap">
              <svg
                className="schedule-search-svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="schedule-search-input"
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="schedule-search-clear-btn"
                  onClick={() => setSearchTerm('')}
                  title="Clear search"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>

            {/* Rating Filter Select */}
            <select
              className="rev-filter-dropdown"
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
            >
              <option value="all">All Ratings</option>
              <option value="5">★★★★★ 5 Stars</option>
              <option value="4">★★★★☆ 4 Stars</option>
              <option value="3">★★★☆☆ 3 Stars</option>
              <option value="2">★★☆☆☆ 2 Stars</option>
              <option value="1">★☆☆☆☆ 1 Star</option>
            </select>
          </div>
        </div>

        {/* Reviews Table Card */}
        <div className="rev-table-panel-card">
          <div className="rev-table-scroll-wrap">
            <table className="rev-data-table">
              <colgroup>
                <col style={{ width: '12%' }} />
                <col style={{ width: '22%' }} />
                <col style={{ width: '16%' }} />
                <col style={{ width: '36%' }} />
                <col style={{ width: '14%' }} />
              </colgroup>
              <thead ref={headerRef}>
                <tr>
                  {/* Review ID */}
                  <th className="col-cell-edge">
                    <button
                      type="button"
                      className="col-header-btn"
                      onClick={() => toggleSort('id')}
                    >
                      <span>Review ID</span>
                      {renderChevron(sortField === 'id' && sortDirection === 'asc')}
                    </button>
                  </th>

                  {/* Customer */}
                  <th>
                    <button
                      type="button"
                      className="col-header-btn"
                      onClick={() => toggleSort('customer')}
                    >
                      <span>Customer</span>
                      {renderChevron(sortField === 'customer' && sortDirection === 'asc')}
                    </button>
                  </th>

                  {/* Rating */}
                  <th className="col-dropdown-th">
                    <button
                      type="button"
                      className={`col-header-btn ${filterRating !== 'all' ? 'col-header-active-filter' : ''}`}
                      onClick={() => setOpenDropdown((prev) => (prev === 'rating' ? null : 'rating'))}
                    >
                      <span>{filterRating === 'all' ? 'Rating' : `${filterRating} Stars`}</span>
                      {renderChevron(openDropdown === 'rating')}
                    </button>

                    {openDropdown === 'rating' && (
                      <div className="col-dropdown-menu">
                        <button
                          type="button"
                          className={`col-dropdown-item ${filterRating === 'all' ? 'dropdown-item-selected' : ''}`}
                          onClick={() => {
                            setFilterRating('all')
                            setOpenDropdown(null)
                          }}
                        >
                          All Ratings ({reviews.length})
                        </button>
                        <button
                          type="button"
                          className={`col-dropdown-item ${filterRating === '5' ? 'dropdown-item-selected' : ''}`}
                          onClick={() => {
                            setFilterRating('5')
                            setOpenDropdown(null)
                          }}
                        >
                          ★★★★★ 5 Stars
                        </button>
                        <button
                          type="button"
                          className={`col-dropdown-item ${filterRating === '4' ? 'dropdown-item-selected' : ''}`}
                          onClick={() => {
                            setFilterRating('4')
                            setOpenDropdown(null)
                          }}
                        >
                          ★★★★☆ 4 Stars
                        </button>
                        <button
                          type="button"
                          className={`col-dropdown-item ${filterRating === '3' ? 'dropdown-item-selected' : ''}`}
                          onClick={() => {
                            setFilterRating('3')
                            setOpenDropdown(null)
                          }}
                        >
                          ★★★☆☆ 3 Stars
                        </button>
                        <button
                          type="button"
                          className={`col-dropdown-item ${filterRating === '2' ? 'dropdown-item-selected' : ''}`}
                          onClick={() => {
                            setFilterRating('2')
                            setOpenDropdown(null)
                          }}
                        >
                          ★★☆☆☆ 2 Stars
                        </button>
                        <button
                          type="button"
                          className={`col-dropdown-item ${filterRating === '1' ? 'dropdown-item-selected' : ''}`}
                          onClick={() => {
                            setFilterRating('1')
                            setOpenDropdown(null)
                          }}
                        >
                          ★☆☆☆☆ 1 Star
                        </button>
                      </div>
                    )}
                  </th>

                  {/* Comment */}
                  <th>
                    <div className="col-header-static">
                      <span>Customer Feedback</span>
                    </div>
                  </th>

                  {/* Date */}
                  <th>
                    <button
                      type="button"
                      className="col-header-btn"
                      onClick={() => toggleSort('date')}
                    >
                      <span>Submitted Date</span>
                      {renderChevron(sortField === 'date' && sortDirection === 'asc')}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="rev-empty-cell">
                      No customer reviews found matching your filter.
                    </td>
                  </tr>
                ) : (
                  filteredReviews.map((rev) => (
                    <tr
                      key={rev.review_id}
                      className="rev-table-row"
                      onClick={() => setSelectedReviewModal(rev)}
                    >
                      <td className="col-cell-edge rev-id-cell">#{rev.review_id}</td>
                      <td>
                        <div className="rev-cust-cell">
                          <span className="rev-avatar-badge">
                            {rev.customer_name ? rev.customer_name[0].toUpperCase() : 'G'}
                          </span>
                          <div className="rev-cust-info">
                            <span className="rev-cust-name">{rev.customer_name || 'Guest'}</span>
                            <span className="rev-verified-sub">Verified Guest</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`rev-stars-text stars-${rev.review_stars}`}>
                          {'★'.repeat(rev.review_stars || 5)} {rev.review_stars}.0
                        </span>
                      </td>
                      <td>
                        <p className="rev-comment-snippet">
                          {rev.comment || 'No written feedback provided.'}
                        </p>
                      </td>
                      <td className="rev-date-text">
                        {rev.created_at ? rev.created_at.split('T')[0] : 'Recent'}
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
              <h3 className="modal-card-title">Review #{selectedReviewModal.review_id} Details</h3>
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
                  <label className="modal-unit-label">Guest Name</label>
                  <span className="modal-unit-val">{selectedReviewModal.customer_name || 'Guest'}</span>
                </div>
                <div className="modal-field-unit">
                  <label className="modal-unit-label">Rating</label>
                  <span className="modal-unit-val rev-modal-rating-val">
                    {'★'.repeat(selectedReviewModal.review_stars || 5)} ({selectedReviewModal.review_stars} / 5 Stars)
                  </span>
                </div>
              </div>

              <div className="modal-charges-card">
                <h4 className="modal-charges-title">Customer Feedback</h4>
                <p className="rev-modal-comment-body">
                  "{selectedReviewModal.comment || 'No written comments provided.'}"
                </p>
                <div className="rev-modal-date-sub">
                  Date Submitted: {selectedReviewModal.created_at || 'Recent'}
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
