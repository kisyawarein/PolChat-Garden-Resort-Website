import { useState, useEffect, useRef } from 'react'

function ListView({
  viewMode = 'list',
  setViewMode,
  reservations = [],
  visitations = [],
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all') // 'all' | 'resort' | 'ocular'
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'pending' | 'confirmed' | 'cancelled'
  const [paymentFilter, setPaymentFilter] = useState('all') // 'all' | 'dep_pending' | 'dep_paid' | 'pending_bal' | 'full_paid' | 'free'
  const [sortField, setSortField] = useState('date') // 'date' | 'customerName' | 'guestCount'
  const [sortDirection, setSortDirection] = useState('desc') // 'asc' | 'desc'
  const [openDropdown, setOpenDropdown] = useState(null) // 'type' | 'payment' | 'status' | null

  const tableHeaderRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tableHeaderRef.current && !tableHeaderRef.current.contains(event.target)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  // Merge into a single consolidated list
  const consolidatedList = [
    ...reservations.map((r) => ({
      uniqueKey: `res-${r.reservation_id}`,
      id: r.reservation_id,
      itemType: 'resort',
      customerName: r.customer_name || `Customer #${r.customer_id}`,
      dateStr: r.start_date ? r.start_date.split('T')[0] : 'N/A',
      timeSlot: formatResortTime(r.start_date, r.end_date, r.duration_id),
      pax: r.guest_count || 0,
      cost: (r.reservation_cost || 0) + (r.extra_charges || 0),
      hasSecDep: r.has_paid_sec_dep,
      hasPaidFull: r.has_paid_reservation,
      status: r.reservation_status || 'pending',
      raw: r,
    })),
    ...visitations.map((v) => ({
      uniqueKey: `vis-${v.visitation_id}`,
      id: v.visitation_id,
      itemType: 'ocular',
      customerName: v.customer_name || `Customer #${v.customer_id}`,
      dateStr: v.visitation_start_date ? v.visitation_start_date.split('T')[0] : 'N/A',
      timeSlot: v.slot_type || '9:00 AM - 11:00 AM',
      pax: v.guest_count || 0,
      cost: 0,
      hasSecDep: false,
      hasPaidFull: true,
      status: v.visitation_status || 'pending',
      raw: v,
    })),
  ]

  // Filter the consolidated list
  const filteredList = consolidatedList.filter((item) => {
    // Status filter
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter

    // Type filter
    const matchesType = typeFilter === 'all' || item.itemType === typeFilter

    // Payment filter
    let matchesPayment = true
    if (paymentFilter === 'dep_pending') {
      matchesPayment = item.itemType === 'resort' && !item.hasSecDep
    } else if (paymentFilter === 'dep_paid') {
      matchesPayment = item.itemType === 'resort' && !!item.hasSecDep
    } else if (paymentFilter === 'pending_bal') {
      matchesPayment = item.itemType === 'resort' && !item.hasPaidFull
    } else if (paymentFilter === 'full_paid') {
      matchesPayment = item.itemType === 'resort' && !!item.hasPaidFull
    } else if (paymentFilter === 'free') {
      matchesPayment = item.itemType === 'ocular'
    }

    // Search query from title bar
    const q = searchTerm.toLowerCase().trim()
    const nameMatch = item.customerName.toLowerCase().includes(q)
    const idMatch = String(item.id).includes(q)
    const dateMatch = item.dateStr.toLowerCase().includes(q)

    const matchesSearch = !q || (nameMatch || idMatch || dateMatch)

    return matchesStatus && matchesType && matchesPayment && matchesSearch
  })

  // Sort list
  filteredList.sort((a, b) => {
    let result = 0
    if (sortField === 'customerName') {
      result = a.customerName.localeCompare(b.customerName)
    } else if (sortField === 'guestCount') {
      result = a.pax - b.pax
    } else {
      // Default: date sort
      if (a.dateStr && b.dateStr && a.dateStr !== b.dateStr) {
        result = a.dateStr.localeCompare(b.dateStr)
      } else {
        result = a.id - b.id
      }
    }
    return sortDirection === 'asc' ? result : -result
  })

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection(field === 'date' ? 'desc' : 'asc')
    }
  }

  const toggleDropdown = (name) => {
    setOpenDropdown((prev) => (prev === name ? null : name))
  }

  // Consistent Chevron Icon component
  const renderChevron = (isOpenOrUp) => (
    <svg
      className={`col-chevron-icon ${isOpenOrUp ? 'col-chevron-up' : 'col-chevron-down'}`}
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
    <div className="schedule-list-section">
      {/* List Header Container Card */}
      <div className="catalog-panel-header-card">
        <h2 className="catalog-panel-title">All Reservations & Schedules</h2>

        <div className="catalog-header-controls">
          {/* Search bar */}
          <div className="schedule-search-wrap">
            <svg
              className="schedule-search-svg"
              width="15"
              height="15"
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
              className="schedule-search-input"
              placeholder="Search bookings..."
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
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          {/* List and Calendar View Mode Switcher */}
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

      {/* Table Card */}
      <div className="consolidated-table-card">
        <div className="consolidated-table-scroll">
          <table className="consolidated-data-table">
            <colgroup>
              <col className="col-w-id" />
              <col className="col-w-cust" />
              <col className="col-w-type" />
              <col className="col-w-date" />
              <col className="col-w-pax" />
              <col className="col-w-payment" />
              <col className="col-w-status" />
            </colgroup>
            <thead ref={tableHeaderRef}>
              <tr>
                {/* Column I: Booking ID */}
                <th className="col-header-th col-id-th">
                  <span className="col-header-text">Booking ID</span>
                </th>

                {/* Column II: Customer Name */}
                <th className="col-header-th">
                  <button
                    type="button"
                    className={`col-header-btn ${sortField === 'customerName' ? 'col-btn-filtered' : ''}`}
                    onClick={() => toggleSort('customerName')}
                    title={`Sort customer name (${sortField === 'customerName' && sortDirection === 'asc' ? 'A-Z active, click for Z-A' : 'Click for A-Z'})`}
                  >
                    <span>Customer Name</span>
                    {renderChevron(sortField === 'customerName' && sortDirection === 'desc')}
                  </button>
                </th>

                {/* Column III: Type */}
                <th className="col-header-th col-relative-th">
                  <button
                    type="button"
                    className={`col-header-btn ${typeFilter !== 'all' ? 'col-btn-filtered' : ''}`}
                    onClick={() => toggleDropdown('type')}
                  >
                    <span>Type</span>
                    {renderChevron(openDropdown === 'type')}
                  </button>

                  {openDropdown === 'type' && (
                    <div className="col-dropdown-menu">
                      <button
                        type="button"
                        className={`col-dropdown-item ${typeFilter === 'all' ? 'col-dropdown-item-active' : ''}`}
                        onClick={() => {
                          setTypeFilter('all')
                          setOpenDropdown(null)
                        }}
                      >
                        All Types
                      </button>
                      <button
                        type="button"
                        className={`col-dropdown-item ${typeFilter === 'resort' ? 'col-dropdown-item-active' : ''}`}
                        onClick={() => {
                          setTypeFilter('resort')
                          setOpenDropdown(null)
                        }}
                      >
                        Resort Reservation
                      </button>
                      <button
                        type="button"
                        className={`col-dropdown-item ${typeFilter === 'ocular' ? 'col-dropdown-item-active' : ''}`}
                        onClick={() => {
                          setTypeFilter('ocular')
                          setOpenDropdown(null)
                        }}
                      >
                        Ocular Visit
                      </button>
                    </div>
                  )}
                </th>

                {/* Column IV: Date and Time */}
                <th className="col-header-th">
                  <button
                    type="button"
                    className={`col-header-btn ${sortField === 'date' ? 'col-btn-filtered' : ''}`}
                    onClick={() => toggleSort('date')}
                    title={`Sort date (${sortField === 'date' && sortDirection === 'desc' ? 'Newest first, click for Oldest' : 'Oldest first, click for Newest'})`}
                  >
                    <span>Date & Time</span>
                    {renderChevron(sortField === 'date' && sortDirection === 'asc')}
                  </button>
                </th>

                {/* Column V: Guest Count */}
                <th className="col-header-th">
                  <button
                    type="button"
                    className={`col-header-btn ${sortField === 'guestCount' ? 'col-btn-filtered' : ''}`}
                    onClick={() => toggleSort('guestCount')}
                    title={`Sort guest count (${sortField === 'guestCount' && sortDirection === 'asc' ? 'Low to High, click for High to Low' : 'High to Low, click for Low to High'})`}
                  >
                    <span>Guest Count</span>
                    {renderChevron(sortField === 'guestCount' && sortDirection === 'desc')}
                  </button>
                </th>

                {/* Column VI: Payment */}
                <th className="col-header-th col-relative-th">
                  <button
                    type="button"
                    className={`col-header-btn ${paymentFilter !== 'all' ? 'col-btn-filtered' : ''}`}
                    onClick={() => toggleDropdown('payment')}
                  >
                    <span>Payment</span>
                    {renderChevron(openDropdown === 'payment')}
                  </button>

                  {openDropdown === 'payment' && (
                    <div className="col-dropdown-menu">
                      <button
                        type="button"
                        className={`col-dropdown-item ${paymentFilter === 'all' ? 'col-dropdown-item-active' : ''}`}
                        onClick={() => {
                          setPaymentFilter('all')
                          setOpenDropdown(null)
                        }}
                      >
                        All Payments
                      </button>
                      <button
                        type="button"
                        className={`col-dropdown-item ${paymentFilter === 'dep_pending' ? 'col-dropdown-item-active' : ''}`}
                        onClick={() => {
                          setPaymentFilter('dep_pending')
                          setOpenDropdown(null)
                        }}
                      >
                        Deposit Pending
                      </button>
                      <button
                        type="button"
                        className={`col-dropdown-item ${paymentFilter === 'dep_paid' ? 'col-dropdown-item-active' : ''}`}
                        onClick={() => {
                          setPaymentFilter('dep_paid')
                          setOpenDropdown(null)
                        }}
                      >
                        Deposit Paid
                      </button>
                      <button
                        type="button"
                        className={`col-dropdown-item ${paymentFilter === 'pending_bal' ? 'col-dropdown-item-active' : ''}`}
                        onClick={() => {
                          setPaymentFilter('pending_bal')
                          setOpenDropdown(null)
                        }}
                      >
                        Balance Pending
                      </button>
                      <button
                        type="button"
                        className={`col-dropdown-item ${paymentFilter === 'full_paid' ? 'col-dropdown-item-active' : ''}`}
                        onClick={() => {
                          setPaymentFilter('full_paid')
                          setOpenDropdown(null)
                        }}
                      >
                        Fully Paid
                      </button>
                      <button
                        type="button"
                        className={`col-dropdown-item ${paymentFilter === 'free' ? 'col-dropdown-item-active' : ''}`}
                        onClick={() => {
                          setPaymentFilter('free')
                          setOpenDropdown(null)
                        }}
                      >
                        Free (Ocular)
                      </button>
                    </div>
                  )}
                </th>

                {/* Column VII: Status (Right-aligned dropdown to prevent overflow) */}
                <th className="col-header-th col-relative-th">
                  <button
                    type="button"
                    className={`col-header-btn ${statusFilter !== 'all' ? 'col-btn-filtered' : ''}`}
                    onClick={() => toggleDropdown('status')}
                  >
                    <span>Status</span>
                    {renderChevron(openDropdown === 'status')}
                  </button>

                  {openDropdown === 'status' && (
                    <div className="col-dropdown-menu col-dropdown-right">
                      <button
                        type="button"
                        className={`col-dropdown-item ${statusFilter === 'all' ? 'col-dropdown-item-active' : ''}`}
                        onClick={() => {
                          setStatusFilter('all')
                          setOpenDropdown(null)
                        }}
                      >
                        All Statuses
                      </button>
                      <button
                        type="button"
                        className={`col-dropdown-item ${statusFilter === 'pending' ? 'col-dropdown-item-active' : ''}`}
                        onClick={() => {
                          setStatusFilter('pending')
                          setOpenDropdown(null)
                        }}
                      >
                        Pending
                      </button>
                      <button
                        type="button"
                        className={`col-dropdown-item ${statusFilter === 'confirmed' ? 'col-dropdown-item-active' : ''}`}
                        onClick={() => {
                          setStatusFilter('confirmed')
                          setOpenDropdown(null)
                        }}
                      >
                        Confirmed
                      </button>
                      <button
                        type="button"
                        className={`col-dropdown-item ${statusFilter === 'cancelled' ? 'col-dropdown-item-active' : ''}`}
                        onClick={() => {
                          setStatusFilter('cancelled')
                          setOpenDropdown(null)
                        }}
                      >
                        Cancelled
                      </button>
                    </div>
                  )}
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="7" className="consolidated-empty-cell">
                    No bookings found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.uniqueKey} className="table-body-row">
                    {/* Column I: Booking ID */}
                    <td className="cell-id-td">
                      <span className="cell-id-text">#{item.id}</span>
                    </td>

                    {/* Column II: Customer Name */}
                    <td className="cell-cust-td">
                      <span className="cell-plain-text cell-cust-name-text">{item.customerName}</span>
                    </td>

                    {/* Column III: Type */}
                    <td className="cell-type-td">
                      <span className="cell-plain-text">
                        {item.itemType === 'resort' ? 'Resort Reservation' : 'Ocular Visit'}
                      </span>
                    </td>

                    {/* Column IV: Date and Time */}
                    <td className="cell-datetime-td">
                      <div className="cell-datetime-stack">
                        <span className="cell-date-line">{item.dateStr}</span>
                        {item.timeSlot && (
                          <span className="cell-time-line">{item.timeSlot}</span>
                        )}
                      </div>
                    </td>

                    {/* Column V: Guest Count */}
                    <td className="cell-pax-td">
                      <span className="cell-plain-text">
                        {item.pax} {item.itemType === 'resort' ? 'Pax' : 'Visitors'}
                      </span>
                    </td>

                    {/* Column VI: Payment */}
                    <td className="cell-payment-td">
                      <span className="cell-plain-text cell-amount-val">
                        {item.itemType === 'resort'
                          ? `PHP ${item.cost.toLocaleString()}`
                          : 'Free Visit'}
                      </span>
                    </td>

                    {/* Column VII: Status */}
                    <td className="cell-status-td">
                      <span className="cell-plain-text">
                        {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ListView
