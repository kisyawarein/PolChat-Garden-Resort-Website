import { useState } from 'react'

function DateCalendar({
  selectedPackage,
  selectedDate,
  onSelectDate,
  reservations = [],
  visitations = [],
  currentUser = null,
  onBack,
  onNext,
}) {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()) // 0-11

  // Helper to determine if a reservation/visitation belongs to the logged-in customer
  const isMyBooking = (item, user) => {
    if (!user || !item) return false
    if (item.customer_id && user.id && Number(item.customer_id) === Number(user.id)) return true

    const itemEmail = (item.customer_email || '').trim().toLowerCase()
    const userEmail = (user.email || '').trim().toLowerCase()
    if (itemEmail && userEmail && itemEmail === userEmail) return true

    const userFullName = (user.name || `${user.first_name || ''} ${user.last_name || ''}`).trim().toLowerCase()
    const itemCustName = (item.customer_name || (item.customer ? `${item.customer.first_name} ${item.customer.last_name || ''}` : '')).trim().toLowerCase()
    if (userFullName && itemCustName && (userFullName === itemCustName || itemCustName.includes(userFullName) || userFullName.includes(itemCustName))) return true

    const userUsername = (user.username || '').trim().toLowerCase()
    if (userUsername && itemCustName && (userUsername === itemCustName || itemCustName.includes(userUsername))) return true

    const evName = (item.event_name || '').toLowerCase()
    if (evName && userEmail && evName.includes(userEmail)) return true
    if (evName && userFullName && evName.includes(userFullName)) return true
    if (evName && userUsername && evName.includes(userUsername)) return true

    return false
  }

  // Parse start/end dates into reliable Date objects respecting package hours
  const parseDateTimeRange = (startStr, endStr, durationId) => {
    if (!startStr) return null

    let startDate, endDate
    const strS = String(startStr).trim()
    const strE = endStr ? String(endStr).trim() : null

    const durNum = Number(durationId)
    // Day Tour: 8 hours (09:00 - 17:00)
    // Overnight: 10 hours (20:00 - 06:00 next day)
    // 22 Hours Day: 22 hours (08:00 - 06:00 next day)
    // 22 Hours Night: 22 hours (20:00 - 18:00 next day)
    const defaultStartTime = durNum === 2 || durNum === 4 ? '20:00:00' : durNum === 3 ? '08:00:00' : '09:00:00'
    const defaultEndTime = durNum === 2 || durNum === 3 ? '06:00:00' : durNum === 4 ? '18:00:00' : '17:00:00'
    const defaultHours = durNum === 2 ? 10 : durNum === 3 || durNum === 4 ? 22 : 8

    // Case A: Simple date only (e.g. "2026-10-21")
    if (/^\d{4}-\d{2}-\d{2}$/.test(strS)) {
      startDate = new Date(`${strS}T${defaultStartTime}`)
      if (strE && /^\d{4}-\d{2}-\d{2}$/.test(strE)) {
        endDate = new Date(`${strE}T${defaultEndTime}`)
        if (durNum === 2 || durNum === 3 || durNum === 4 || endDate <= startDate) {
          endDate = new Date(startDate.getTime() + defaultHours * 60 * 60 * 1000)
        }
      } else {
        endDate = new Date(startDate.getTime() + defaultHours * 60 * 60 * 1000)
      }
    } else {
      // Case B: Full timestamp / ISO format (e.g. "2026-10-21T09:00:00" or "2026-10-21 09:00:00")
      if (strS.includes('Z') || (strS.includes('+') && strS.length > 19)) {
        startDate = new Date(strS)
      } else {
        const cleanS = strS.replace(' ', 'T')
        startDate = new Date(cleanS)
      }

      if (strE) {
        if (strE.includes('Z') || (strE.includes('+') && strE.length > 19)) {
          endDate = new Date(strE)
        } else {
          const cleanE = strE.replace(' ', 'T')
          endDate = new Date(cleanE)
        }
      }
    }

    if (!startDate || isNaN(startDate.getTime())) return null

    if (!endDate || isNaN(endDate.getTime()) || endDate <= startDate) {
      endDate = new Date(startDate.getTime() + defaultHours * 60 * 60 * 1000)
    }

    return { start: startDate, end: endDate }
  }

  // Format YMD: YYYY-MM-DD
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

  // Get Philippine Standard Time (Asia/Manila, UTC+8)
  const getPhilippineNow = () => {
    const now = new Date()
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
    const parts = formatter.formatToParts(now)
    const map = {}
    parts.forEach((p) => {
      map[p.type] = p.value
    })
    const ymd = `${map.year}-${map.month}-${map.day}`
    const hms = `${map.hour}:${map.minute}:${map.second}`
    const nowPH = new Date(`${ymd}T${hms}`)
    return { ymd, hms, nowPH }
  }

  // Month calculations
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

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

  // Check whether the proposed package on dateStr has any conflict
  // Returns: 'occupied' (confirmed conflict from anyone), 'pending' (pending conflict from ME only), or 'available'
  const getDateAvailability = (dateStr) => {
    if (!dateStr) return 'available'

    const pkg = selectedPackage || { duration_id: 1, duration_start: '09:00:00', duration_end: '17:00:00' }
    const durId = Number(pkg.duration_id || 1)
    const startStr = pkg.duration_start || (durId === 2 || durId === 4 ? '20:00:00' : durId === 3 ? '08:00:00' : '09:00:00')
    const endStr = pkg.duration_end || (durId === 2 || durId === 3 ? '06:00:00' : durId === 4 ? '18:00:00' : '17:00:00')

    const proposedStart = new Date(`${dateStr}T${startStr}`)
    let proposedEnd = new Date(`${dateStr}T${endStr}`)
    if (proposedEnd <= proposedStart || durId === 2 || durId === 3 || durId === 4) {
      proposedEnd = new Date(proposedEnd.getTime() + 24 * 60 * 60 * 1000)
    }

    let hasMyPending = false

    // 1. Check reservations (non-cancelled)
    for (const r of reservations || []) {
      const status = (r.reservation_status || '').toLowerCase()
      if (status === 'cancelled' || status === 'declined') continue
      if (!r.start_date) continue

      const range = parseDateTimeRange(r.start_date, r.end_date, r.duration_id)
      if (!range) continue

      // Precise time overlap: proposedStart < r.end && r.start < proposedEnd
      if (proposedStart < range.end && range.start < proposedEnd) {
        const isMine = isMyBooking(r, currentUser)
        if (status === 'confirmed' || status === 'approved' || status === 'completed') {
          return 'occupied'
        }
        if (status === 'pending' || status === '') {
          if (isMine) {
            hasMyPending = true
          }
        }
      }
    }

    // 2. Check visitations (ocular visits) - non-cancelled
    for (const v of visitations || []) {
      const vStatus = (v.visitation_status || '').toLowerCase()
      if (vStatus === 'cancelled' || vStatus === 'declined') continue
      if (!v.visitation_start_date) continue

      let vStart, vEnd
      if (v.visitation_start_date.includes('T') || v.visitation_start_date.includes(' ')) {
        const cleanStart = v.visitation_start_date.replace(' ', 'T')
        vStart = new Date(cleanStart)
        if (v.visitation_end_date) {
          vEnd = new Date(v.visitation_end_date.replace(' ', 'T'))
        } else {
          vEnd = new Date(vStart.getTime() + 2 * 60 * 60 * 1000)
        }
      } else {
        const isMorning =
          (v.slot_type && v.slot_type.toLowerCase().includes('morning')) ||
          v.visitation_start_date.includes('09:')
        vStart = new Date(`${v.visitation_start_date}T${isMorning ? '09:00:00' : '14:00:00'}`)
        vEnd = new Date(`${v.visitation_start_date}T${isMorning ? '11:00:00' : '16:00:00'}`)
      }

      if (vStart && vEnd && proposedStart < vEnd && vStart < proposedEnd) {
        const isMine = isMyBooking(v, currentUser)
        if (vStatus === 'confirmed' || vStatus === 'approved') {
          return 'occupied'
        }
        if (vStatus === 'pending') {
          if (isMine) {
            hasMyPending = true
          }
        }
      }
    }

    if (hasMyPending) return 'pending'
    return 'available'
  }

  // Render Calendar Grid Cells
  const renderDays = () => {
    const cells = []
    const { ymd: todayYMD, nowPH } = getPhilippineNow()

    const pkg = selectedPackage || { duration_id: 1, duration_start: '09:00:00', duration_end: '17:00:00' }
    const durId = Number(pkg.duration_id || 1)
    const startStr = pkg.duration_start || (durId === 2 || durId === 4 ? '20:00:00' : durId === 3 ? '08:00:00' : '09:00:00')

    // Empty cells for alignment
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(<div key={`empty-${i}`} className="resv-cal-day-cell resv-cal-empty-cell" />)
    }

    // Days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatYMD(currentYear, currentMonth, day)
      const proposedSlotStart = new Date(`${dateStr}T${startStr}`)
      const isPast = dateStr < todayYMD || (dateStr === todayYMD && proposedSlotStart <= nowPH)
      const isToday = dateStr === todayYMD
      const isSelected = selectedDate === dateStr
      const availability = isPast ? 'past' : getDateAvailability(dateStr)
      const isOccupied = availability === 'occupied'
      const isPending = availability === 'pending'
      const isBlocked = isPast || isOccupied || isPending

      let cellClass = 'resv-cal-day-cell'
      if (isPast) cellClass += ' resv-cal-day-past'
      if (isToday) cellClass += ' resv-cal-day-today'
      if (isSelected) cellClass += ' resv-cal-day-selected'
      if (isOccupied) cellClass += ' resv-cal-day-booked'
      if (isPending) cellClass += ' resv-cal-day-pending'

      cells.push(
        <button
          key={dateStr}
          type="button"
          disabled={isBlocked}
          className={cellClass}
          onClick={() => onSelectDate(dateStr)}
          title={
            isOccupied
              ? 'Occupied (Confirmed Reservation on this time slot)'
              : isPending
              ? 'Pending (You have a pending reservation on this time slot)'
              : isPast
              ? 'Past Time / Date (This package duration start time has already passed)'
              : 'Available'
          }
        >
          <span className="resv-cal-day-number">{day}</span>

          <div className="resv-cal-day-indicators">
            {isOccupied ? (
              <span className="resv-cal-pill resv-cal-pill-booked">
                Occupied
              </span>
            ) : isPending ? (
              <span className="resv-cal-pill resv-cal-pill-pending">
                Pending
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
            <span className="resv-legend-dot resv-legend-dot-pending"></span>
            <span className="resv-legend-text">Pending</span>
          </div>
          <div className="resv-legend-item">
            <span className="resv-legend-dot resv-legend-dot-booked"></span>
            <span className="resv-legend-text">Occupied</span>
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
