import { useState, useMemo } from 'react'
import { DataService } from '../../../services/dataService'

function OcularModal({
  isOpen,
  onClose,
  user,
  reservations = [],
  visitations = [],
  onSuccess,
}) {
  const [slot, setSlot] = useState('morning') // 'morning' (9-11am) | 'afternoon' (2-4pm)
  const [visitationDate, setVisitationDate] = useState('')
  const [guestCount, setGuestCount] = useState(2)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Calendar month navigation state
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear())
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth())

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const todayYMD = useMemo(() => new Date().toISOString().split('T')[0], [])

  const formatYMD = (year, month, day) => {
    const m = String(month + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    return `${year}-${m}-${d}`
  }

  // Helper to determine if a reservation/visitation belongs to the logged-in customer
  const isMyBooking = (item, currentUser) => {
    if (!currentUser || !item) return false
    if (item.customer_id && currentUser.id && Number(item.customer_id) === Number(currentUser.id)) return true

    const itemEmail = (item.customer_email || '').trim().toLowerCase()
    const userEmail = (currentUser.email || '').trim().toLowerCase()
    if (itemEmail && userEmail && itemEmail === userEmail) return true

    const userFullName = (currentUser.name || `${currentUser.first_name || ''} ${currentUser.last_name || ''}`).trim().toLowerCase()
    const itemCustName = (item.customer_name || (item.customer ? `${item.customer.first_name} ${item.customer.last_name || ''}` : '')).trim().toLowerCase()
    if (userFullName && itemCustName && (userFullName === itemCustName || itemCustName.includes(userFullName) || userFullName.includes(itemCustName))) return true

    const userUsername = (currentUser.username || '').trim().toLowerCase()
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
      // Case B: Full timestamp / ISO format
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

  // Check if a specific date and time slot has any overlap conflict
  const checkSlotConflict = (dateStr, targetSlot) => {
    if (!dateStr) return null

    const startHour = targetSlot === 'morning' ? '09:00:00' : '14:00:00'
    const endHour = targetSlot === 'morning' ? '11:00:00' : '16:00:00'

    const proposedStart = new Date(`${dateStr}T${startHour}`)
    const proposedEnd = new Date(`${dateStr}T${endHour}`)

    let hasMyPending = false

    // 1. Check against active ocular visitations
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
        const isMine = isMyBooking(v, user)
        if (vStatus === 'confirmed' || vStatus === 'approved') return 'occupied'
        if (vStatus === 'pending') {
          if (isMine) hasMyPending = true
        }
      }
    }

    // 2. Check against active resort reservations
    for (const r of reservations || []) {
      const rStatus = (r.reservation_status || '').toLowerCase()
      if (rStatus === 'cancelled' || rStatus === 'declined') continue
      if (!r.start_date) continue

      const range = parseDateTimeRange(r.start_date, r.end_date, r.duration_id)
      if (!range) continue

      if (proposedStart < range.end && range.start < proposedEnd) {
        const isMine = isMyBooking(r, user)
        if (rStatus === 'confirmed' || rStatus === 'approved' || rStatus === 'completed') return 'occupied'
        if (rStatus === 'pending' || rStatus === '') {
          if (isMine) hasMyPending = true
        }
      }
    }

    if (hasMyPending) return 'pending'
    return null
  }

  // Switch slot and re-validate selected date
  const handleSlotChange = (newSlot) => {
    setSlot(newSlot)
    setErrorMsg('')
    if (visitationDate && checkSlotConflict(visitationDate, newSlot)) {
      setVisitationDate('')
    }
  }

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

  const handleSelectDate = (dateStr) => {
    setErrorMsg('')
    setVisitationDate(dateStr)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!visitationDate) {
      setErrorMsg('Please select an available date from the calendar.')
      return
    }
    if (visitationDate < todayYMD) {
      setErrorMsg('Ocular visit date cannot be in the past.')
      return
    }

    const conflict = checkSlotConflict(visitationDate, slot)
    if (conflict) {
      setErrorMsg(`The selected ${slot} slot has a ${conflict} booking/reservation on this date. Please choose another date or time slot.`)
      return
    }

    setIsSubmitting(true)
    setErrorMsg('')

    const startTime = slot === 'morning' ? `${visitationDate}T09:00:00` : `${visitationDate}T14:00:00`
    const endTime = slot === 'morning' ? `${visitationDate}T11:00:00` : `${visitationDate}T16:00:00`

    try {
      const newVisit = await DataService.createVisitation({
        customer_id: user?.id || 101,
        guest_count: Number(guestCount) || 2,
        visitation_start_date: startTime,
        visitation_end_date: endTime,
        visitation_status: 'pending',
      })

      setIsSubmitting(false)
      if (onSuccess) onSuccess(newVisit)
      onClose()
    } catch (err) {
      console.error('Failed to submit ocular visitation:', err)
      setIsSubmitting(false)
      setErrorMsg('Could not submit ocular visit. Please try again.')
    }
  }

  if (!isOpen) return null

  // Calendar rendering calculations
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  const renderDays = () => {
    const cells = []

    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(<div key={`empty-${i}`} className="ocular-cal-cell ocular-cal-empty" />)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatYMD(currentYear, currentMonth, day)
      const isPast = dateStr < todayYMD
      const isToday = dateStr === todayYMD
      const isSelected = visitationDate === dateStr
      const slotConflict = checkSlotConflict(dateStr, slot)
      const isBooked = slotConflict === 'confirmed'
      const isPending = slotConflict === 'pending'
      const isBlocked = isPast || isBooked || isPending

      let cellClass = 'ocular-cal-day-btn'
      if (isPast) cellClass += ' ocular-cal-past'
      if (isToday) cellClass += ' ocular-cal-today'
      if (isSelected) cellClass += ' ocular-cal-selected'
      if (isBooked) cellClass += ' ocular-cal-booked'
      if (isPending) cellClass += ' ocular-cal-pending'

      cells.push(
        <button
          key={dateStr}
          type="button"
          disabled={isBlocked}
          className={cellClass}
          onClick={() => handleSelectDate(dateStr)}
          title={
            isBooked
              ? `Booked for ${slot === 'morning' ? 'Morning Slot (9am-11am)' : 'Afternoon Slot (2pm-4pm)'}`
              : isPending
              ? `Pending for ${slot === 'morning' ? 'Morning Slot (9am-11am)' : 'Afternoon Slot (2pm-4pm)'}`
              : isPast
              ? 'Past Date'
              : 'Available'
          }
        >
          <span className="ocular-cal-day-num">{day}</span>
        </button>
      )
    }

    return cells
  }

  return (
    <div className="resv-modal-overlay">
      <div className="resv-modal-backdrop" onClick={onClose} />
      <div className="resv-ocular-modal-card ocular-card-wide">
        {/* Modal Header */}
        <div className="resv-modal-header">
          <h3 className="resv-modal-title">Schedule an Ocular Visit</h3>
          <button
            type="button"
            className="resv-modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="resv-payment-alert-error">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="ocular-form-content">
          {/* Side-by-Side Dual Column Layout */}
          <div className="ocular-dual-grid">
            {/* Left Column: Information & Options */}
            <div className="ocular-left-panel">
              {/* Step 1: Slot Selection */}
              <div className="ocular-section-group">
                <label className="ocular-section-label">
                  1. Select Time Slot <span className="resv-req-star">*</span>
                </label>
                <div className="resv-slot-options">
                  <label className={`resv-slot-card ${slot === 'morning' ? 'resv-slot-card-active' : ''}`}>
                    <input
                      type="radio"
                      name="ocularTimeSlot"
                      value="morning"
                      checked={slot === 'morning'}
                      onChange={() => handleSlotChange('morning')}
                      className="resv-slot-radio"
                    />
                    <div className="resv-slot-info">
                      <span className="resv-slot-title">Morning Slot</span>
                      <span className="resv-slot-time">9:00 AM – 11:00 AM</span>
                    </div>
                  </label>

                  <label className={`resv-slot-card ${slot === 'afternoon' ? 'resv-slot-card-active' : ''}`}>
                    <input
                      type="radio"
                      name="ocularTimeSlot"
                      value="afternoon"
                      checked={slot === 'afternoon'}
                      onChange={() => handleSlotChange('afternoon')}
                      className="resv-slot-radio"
                    />
                    <div className="resv-slot-info">
                      <span className="resv-slot-title">Afternoon Slot</span>
                      <span className="resv-slot-time">2:00 PM – 4:00 PM</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Step 2: Guest Count Stepper */}
              <div className="ocular-section-group">
                <label className="ocular-section-label" htmlFor="ocularGuestCount">
                  2. Number of Attendees (Max 5 recommended)
                </label>
                <div className="ocular-stepper-wrap">
                  <button
                    type="button"
                    className="ocular-stepper-btn"
                    onClick={() => setGuestCount((prev) => Math.max(1, Number(prev) - 1))}
                    disabled={guestCount <= 1}
                    aria-label="Decrease attendees"
                  >
                    −
                  </button>
                  <input
                    id="ocularGuestCount"
                    type="number"
                    min="1"
                    max="10"
                    className="ocular-stepper-input"
                    value={guestCount}
                    onChange={(e) => {
                      const val = Math.max(1, Math.min(10, Number(e.target.value) || 1))
                      setGuestCount(val)
                    }}
                  />
                  <button
                    type="button"
                    className="ocular-stepper-btn"
                    onClick={() => setGuestCount((prev) => Math.min(10, Number(prev) + 1))}
                    disabled={guestCount >= 10}
                    aria-label="Increase attendees"
                  >
                    +
                  </button>
                  <span className="ocular-guest-unit">{guestCount === 1 ? 'Guest' : 'Guests'}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Dedicated Calendar Container */}
            <div className="ocular-right-panel">
              <label className="ocular-section-label ocular-cal-header-label">
                3. Choose Visit Date <span className="resv-req-star">*</span>
              </label>

              <div className="ocular-cal-container">
                {/* Month navigation */}
                <div className="ocular-cal-nav">
                  <button
                    type="button"
                    className="ocular-cal-nav-btn"
                    onClick={handlePrevMonth}
                    aria-label="Previous Month"
                  >
                    ‹
                  </button>
                  <div className="ocular-cal-title">
                    {monthNames[currentMonth]} {currentYear}
                  </div>
                  <button
                    type="button"
                    className="ocular-cal-nav-btn"
                    onClick={handleNextMonth}
                    aria-label="Next Month"
                  >
                    ›
                  </button>
                </div>

                {/* Weekday headers */}
                <div className="ocular-cal-weekdays">
                  {daysOfWeek.map((day) => (
                    <div key={day} className="ocular-cal-weekday">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Days grid */}
                <div className="ocular-cal-grid">{renderDays()}</div>

                {/* Returned Calendar Legend with Correct Background Indicators */}
                <div className="ocular-cal-legend">
                  <div className="ocular-legend-item">
                    <span className="ocular-legend-dot ocular-dot-available" />
                    <span>Available</span>
                  </div>
                  <div className="ocular-legend-item">
                    <span className="ocular-legend-dot ocular-dot-selected" />
                    <span>Selected</span>
                  </div>
                  <div className="ocular-legend-item">
                    <span className="ocular-legend-dot ocular-dot-pending" />
                    <span>Pending</span>
                  </div>
                  <div className="ocular-legend-item">
                    <span className="ocular-legend-dot ocular-dot-booked" />
                    <span>Occupied</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Actions Aligned to the Footer on the Right Side */}
          <div className="resv-modal-actions ocular-modal-bottom-actions">
            <button
              type="button"
              className="resv-back-btn"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="resv-confirm-btn ocular-submit-btn"
              disabled={isSubmitting || !visitationDate}
            >
              {isSubmitting ? 'Scheduling Visit...' : 'Book Ocular Visit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default OcularModal
