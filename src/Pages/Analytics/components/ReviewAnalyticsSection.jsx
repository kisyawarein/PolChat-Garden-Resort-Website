import React from 'react'

function ReviewAnalyticsSection({
  reviews = [],
}) {
  const safeReviews = Array.isArray(reviews)
    ? reviews
    : []

  /*
   * Only valid ratings from 1 through 5 are included
   * in rating and sentiment calculations.
   */
  const validRatings = safeReviews
    .map((review) =>
      Number(review.review_stars)
    )
    .filter(
      (rating) =>
        Number.isFinite(rating) &&
        rating >= 1 &&
        rating <= 5
    )

  const totalValidReviews =
    validRatings.length

  /*
   * Real star distribution
   */
  const getStarCount = (stars) =>
    validRatings.filter(
      (rating) => rating === stars
    ).length

  const starCounts = [
    {
      stars: 5,
      count: getStarCount(5),
      color: '#7CCE17',
    },
    {
      stars: 4,
      count: getStarCount(4),
      color: '#43593B',
    },
    {
      stars: 3,
      count: getStarCount(3),
      color: '#E6BF5C',
    },
    {
      stars: 2,
      count: getStarCount(2),
      color: '#ACAD79',
    },
    {
      stars: 1,
      count: getStarCount(1),
      color: '#58402E',
    },
  ]

  /*
   * Real average rating
   */
  const averageRating =
    totalValidReviews > 0
      ? (
          validRatings.reduce(
            (total, rating) =>
              total + rating,
            0
          ) / totalValidReviews
        ).toFixed(1)
      : '0.0'

  /*
   * Positive feedback is defined here as
   * ratings of 4 or 5 stars.
   */
  const positiveReviewsCount =
    getStarCount(5) +
    getStarCount(4)

  const positivePercentage =
    totalValidReviews > 0
      ? Math.round(
          (
            positiveReviewsCount /
            totalValidReviews
          ) * 100
        )
      : 0

  const sentimentTag =
    totalValidReviews === 0
      ? 'No reviews in selected timeframe'
      : positivePercentage >= 80
        ? `Excellent (${positivePercentage}% Positive Feedback)`
        : positivePercentage >= 50
          ? `Good (${positivePercentage}% Positive Feedback)`
          : `Needs Attention (${positivePercentage}% Positive Feedback)`

  /*
   * Display stars from the actual rounded average.
   *
   * Zero reviews = zero stars.
   * There is no fallback to five stars.
   */
  const displayedStars =
    totalValidReviews > 0
      ? Math.min(
          5,
          Math.max(
            1,
            Math.round(
              Number(averageRating)
            )
          )
        )
      : 0

  return (
    <div className="analytics-section-card">
      <div className="analytics-section-header">
        <h3 className="analytics-section-title">
          Customer Reviews & Sentiment
          Intelligence
        </h3>

        <span className="analytics-section-pill">
          Guest Satisfaction
        </span>
      </div>

      <div className="analytics-grid-two-col">
        {/* Star Rating Distribution */}

        <div className="analytics-panel-inner">
          <div className="analytics-inner-heading">
            <h4>
              Star Rating Distribution
              (1 to 5 Stars)
            </h4>
          </div>

          {totalValidReviews > 0 ? (
            <div className="analytics-stars-breakdown">
              {starCounts.map(
                (starItem) => {
                  const percentage =
                    Math.round(
                      (
                        starItem.count /
                        totalValidReviews
                      ) * 100
                    )

                  return (
                    <div
                      key={starItem.stars}
                      className="analytics-star-row"
                    >
                      <span className="analytics-star-label">
                        {'★'.repeat(
                          starItem.stars
                        )}
                      </span>

                      <div className="analytics-star-track">
                        <div
                          className="analytics-star-fill"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor:
                              starItem.color,
                          }}
                        />
                      </div>

                      <span className="analytics-star-count">
                        {starItem.count}{' '}
                        ({percentage}%)
                      </span>
                    </div>
                  )
                }
              )}
            </div>
          ) : (
            <div className="analytics-empty-state">
              No valid guest ratings match
              the selected timeframe.
            </div>
          )}
        </div>

        {/* Overall Satisfaction */}

        <div className="analytics-panel-inner">
          <div className="analytics-inner-heading">
            <h4>
              Overall Resort Satisfaction
            </h4>
          </div>

          <div className="analytics-sentiment-box">
            <div className="analytics-sentiment-score">
              {averageRating}
            </div>

            <div className="analytics-sentiment-stars">
              {displayedStars > 0
                ? '★'.repeat(
                    displayedStars
                  )
                : 'No rating'}
            </div>

            <div className="analytics-sentiment-tag">
              {sentimentTag}
            </div>

            <p className="analytics-sentiment-desc">
              Based on{' '}
              {totalValidReviews}{' '}
              valid guest{' '}
              {totalValidReviews === 1
                ? 'review'
                : 'reviews'}{' '}
              in the selected timeframe.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewAnalyticsSection