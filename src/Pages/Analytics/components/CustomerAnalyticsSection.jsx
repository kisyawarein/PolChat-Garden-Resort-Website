import React, { useMemo } from 'react'

function CustomerAnalyticsSection({
  customers = [],
  reservations = [],
}) {
  const safeCustomers = Array.isArray(customers)
    ? customers
    : []

  const safeReservations = Array.isArray(reservations)
    ? reservations
    : []

  /*
   * Parse date-only values as local dates.
   * This prevents timezone conversion from moving a
   * registration into the previous day or month.
   */
  const parseDateValue = (value) => {
    if (!value) return null

    if (value instanceof Date) {
      return Number.isNaN(value.getTime())
        ? null
        : value
    }

    if (typeof value === 'string') {
      const trimmedValue = value.trim()

      const dateOnlyMatch = trimmedValue.match(
        /^(\d{4})-(\d{2})-(\d{2})$/
      )

      if (dateOnlyMatch) {
        const [, year, month, day] =
          dateOnlyMatch

        const localDate = new Date(
          Number(year),
          Number(month) - 1,
          Number(day)
        )

        return Number.isNaN(
          localDate.getTime()
        )
          ? null
          : localDate
      }
    }

    const parsedDate = new Date(value)

    return Number.isNaN(parsedDate.getTime())
      ? null
      : parsedDate
  }

  const getCustomerId = (customer) => {
    const value =
      customer?.customer_id ??
      customer?.id

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return null
    }

    return String(value)
  }

  const getReservationCustomerId = (
    reservation
  ) => {
    const value =
      reservation?.customer_id ??
      reservation?.customer?.customer_id

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return null
    }

    return String(value)
  }

  const getCustomerDate = (customer) =>
    parseDateValue(
      customer?.date_create ??
      customer?.created_at ??
      customer?.date_created
    )

  /*
   * Count real resort reservations for each
   * registered customer.
   *
   * Guest reservations without customer_id are not
   * interpreted as registered customer profiles.
   */
  const bookingCountMap = useMemo(() => {
    const countMap = {}

    safeReservations.forEach(
      (reservation) => {
        const customerId =
          getReservationCustomerId(
            reservation
          )

        if (!customerId) return

        countMap[customerId] =
          (countMap[customerId] || 0) + 1
      }
    )

    return countMap
  }, [safeReservations])

  /*
   * Segment only actual customer profiles.
   *
   * Each profile is assigned to exactly one group:
   * - Repeat guest: two or more reservations
   * - Single-booking guest: exactly one reservation
   * - Registered without booking: no reservation
   */
  const customerSegments = useMemo(() => {
    let repeatGuests = 0
    let singleBookingGuests = 0
    let registeredWithoutBooking = 0

    safeCustomers.forEach((customer) => {
      const customerId =
        getCustomerId(customer)

      const reservationCount =
        customerId
          ? bookingCountMap[customerId] || 0
          : 0

      if (reservationCount > 1) {
        repeatGuests += 1
      } else if (reservationCount === 1) {
        singleBookingGuests += 1
      } else {
        registeredWithoutBooking += 1
      }
    })

    return {
      repeatGuests,
      singleBookingGuests,
      registeredWithoutBooking,
    }
  }, [safeCustomers, bookingCountMap])

  const segments = [
    {
      label: 'Repeat Guests (2+ Bookings)',
      count:
        customerSegments.repeatGuests,
      color: '#7CCE17',
      sub: 'High Loyalty',
    },
    {
      label: 'Single Booking Guests',
      count:
        customerSegments.singleBookingGuests,
      color: '#43593B',
      sub: 'First-time Bookers',
    },
    {
      label:
        'Registered (No Booking Yet)',
      count:
        customerSegments.registeredWithoutBooking,
      color: '#E6BF5C',
      sub: 'Potential Leads',
    },
  ]

  const totalProfiles =
    safeCustomers.length

  const totalSegmentCount =
    segments.reduce(
      (total, segment) =>
        total + segment.count,
      0
    )

  /*
   * Create actual monthly registration counts.
   *
   * The chart covers every month between the first
   * and last valid customer-registration dates.
   * Months with no registrations remain visible as 0.
   */
  const monthlyCustomers = useMemo(() => {
    const datedCustomers =
      safeCustomers
        .map((customer) => ({
          customer,
          date: getCustomerDate(customer),
        }))
        .filter(({ date }) => date !== null)
        .sort(
          (first, second) =>
            first.date.getTime() -
            second.date.getTime()
        )

    if (datedCustomers.length === 0) {
      return []
    }

    const firstDate =
      datedCustomers[0].date

    const lastDate =
      datedCustomers[
        datedCustomers.length - 1
      ].date

    const firstMonth = new Date(
      firstDate.getFullYear(),
      firstDate.getMonth(),
      1
    )

    const lastMonth = new Date(
      lastDate.getFullYear(),
      lastDate.getMonth(),
      1
    )

    const monthlyCountMap = new Map()

    datedCustomers.forEach(({ date }) => {
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, '0')}`

      monthlyCountMap.set(
        monthKey,
        (monthlyCountMap.get(monthKey) || 0) +
          1
      )
    })

    const periods = []
    const cursor = new Date(firstMonth)

    while (cursor <= lastMonth) {
      const year = cursor.getFullYear()
      const monthIndex = cursor.getMonth()

      const key = `${year}-${String(
        monthIndex + 1
      ).padStart(2, '0')}`

      periods.push({
        key,
        month: cursor.toLocaleDateString(
          'en-US',
          {
            month: 'short',
          }
        ),
        fullLabel:
          cursor.toLocaleDateString(
            'en-US',
            {
              month: 'long',
              year: 'numeric',
            }
          ),
        count:
          monthlyCountMap.get(key) || 0,
      })

      cursor.setMonth(
        cursor.getMonth() + 1
      )
    }

    return periods
  }, [safeCustomers])

  const maxMonthlyCount =
    monthlyCustomers.length > 0
      ? Math.max(
          ...monthlyCustomers.map(
            (period) => period.count
          ),
          1
        )
      : 1

  /*
   * Show a reduced number of labels if the selected
   * timeframe spans many months.
   */
  const labelStep = Math.max(
    1,
    Math.ceil(monthlyCustomers.length / 12)
  )

  const customersWithValidDates =
    monthlyCustomers.reduce(
      (total, period) =>
        total + period.count,
      0
    )

  return (
    <div className="analytics-section-card">
      <div className="analytics-section-header">
        <h3 className="analytics-section-title">
          Customer Accounts & Directory
          Intelligence
        </h3>

        <span className="analytics-section-pill">
          Guest Lifecycle & Retention
        </span>
      </div>

      <div className="analytics-grid-two-col">
        {/* Real Customer Segmentation */}
        <div className="analytics-panel-inner">
          <div className="analytics-inner-heading">
            <h4>
              Customer Segmentation &
              Loyalty Breakdown
            </h4>
          </div>

          {totalProfiles > 0 ? (
            <>
              <div className="analytics-segments-list">
                {segments.map((segment) => {
                  const percentage =
                    totalSegmentCount > 0
                      ? Math.round(
                          (
                            segment.count /
                            totalSegmentCount
                          ) * 100
                        )
                      : 0

                  return (
                    <div
                      key={segment.label}
                      className="analytics-segment-row"
                    >
                      <div className="analytics-seg-left">
                        <span
                          className="analytics-seg-dot"
                          style={{
                            backgroundColor:
                              segment.color,
                          }}
                        />

                        <div className="analytics-seg-info">
                          <strong className="analytics-seg-title">
                            {segment.label}
                          </strong>

                          <span className="analytics-seg-sub">
                            {segment.sub}
                          </span>
                        </div>
                      </div>

                      <div className="analytics-seg-right">
                        <span className="analytics-seg-count">
                          {segment.count}{' '}
                          {segment.count === 1
                            ? 'Profile'
                            : 'Profiles'}
                        </span>

                        <span className="analytics-seg-badge">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div
                style={{
                  marginTop: '14px',
                  textAlign: 'right',
                  color: '#796656',
                  fontSize: '0.76rem',
                }}
              >
                {totalProfiles} total registered{' '}
                {totalProfiles === 1
                  ? 'profile'
                  : 'profiles'}
              </div>
            </>
          ) : (
            <div className="analytics-empty-state">
              No customer profiles match the
              selected timeframe.
            </div>
          )}
        </div>

        {/* Real Monthly Customer Registrations */}
        <div className="analytics-panel-inner">
          <div className="analytics-inner-heading">
            <h4>
              New Customer Registrations
              (Monthly)
            </h4>
          </div>

          {monthlyCustomers.length > 0 ? (
            <>
              <div className="analytics-bar-chart-container">
                <div className="analytics-bar-flex">
                  {monthlyCustomers.map(
                    (period, index) => {
                      const heightPercentage =
                        period.count > 0
                          ? Math.max(
                              Math.round(
                                (
                                  period.count /
                                  maxMonthlyCount
                                ) * 100
                              ),
                              4
                            )
                          : 0

                      const shouldShowLabel =
                        index % labelStep ===
                          0 ||
                        index ===
                          monthlyCustomers.length -
                            1

                      return (
                        <div
                          key={period.key}
                          className="analytics-col-bar"
                          title={`${period.fullLabel}: ${period.count} new ${
                            period.count === 1
                              ? 'registration'
                              : 'registrations'
                          }`}
                        >
                          <span className="analytics-col-val">
                            {period.count}
                          </span>

                          <div className="analytics-col-track">
                            <div
                              className="analytics-col-fill"
                              style={{
                                height: `${heightPercentage}%`,
                                backgroundColor:
                                  '#43593B',
                              }}
                            />
                          </div>

                          <span className="analytics-col-label">
                            {shouldShowLabel
                              ? period.month
                              : ''}
                          </span>
                        </div>
                      )
                    }
                  )}
                </div>
              </div>

              <div
                style={{
                  marginTop: '12px',
                  color: '#796656',
                  fontSize: '0.76rem',
                  textAlign: 'right',
                }}
              >
                {customersWithValidDates}{' '}
                registrations with a valid
                creation date
              </div>
            </>
          ) : (
            <div className="analytics-empty-state">
              No customer registration dates
              are available for the selected
              timeframe.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CustomerAnalyticsSection