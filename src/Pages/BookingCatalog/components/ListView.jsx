import { useState } from 'react'

function ListView({
  reservations,
  visitations,
  onUpdateReservationStatus,
  onUpdateReservationPayment,
  onUpdateVisitationStatus,
  onOpenReceipt,
}) {
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'pending' | 'confirmed' | 'cancelled'
  const [typeFilter, setTypeFilter] = useState('all') // 'all' | 'resort' | 'ocular'
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBookingDetails, setSelectedBookingDetails] = useState(null)
  const [extraChargesInput, setExtraChargesInput] = useState(0)

  const getPackageName = (durationId) => {
    switch (durationId) {
      case 1:
        return 'Day Tour (9:00 AM - 5:00 PM)'
      case 2:
        return 'Overnight (8:00 PM - 6:00 AM)'
      case 3:
        return '22 Hours (8:00 AM - 6:00 AM)'
      case 4:
        return '22 Hours (8:00 PM - 6:00 PM)'
      default:
        return 'Resort Package'
    }
  }

  // Merge into a single consolidated list
  const consolidatedList = [
    ...reservations.map((r) => ({
      uniqueKey: `res-${r.reservation_id}`,
      id: r.reservation_id,
      itemType: 'resort',
      typeBadge: 'Resort Stay',
      customerName: r.customer_name || `Customer #${r.customer_id}`,
      customerPhone: r.customer_phone || '0917-xxx-xxxx',
      packageName: getPackageName(r.duration_id),
      detailSub: r.event_name || 'Resort Stay',
      dateStr: r.start_date ? r.start_date.split('T')[0] : 'N/A',
      timeSlot: r.start_date
        ? `${r.start_date.split('T')[1]?.substring(0, 5) || ''} - ${r.end_date?.split('T')[1]?.substring(0, 5) || ''}`
        : '',
      pax: r.guest_count,
      cost: (r.reservation_cost || 0) + (r.extra_charges || 0),
      hasSecDep: r.has_paid_sec_dep,
      hasPaidFull: r.has_paid_reservation,
      paymentMethod: r.payment_method || 'GCash',
      paymentRef: r.payment_reference,
      status: r.reservation_status || 'pending',
      raw: r,
    })),
    ...visitations.map((v) => ({
      uniqueKey: `vis-${v.visitation_id}`,
      id: v.visitation_id,
      itemType: 'ocular',
      typeBadge: 'Ocular Visit',
      customerName: v.customer_name || `Customer #${v.customer_id}`,
      customerPhone: v.customer_phone || '0928-xxx-xxxx',
      packageName: 'Ocular Inspection',
      detailSub: v.purpose || 'Venue preview',
      dateStr: v.visitation_start_date ? v.visitation_start_date.split('T')[0] : 'N/A',
      timeSlot: v.slot_type || 'Morning (9:00 AM - 11:00 AM)',
      pax: v.guest_count,
      cost: 0,
      hasSecDep: false,
      hasPaidFull: true,
      paymentMethod: 'Free Service',
      paymentRef: '',
      status: v.visitation_status || 'pending',
      raw: v,
    })),
  ]

  // Filter the consolidated list
  const filteredList = consolidatedList.filter((item) => {
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    const matchesType = typeFilter === 'all' || item.itemType === typeFilter

    const q = searchTerm.toLowerCase()
    const nameMatch = item.customerName.toLowerCase().includes(q)
    const phoneMatch = item.customerPhone.toLowerCase().includes(q)
    const detailMatch = item.detailSub.toLowerCase().includes(q)
    const packageMatch = item.packageName.toLowerCase().includes(q)
    const idMatch = String(item.id).includes(q)

    return matchesStatus && matchesType && (nameMatch || phoneMatch || detailMatch || packageMatch || idMatch)
  })

  // Sort by date or ID descending
  filteredList.sort((a, b) => {
    if (a.dateStr && b.dateStr && a.dateStr !== b.dateStr) {
      return b.dateStr.localeCompare(a.dateStr)
    }
    return b.id - a.id
  })

  const handleOpenDetailsModal = (item) => {
    setSelectedBookingDetails(item.raw)
    setExtraChargesInput(item.raw.extra_charges || 0)
  }

  const handleSaveExtraCharges = () => {
    if (!selectedBookingDetails) return
    onUpdateReservationPayment(selectedBookingDetails.reservation_id, {
      extra_charges: Number(extraChargesInput),
    })
    setSelectedBookingDetails({
      ...selectedBookingDetails,
      extra_charges: Number(extraChargesInput),
    })
  }

  return (
    <div className="dash-panel-box consolidated-booking-panel">
      {/* Panel Header */}
      <div className="dash-panel-bar">
        <div className="dash-panel-heading">
          <span className="dash-panel-title-text">All Reservations & Schedules</span>
        </div>
        <span className="dash-count-pill">{filteredList.length} Total Records</span>
      </div>

      <div className="dash-panel-content">
        {/* Search & Filter Toolbar */}
        <div className="consolidated-toolbar-card">
          <div className="consolidated-search-wrap">
            <span className="consolidated-search-icon">🔍</span>
            <input
              type="text"
              className="consolidated-search-input"
              placeholder="Search bookings by customer, phone, event, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="consolidated-search-clear"
                onClick={() => setSearchTerm('')}
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="consolidated-filters-wrap">
            {/* Type Dropdown */}
            <div className="consolidated-filter-row">
              <label className="consolidated-filter-title" htmlFor="catalog-type-filter">Category:</label>
              <select
                id="catalog-type-filter"
                className="consolidated-select-dropdown"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types ({consolidatedList.length})</option>
                <option value="resort">Resort Bookings ({reservations.length})</option>
                <option value="ocular">Ocular Visits ({visitations.length})</option>
              </select>
            </div>

            {/* Status Dropdown */}
            <div className="consolidated-filter-row">
              <label className="consolidated-filter-title" htmlFor="catalog-status-filter">Status:</label>
              <select
                id="catalog-status-filter"
                className="consolidated-select-dropdown"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Consolidated Data Table */}
        <div className="consolidated-table-card">
          <div className="consolidated-table-scroll">
            <table className="consolidated-data-table">
              <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Customer & Contact</th>
                <th>Type & Package / Purpose</th>
                <th>Schedule Date</th>
                <th>Guests</th>
                <th>Cost & Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="8" className="consolidated-empty-cell">
                    No bookings found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.uniqueKey} className={`table-row-${item.itemType}`}>
                    {/* Booking Ref & Type */}
                    <td>
                      <div className="cell-ref-group">
                        <span className="cell-id-text">#{item.id}</span>
                        <span className={`cell-type-badge type-badge-${item.itemType}`}>
                          {item.typeBadge}
                        </span>
                      </div>
                    </td>

                    {/* Customer */}
                    <td>
                      <div className="cell-cust-group">
                        <strong className="cell-cust-name">{item.customerName}</strong>
                        <span className="cell-cust-phone">{item.customerPhone}</span>
                      </div>
                    </td>

                    {/* Package / Details */}
                    <td>
                      <div className="cell-details-group">
                        <span className="cell-package-name">{item.packageName}</span>
                        <span className="cell-details-sub">{item.detailSub}</span>
                      </div>
                    </td>

                    {/* Schedule Date */}
                    <td>
                      <div className="cell-schedule-group">
                        <strong className="cell-date-text">{item.dateStr}</strong>
                        {item.timeSlot && (
                          <span className="cell-timeslot-text">{item.timeSlot}</span>
                        )}
                      </div>
                    </td>

                    {/* Guests */}
                    <td>
                      <span className="cell-pax-pill">
                        {item.pax} {item.itemType === 'resort' ? 'Pax' : 'Visitors'}
                      </span>
                    </td>

                    {/* Cost & Payment */}
                    <td>
                      {item.itemType === 'resort' ? (
                        <div className="cell-payment-group">
                          <span className="cell-amount-text">PHP {item.cost.toLocaleString()}</span>
                          <div className="cell-badges-row">
                            <span className={`cell-mini-pill ${item.hasSecDep ? 'pill-green' : 'pill-yellow'}`}>
                              {item.hasSecDep ? 'Dep Paid' : 'Dep Pending'}
                            </span>
                            <span className={`cell-mini-pill ${item.hasPaidFull ? 'pill-green' : 'pill-red'}`}>
                              {item.hasPaidFull ? 'Full Paid' : 'Pending Bal'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="cell-payment-group">
                          <span className="cell-free-tag">Free Visit</span>
                          <span className="cell-mini-pill pill-green">Approved Slot</span>
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td>
                      <span className={`consolidated-status-badge status-${item.status}`}>
                        {item.status.toUpperCase()}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="cell-actions-group">
                        {/* Approve Action */}
                        {item.status === 'pending' && (
                          <button
                            type="button"
                            className="btn-action-approve"
                            title="Approve booking"
                            onClick={() => {
                              if (item.itemType === 'resort') {
                                onUpdateReservationStatus(item.id, 'confirmed')
                              } else {
                                onUpdateVisitationStatus(item.id, 'confirmed')
                              }
                            }}
                          >
                            Approve
                          </button>
                        )}

                        {/* Cancel Action */}
                        {item.status !== 'cancelled' && (
                          <button
                            type="button"
                            className="btn-action-cancel"
                            title="Cancel booking"
                            onClick={() => {
                              if (item.itemType === 'resort') {
                                onUpdateReservationStatus(item.id, 'cancelled')
                              } else {
                                onUpdateVisitationStatus(item.id, 'cancelled')
                              }
                            }}
                          >
                            Cancel
                          </button>
                        )}

                        {/* Receipt Action for Resort */}
                        {item.itemType === 'resort' && (
                          <button
                            type="button"
                            className="btn-action-receipt"
                            title="View / Print Official Receipt"
                            onClick={() => onOpenReceipt(item.raw)}
                          >
                            Receipt
                          </button>
                        )}

                        {/* Manage Action for Resort */}
                        {item.itemType === 'resort' && (
                          <button
                            type="button"
                            className="btn-action-manage"
                            title="Manage payments & extra charges"
                            onClick={() => handleOpenDetailsModal(item)}
                          >
                            Manage
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        </div>
      </div>

      {/* Details & Payment Adjustment Modal */}
      {selectedBookingDetails && (
        <div className="modal-backdrop" onClick={() => setSelectedBookingDetails(null)}>
          <div className="modal-dialog-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-card-header">
              <h3 className="modal-card-title">
                Manage Reservation #{selectedBookingDetails.reservation_id}
              </h3>
              <button
                type="button"
                className="modal-close-x"
                onClick={() => setSelectedBookingDetails(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-card-body">
              <div className="modal-info-grid">
                <div className="modal-field-unit">
                  <label className="modal-unit-label">Customer Name</label>
                  <span className="modal-unit-val">{selectedBookingDetails.customer_name}</span>
                </div>
                <div className="modal-field-unit">
                  <label className="modal-unit-label">Contact Phone</label>
                  <span className="modal-unit-val">{selectedBookingDetails.customer_phone}</span>
                </div>
                <div className="modal-field-unit">
                  <label className="modal-unit-label">Package Type</label>
                  <span className="modal-unit-val">{getPackageName(selectedBookingDetails.duration_id)}</span>
                </div>
                <div className="modal-field-unit">
                  <label className="modal-unit-label">Guest Count</label>
                  <span className="modal-unit-val">{selectedBookingDetails.guest_count} Guests</span>
                </div>
              </div>

              {/* Charges Management */}
              <div className="modal-charges-card">
                <h4 className="modal-charges-title">Payment & Charges Management</h4>

                <div className="modal-toggles-stack">
                  <label className="modal-checkbox-row">
                    <input
                      type="checkbox"
                      checked={!!selectedBookingDetails.has_paid_sec_dep}
                      onChange={(e) => {
                        const val = e.target.checked
                        onUpdateReservationPayment(selectedBookingDetails.reservation_id, {
                          has_paid_sec_dep: val,
                        })
                        setSelectedBookingDetails({ ...selectedBookingDetails, has_paid_sec_dep: val })
                      }}
                    />
                    <span>Security Deposit (PHP 2,000) Received</span>
                  </label>

                  <label className="modal-checkbox-row">
                    <input
                      type="checkbox"
                      checked={!!selectedBookingDetails.has_paid_reservation}
                      onChange={(e) => {
                        const val = e.target.checked
                        onUpdateReservationPayment(selectedBookingDetails.reservation_id, {
                          has_paid_reservation: val,
                        })
                        setSelectedBookingDetails({ ...selectedBookingDetails, has_paid_reservation: val })
                      }}
                    />
                    <span>Full Reservation Package Amount Received</span>
                  </label>
                </div>

                <div className="modal-extra-row">
                  <div className="modal-extra-input-wrap">
                    <label className="modal-unit-label">
                      Extra Charges (PHP)
                      <span className="modal-hint-text">
                        (PHP 200 per head exceeding pax / PHP 700-800 per hr extension)
                      </span>
                    </label>
                    <input
                      type="number"
                      className="modal-number-input"
                      value={extraChargesInput}
                      onChange={(e) => setExtraChargesInput(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="modal-save-btn"
                    onClick={handleSaveExtraCharges}
                  >
                    Save Charges
                  </button>
                </div>

                <div className="modal-total-summary">
                  <span>Total Booking Amount:</span>
                  <strong>
                    PHP {((selectedBookingDetails.reservation_cost || 0) + Number(extraChargesInput || 0)).toLocaleString()}
                  </strong>
                </div>
              </div>
            </div>

            <div className="modal-card-footer">
              <button
                type="button"
                className="btn-action-receipt modal-receipt-btn"
                onClick={() => {
                  onOpenReceipt(selectedBookingDetails)
                  setSelectedBookingDetails(null)
                }}
              >
                🖨️ View & Print Receipt
              </button>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedBookingDetails(null)}
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

export default ListView
