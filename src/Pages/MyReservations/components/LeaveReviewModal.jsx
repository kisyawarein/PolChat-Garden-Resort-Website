import { useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { DataService } from '../../../services/dataService'

export default function LeaveReviewModal({
  reservation,
  onClose,
  onReviewSubmitted,
}) {
  const { user } = useAuth()
  const [stars, setStars] = useState(5)
  const [hoverStars, setHoverStars] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [submittedSuccess, setSubmittedSuccess] = useState(false)

  const customerName =
    user?.name ||
    (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '') ||
    reservation?.customer_name ||
    'Verified Guest'

  const customerId = user?.id || reservation?.customer_id || 1

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!comment.trim()) {
      setErrorMsg('Please write a sentence or brief feedback about your stay.')
      return
    }

    setIsSubmitting(true)
    setErrorMsg('')

    const result = await DataService.addReview({
      customerId: customerId,
      customerName: customerName,
      stars: Number(stars),
      comment: comment.trim(),
      reservationId: reservation?.reservation_id,
    })

    setIsSubmitting(false)

    if (result) {
      setSubmittedSuccess(true)
      if (onReviewSubmitted) {
        onReviewSubmitted(result, reservation?.reservation_id)
      }
      setTimeout(() => {
        onClose()
      }, 2000)
    } else {
      setErrorMsg('Error submitting your review. Please try again.')
    }
  }

  const ratingDescriptions = {
    1: 'Poor / Disappointing',
    2: 'Fair / Needs Improvement',
    3: 'Good / Average Experience',
    4: 'Very Good / Enjoyable Stay',
    5: 'Exceptional / Highly Recommended!',
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-dialog-card myres-review-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-card-header">
          <div className="myres-review-header-title">
            <span className="myres-review-badge">GUEST EXPERIENCE</span>
            <h3 className="modal-card-title">How was your stay?</h3>
          </div>
          <button
            type="button"
            className="modal-close-x"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="modal-card-body myres-review-body">
          {submittedSuccess ? (
            <div className="myres-review-success-state">
              <div className="myres-review-success-icon">🎉</div>
              <h3 className="myres-review-success-title">Thank You for Your Feedback!</h3>
              <p className="myres-review-success-desc">
                Your <strong>{stars}-star review</strong> has been published. We appreciate you choosing PolChat Garden Resort for your getaway!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="myres-review-form">
              <p className="myres-review-intro">
                Thank you for staying with us, <strong>{customerName}</strong>! Please share your rating and a quick sentence review to help us continue improving.
              </p>

              {errorMsg && (
                <div className="resv-payment-alert-error">
                  {errorMsg}
                </div>
              )}

              {/* Interactive Star Picker */}
              <div className="myres-stars-picker-wrap">
                <label className="myres-stars-label">Select Your Star Rating:</label>
                <div className="myres-stars-row">
                  {[1, 2, 3, 4, 5].map((starNum) => {
                    const activeRating = hoverStars || stars
                    const isFilled = starNum <= activeRating
                    return (
                      <button
                        key={starNum}
                        type="button"
                        className={`myres-star-btn ${isFilled ? 'myres-star-filled' : 'myres-star-empty'}`}
                        onMouseEnter={() => setHoverStars(starNum)}
                        onMouseLeave={() => setHoverStars(0)}
                        onClick={() => setStars(starNum)}
                        aria-label={`${starNum} Stars`}
                      >
                        ★
                      </button>
                    )
                  })}
                </div>
                <span className="myres-star-rating-hint">
                  {ratingDescriptions[hoverStars || stars]} ({hoverStars || stars} / 5)
                </span>
              </div>

              {/* Review Sentence Text Area */}
              <div className="myres-review-input-group">
                <label className="myres-review-field-label" htmlFor="myres-review-textarea">
                  Your Sentence Review / Comments <span className="resv-req-star">*</span>
                </label>
                <textarea
                  id="myres-review-textarea"
                  className="myres-review-textarea"
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="e.g. The resort grounds were stunning, clean, and our family had a wonderful time at the pool!"
                  required
                  autoFocus
                />
                <span className="myres-review-char-count">{comment.length} characters</span>
              </div>

              <div className="modal-card-footer myres-review-footer">
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Skip for Now
                </button>
                <button
                  type="submit"
                  className="myres-submit-review-btn"
                  disabled={isSubmitting || !comment.trim()}
                >
                  {isSubmitting ? 'Submitting Review...' : 'Submit Review ★'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
