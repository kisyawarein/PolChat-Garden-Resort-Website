import { useState } from 'react'

function ReservationCalendar({
  reservations,
  visitations,
  onUpdateReservationStatus,
  onOpenReceipt,
}) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1)) // October 2026
  const [selectedDayDetails, setSelectedDayDetails] = useState(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  // Find bookings for a given day
  const getBookingsForDay = (day) => {
    const formattedDay = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

    const dayRes = reservations.filter((r) => {
      if (!r.start_date) return false
      return r.start_date.startsWith(formattedDay)
    })

    const dayVis = visitations.filter((v) => {
      if (!v.visitation_start_date) return false
      return v.visitation_start_date.startsWith(formattedDay)
    })

    return { reservations: dayRes, visitations: dayVis, dateStr: formattedDay }
  }

  const getPackageBadgeClass = (durationId) => {
    switch (durationId) {
      case 1:
        return 'cal-badge-daytour'
      case 2:
        return 'cal-badge-overnight'
      case 3:
      case 4:
        return 'cal-badge-twentytwo'
      default:
        return 'cal-badge-general'
    }
  }

  const getPackageShortLabel = (durationId) => {
    switch (durationId) {
      case 1:
        return 'Day Tour'
      case 2:
        return 'Overnight'
      case 3:
      case 4:
        return '22 Hours'
      default:
        return 'Resort'
    }
  }

  return (
    <div className="admin-calendar-container">
      {/* Calendar Header Navigation */}
      <div className="admin-calendar-nav-bar">
        <div className="admin-calendar-month-display">
          <h2 className="admin-calendar-month-title">
            {monthNames[month]} {year}
          </h2>
          <span className="admin-calendar-subtitle">
            Resort Schedule & Ocular Visitations Overview
          </span>
        </div>

        <div className="admin-calendar-nav-buttons">
          <button
            type="button"
            className="admin-cal-btn"
            onClick={handlePrevMonth}
          >
            ← Previous
          </button>
          <button
            type="button"
            className="admin-cal-btn admin-cal-btn-today"
            onClick={handleToday}
          >
            Today
          </button>
          <button
            type="button"
            className="admin-cal-btn"
            onClick={handleNextMonth}
          >
            Next →
          </button>
        </div>
      </div>

      {/* Package Legend Bar */}
      <div className="admin-calendar-legend">
        <div className="admin-legend-tag-item">
          <span className="cal-dot cal-dot-daytour"></span>
          <span className="cal-legend-text">Day Tour (9:00 AM - 5:00 PM)</span>
        </div>
        <div className="admin-legend-tag-item">
          <span className="cal-dot cal-dot-overnight"></span>
          <span className="cal-legend-text">Overnight (8:00 PM - 6:00 AM)</span>
        </div>
        <div className="admin-legend-tag-item">
          <span className="cal-dot cal-dot-twentytwo"></span>
          <span className="cal-legend-text">22 Hours (8 AM - 6 AM / 8 PM - 6 PM)</span>
        </div>
        <div className="admin-legend-tag-item">
          <span className="cal-dot cal-dot-ocular"></span>
          <span className="cal-legend-text">Ocular Visit (9-11 AM / 2-4 PM)</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="admin-calendar-grid-card">
        {/* Days of Week Header */}
        <div className="admin-calendar-weekdays-row">
          <div className="admin-cal-weekday">Sun</div>
          <div className="admin-cal-weekday">Mon</div>
          <div className="admin-cal-weekday">Tue</div>
          <div className="admin-cal-weekday">Wed</div>
          <div className="admin-cal-weekday">Thu</div>
          <div className="admin-cal-weekday">Fri</div>
          <div className="admin-cal-weekday">Sat</div>
        </div>

        {/* Days Grid */}
        <div className="admin-calendar-days-matrix">
          {/* Leading Empty Slots */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="admin-cal-cell admin-cal-cell-empty" />
          ))}

          {/* Month Days */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const dayNumber = index + 1
            const { reservations: dayRes, visitations: dayVis, dateStr } = getBookingsForDay(dayNumber)
            const hasBookings = dayRes.length > 0 || dayVis.length > 0

            return (
              <div
                key={`day-${dayNumber}`}
                className={`admin-cal-cell ${hasBookings ? 'admin-cal-cell-has-data' : ''}`}
                onClick={() => {
                  if (hasBookings) {
                    setSelectedDayDetails({ dayNumber, dateStr, dayRes, dayVis })
                  }
                }}
              >
                <div className="admin-cal-cell-header">
                  <span className="admin-cal-date-number">{dayNumber}</span>
                  {hasBookings && (
                    <span className="admin-cal-count-badge">
                      {dayRes.length + dayVis.length}
                    </span>
                  )}
                </div>

                <div className="admin-cal-items-stack">
                  {dayRes.map((res) => (
                    <div
                      key={res.reservation_id}
                      className={`admin-cal-badge-pill ${getPackageBadgeClass(res.duration_id)} admin-cal-status-${res.reservation_status}`}
                      title={`${getPackageShortLabel(res.duration_id)} - ${res.customer_name} (${res.reservation_status})`}
                    >
                      <span className="admin-cal-badge-type">
                        {getPackageShortLabel(res.duration_id)}
                      </span>
                      <span className="admin-cal-badge-name">
                        {res.customer_name || `Cust #${res.customer_id}`}
                      </span>
                    </div>
                  ))}

                  {dayVis.map((vis) => (
                    <div
                      key={vis.visitation_id}
                      className="admin-cal-badge-pill cal-badge-ocular"
                      title={`Ocular Visit: ${vis.customer_name} (${vis.slot_type})`}
                    >
                      <span className="admin-cal-badge-type">Ocular</span>
                      <span className="admin-cal-badge-name">{vis.customer_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Day Details Drawer/Modal */}
      {selectedDayDetails && (
        <div className="admin-modal-overlay" onClick={() => setSelectedDayDetails(null)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                Schedule for {selectedDayDetails.dateStr}
              </h3>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => setSelectedDayDetails(null)}
              >
                ✕
              </button>
            </div>

            <div className="admin-modal-body">
              {selectedDayDetails.dayRes.length > 0 && (
                <div className="admin-cal-modal-section">
                  <h4 className="admin-cal-section-title">Resort Reservations</h4>
                  <div className="admin-cal-details-list">
                    {selectedDayDetails.dayRes.map((r) => (
                      <div key={r.reservation_id} className="admin-cal-detail-card">
                        <div className="admin-cal-detail-head">
                          <strong>#{r.reservation_id} - {r.customer_name}</strong>
                          <span className={`admin-status-badge admin-status-${r.reservation_status}`}>
                            {r.reservation_status.toUpperCase()}
                          </span>
                        </div>
                        <div className="admin-cal-detail-body">
                          <div><strong>Package:</strong> {getPackageShortLabel(r.duration_id)} ({r.guest_count} Pax)</div>
                          <div><strong>Event:</strong> {r.event_name || 'Family/Group Gathering'}</div>
                          <div><strong>Contact:</strong> {r.customer_phone || '0917-xxx-xxxx'}</div>
                          <div><strong>Cost:</strong> PHP {((r.reservation_cost || 0) + (r.extra_charges || 0)).toLocaleString()}</div>
                        </div>
                        <div className="admin-cal-detail-actions">
                          {r.reservation_status === 'pending' && (
                            <button
                              type="button"
                              className="admin-action-btn admin-btn-confirm"
                              onClick={() => {
                                onUpdateReservationStatus(r.reservation_id, 'confirmed')
                                setSelectedDayDetails(null)
                              }}
                            >
                              Approve Booking
                            </button>
                          )}
                          <button
                            type="button"
                            className="admin-action-btn admin-btn-receipt"
                            onClick={() => {
                              onOpenReceipt(r)
                              setSelectedDayDetails(null)
                            }}
                          >
                            Print Receipt
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedDayDetails.dayVis.length > 0 && (
                <div className="admin-cal-modal-section">
                  <h4 className="admin-cal-section-title">Ocular Visitations</h4>
                  <div className="admin-cal-details-list">
                    {selectedDayDetails.dayVis.map((v) => (
                      <div key={v.visitation_id} className="admin-cal-detail-card">
                        <div className="admin-cal-detail-head">
                          <strong>#{v.visitation_id} - {v.customer_name}</strong>
                          <span className={`admin-status-badge admin-status-${v.visitation_status}`}>
                            {v.visitation_status.toUpperCase()}
                          </span>
                        </div>
                        <div className="admin-cal-detail-body">
                          <div><strong>Timeslot:</strong> {v.slot_type}</div>
                          <div><strong>Visitors:</strong> {v.guest_count} Person(s)</div>
                          <div><strong>Inspection Purpose:</strong> {v.purpose}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-footer-btn admin-btn-close"
                onClick={() => setSelectedDayDetails(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReservationCalendar
