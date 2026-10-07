import { useState } from 'react'

function CalendarView({
  viewMode = 'calendar',
  setViewMode,
  reservations,
  visitations,
  onUpdateReservationStatus,
  onOpenReceipt,
}) {
  const [currentDate, setCurrentDate] = useState(new Date())
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
    <div className="booking-calendar-view">
      {/* Calendar Header Navigation */}
      <div className="catalog-panel-header-card calendar-nav-toolbar">
        <div className="calendar-month-title-wrap">
          <h2 className="calendar-month-heading">
            {monthNames[month]} {year}
          </h2>
          <span className="calendar-month-sub">
            Resort Schedule & Ocular Visitations Overview
          </span>
        </div>

        <div className="calendar-nav-right-controls">
          <div className="calendar-nav-buttons">
            <button
              type="button"
              className="calendar-nav-btn"
              onClick={handlePrevMonth}
            >
              ← Previous
            </button>
            <button
              type="button"
              className="calendar-nav-btn calendar-nav-btn-today"
              onClick={handleToday}
            >
              Today
            </button>
            <button
              type="button"
              className="calendar-nav-btn"
              onClick={handleNextMonth}
            >
              Next →
            </button>
          </div>

          {setViewMode && (
            <div className="schedule-mode-switcher">
              <button
                type="button"
                className={`schedule-mode-btn ${viewMode === 'list' ? 'schedule-mode-btn-active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
                <span>List</span>
              </button>
              <button
                type="button"
                className={`schedule-mode-btn ${viewMode === 'calendar' ? 'schedule-mode-btn-active' : ''}`}
                onClick={() => setViewMode('calendar')}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>Calendar</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Package Legend Bar */}
      <div className="calendar-legend-bar">
        <div className="calendar-legend-item">
          <span className="cal-dot cal-dot-daytour"></span>
          <span>Day Tour (9:00 AM - 5:00 PM)</span>
        </div>
        <div className="calendar-legend-item">
          <span className="cal-dot cal-dot-overnight"></span>
          <span>Overnight (8:00 PM - 6:00 AM)</span>
        </div>
        <div className="calendar-legend-item">
          <span className="cal-dot cal-dot-twentytwo"></span>
          <span>22 Hours (8 AM - 6 AM / 8 PM - 6 PM)</span>
        </div>
        <div className="calendar-legend-item">
          <span className="cal-dot cal-dot-ocular"></span>
          <span>Ocular Visit (9-11 AM / 2-4 PM)</span>
        </div>
      </div>

      {/* Calendar Matrix Card */}
      <div className="calendar-matrix-card">
        {/* Weekdays */}
        <div className="calendar-weekdays-bar">
          <div className="cal-weekday-cell">Sun</div>
          <div className="cal-weekday-cell">Mon</div>
          <div className="cal-weekday-cell">Tue</div>
          <div className="cal-weekday-cell">Wed</div>
          <div className="cal-weekday-cell">Thu</div>
          <div className="cal-weekday-cell">Fri</div>
          <div className="cal-weekday-cell">Sat</div>
        </div>

        {/* Days Grid */}
        <div className="calendar-days-grid">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="cal-day-cell cal-cell-empty" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, index) => {
            const dayNumber = index + 1
            const { reservations: dayRes, visitations: dayVis, dateStr } = getBookingsForDay(dayNumber)
            const hasBookings = dayRes.length > 0 || dayVis.length > 0

            return (
              <div
                key={`day-${dayNumber}`}
                className={`cal-day-cell ${hasBookings ? 'cal-cell-active' : ''}`}
                onClick={() => {
                  if (hasBookings) {
                    setSelectedDayDetails({ dayNumber, dateStr, dayRes, dayVis })
                  }
                }}
              >
                <div className="cal-cell-head">
                  <span className="cal-cell-date-num">{dayNumber}</span>
                  {hasBookings && (
                    <span className="cal-cell-count-tag">
                      {dayRes.length + dayVis.length}
                    </span>
                  )}
                </div>

                <div className="cal-cell-badges">
                  {dayRes.map((res) => (
                    <div
                      key={res.reservation_id}
                      className={`cal-badge-pill ${getPackageBadgeClass(res.duration_id)}`}
                      title={`${getPackageShortLabel(res.duration_id)} - ${res.customer_name} (${res.reservation_status})`}
                    >
                      <span className="cal-badge-type">{getPackageShortLabel(res.duration_id)}</span>
                      <span className="cal-badge-user">{res.customer_name || `Cust #${res.customer_id}`}</span>
                    </div>
                  ))}

                  {dayVis.map((vis) => (
                    <div
                      key={vis.visitation_id}
                      className="cal-badge-pill cal-badge-ocular"
                      title={`Ocular Visit: ${vis.customer_name} (${vis.slot_type})`}
                    >
                      <span className="cal-badge-type">Ocular</span>
                      <span className="cal-badge-user">{vis.customer_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Day Details Modal */}
      {selectedDayDetails && (
        <div className="modal-backdrop" onClick={() => setSelectedDayDetails(null)}>
          <div className="modal-dialog-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-card-header">
              <h3 className="modal-card-title">
                Schedule for {selectedDayDetails.dateStr}
              </h3>
              <button
                type="button"
                className="modal-close-x"
                onClick={() => setSelectedDayDetails(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-card-body">
              {selectedDayDetails.dayRes.length > 0 && (
                <div className="modal-sched-section">
                  <h4 className="modal-sched-heading">Resort Reservations</h4>
                  <div className="modal-sched-stack">
                    {selectedDayDetails.dayRes.map((r) => (
                      <div key={r.reservation_id} className="modal-sched-item">
                        <div className="modal-sched-item-header">
                          <strong>#{r.reservation_id} - {r.customer_name}</strong>
                          <span className={`booking-status-badge status-${r.reservation_status}`}>
                            {r.reservation_status.toUpperCase()}
                          </span>
                        </div>
                        <div className="modal-sched-item-body">
                          <div><strong>Package:</strong> {getPackageShortLabel(r.duration_id)} ({r.guest_count} Pax)</div>
                          <div><strong>Event:</strong> {r.event_name || 'Group Gathering'}</div>
                          <div><strong>Contact:</strong> {r.customer_phone || '0917-xxx-xxxx'}</div>
                          <div><strong>Cost:</strong> PHP {((r.reservation_cost || 0) + (r.extra_charges || 0)).toLocaleString()}</div>
                        </div>
                        <div className="modal-sched-item-actions">
                          {r.reservation_status === 'pending' && (
                            <button
                              type="button"
                              className="booking-btn-approve"
                              onClick={() => {
                                onUpdateReservationStatus(r.reservation_id, 'confirmed')
                                setSelectedDayDetails(null)
                              }}
                            >
                              Approve
                            </button>
                          )}
                          <button
                            type="button"
                            className="booking-btn-receipt"
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
                <div className="modal-sched-section">
                  <h4 className="modal-sched-heading">Ocular Visitations</h4>
                  <div className="modal-sched-stack">
                    {selectedDayDetails.dayVis.map((v) => (
                      <div key={v.visitation_id} className="modal-sched-item">
                        <div className="modal-sched-item-header">
                          <strong>#{v.visitation_id} - {v.customer_name}</strong>
                          <span className={`booking-status-badge status-${v.visitation_status}`}>
                            {v.visitation_status.toUpperCase()}
                          </span>
                        </div>
                        <div className="modal-sched-item-body">
                          <div><strong>Timeslot:</strong> {v.slot_type}</div>
                          <div><strong>Visitors:</strong> {v.guest_count}</div>
                          <div><strong>Purpose:</strong> {v.purpose}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-card-footer">
              <button
                type="button"
                className="modal-close-btn"
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

export default CalendarView
