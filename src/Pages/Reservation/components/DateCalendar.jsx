import { useState } from 'react'

function DateCalendar({
  selectedPackage,
  selectedDate,
  onSelectDate,
  reservations = [],
  visitations = [],
  onBack,
  onNext,
}) {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()) // 0-11

  // Format YYYY-MM-DD
  const formatYMD = (year, month, day) => {
    const m = String(month + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    return `${year}-${m}-${d}`
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Month calculations
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const todayYMD = new Date().toISOString().split('T')[0]

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((y) => y - 1)
    } else {
      setCurrentMonth((m) => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((y) => y + 1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
  }

  // Check booked items on a specific day
  const getBookingsForDate = (dateStr) => {
    const res = reservations.filter(
      (r) => r.start_date && r.start_date.startsWith(dateStr) && r.reservation_status !== 'cancelled'
    )
    const vis = visitations.filter(
      (v) => v.visitation_start_date && v.visitation_start_date.startsWith(dateStr) && v.visitation_status !== 'cancelled'
    )
    return { reservations: res, visitations: vis }
  }

  // Render Calendar Grid Cells
  const renderDays = () => {
    const cells = []

    // Empty cells for alignment
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(<div key={`empty-${i}`} className="resv-cal-day-cell resv-cal-empty-cell" />)
    }

    // Days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatYMD(currentYear, currentMonth, day)
      const isPast = dateStr < todayYMD
      const isToday = dateStr === todayYMD
      const isSelected = selectedDate === dateStr
      const dayBookings = getBookingsForDate(dateStr)
      const hasBooking = dayBookings.reservations.length > 0
      const hasVisitation = dayBookings.visitations.length > 0

      let cellClass = 'resv-cal-day-cell'
      if (isPast) cellClass += ' resv-cal-day-past'
      if (isToday) cellClass += ' resv-cal-day-today'
      if (isSelected) cellClass += ' resv-cal-day-selected'
      if (hasBooking) cellClass += ' resv-cal-day-booked'

      cells.push(
        <button
          key={dateStr}
          type="button"
          disabled={isPast}
          className={cellClass}
          onClick={() => onSelectDate(dateStr)}
        >
          <span className="resv-cal-day-number">{day}</span>

          <div className="resv-cal-day-indicators">
            {hasBooking && (
              <span className="resv-cal-pill resv-cal-pill-booked" title="Resort Booked">
                Booked
              </span>
            )}
            {hasVisitation && (
              <span className="resv-cal-pill resv-cal-pill-visit" title="Ocular Visit">
                Ocular
              </span>
            )}
            {!hasBooking && !isPast && (
              <span className="resv-cal-pill resv-cal-pill-available">
                Available
              </span>
            )}
          </div>
        </button>
      )
    }

    return cells
  }

  return (
    <div className="resv-calendar-step-wrapper">
      <div className="resv-header-section">
        <span className="resv-step-badge">Step 2 of 4</span>
        <h2 className="resv-section-title">Select Your Reservation Date</h2>
        <p className="resv-section-subtitle">
          Choose an open date on our calendar. Real-time availability reflects confirmed bookings.
        </p>
      </div>

      {/* Selected Package Banner */}
      <div className="resv-selected-pkg-card">
        <div className="resv-selected-pkg-left">
          <span className="resv-selected-tag">Selected Package</span>
          <h3 className="resv-selected-name">{selectedPackage?.duration_name}</h3>
          <p className="resv-selected-price">
            Base Rate: ₱{Number(selectedPackage?.duration_price || 0).toLocaleString()} • {selectedPackage?.duration_hours} Hours
          </p>
        </div>
        <button
          type="button"
          className="resv-change-pkg-btn"
          onClick={onBack}
        >
          Change Package
        </button>
      </div>

      {/* Interactive Calendar Component */}
      <div className="resv-calendar-container">
        {/* Calendar Header Navigation */}
        <div className="resv-calendar-header">
          <button
            type="button"
            className="resv-cal-nav-btn"
            onClick={handlePrevMonth}
            aria-label="Previous Month"
          >
            ‹ Prev
          </button>
          <div className="resv-cal-month-title">
            {monthNames[currentMonth]} {currentYear}
          </div>
          <button
            type="button"
            className="resv-cal-nav-btn"
            onClick={handleNextMonth}
            aria-label="Next Month"
          >
            Next ›
          </button>
        </div>

        {/* Day Names Header */}
        <div className="resv-cal-weekdays-grid">
          {daysOfWeek.map((day) => (
            <div key={day} className="resv-cal-weekday">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="resv-cal-days-grid">{renderDays()}</div>

        {/* Calendar Legend */}
        <div className="resv-cal-legend">
          <div className="resv-legend-item">
            <span className="resv-legend-dot resv-legend-dot-available"></span>
            <span className="resv-legend-text">Available</span>
          </div>
          <div className="resv-legend-item">
            <span className="resv-legend-dot resv-legend-dot-selected"></span>
            <span className="resv-legend-text">Selected</span>
          </div>
          <div className="resv-legend-item">
            <span className="resv-legend-dot resv-legend-dot-booked"></span>
            <span className="resv-legend-text">Booked / Reserved</span>
          </div>
        </div>
      </div>

      {/* Selected Date Indicator & Action Bar */}
      <div className="resv-calendar-actions-bar">
        <div className="resv-cal-choice-preview">
          {selectedDate ? (
            <p className="resv-choice-text">
              Selected Date: <strong>{new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
            </p>
          ) : (
            <p className="resv-choice-text-empty">Please click a date on the calendar above to continue.</p>
          )}
        </div>

        <div className="resv-actions-group">
          <button
            type="button"
            className="resv-back-btn"
            onClick={onBack}
          >
            ← Back
          </button>
          <button
            type="button"
            disabled={!selectedDate}
            className="resv-continue-btn"
            onClick={onNext}
          >
            Continue to Guest Form →
          </button>
        </div>
      </div>
    </div>
  )
}

export default DateCalendar
