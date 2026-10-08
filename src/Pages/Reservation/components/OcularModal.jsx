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

  // Check if a specific date and time slot has any overlap conflict
  const checkSlotConflict = (dateStr, targetSlot) => {
    if (!dateStr) return false

    const startHour = targetSlot === 'morning' ? '09:00:00' : '14:00:00'
    const endHour = targetSlot === 'morning' ? '11:00:00' : '16:00:00'

    const proposedStart = new Date(`${dateStr}T${startHour}`)
    const proposedEnd = new Date(`${dateStr}T${endHour}`)

    // 1. Check against active ocular visitations
    for (const v of visitations || []) {
      if (v.visitation_status === 'cancelled') continue
      if (!v.visitation_start_date) continue

      let vStart, vEnd
      if (v.visitation_start_date.includes('T') || v.visitation_start_date.includes(' ')) {
        const cleanStart = v.visitation_start_date.replace(' ', 'T')
        vStart = new Date(cleanStart)
        if (v.visitation_end_date) {
          const cleanEnd = v.visitation_end_date.replace(' ', 'T')
          vEnd = new Date(cleanEnd)
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

      // Interval overlap check: StartA < EndB && StartB < EndA
      if (proposedStart < vEnd && vStart < proposedEnd) {
        return true
      }
    }

    // 2. Check against active resort reservations
    for (const r of reservations || []) {
      if (r.reservation_status === 'cancelled') continue
      if (!r.start_date || !r.end_date) continue

      const rStart = new Date(r.start_date.replace(' ', 'T'))
      const rEnd = new Date(r.end_date.replace(' ', 'T'))

      if (proposedStart < rEnd && rStart < proposedEnd) {
        return true
      }
    }

    return false
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

    if (checkSlotConflict(visitationDate, slot)) {
      setErrorMsg(`The selected ${slot} slot is already booked on this date. Please choose another date or time slot.`)
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
      const isBooked = checkSlotConflict(dateStr, slot)

      let cellClass = 'ocular-cal-day-btn'
      if (isPast) cellClass += ' ocular-cal-past'
      if (isToday) cellClass += ' ocular-cal-today'
      if (isSelected) cellClass += ' ocular-cal-selected'
      if (isBooked) cellClass += ' ocular-cal-booked'

      cells.push(
        <button
          key={dateStr}
          type="button"
          disabled={isPast || isBooked}
          className={cellClass}
          onClick={() => handleSelectDate(dateStr)}
          title={
            isBooked
              ? `Booked for ${slot === 'morning' ? 'Morning Slot (9am-11am)' : 'Afternoon Slot (2pm-4pm)'}`
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
                    <span className="ocular-legend-dot ocular-dot-booked" />
                    <span>Booked</span>
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
