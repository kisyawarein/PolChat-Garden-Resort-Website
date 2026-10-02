function ReviewCard({ review }) {
  const renderStars = (count) => {
    return '★'.repeat(count) + '☆'.repeat(5 - count)
  }

  return (
    <div className="review-item-card">
      <div className="review-card-head">
        <div className="review-user-block">
          <div className="review-avatar">
            {review.customer_name ? review.customer_name[0] : 'G'}
          </div>
          <div>
            <h4 className="review-author">{review.customer_name || 'Guest User'}</h4>
            <span className="review-date">
              {review.date_submitted ? new Date(review.date_submitted).toLocaleDateString() : 'Recent Stay'}
            </span>
          </div>
        </div>

        <div className="review-stars-pill">
          {renderStars(review.review_stars || 5)}
        </div>
      </div>

      <p className="review-comment-text">"{review.review_comment}"</p>
    </div>
  )
}

export default ReviewCard
