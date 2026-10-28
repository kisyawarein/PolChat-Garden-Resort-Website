import React from 'react'

function AnalyticsKPIs({
  reservations = [],
  customers = [],
  reviews = [],
  visitations = [],
}) {
  const safeReservations = Array.isArray(reservations)
    ? reservations
    : []

  const safeCustomers = Array.isArray(customers)
    ? customers
    : []

  const safeReviews = Array.isArray(reviews)
    ? reviews
    : []

  const safeVisitations = Array.isArray(visitations)
    ? visitations
    : []

  const normalizeStatus = (value) =>
    String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[_-]+/g, ' ')

  const getReservationTotal = (reservation) => {
    const reservationCost = Number(
      reservation?.reservation_cost || 0
    )

    const extraCharges = Number(
      reservation?.extra_charges || 0
    )

    return (
      (Number.isFinite(reservationCost)
        ? reservationCost
        : 0) +
      (Number.isFinite(extraCharges)
        ? extraCharges
        : 0)
    )
  }

  /*
   * These reservation statuses are treated as valid booking value
   * because they represent approved or fulfilled reservations.
   */
  const revenueReservations =
    safeReservations.filter((reservation) => {
      const status = normalizeStatus(
        reservation.reservation_status
      )

      return [
        'confirmed',
        'approved',
        'arrived',
        'completed',
      ].includes(status)
    })

  /*
   * 1. Gross booking value
   *
   * Uses only actual approved or fulfilled reservation records.
   * No fake fallback revenue is supplied.
   */
  const totalRevenue =
    revenueReservations.reduce(
      (total, reservation) =>
        total +
        getReservationTotal(reservation),
      0
    )

  /*
   * 2. Total bookings
   *
   * Includes actual resort reservations and ocular visitations
   * received from the already-filtered Analytics page data.
   */
  const totalBookings =
    safeReservations.length +
    safeVisitations.length

  /*
   * 3. Average booking value
   *
   * Ocular visits are excluded because their amount is zero and
   * this card specifically measures value per resort reservation.
   */
  const avgBookingValue =
    revenueReservations.length > 0
      ? Math.round(
          totalRevenue /
            revenueReservations.length
        )
      : 0

  /*
   * 4. Repeat guest rate
   *
   * A repeat guest is a registered customer_id appearing in more
   * than one resort reservation within the selected timeframe.
   */
  const bookingCountMap = {}

  safeReservations.forEach((reservation) => {
    const customerId =
      reservation.customer_id

    if (
      customerId !== null &&
      customerId !== undefined &&
      customerId !== ''
    ) {
      const key = String(customerId)

      bookingCountMap[key] =
        (bookingCountMap[key] || 0) + 1
    }
  })

  const repeatBookers =
    Object.values(bookingCountMap).filter(
      (bookingCount) =>
        bookingCount > 1
    ).length

  const repeatRate =
    safeCustomers.length > 0
      ? Math.round(
          (repeatBookers /
            safeCustomers.length) *
            100
        )
      : 0

  /*
   * 5. Guest satisfaction
   *
   * Invalid, missing, and zero-star values are excluded from the
   * average rather than being converted into fake ratings.
   */
  const validRatings = safeReviews
    .map((review) =>
      Number(review.review_stars)
    )
    .filter(
      (rating) =>
        Number.isFinite(rating) &&
        rating > 0
    )

  const averageRating =
    validRatings.length > 0
      ? (
          validRatings.reduce(
            (total, rating) =>
              total + rating,
            0
          ) / validRatings.length
        ).toFixed(1)
      : '0.0'

  /*
   * 6. Confirmation rate
   *
   * Uses actual reservations only:
   *
   * confirmed/approved/arrived/completed
   * divided by all reservation requests.
   */
  const successfulReservations =
    safeReservations.filter((reservation) => {
      const status = normalizeStatus(
        reservation.reservation_status
      )

      return [
        'confirmed',
        'approved',
        'arrived',
        'completed',
      ].includes(status)
    })

  const confirmationRate =
    safeReservations.length > 0
      ? Math.round(
          (
            successfulReservations.length /
            safeReservations.length
          ) * 100
        )
      : 0

  return (
    <div className="dash-stats-grid">
      {/* 1. Gross Booking Value */}
      <div className="dash-stat-card theme-forest">
        <div className="dash-stat-top">
          <div className="dash-stat-icon-wrap">
            <svg
              viewBox="0 0 24 24"
              width="34"
              height="34"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect
                x="2"
                y="4"
                width="20"
                height="16"
                rx="2"
              />
              <line
                x1="2"
                y1="10"
                x2="22"
                y2="10"
              />
              <circle
                cx="12"
                cy="15"
                r="2"
              />
            </svg>
          </div>

          <div className="dash-stat-text-wrap">
            <div className="dash-stat-number">
              ₱
              {Math.round(
                totalRevenue
              ).toLocaleString()}
            </div>

            <div className="dash-stat-label">
              Gross Booking Value
            </div>
          </div>
        </div>

        <div className="dash-stat-bottom">
          <span className="dash-stat-link-text">
            {revenueReservations.length}{' '}
            approved or fulfilled reservations
          </span>
        </div>
      </div>

      {/* 2. Total Bookings */}
      <div className="dash-stat-card theme-green">
        <div className="dash-stat-top">
          <div className="dash-stat-icon-wrap">
            <svg
              viewBox="0 0 24 24"
              width="34"
              height="34"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect
                x="3"
                y="4"
                width="18"
                height="18"
                rx="2"
                ry="2"
              />
              <line
                x1="16"
                y1="2"
                x2="16"
                y2="6"
              />
              <line
                x1="8"
                y1="2"
                x2="8"
                y2="6"
              />
              <line
                x1="3"
                y1="10"
                x2="21"
                y2="10"
              />
              <path d="M9 16l2 2 4-4" />
            </svg>
          </div>

          <div className="dash-stat-text-wrap">
            <div className="dash-stat-number">
              {totalBookings}
            </div>

            <div className="dash-stat-label">
              Total Bookings
            </div>
          </div>
        </div>

        <div className="dash-stat-bottom">
          <span className="dash-stat-link-text">
            {safeReservations.length} stays +{' '}
            {safeVisitations.length} oculars
          </span>
        </div>
      </div>

      {/* 3. Average Booking Value */}
      <div className="dash-stat-card theme-gold">
        <div className="dash-stat-top">
          <div className="dash-stat-icon-wrap">
            <svg
              viewBox="0 0 24 24"
              width="34"
              height="34"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
              />
              <line
                x1="12"
                y1="8"
                x2="12"
                y2="12"
              />
              <line
                x1="12"
                y1="16"
                x2="12.01"
                y2="16"
              />
            </svg>
          </div>

          <div className="dash-stat-text-wrap">
            <div className="dash-stat-number">
              ₱{avgBookingValue.toLocaleString()}
            </div>

            <div className="dash-stat-label">
              Avg Booking Value
            </div>
          </div>
        </div>

        <div className="dash-stat-bottom">
          <span className="dash-stat-link-text">
            Per approved or fulfilled stay
          </span>
        </div>
      </div>

      {/* 4. Repeat Guest Rate */}
      <div className="dash-stat-card theme-sage">
        <div className="dash-stat-top">
          <div className="dash-stat-icon-wrap">
            <svg
              viewBox="0 0 24 24"
              width="34"
              height="34"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="1 4 1 10 7 10" />
              <polyline points="23 20 23 14 17 14" />
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
            </svg>
          </div>

          <div className="dash-stat-text-wrap">
            <div className="dash-stat-number">
              {repeatRate}%
            </div>

            <div className="dash-stat-label">
              Repeat Guest Rate
            </div>
          </div>
        </div>

        <div className="dash-stat-bottom">
          <span className="dash-stat-link-text">
            {repeatBookers}{' '}
            {repeatBookers === 1
              ? 'repeat guest'
              : 'repeat guests'}
          </span>
        </div>
      </div>

      {/* 5. Guest Satisfaction */}
      <div className="dash-stat-card theme-earth">
        <div className="dash-stat-top">
          <div className="dash-stat-icon-wrap">
            <svg
              viewBox="0 0 24 24"
              width="34"
              height="34"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>

          <div className="dash-stat-text-wrap">
            <div className="dash-stat-number">
              {averageRating} ★
            </div>

            <div className="dash-stat-label">
              Guest Satisfaction
            </div>
          </div>
        </div>

        <div className="dash-stat-bottom">
          <span className="dash-stat-link-text">
            {validRatings.length}{' '}
            {validRatings.length === 1
              ? 'valid review'
              : 'valid reviews'}
          </span>
        </div>
      </div>

      {/* 6. Confirmation Rate */}
      <div className="dash-stat-card theme-deep">
        <div className="dash-stat-top">
          <div className="dash-stat-icon-wrap">
            <svg
              viewBox="0 0 24 24"
              width="34"
              height="34"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>

          <div className="dash-stat-text-wrap">
            <div className="dash-stat-number">
              {confirmationRate}%
            </div>

            <div className="dash-stat-label">
              Confirmation Rate
            </div>
          </div>
        </div>

        <div className="dash-stat-bottom">
          <span className="dash-stat-link-text">
            {successfulReservations.length} of{' '}
            {safeReservations.length} stay requests
          </span>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsKPIs