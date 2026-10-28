import React, { useMemo, useState } from 'react'

function BookingAnalyticsSection({
  reservations = [],
  visitations = [],
}) {
  const [hoveredPoint, setHoveredPoint] =
    useState(null)

  const safeReservations = Array.isArray(reservations)
    ? reservations
    : []

  const safeVisitations = Array.isArray(visitations)
    ? visitations
    : []

  const normalizeStatus = (value) =>
    String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[_-]+/g, ' ')

  /*
   * Parse date-only values as local dates so timezone conversion
   * does not accidentally move them into the previous month.
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

        return Number.isNaN(localDate.getTime())
          ? null
          : localDate
      }
    }

    const parsedDate = new Date(value)

    return Number.isNaN(parsedDate.getTime())
      ? null
      : parsedDate
  }

  const getReservationDate = (reservation) =>
    parseDateValue(
      reservation?.start_date ??
        reservation?.reservation_start_date ??
        reservation?.reservation_date ??
        reservation?.booking_date ??
        reservation?.created_at
    )

  const getReservationValue = (reservation) => {
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

  const getDurationId = (reservation) => {
    const value =
      reservation?.duration_id ??
      reservation?.duration_type_id ??
      reservation?.duration?.duration_id

    return Number(value)
  }

  /*
   * Revenue is counted only for approved or fulfilled
   * reservations, matching the corrected KPI cards.
   */
  const revenueStatuses = [
    'confirmed',
    'approved',
    'arrived',
    'completed',
  ]

  const isRevenueReservation = (reservation) =>
    revenueStatuses.includes(
      normalizeStatus(
        reservation?.reservation_status
      )
    )

  /*
   * Build real monthly cumulative revenue data.
   *
   * There are no hard-coded monthly values, multipliers,
   * minimum counts, or fallback revenue amounts.
   */
  const trendPeriods = useMemo(() => {
    const datedReservations =
      safeReservations
        .map((reservation) => ({
          reservation,
          date: getReservationDate(reservation),
        }))
        .filter(({ date }) => date !== null)
        .sort(
          (first, second) =>
            first.date.getTime() -
            second.date.getTime()
        )

    if (datedReservations.length === 0) {
      return []
    }

    const firstDate =
      datedReservations[0].date

    const lastDate =
      datedReservations[
        datedReservations.length - 1
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

    const monthlyMap = new Map()

    datedReservations.forEach(
      ({ reservation, date }) => {
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, '0')}`

        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, {
            revenue: 0,
            bookings: 0,
          })
        }

        const monthData =
          monthlyMap.get(monthKey)

        monthData.bookings += 1

        if (isRevenueReservation(reservation)) {
          monthData.revenue +=
            getReservationValue(reservation)
        }
      }
    )

    const periods = []
    const cursor = new Date(firstMonth)

    let cumulativeRevenue = 0
    let cumulativeBookings = 0

    while (cursor <= lastMonth) {
      const year = cursor.getFullYear()
      const month = cursor.getMonth()

      const monthKey = `${year}-${String(
        month + 1
      ).padStart(2, '0')}`

      const monthData =
        monthlyMap.get(monthKey) || {
          revenue: 0,
          bookings: 0,
        }

      cumulativeRevenue += monthData.revenue
      cumulativeBookings += monthData.bookings

      periods.push({
        key: monthKey,
        label: cursor.toLocaleDateString(
          'en-US',
          {
            month: 'short',
          }
        ),
        fullLabel: cursor.toLocaleDateString(
          'en-US',
          {
            month: 'long',
            year: 'numeric',
          }
        ),
        monthlyRevenue: monthData.revenue,
        monthlyBookings: monthData.bookings,
        revenue: cumulativeRevenue,
        bookings: cumulativeBookings,
      })

      cursor.setMonth(cursor.getMonth() + 1)
    }

    return periods
  }, [safeReservations])

  /*
   * Package distribution and value from real records.
   */
  const packageBars = useMemo(() => {
    const buildPackage = (
      label,
      durationIds,
      color
    ) => {
      const matchingReservations =
        safeReservations.filter(
          (reservation) =>
            durationIds.includes(
              getDurationId(reservation)
            )
        )

      const qualifyingValue =
        matchingReservations.reduce(
          (total, reservation) => {
            if (
              !isRevenueReservation(
                reservation
              )
            ) {
              return total
            }

            return (
              total +
              getReservationValue(reservation)
            )
          },
          0
        )

      return {
        label,
        count: matchingReservations.length,
        color,
        value: qualifyingValue,
        type: 'reservation',
      }
    }

    return [
      buildPackage(
        'Day Tour (8h)',
        [1],
        '#7CCE17'
      ),
      buildPackage(
        'Overnight (10h)',
        [2],
        '#43593B'
      ),
      buildPackage(
        '22h Day Start',
        [3],
        '#E6BF5C'
      ),
      buildPackage(
        '22h Night Start',
        [4],
        '#ACAD79'
      ),
      {
        label: 'Ocular Visit',
        count: safeVisitations.length,
        color: '#58402E',
        value: 0,
        type: 'ocular',
      },
    ]
  }, [safeReservations, safeVisitations])

  const totalPackageRecords =
    packageBars.reduce(
      (total, packageItem) =>
        total + packageItem.count,
      0
    )

  /*
   * SVG chart dimensions.
   */
  const chartWidth = 560
  const chartHeight = 220
  const padLeft = 58
  const padRight = 20
  const padTop = 20
  const padBottom = 30

  const usableWidth =
    chartWidth - padLeft - padRight

  const usableHeight =
    chartHeight - padTop - padBottom

  const maxRevenue =
    trendPeriods.length > 0
      ? Math.max(
          ...trendPeriods.map(
            (period) => period.revenue
          ),
          0
        )
      : 0

  /*
   * Produce a clean vertical scale without using a fake
   * minimum revenue amount.
   */
  const getNiceMaximum = (value) => {
    if (value <= 0) return 1

    const magnitude = 10 ** Math.floor(
      Math.log10(value)
    )

    const normalized = value / magnitude

    let niceNormalized

    if (normalized <= 1) {
      niceNormalized = 1
    } else if (normalized <= 2) {
      niceNormalized = 2
    } else if (normalized <= 5) {
      niceNormalized = 5
    } else {
      niceNormalized = 10
    }

    return niceNormalized * magnitude
  }

  const maxValue =
    getNiceMaximum(maxRevenue)

  const getX = (index) => {
    if (trendPeriods.length <= 1) {
      return padLeft + usableWidth / 2
    }

    return (
      padLeft +
      (index /
        (trendPeriods.length - 1)) *
        usableWidth
    )
  }

  const getY = (value) =>
    padTop +
    usableHeight -
    (value / maxValue) * usableHeight

  /*
   * Build smooth SVG line and filled-area paths only when
   * actual dated reservation records are available.
   */
  let linePath = ''
  let areaPath = ''

  if (trendPeriods.length === 1) {
    const x = getX(0)
    const y = getY(trendPeriods[0].revenue)

    linePath = `M ${x} ${y}`
    areaPath = `
      M ${x} ${y}
      L ${x} ${padTop + usableHeight}
      Z
    `
  } else if (trendPeriods.length > 1) {
    linePath = `M ${getX(0)} ${getY(
      trendPeriods[0].revenue
    )}`

    for (
      let index = 0;
      index < trendPeriods.length - 1;
      index += 1
    ) {
      const firstPoint = {
        x: getX(index),
        y: getY(
          trendPeriods[index].revenue
        ),
      }

      const secondPoint = {
        x: getX(index + 1),
        y: getY(
          trendPeriods[index + 1].revenue
        ),
      }

      const middleX =
        (firstPoint.x +
          secondPoint.x) /
        2

      linePath += `
        C ${middleX} ${firstPoint.y},
          ${middleX} ${secondPoint.y},
          ${secondPoint.x} ${secondPoint.y}
      `
    }

    areaPath = `
      ${linePath}
      L ${getX(
        trendPeriods.length - 1
      )} ${padTop + usableHeight}
      L ${getX(0)} ${
        padTop + usableHeight
      }
      Z
    `
  }

  const yTicks = [
    0,
    maxValue * 0.25,
    maxValue * 0.5,
    maxValue * 0.75,
    maxValue,
  ]

  /*
   * Prevent month labels from overlapping when the selected
   * range contains many months.
   */
  const xLabelStep = Math.max(
    1,
    Math.ceil(trendPeriods.length / 10)
  )

  const formatCurrencyAxis = (value) => {
    if (value === 0) return '₱0'

    if (value >= 1000000) {
      return `₱${(
        value / 1000000
      ).toFixed(1)}M`
    }

    if (value >= 1000) {
      return `₱${Math.round(
        value / 1000
      )}k`
    }

    return `₱${Math.round(value)}`
  }

  const maxPackageCount = Math.max(
    ...packageBars.map(
      (packageItem) =>
        packageItem.count
    ),
    1
  )

  return (
    <div className="analytics-section-card">
      <div className="analytics-section-header">
        <h3 className="analytics-section-title">
          Bookings & Revenue Performance
        </h3>

        <span className="analytics-section-pill">
          Reservations Intelligence
        </span>
      </div>

      <div className="analytics-grid-two-col">
        {/* Real cumulative revenue chart */}
        <div className="analytics-panel-inner">
          <div className="analytics-inner-heading">
            <h4>
              Cumulative Booking Value (PHP)
            </h4>
          </div>

          <div className="analytics-chart-wrap">
            {trendPeriods.length > 0 ? (
              <>
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="analytics-svg"
                  role="img"
                  aria-label="Cumulative booking value from actual reservation records"
                >
                  <defs>
                    <linearGradient
                      id="bookRevGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#43593B"
                        stopOpacity="0.85"
                      />

                      <stop
                        offset="100%"
                        stopColor="#43593B"
                        stopOpacity="0.08"
                      />
                    </linearGradient>
                  </defs>

                  {/* Grid and Y labels */}
                  {yTicks.map(
                    (tickValue, tickIndex) => {
                      const y =
                        getY(tickValue)

                      return (
                        <g key={tickIndex}>
                          <line
                            x1={padLeft}
                            y1={y}
                            x2={
                              chartWidth -
                              padRight
                            }
                            y2={y}
                            stroke="#E5E0D8"
                            strokeDasharray="3,3"
                          />

                          <text
                            x={padLeft - 8}
                            y={y + 4}
                            textAnchor="end"
                            className="analytics-axis-text"
                          >
                            {formatCurrencyAxis(
                              tickValue
                            )}
                          </text>
                        </g>
                      )
                    }
                  )}

                  {/* Month labels */}
                  {trendPeriods.map(
                    (period, index) => {
                      const shouldShowLabel =
                        index % xLabelStep ===
                          0 ||
                        index ===
                          trendPeriods.length -
                            1

                      if (!shouldShowLabel) {
                        return null
                      }

                      return (
                        <text
                          key={period.key}
                          x={getX(index)}
                          y={chartHeight - 8}
                          textAnchor="middle"
                          className="analytics-axis-text"
                        >
                          {period.label}
                        </text>
                      )
                    }
                  )}

                  {/* Area and line */}
                  <path
                    d={areaPath}
                    fill="url(#bookRevGrad)"
                  />

                  <path
                    d={linePath}
                    fill="none"
                    stroke="#43593B"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Actual monthly points */}
                  {trendPeriods.map(
                    (period, index) => {
                      const x = getX(index)
                      const y = getY(
                        period.revenue
                      )

                      const isHovered =
                        hoveredPoint?.key ===
                        period.key

                      return (
                        <circle
                          key={period.key}
                          cx={x}
                          cy={y}
                          r={
                            isHovered
                              ? 6
                              : 4
                          }
                          fill="#ffffff"
                          stroke="#43593B"
                          strokeWidth="2"
                          onMouseEnter={() =>
                            setHoveredPoint(
                              period
                            )
                          }
                          onMouseLeave={() =>
                            setHoveredPoint(
                              null
                            )
                          }
                          style={{
                            cursor: 'pointer',
                          }}
                        />
                      )
                    }
                  )}
                </svg>

                {hoveredPoint && (
                  <div className="analytics-tooltip">
                    <strong>
                      {hoveredPoint.fullLabel}
                    </strong>

                    <div>
                      Monthly value:{' '}
                      ₱
                      {Math.round(
                        hoveredPoint.monthlyRevenue
                      ).toLocaleString()}
                    </div>

                    <div>
                      Cumulative value:{' '}
                      ₱
                      {Math.round(
                        hoveredPoint.revenue
                      ).toLocaleString()}
                    </div>

                    <div>
                      Monthly requests:{' '}
                      {
                        hoveredPoint.monthlyBookings
                      }
                    </div>

                    <div>
                      Cumulative requests:{' '}
                      {hoveredPoint.bookings}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="analytics-empty-state">
                No dated reservation records match
                the selected timeframe.
              </div>
            )}
          </div>
        </div>

        {/* Real package distribution */}
        <div className="analytics-panel-inner">
          <div className="analytics-inner-heading">
            <h4>
              Booking Share by Package Tier
            </h4>
          </div>

          <div className="analytics-bars-list">
            {packageBars.map(
              (packageItem) => {
                const percentageOfLargest =
                  Math.round(
                    (
                      packageItem.count /
                      maxPackageCount
                    ) * 100
                  )

                const bookingText =
                  packageItem.type ===
                  'ocular'
                    ? `${
                        packageItem.count
                      } ${
                        packageItem.count ===
                        1
                          ? 'visit'
                          : 'visits'
                      }`
                    : `${
                        packageItem.count
                      } ${
                        packageItem.count ===
                        1
                          ? 'booking'
                          : 'bookings'
                      }`

                const valueText =
                  packageItem.type ===
                  'ocular'
                    ? 'Free'
                    : `₱${Math.round(
                        packageItem.value
                      ).toLocaleString()} value`

                return (
                  <div
                    key={packageItem.label}
                    className="analytics-bar-item"
                  >
                    <div className="analytics-bar-labels">
                      <span className="analytics-bar-name">
                        {packageItem.label}
                      </span>

                      <span className="analytics-bar-stat">
                        {bookingText} ·{' '}
                        {valueText}
                      </span>
                    </div>

                    <div className="analytics-bar-track">
                      <div
                        className="analytics-bar-fill"
                        style={{
                          width:
                            packageItem.count >
                            0
                              ? `${Math.max(
                                  percentageOfLargest,
                                  2
                                )}%`
                              : '0%',
                          backgroundColor:
                            packageItem.color,
                        }}
                      />
                    </div>
                  </div>
                )
              }
            )}
          </div>

          <div
            style={{
              marginTop: '14px',
              fontSize: '0.76rem',
              color: '#796656',
              textAlign: 'right',
            }}
          >
            {totalPackageRecords} total matching
            records
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingAnalyticsSection