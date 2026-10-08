import { useState } from 'react'

function PastReservationsList({
  pastReservations = [],
  onOpenReceipt,
  onOpenReview,
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortDirection, setSortDirection] = useState('desc') // 'asc' | 'desc'

  const getPackageName = (durationId) => {
    switch (durationId) {
      case 1: return 'Day Tour (9am - 5pm)'
      case 2: return 'Overnight (8pm - 6am)'
      case 3: return '22h Day Start'
      case 4: return '22h Night Start'
      default: return 'Resort Package'
    }
  }

  const formatResortTime = (startStr, endStr, durationId) => {
    if (startStr && startStr.includes('T')) {
      const startTime = startStr.split('T')[1]?.substring(0, 5)
      const endTime = endStr?.split('T')[1]?.substring(0, 5)
      if (startTime && startTime !== '00:00') {
        return `${startTime} - ${endTime || ''}`
      }
    }
    switch (durationId) {
      case 1: return '9:00 AM - 5:00 PM'
      case 2: return '8:00 PM - 6:00 AM'
      case 3: return '8:00 AM - 6:00 AM'
      case 4: return '8:00 PM - 6:00 PM'
      default: return ''
    }
  }

  // Filter list
  const filteredList = pastReservations.filter((r) => {
    const q = searchTerm.toLowerCase().trim()
    const idMatch = String(r.reservation_id).includes(q)
    const eventMatch = (r.event_name || '').toLowerCase().includes(q)
    const dateMatch = (r.start_date || '').toLowerCase().includes(q)
    return !q || (idMatch || eventMatch || dateMatch)
  })

  // Sort
  filteredList.sort((a, b) => {
    const dateA = a.start_date || ''
    const dateB = b.start_date || ''
    const res = dateA.localeCompare(dateB)
    return sortDirection === 'asc' ? res : -res
  })

  const toggleSort = () => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }

  const renderChevron = (isUp) => (
    <svg
      className={`col-chevron-icon ${isUp ? 'col-chevron-up' : 'col-chevron-down'}`}
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )

  return (
    <div className="myres-past-column">
      {/* Header Container Card (66px) */}
      <div className="catalog-panel-header-card">
        <div className="myres-past-title-row">
          <h2 className="catalog-panel-title">Past Reservations & History</h2>
          <span className="myres-history-badge">{filteredList.length} Records</span>
        </div>

        <div className="catalog-header-controls">
          <div className="schedule-search-wrap myres-search-wrap">
            <svg
              className="schedule-search-svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="schedule-search-input myres-search-input"
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="schedule-search-clear-btn"
                onClick={() => setSearchTerm('')}
                title="Clear search"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Panel Card */}
      <div className="myres-table-panel-card">
        <div className="myres-table-scroll-wrap">
          <table className="myres-data-table">
            <colgroup>
              <col style={{ width: '14%' }} />
              <col style={{ width: '24%' }} />
              <col style={{ width: '26%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '10%' }} />
            </colgroup>
            <thead>
              <tr>
                <th className="col-cell-edge">
                  <div className="col-header-static">
                    <span>Booking ID</span>
                  </div>
                </th>

                <th>
                  <div className="col-header-static">
                    <span>Package Tier</span>
                  </div>
                </th>

                <th>
                  <button
                    type="button"
                    className="col-header-btn"
                    onClick={toggleSort}
                  >
                    <span>Date and Time</span>
                    {renderChevron(sortDirection === 'asc')}
                  </button>
                </th>

                <th>
                  <div className="col-header-static">
                    <span>Guests</span>
                  </div>
                </th>

                <th>
                  <div className="col-header-static">
                    <span>Total Paid</span>
                  </div>
                </th>

                <th>
                  <div className="col-header-static">
                    <span>Status</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="myres-empty-cell">
                    No past reservations found in your account history.
                  </td>
                </tr>
              ) : (
                filteredList.map((r) => {
                  const dateStr = r.start_date ? r.start_date.split('T')[0] : 'N/A'
                  const timeSlot = formatResortTime(r.start_date, r.end_date, r.duration_id)
                  const totalPaid = (r.reservation_cost || 0) + (r.extra_charges || 0)

                  return (
                    <tr
                      key={r.reservation_id}
                      className="myres-table-row"
                      onClick={() => onOpenReceipt(r)}
                      title="Click to view official receipt"
                    >
                      <td className="col-cell-edge myres-id-cell">#{r.reservation_id}</td>
                      <td>
                        <div className="myres-tier-stack">
                          <span className="myres-tier-name">{getPackageName(r.duration_id)}</span>
                          <span className="myres-event-sub">{r.event_name || 'Resort Stay'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="myres-datetime-stack">
                          <span className="myres-date-line">{dateStr}</span>
                          {timeSlot && <span className="myres-time-line">{timeSlot}</span>}
                        </div>
                      </td>
                      <td className="myres-plain-text">{r.guest_count} Pax</td>
                      <td className="myres-plain-text myres-cost-text">₱{totalPaid.toLocaleString()}</td>
                      <td className="myres-status-cell">
                        <span className="myres-plain-status-text">
                          {r.reservation_status ? r.reservation_status.charAt(0).toUpperCase() + r.reservation_status.slice(1) : 'Confirmed'}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PastReservationsList
