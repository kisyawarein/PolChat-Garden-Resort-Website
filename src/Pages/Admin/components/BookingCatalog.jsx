import { useState } from 'react'

function BookingCatalog({
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

  // Filter Logic
  const filteredReservations = reservations.filter((r) => {
    const matchesStatus = statusFilter === 'all' || r.reservation_status === statusFilter
    const matchesType = typeFilter === 'all' || typeFilter === 'resort'
    const nameMatch = (r.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    const eventMatch = (r.event_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    const idMatch = String(r.reservation_id).includes(searchTerm)
    return matchesStatus && matchesType && (nameMatch || eventMatch || idMatch)
  })

  const filteredVisitations = visitations.filter((v) => {
    const matchesStatus = statusFilter === 'all' || v.visitation_status === statusFilter
    const matchesType = typeFilter === 'all' || typeFilter === 'ocular'
    const nameMatch = (v.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    const purposeMatch = (v.purpose || '').toLowerCase().includes(searchTerm.toLowerCase())
    const idMatch = String(v.visitation_id).includes(searchTerm)
    return matchesStatus && matchesType && (nameMatch || purposeMatch || idMatch)
  })

  const handleOpenDetailsModal = (item) => {
    setSelectedBookingDetails(item)
    setExtraChargesInput(item.extra_charges || 0)
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

  return (
    <div className="admin-catalog-container">
      {/* Search & Filter Toolbar */}
      <div className="admin-toolbar-row">
        <div className="admin-search-wrapper">
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by customer name, event name, or booking ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="admin-search-clear-btn"
              onClick={() => setSearchTerm('')}
            >
              ✕
            </button>
          )}
        </div>

        <div className="admin-filter-pills-group">
          <div className="admin-pill-selector">
            <span className="admin-selector-label">Status:</span>
            <button
              type="button"
              className={statusFilter === 'all' ? 'admin-filter-pill admin-filter-pill-active' : 'admin-filter-pill'}
              onClick={() => setStatusFilter('all')}
            >
              All
            </button>
            <button
              type="button"
              className={statusFilter === 'pending' ? 'admin-filter-pill admin-filter-pill-active' : 'admin-filter-pill'}
              onClick={() => setStatusFilter('pending')}
            >
              Pending
            </button>
            <button
              type="button"
              className={statusFilter === 'confirmed' ? 'admin-filter-pill admin-filter-pill-active' : 'admin-filter-pill'}
              onClick={() => setStatusFilter('confirmed')}
            >
              Confirmed
            </button>
            <button
              type="button"
              className={statusFilter === 'cancelled' ? 'admin-filter-pill admin-filter-pill-active' : 'admin-filter-pill'}
              onClick={() => setStatusFilter('cancelled')}
            >
              Cancelled
            </button>
          </div>

          <div className="admin-pill-selector">
            <span className="admin-selector-label">Type:</span>
            <button
              type="button"
              className={typeFilter === 'all' ? 'admin-filter-pill admin-filter-pill-active' : 'admin-filter-pill'}
              onClick={() => setTypeFilter('all')}
            >
              All Types
            </button>
            <button
              type="button"
              className={typeFilter === 'resort' ? 'admin-filter-pill admin-filter-pill-active' : 'admin-filter-pill'}
              onClick={() => setTypeFilter('resort')}
            >
              Resort Bookings
            </button>
            <button
              type="button"
              className={typeFilter === 'ocular' ? 'admin-filter-pill admin-filter-pill-active' : 'admin-filter-pill'}
              onClick={() => setTypeFilter('ocular')}
            >
              Ocular Visits
            </button>
          </div>
        </div>
      </div>

      {/* Resort Reservations Table */}
      {(typeFilter === 'all' || typeFilter === 'resort') && (
        <div className="admin-table-section">
          <div className="admin-table-header-bar">
            <h3 className="admin-table-title">
              Resort Package Reservations ({filteredReservations.length})
            </h3>
          </div>

          <div className="admin-table-scroll-wrap">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th className="admin-th">ID</th>
                  <th className="admin-th">Customer & Contact</th>
                  <th className="admin-th">Package & Event</th>
                  <th className="admin-th">Date & Timeslot</th>
                  <th className="admin-th">Guests</th>
                  <th className="admin-th">Pricing & Deposit</th>
                  <th className="admin-th">Payment</th>
                  <th className="admin-th">Status</th>
                  <th className="admin-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="admin-empty-table-cell">
                      No resort reservations match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredReservations.map((res) => (
                    <tr key={res.reservation_id} className="admin-table-row">
                      <td className="admin-td admin-td-id">#{res.reservation_id}</td>
                      <td className="admin-td">
                        <div className="admin-customer-info-cell">
                          <span className="admin-customer-name-text">
                            {res.customer_name || `Customer #${res.customer_id}`}
                          </span>
                          <span className="admin-customer-phone-sub">
                            {res.customer_phone || '0917-xxx-xxxx'}
                          </span>
                        </div>
                      </td>
                      <td className="admin-td">
                        <div className="admin-package-cell">
                          <span className="admin-package-name-tag">
                            {getPackageName(res.duration_id)}
                          </span>
                          {res.event_name && (
                            <span className="admin-event-name-sub">
                              {res.event_name}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="admin-td admin-td-datetime">
                        <div>
                          <strong>{res.start_date ? res.start_date.split('T')[0] : 'N/A'}</strong>
                        </div>
                        <span className="admin-timeslot-text">
                          {res.start_date ? res.start_date.split('T')[1]?.substring(0, 5) : ''} -{' '}
                          {res.end_date ? res.end_date.split('T')[1]?.substring(0, 5) : ''}
                        </span>
                      </td>
                      <td className="admin-td">
                        <span className="admin-guest-count-badge">
                          {res.guest_count} Pax
                        </span>
                      </td>
                      <td className="admin-td">
                        <div className="admin-pricing-cell">
                          <span className="admin-cost-text">
                            PHP {((res.reservation_cost || 0) + (res.extra_charges || 0)).toLocaleString()}
                          </span>
                          <span
                            className={
                              res.has_paid_sec_dep
                                ? 'admin-sec-dep-tag admin-dep-paid'
                                : 'admin-sec-dep-tag admin-dep-unpaid'
                            }
                          >
                            Sec Dep: {res.has_paid_sec_dep ? '✓ 2k Paid' : 'Pending 2k'}
                          </span>
                        </div>
                      </td>
                      <td className="admin-td">
                        <div className="admin-payment-status-cell">
                          <span className="admin-payment-method-text">
                            {res.payment_method || 'GCash'}
                          </span>
                          {res.payment_reference && (
                            <span className="admin-payment-ref-text">
                              Ref: {res.payment_reference}
                            </span>
                          )}
                          <span
                            className={
                              res.has_paid_reservation
                                ? 'admin-pay-badge admin-pay-full'
                                : 'admin-pay-badge admin-pay-partial'
                            }
                          >
                            {res.has_paid_reservation ? 'Fully Paid' : 'Pending Balance'}
                          </span>
                        </div>
                      </td>
                      <td className="admin-td">
                        <span className={`admin-status-badge admin-status-${res.reservation_status}`}>
                          {res.reservation_status.toUpperCase()}
                        </span>
                      </td>
                      <td className="admin-td">
                        <div className="admin-row-actions">
                          {res.reservation_status === 'pending' && (
                            <button
                              type="button"
                              className="admin-action-btn admin-btn-confirm"
                              onClick={() => onUpdateReservationStatus(res.reservation_id, 'confirmed')}
                              title="Confirm Reservation"
                            >
                              Approve
                            </button>
                          )}
                          {res.reservation_status !== 'cancelled' && (
                            <button
                              type="button"
                              className="admin-action-btn admin-btn-cancel"
                              onClick={() => onUpdateReservationStatus(res.reservation_id, 'cancelled')}
                              title="Cancel Reservation"
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            type="button"
                            className="admin-action-btn admin-btn-receipt"
                            onClick={() => onOpenReceipt(res)}
                            title="Generate Official Printable Receipt"
                          >
                            Receipt
                          </button>
                          <button
                            type="button"
                            className="admin-action-btn admin-btn-details"
                            onClick={() => handleOpenDetailsModal(res)}
                            title="View Full Booking Details & Extra Charges"
                          >
                            Manage
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ocular Visitations Section */}
      {(typeFilter === 'all' || typeFilter === 'ocular') && (
        <div className="admin-table-section">
          <div className="admin-table-header-bar">
            <h3 className="admin-table-title">
              Ocular Visitations Catalog ({filteredVisitations.length})
            </h3>
            <span className="admin-table-subtitle">
              Personal resort walk-throughs (Morning: 9am-11am, Afternoon: 2pm-4pm)
            </span>
          </div>

          <div className="admin-table-scroll-wrap">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th className="admin-th">ID</th>
                  <th className="admin-th">Visitor Name</th>
                  <th className="admin-th">Contact</th>
                  <th className="admin-th">Date & Scheduled Slot</th>
                  <th className="admin-th">Visitors Count</th>
                  <th className="admin-th">Inspection Purpose</th>
                  <th className="admin-th">Status</th>
                  <th className="admin-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVisitations.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="admin-empty-table-cell">
                      No ocular visitations found.
                    </td>
                  </tr>
                ) : (
                  filteredVisitations.map((vis) => (
                    <tr key={vis.visitation_id} className="admin-table-row">
                      <td className="admin-td admin-td-id">#{vis.visitation_id}</td>
                      <td className="admin-td admin-strong-text">{vis.customer_name}</td>
                      <td className="admin-td">{vis.customer_phone || '0928-xxx-xxxx'}</td>
                      <td className="admin-td">
                        <strong>{vis.visitation_start_date ? vis.visitation_start_date.split('T')[0] : 'N/A'}</strong>
                        <div className="admin-timeslot-text">{vis.slot_type || 'Morning (9:00 AM - 11:00 AM)'}</div>
                      </td>
                      <td className="admin-td">
                        <span className="admin-guest-count-badge">{vis.guest_count} Visitors</span>
                      </td>
                      <td className="admin-td">{vis.purpose || 'Venue preview'}</td>
                      <td className="admin-td">
                        <span className={`admin-status-badge admin-status-${vis.visitation_status}`}>
                          {vis.visitation_status.toUpperCase()}
                        </span>
                      </td>
                      <td className="admin-td">
                        <div className="admin-row-actions">
                          {vis.visitation_status === 'pending' && (
                            <button
                              type="button"
                              className="admin-action-btn admin-btn-confirm"
                              onClick={() => onUpdateVisitationStatus(vis.visitation_id, 'confirmed')}
                            >
                              Approve
                            </button>
                          )}
                          {vis.visitation_status !== 'cancelled' && (
                            <button
                              type="button"
                              className="admin-action-btn admin-btn-cancel"
                              onClick={() => onUpdateVisitationStatus(vis.visitation_id, 'cancelled')}
                            >
                              Cancel
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
      )}

      {/* Details & Payment Adjustment Modal */}
      {selectedBookingDetails && (
        <div className="admin-modal-overlay" onClick={() => setSelectedBookingDetails(null)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                Manage Reservation #{selectedBookingDetails.reservation_id}
              </h3>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => setSelectedBookingDetails(null)}
              >
                ✕
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="admin-modal-info-grid">
                <div className="admin-modal-field">
                  <label className="admin-modal-label">Customer Name</label>
                  <span className="admin-modal-value">{selectedBookingDetails.customer_name}</span>
                </div>

                <div className="admin-modal-field">
                  <label className="admin-modal-label">Contact Phone</label>
                  <span className="admin-modal-value">{selectedBookingDetails.customer_phone}</span>
                </div>

                <div className="admin-modal-field">
                  <label className="admin-modal-label">Package Type</label>
                  <span className="admin-modal-value">{getPackageName(selectedBookingDetails.duration_id)}</span>
                </div>

                <div className="admin-modal-field">
                  <label className="admin-modal-label">Event Name</label>
                  <span className="admin-modal-value">{selectedBookingDetails.event_name || 'Standard Resort Stay'}</span>
                </div>

                <div className="admin-modal-field">
                  <label className="admin-modal-label">Guest Count</label>
                  <span className="admin-modal-value">{selectedBookingDetails.guest_count} Guests</span>
                </div>

                <div className="admin-modal-field">
                  <label className="admin-modal-label">Payment Reference</label>
                  <span className="admin-modal-value">{selectedBookingDetails.payment_reference || 'N/A'}</span>
                </div>
              </div>

              {/* Payment & Charges Management */}
              <div className="admin-modal-charges-card">
                <h4 className="admin-charges-card-title">Payment & Charges Management</h4>

                <div className="admin-toggles-row">
                  <label className="admin-checkbox-label">
                    <input
                      type="checkbox"
                      className="admin-checkbox-input"
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

                  <label className="admin-checkbox-label">
                    <input
                      type="checkbox"
                      className="admin-checkbox-input"
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

                <div className="admin-extra-charges-row">
                  <div className="admin-extra-field">
                    <label className="admin-modal-label">
                      Extra Charges (PHP)
                      <span className="admin-field-hint">
                        (PHP 200 per head exceeding pax / PHP 700-800 per hr extension)
                      </span>
                    </label>
                    <input
                      type="number"
                      className="admin-number-input"
                      value={extraChargesInput}
                      onChange={(e) => setExtraChargesInput(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="admin-save-charges-btn"
                    onClick={handleSaveExtraCharges}
                  >
                    Save Charges
                  </button>
                </div>

                <div className="admin-total-summary-row">
                  <span className="admin-summary-label">Total Booking Amount:</span>
                  <span className="admin-summary-amount">
                    PHP {((selectedBookingDetails.reservation_cost || 0) + Number(extraChargesInput || 0)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-footer-btn admin-btn-receipt"
                onClick={() => {
                  onOpenReceipt(selectedBookingDetails)
                  setSelectedBookingDetails(null)
                }}
              >
                🖨️ View & Print Receipt
              </button>
              <button
                type="button"
                className="admin-footer-btn admin-btn-close"
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

export default BookingCatalog
