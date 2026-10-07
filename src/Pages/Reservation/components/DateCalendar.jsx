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

  // Check whether the proposed package on dateStr has any time conflict
  const checkTimeConflict = (dateStr) => {
    const pkg = selectedPackage || { duration_id: 1, duration_start: '09:00:00', duration_end: '17:00:00' }
    const startStr = pkg.duration_start || '09:00:00'
    const endStr = pkg.duration_end || '17:00:00'

    const proposedStart = new Date(`${dateStr}T${startStr}`)
    const proposedEnd = new Date(`${dateStr}T${endStr}`)
    if (pkg.duration_id === 2 || pkg.duration_id === 3 || pkg.duration_id === 4) {
      proposedEnd.setDate(proposedEnd.getDate() + 1)
    }

    // Check reservations (non-cancelled)
    for (const r of reservations) {
      if (r.reservation_status === 'cancelled') continue
      if (!r.start_date || !r.end_date) continue

      const rStart = new Date(r.start_date)
      const rEnd = new Date(r.end_date)

      // Time overlap rule: StartA < EndB && StartB < EndA
      if (proposedStart < rEnd && rStart < proposedEnd) {
        return true
      }
    }

    // Check visitations (ocular visits) - non-cancelled
    for (const v of visitations) {
      if (v.visitation_status === 'cancelled') continue
      if (!v.visitation_start_date) continue

      const vDateOnly = v.visitation_start_date.split('T')[0]
      const vStart = new Date(`${vDateOnly}T09:00:00`)
      const vEnd = new Date(`${vDateOnly}T11:00:00`)

      if (proposedStart < vEnd && vStart < proposedEnd) {
        return true
      }
    }

    return false
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
      const isBooked = checkTimeConflict(dateStr)

      let cellClass = 'resv-cal-day-cell'
      if (isPast) cellClass += ' resv-cal-day-past'
      if (isToday) cellClass += ' resv-cal-day-today'
      if (isSelected) cellClass += ' resv-cal-day-selected'
      if (isBooked) cellClass += ' resv-cal-day-booked'

      cells.push(
        <button
          key={dateStr}
          type="button"
          disabled={isPast || isBooked}
          className={cellClass}
          onClick={() => onSelectDate(dateStr)}
        >
          <span className="resv-cal-day-number">{day}</span>

          <div className="resv-cal-day-indicators">
            {isBooked ? (
              <span className="resv-cal-pill resv-cal-pill-booked">
                Booked
              </span>
            ) : !isPast ? (
              <span className="resv-cal-pill resv-cal-pill-available">
                Available
              </span>
            ) : null}
          </div>
        </button>
      )
    }

    return cells
  }

  return (
    <div className="resv-calendar-step-wrapper">
      <div className="resv-header-section">
        <h2 className="resv-section-title">Select Your Reservation Date</h2>
        <p className="resv-section-subtitle">
          Choose an open date on our calendar. Availability reflects non-conflicting time slots for {selectedPackage?.duration_name || 'your package'}.
        </p>
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
            Prev
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
            Next
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
            <span className="resv-legend-text">Booked / Time Conflict</span>
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
            Back
          </button>
          <button
            type="button"
            disabled={!selectedDate}
            className="resv-continue-btn"
            onClick={onNext}
          >
            Continue to Guest Form
          </button>
        </div>
      </div>
    </div>
  )
}

export default DateCalendar
