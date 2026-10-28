import React, { useMemo, useState } from 'react'

function PieChartPanel({ reservations = [], visitations = [] }) {
  const [hoveredSlice, setHoveredSlice] = useState(null)

  // Date Range state
  const [dateRange, setDateRange] = useState('This Year')
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false)

  const currentYear = new Date().getFullYear()

  const [customStart, setCustomStart] = useState(
    `${currentYear}-01-01`
  )
  const [customEnd, setCustomEnd] = useState(
    `${currentYear}-12-31`
  )

  const dateOptions = [
    'This Week',
    'This Month',
    'Last 3 Months',
    'This Year',
    'Last 3 Years',
    'Custom range',
  ]

  /*
   * Converts database date values into JavaScript dates.
   *
   * Date-only values are parsed as local dates to prevent timezone
   * conversion from moving the record to the previous day.
   */
  const parseDateValue = (value) => {
    if (!value) return null

    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value
    }

    if (typeof value === 'string') {
      const trimmedValue = value.trim()

      const dateOnlyMatch = trimmedValue.match(
        /^(\d{4})-(\d{2})-(\d{2})$/
      )

      if (dateOnlyMatch) {
        const [, year, month, day] = dateOnlyMatch

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

  /*
   * Finds the scheduled date of a resort reservation.
   *
   * created_at is kept as the final fallback in case the reservation
   * table does not include one of the scheduling fields above it.
   */
const getReservationDate = (reservation) => {
  if (!reservation) return null

  const value =
    reservation.start_date ??
    reservation.reservation_start_date ??
    reservation.reservation_date ??
    reservation.booking_date ??
    reservation.check_in_date ??
    reservation.checkin_date ??
    reservation.visit_date ??
    reservation.date_reserved ??
    reservation.created_at ??
    reservation.date_created

  return parseDateValue(value)
}

  /*
   * Finds the scheduled date of an ocular visitation.
   */
  const getVisitationDate = (visitation) => {
    if (!visitation) return null

    const value =
      visitation.visitation_start_date ??
      visitation.visitation_date ??
      visitation.visit_date ??
      visitation.schedule_date ??
      visitation.start_date ??
      visitation.created_at ??
      visitation.date_created

    return parseDateValue(value)
  }

  const startOfDay = (date) => {
    const result = new Date(date)
    result.setHours(0, 0, 0, 0)
    return result
  }

  const endOfDay = (date) => {
    const result = new Date(date)
    result.setHours(23, 59, 59, 999)
    return result
  }

  /*
   * Calculates the start and end date for the selected timeframe.
   */
  const selectedDateBounds = useMemo(() => {
  const now = new Date()

  let start = startOfDay(now)
  let end = endOfDay(now)

  switch (dateRange) {
    case 'This Week': {
      // Monday through Sunday of the current calendar week
      const currentDay = now.getDay()
      const daysSinceMonday =
        currentDay === 0 ? 6 : currentDay - 1

      start = startOfDay(now)
      start.setDate(start.getDate() - daysSinceMonday)

      end = endOfDay(start)
      end.setDate(end.getDate() + 6)

      break
    }

    case 'This Month': {
      // Entire current calendar month
      start = startOfDay(
        new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        )
      )

      end = endOfDay(
        new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0
        )
      )

      break
    }

    case 'Last 3 Months': {
      // Rolling three-month period ending today
      start = startOfDay(now)
      start.setMonth(start.getMonth() - 3)

      end = endOfDay(now)

      break
    }

    case 'Last 3 Years': {
      // Rolling three-year period ending today
      start = startOfDay(now)
      start.setFullYear(start.getFullYear() - 3)

      end = endOfDay(now)

      break
    }

    case 'Custom range': {
      const parsedStart = parseDateValue(customStart)
      const parsedEnd = parseDateValue(customEnd)

      start = parsedStart
        ? startOfDay(parsedStart)
        : null

      end = parsedEnd
        ? endOfDay(parsedEnd)
        : null

      break
    }

    case 'This Year':
    default: {
      // Entire calendar year, including future scheduled bookings
      start = startOfDay(
        new Date(
          now.getFullYear(),
          0,
          1
        )
      )

      end = endOfDay(
        new Date(
          now.getFullYear(),
          11,
          31
        )
      )

      break
    }
  }

  return { start, end }
}, [dateRange, customStart, customEnd])

  /*
   * Filters the reservation records by the selected date range.
   */
  const filteredReservations = useMemo(() => {
    const { start, end } = selectedDateBounds

    if (!start || !end) return []
    if (start.getTime() > end.getTime()) return []

    return reservations.filter((reservation) => {
      const reservationDate =
        getReservationDate(reservation)

      if (!reservationDate) return false

      const recordTime = reservationDate.getTime()

      return (
        recordTime >= start.getTime() &&
        recordTime <= end.getTime()
      )
    })
  }, [reservations, selectedDateBounds])

  /*
   * Filters ocular visitation records by the selected date range.
   */
  const filteredVisitations = useMemo(() => {
    const { start, end } = selectedDateBounds

    if (!start || !end) return []
    if (start.getTime() > end.getTime()) return []

    return visitations.filter((visitation) => {
      const visitationDate =
        getVisitationDate(visitation)

      if (!visitationDate) return false

      const recordTime = visitationDate.getTime()

      return (
        recordTime >= start.getTime() &&
        recordTime <= end.getTime()
      )
    })
  }, [visitations, selectedDateBounds])

  /*
   * Converts duration_id to a number because Supabase may return
   * the value as either a number or a numeric string.
   */
  const getDurationId = (reservation) => {
    const value =
      reservation?.duration_id ??
      reservation?.duration_type_id ??
      reservation?.duration?.duration_id

    return Number(value)
  }

  // Real package counts from the filtered records
  const dayTourCount = filteredReservations.filter(
    (reservation) => getDurationId(reservation) === 1
  ).length

  const overnightCount = filteredReservations.filter(
    (reservation) => getDurationId(reservation) === 2
  ).length

  const twentyTwoCount = filteredReservations.filter(
    (reservation) => {
      const durationId = getDurationId(reservation)

      return durationId === 3 || durationId === 4
    }
  ).length

  const ocularCount = filteredVisitations.length

  /*
   * No fake fallback data and no minimum count of 1.
   * A category with no matching records correctly displays 0.
   */
  const rawData = [
    {
      label: 'Day Tour',
      count: dayTourCount,
      color: '#7CCE17',
      sub: '8 Hours (9am-5pm)',
    },
    {
      label: 'Overnight',
      count: overnightCount,
      color: '#43593B',
      sub: '10 Hours (8pm-6am)',
    },
    {
      label: '22 Hours',
      count: twentyTwoCount,
      color: '#E6BF5C',
      sub: 'Day/Night Start',
    },
    {
      label: 'Ocular Visits',
      count: ocularCount,
      color: '#ACAD79',
      sub: 'Free Inspection',
    },
  ]

  const totalSum = rawData.reduce(
    (total, item) => total + item.count,
    0
  )

  /*
   * Calculate slice angles for the SVG donut chart.
   */
  let cumulativeAngle = 0

  const slices = rawData.map((item) => {
    const fraction =
      totalSum > 0 ? item.count / totalSum : 0

    const startAngle = cumulativeAngle
    const angle = fraction * 2 * Math.PI

    cumulativeAngle += angle

    const endAngle = cumulativeAngle
    const percent =
      totalSum > 0 ? Math.round(fraction * 100) : 0

    return {
      ...item,
      startAngle,
      endAngle,
      percent,
    }
  })

  // SVG dimensions
  const size = 180
  const center = size / 2
  const outerRadius = 75
  const innerRadius = 42

  /*
   * Creates an SVG donut slice.
   */
  const getArcPath = (
    startAngle,
    endAngle,
    isHovered
  ) => {
    const rOuter = isHovered
      ? outerRadius + 4
      : outerRadius

    const rInner = innerRadius

    const x1 =
      center +
      rOuter * Math.cos(startAngle - Math.PI / 2)

    const y1 =
      center +
      rOuter * Math.sin(startAngle - Math.PI / 2)

    const x2 =
      center +
      rOuter * Math.cos(endAngle - Math.PI / 2)

    const y2 =
      center +
      rOuter * Math.sin(endAngle - Math.PI / 2)

    const x3 =
      center +
      rInner * Math.cos(endAngle - Math.PI / 2)

    const y3 =
      center +
      rInner * Math.sin(endAngle - Math.PI / 2)

    const x4 =
      center +
      rInner * Math.cos(startAngle - Math.PI / 2)

    const y4 =
      center +
      rInner * Math.sin(startAngle - Math.PI / 2)

    const largeArc =
      endAngle - startAngle > Math.PI ? 1 : 0

    return `
      M ${x1} ${y1}
      A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${rInner} ${rInner} 0 ${largeArc} 0 ${x4} ${y4}
      Z
    `
  }

  const customRangeIsInvalid =
    dateRange === 'Custom range' &&
    selectedDateBounds.start &&
    selectedDateBounds.end &&
    selectedDateBounds.start.getTime() >
      selectedDateBounds.end.getTime()

  return (
    <div className="dash-panel-box dash-pie-panel">
      {/* Panel Header */}
      <div className="dash-panel-bar">
        <div className="dash-panel-heading">
          <span className="dash-panel-title-text">
            Reservation Types Breakdown
          </span>
        </div>

        {/* Date Range Selector Dropdown */}
        <div className="dash-panel-actions-group">
          <div className="dash-dropdown-container">
            <button
              type="button"
              className="dash-dropdown-toggle-btn"
              onClick={() =>
                setIsDateMenuOpen(
                  (currentValue) => !currentValue
                )
              }
            >
              <span>{dateRange}</span>

              <span className="dash-dropdown-caret">
                ▾
              </span>
            </button>

            {isDateMenuOpen && (
              <div className="dash-dropdown-menu dash-date-menu">
                <div className="dash-filter-menu-title">
                  Select Timeframe
                </div>

                {dateOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`dash-dropdown-item ${
                      dateRange === option ? 'active' : ''
                    }`}
                    onClick={() => {
                      setDateRange(option)
                      setHoveredSlice(null)

                      if (option !== 'Custom range') {
                        setIsDateMenuOpen(false)
                      }
                    }}
                  >
                    {option}
                  </button>
                ))}

                {dateRange === 'Custom range' && (
                  <div className="dash-custom-range-box">
                    <div className="dash-range-row">
                      <label htmlFor="pie-custom-start">
                        From:
                      </label>

                      <input
                        id="pie-custom-start"
                        type="date"
                        value={customStart}
                        onChange={(event) => {
                          setCustomStart(event.target.value)
                          setHoveredSlice(null)
                        }}
                        className="dash-date-input"
                      />
                    </div>

                    <div className="dash-range-row">
                      <label htmlFor="pie-custom-end">
                        To:
                      </label>

                      <input
                        id="pie-custom-end"
                        type="date"
                        value={customEnd}
                        min={customStart || undefined}
                        onChange={(event) => {
                          setCustomEnd(event.target.value)
                          setHoveredSlice(null)
                        }}
                        className="dash-date-input"
                      />
                    </div>

                    {customRangeIsInvalid && (
                      <div className="dash-date-error">
                        The end date must be on or after the
                        start date.
                      </div>
                    )}

                    <button
                      type="button"
                      className="dash-apply-date-btn"
                      disabled={
                        !customStart ||
                        !customEnd ||
                        customRangeIsInvalid
                      }
                      onClick={() => {
                        if (!customRangeIsInvalid) {
                          setIsDateMenuOpen(false)
                        }
                      }}
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Panel Body */}
      <div className="dash-pie-content">
        <div className="dash-pie-chart-wrap">
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="dash-pie-svg"
            role="img"
            aria-label={`Reservation type breakdown for ${dateRange}`}
          >
            {totalSum > 0 ? (
              slices
                .filter((slice) => slice.count > 0)
                .map((slice) => {
                  const isHovered =
                    hoveredSlice?.label === slice.label

                  return (
                    <path
                      key={slice.label}
                      d={getArcPath(
                        slice.startAngle,
                        slice.endAngle,
                        isHovered
                      )}
                      fill={slice.color}
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="dash-pie-slice"
                      onMouseEnter={() =>
                        setHoveredSlice(slice)
                      }
                      onMouseLeave={() =>
                        setHoveredSlice(null)
                      }
                    />
                  )
                })
            ) : (
              /*
               * Empty donut shown when no records match the
               * selected date range.
               */
              <circle
                cx={center}
                cy={center}
                r={(outerRadius + innerRadius) / 2}
                fill="none"
                stroke="#E4DCD3"
                strokeWidth={outerRadius - innerRadius}
              />
            )}

            {/* Center Value */}
            <text
              x={center}
              y={center - 3}
              textAnchor="middle"
              className="dash-pie-center-val"
            >
              {hoveredSlice
                ? `${hoveredSlice.percent}%`
                : totalSum}
            </text>

            {/* Center Label */}
            <text
              x={center}
              y={center + 12}
              textAnchor="middle"
              className="dash-pie-center-label"
            >
              {hoveredSlice
                ? hoveredSlice.label
                : 'Bookings'}
            </text>
          </svg>
        </div>

        {/* Legend List */}
        <div className="dash-pie-legend">
          {slices.map((slice) => (
            <div
              key={slice.label}
              className={`dash-pie-legend-row ${
                hoveredSlice?.label === slice.label
                  ? 'highlight'
                  : ''
              }`}
              onMouseEnter={() =>
                setHoveredSlice(slice)
              }
              onMouseLeave={() =>
                setHoveredSlice(null)
              }
            >
              <div className="dash-pie-legend-left">
                <span
                  className="dash-pie-legend-color"
                  style={{
                    backgroundColor: slice.color,
                  }}
                />

                <div className="dash-pie-legend-names">
                  <span className="dash-pie-legend-title">
                    {slice.label}
                  </span>

                  <span className="dash-pie-legend-sub">
                    {slice.sub}
                  </span>
                </div>
              </div>

              <div className="dash-pie-legend-right">
                <span className="dash-pie-legend-count">
                  {slice.count}
                </span>

                <span className="dash-pie-legend-percent">
                  {slice.percent}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PieChartPanel