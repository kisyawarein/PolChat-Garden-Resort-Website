import React, { useMemo, useState } from 'react'

function BarChartPanel({
  reservations = [],
  visitations = [],
  onExportCsv,
}) {
  const [selectedView, setSelectedView] = useState('packages')
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false)
  const [hoveredBar, setHoveredBar] = useState(null)

  // Date Range state
  const [dateRange, setDateRange] = useState('This Year')
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false)
  const [customStart, setCustomStart] = useState('2026-01-01')
  const [customEnd, setCustomEnd] = useState('2026-12-31')

  const dateOptions = [
    'This Week',
    'This Month',
    'Last 3 Months',
    'This Year',
    'Last 3 Years',
    'Custom range',
  ]

  /*
   * Converts a database date value into a JavaScript Date.
   *
   * Date-only values such as "2026-10-29" are parsed as local dates.
   * This prevents them from moving to the previous day because of
   * timezone conversion.
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

        return Number.isNaN(localDate.getTime()) ? null : localDate
      }
    }

    const parsedDate = new Date(value)

    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
  }

  /*
   * Finds the reservation date.
   *
   * The first available date field is used. Place the actual booking
   * schedule fields before created_at so the chart measures scheduled
   * visits instead of the date the database row was created.
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
   * Finds the ocular visitation date.
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
   * Returns the beginning and end of the selected date period.
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
   * Checks whether a record date is inside the selected period.
   */
  const isInsideSelectedRange = (recordDate) => {
    if (!recordDate) return false

    const { start, end } = selectedDateBounds

    if (!start || !end) return false
    if (start.getTime() > end.getTime()) return false

    const recordTime = recordDate.getTime()

    return (
      recordTime >= start.getTime() &&
      recordTime <= end.getTime()
    )
  }

  /*
   * Filter the source records before calculating chart values.
   */
  const filteredReservations = useMemo(() => {
    return reservations.filter((reservation) => {
      const reservationDate = getReservationDate(reservation)
      return isInsideSelectedRange(reservationDate)
    })
  }, [reservations, selectedDateBounds])

  const filteredVisitations = useMemo(() => {
    return visitations.filter((visitation) => {
      const visitationDate = getVisitationDate(visitation)
      return isInsideSelectedRange(visitationDate)
    })
  }, [visitations, selectedDateBounds])

  /*
   * Converts duration_id into a number because Supabase data may
   * sometimes provide IDs as strings.
   */
  const getDurationId = (reservation) => {
    const value =
      reservation?.duration_id ??
      reservation?.duration_type_id ??
      reservation?.duration?.duration_id

    return Number(value)
  }

  /*
   * Package counts based only on the filtered records.
   */
  const realDayTour = filteredReservations.filter(
    (reservation) => getDurationId(reservation) === 1
  ).length

  const realOvernight = filteredReservations.filter(
    (reservation) => getDurationId(reservation) === 2
  ).length

  const realDay22 = filteredReservations.filter(
    (reservation) => getDurationId(reservation) === 3
  ).length

  const realNight22 = filteredReservations.filter(
    (reservation) => getDurationId(reservation) === 4
  ).length

  const realOcular = filteredVisitations.length

  const packageBars = [
    {
      label: 'Day Tour',
      count: realDayTour,
      color: '#7CCE17',
      sub: '9am - 5pm',
    },
    {
      label: 'Overnight',
      count: realOvernight,
      color: '#43593B',
      sub: '8pm - 6am',
    },
    {
      label: '22h Day',
      count: realDay22,
      color: '#E6BF5C',
      sub: '8am - 6am',
    },
    {
      label: '22h Night',
      count: realNight22,
      color: '#ACAD79',
      sub: '8pm - 6pm',
    },
    {
      label: 'Ocular',
      count: realOcular,
      color: '#58402E',
      sub: 'Inspections',
    },
  ]

  /*
   * Normalizes text values before comparing reservation statuses.
   */
  const normalizeText = (value) => {
    return String(value ?? '').trim().toLowerCase()
  }

  /*
   * Handles true, 1, and common text representations from the database.
   */
  const isTrueValue = (value) => {
    if (value === true || value === 1) return true

    const normalizedValue = normalizeText(value)

    return (
      normalizedValue === 'true' ||
      normalizedValue === '1' ||
      normalizedValue === 'yes' ||
      normalizedValue === 'paid'
    )
  }

  const confirmedCount = filteredReservations.filter(
    (reservation) =>
      normalizeText(reservation.reservation_status) === 'confirmed'
  ).length

  const pendingCount = filteredReservations.filter(
    (reservation) =>
      normalizeText(reservation.reservation_status) === 'pending'
  ).length

  const paidSecDepCount = filteredReservations.filter(
    (reservation) => isTrueValue(reservation.has_paid_sec_dep)
  ).length

  const fullPaidCount = filteredReservations.filter(
    (reservation) => isTrueValue(reservation.has_paid_reservation)
  ).length

  const statusBars = [
    {
      label: 'Confirmed',
      count: confirmedCount,
      color: '#7CCE17',
      sub: 'Approved',
    },
    {
      label: 'Pending',
      count: pendingCount,
      color: '#E6BF5C',
      sub: 'Awaiting Action',
    },
    {
      label: 'Deposit Paid',
      count: paidSecDepCount,
      color: '#ACAD79',
      sub: 'Security Dep',
    },
    {
      label: 'Fully Paid',
      count: fullPaidCount,
      color: '#43593B',
      sub: 'Completed',
    },
  ]

  const activeBars =
    selectedView === 'packages' ? packageBars : statusBars

  // Chart Dimensions
  const chartWidth = 380
  const chartHeight = 220
  const padLeft = 35
  const padRight = 15
  const padTop = 20
  const padBottom = 35

  const usableWidth = chartWidth - padLeft - padRight
  const usableHeight = chartHeight - padTop - padBottom

  /*
   * The chart keeps a minimum vertical scale of 5 so that an empty
   * chart remains readable, but the actual displayed values stay at 0.
   */
  const highestCount = Math.max(
    ...activeBars.map((bar) => bar.count),
    0
  )

  const maxVal = Math.max(5, highestCount)

  const barSlotWidth = usableWidth / activeBars.length
  const barWidth = Math.min(barSlotWidth * 0.58, 38)

  /*
   * Use unique rounded tick values to avoid duplicate React keys.
   */
  const yTicks = [
    ...new Set([
      0,
      Math.round(maxVal * 0.33),
      Math.round(maxVal * 0.66),
      maxVal,
    ]),
  ]

  const customRangeIsInvalid =
    dateRange === 'Custom range' &&
    selectedDateBounds.start &&
    selectedDateBounds.end &&
    selectedDateBounds.start.getTime() >
      selectedDateBounds.end.getTime()

  const handleExport = () => {
    if (typeof onExportCsv !== 'function') return

    onExportCsv({
      selectedView,
      dateRange,
      customStart,
      customEnd,
      bars: activeBars,
      reservations: filteredReservations,
      visitations: filteredVisitations,
    })
  }

  return (
    <div className="dash-panel-box dash-bar-panel">
      {/* Panel Header */}
      <div className="dash-panel-bar">
        <div className="dash-panel-heading">
          <span className="dash-panel-title-text">
            {selectedView === 'packages'
              ? 'Package Volume'
              : 'Status Breakdown'}
          </span>
        </div>

        {/* Action Controls */}
        <div className="dash-panel-actions-group">
          {/* Date Range Selector Dropdown */}
          <div className="dash-dropdown-container">
            <button
              type="button"
              className="dash-dropdown-toggle-btn"
              onClick={() => {
                setIsDateMenuOpen((currentValue) => !currentValue)
                setIsViewMenuOpen(false)
              }}
            >
              <span>{dateRange}</span>
              <span className="dash-dropdown-caret">▾</span>
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
                      setHoveredBar(null)

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
                      <label htmlFor="dash-custom-start">
                        From:
                      </label>

                      <input
                        id="dash-custom-start"
                        type="date"
                        value={customStart}
                        onChange={(event) => {
                          setCustomStart(event.target.value)
                          setHoveredBar(null)
                        }}
                        className="dash-date-input"
                      />
                    </div>

                    <div className="dash-range-row">
                      <label htmlFor="dash-custom-end">
                        To:
                      </label>

                      <input
                        id="dash-custom-end"
                        type="date"
                        value={customEnd}
                        min={customStart || undefined}
                        onChange={(event) => {
                          setCustomEnd(event.target.value)
                          setHoveredBar(null)
                        }}
                        className="dash-date-input"
                      />
                    </div>

                    {customRangeIsInvalid && (
                      <div className="dash-date-error">
                        The end date must be on or after the start
                        date.
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

          {/* View Toggle */}
          <div className="dash-dropdown-container">
            <button
              type="button"
              className="dash-dropdown-toggle-btn"
              onClick={() => {
                setIsViewMenuOpen((currentValue) => !currentValue)
                setIsDateMenuOpen(false)
              }}
            >
              <span>View</span>
              <span className="dash-dropdown-caret">▾</span>
            </button>

            {isViewMenuOpen && (
              <div className="dash-dropdown-menu">
                <button
                  type="button"
                  className={`dash-dropdown-item ${
                    selectedView === 'packages' ? 'active' : ''
                  }`}
                  onClick={() => {
                    setSelectedView('packages')
                    setIsViewMenuOpen(false)
                    setHoveredBar(null)
                  }}
                >
                  By Package Type
                </button>

                <button
                  type="button"
                  className={`dash-dropdown-item ${
                    selectedView === 'status' ? 'active' : ''
                  }`}
                  onClick={() => {
                    setSelectedView('status')
                    setIsViewMenuOpen(false)
                    setHoveredBar(null)
                  }}
                >
                  By Status Breakdown
                </button>
              </div>
            )}
          </div>

          {/* Only render Export if the parent supplied the function */}
          {typeof onExportCsv === 'function' && (
            <button
              type="button"
              className="dash-dropdown-toggle-btn"
              onClick={handleExport}
            >
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Panel Body */}
      <div className="dash-panel-content">
        <div className="dash-chart-wrapper">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="dash-svg-chart"
            role="img"
            aria-label={
              selectedView === 'packages'
                ? `Package volume for ${dateRange}`
                : `Reservation status breakdown for ${dateRange}`
            }
          >
            {/* Horizontal Grid Lines */}
            {yTicks.map((tick) => {
              const y =
                padTop +
                usableHeight -
                (tick / maxVal) * usableHeight

              return (
                <g
                  key={`tick-${tick}`}
                  className="dash-grid-group"
                >
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={chartWidth - padRight}
                    y2={y}
                    stroke="#E4DCD3"
                    strokeWidth="1"
                    strokeDasharray={
                      tick === 0 ? 'none' : '3,3'
                    }
                  />

                  <text
                    x={padLeft - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="dash-axis-text"
                  >
                    {tick}
                  </text>
                </g>
              )
            })}

            {/* Bars */}
            {activeBars.map((bar, index) => {
              const barCenterX =
                padLeft +
                index * barSlotWidth +
                barSlotWidth / 2

              const barX = barCenterX - barWidth / 2

              const barHeight =
                bar.count === 0
                  ? 0
                  : (bar.count / maxVal) * usableHeight

              const barY =
                padTop + usableHeight - barHeight

              return (
                <g
                  key={bar.label}
                  className="dash-bar-group"
                  onMouseEnter={() =>
                    setHoveredBar({
                      ...bar,
                      x: barCenterX,
                      y: barY,
                    })
                  }
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  <rect
                    x={barX}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    fill={bar.color}
                    rx="4"
                    className="dash-bar-rect"
                  />

                  <text
                    x={barCenterX}
                    y={
                      bar.count === 0
                        ? padTop + usableHeight - 5
                        : barY - 5
                    }
                    textAnchor="middle"
                    className="dash-bar-val-text"
                  >
                    {bar.count}
                  </text>

                  <text
                    x={barCenterX}
                    y={chartHeight - 12}
                    textAnchor="middle"
                    className="dash-axis-text"
                  >
                    {bar.label}
                  </text>
                </g>
              )
            })}
          </svg>

          {/* Hover Tooltip */}
          {hoveredBar && (
            <div
              className="dash-chart-tooltip"
              style={{
                left: `${(hoveredBar.x / chartWidth) * 100}%`,
                top: `${(hoveredBar.y / chartHeight) * 100}%`,
              }}
            >
              <div className="dash-tooltip-title">
                {hoveredBar.label}
              </div>

              <div className="dash-tooltip-val">
                {hoveredBar.count}{' '}
                {hoveredBar.label === 'Ocular'
                  ? hoveredBar.count === 1
                    ? 'Inspection'
                    : 'Inspections'
                  : hoveredBar.count === 1
                    ? 'Booking'
                    : 'Bookings'}
                {' • '}
                {hoveredBar.sub}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BarChartPanel