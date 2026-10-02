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
    <div className="booking-list-view">
      {/* Search & Filter Controls */}
      <div className="booking-toolbar-card">
        <div className="booking-search-box">
          <input
            type="text"
            className="booking-search-input"
            placeholder="Search by customer name, event name, or booking ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="booking-search-clear"
              onClick={() => setSearchTerm('')}
            >
              ✕
            </button>
          )}
        </div>

        <div className="booking-filter-group">
          <div className="booking-filter-row">
            <span className="booking-filter-label">Status:</span>
            <button
              type="button"
              className={statusFilter === 'all' ? 'booking-filter-chip booking-filter-chip-active' : 'booking-filter-chip'}
              onClick={() => setStatusFilter('all')}
            >
              All
            </button>
            <button
              type="button"
              className={statusFilter === 'pending' ? 'booking-filter-chip booking-filter-chip-active' : 'booking-filter-chip'}
              onClick={() => setStatusFilter('pending')}
            >
              Pending
            </button>
            <button
              type="button"
              className={statusFilter === 'confirmed' ? 'booking-filter-chip booking-filter-chip-active' : 'booking-filter-chip'}
              onClick={() => setStatusFilter('confirmed')}
            >
              Confirmed
            </button>
            <button
              type="button"
              className={statusFilter === 'cancelled' ? 'booking-filter-chip booking-filter-chip-active' : 'booking-filter-chip'}
              onClick={() => setStatusFilter('cancelled')}
            >
              Cancelled
            </button>
          </div>

          <div className="booking-filter-row">
            <span className="booking-filter-label">Category:</span>
            <button
              type="button"
              className={typeFilter === 'all' ? 'booking-filter-chip booking-filter-chip-active' : 'booking-filter-chip'}
              onClick={() => setTypeFilter('all')}
            >
              All
            </button>
            <button
              type="button"
              className={typeFilter === 'resort' ? 'booking-filter-chip booking-filter-chip-active' : 'booking-filter-chip'}
              onClick={() => setTypeFilter('resort')}
            >
              Resort Bookings
            </button>
            <button
              type="button"
              className={typeFilter === 'ocular' ? 'booking-filter-chip booking-filter-chip-active' : 'booking-filter-chip'}
              onClick={() => setTypeFilter('ocular')}
            >
              Ocular Visits
            </button>
          </div>
        </div>
      </div>

      {/* Resort Reservations Table */}
      {(typeFilter === 'all' || typeFilter === 'resort') && (
        <div className="booking-table-card">
          <div className="booking-table-header">
            <h3 className="booking-table-title">
              Resort Package Reservations ({filteredReservations.length})
            </h3>
          </div>

          <div className="booking-table-scroll">
            <table className="booking-data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer & Contact</th>
                  <th>Package & Event</th>
                  <th>Date & Timeslot</th>
                  <th>Guests</th>
                  <th>Cost & Deposit</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="booking-empty-cell">
                      No resort reservations match the filters.
                    </td>
                  </tr>
                ) : (
                  filteredReservations.map((res) => (
                    <tr key={res.reservation_id}>
                      <td className="booking-id-cell">#{res.reservation_id}</td>
                      <td>
                        <div className="booking-cust-info">
                          <span className="booking-cust-name">{res.customer_name || `Customer #${res.customer_id}`}</span>
                          <span className="booking-cust-phone">{res.customer_phone || '0917-xxx-xxxx'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="booking-package-info">
                          <span className="booking-package-name">{getPackageName(res.duration_id)}</span>
                          {res.event_name && <span className="booking-event-sub">{res.event_name}</span>}
                        </div>
                      </td>
                      <td>
                        <strong>{res.start_date ? res.start_date.split('T')[0] : 'N/A'}</strong>
                        <div className="booking-timeslot-sub">
                          {res.start_date ? res.start_date.split('T')[1]?.substring(0, 5) : ''} -{' '}
                          {res.end_date ? res.end_date.split('T')[1]?.substring(0, 5) : ''}
                        </div>
                      </td>
                      <td>
                        <span className="booking-pax-badge">{res.guest_count} Pax</span>
                      </td>
                      <td>
                        <div className="booking-pricing-info">
                          <span className="booking-amount-text">
                            PHP {((res.reservation_cost || 0) + (res.extra_charges || 0)).toLocaleString()}
                          </span>
                          <span className={`booking-deposit-tag ${res.has_paid_sec_dep ? 'deposit-paid' : 'deposit-unpaid'}`}>
                            Sec Dep: {res.has_paid_sec_dep ? '✓ 2k Paid' : 'Pending 2k'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="booking-pay-info">
                          <span className="booking-method-text">{res.payment_method || 'GCash'}</span>
                          {res.payment_reference && (
                            <span className="booking-ref-text">Ref: {res.payment_reference}</span>
                          )}
                          <span className={`booking-pay-status-tag ${res.has_paid_reservation ? 'pay-full' : 'pay-pending'}`}>
                            {res.has_paid_reservation ? 'Fully Paid' : 'Pending Balance'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`booking-status-badge status-${res.reservation_status}`}>
                          {res.reservation_status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div className="booking-row-actions">
                          {res.reservation_status === 'pending' && (
                            <button
                              type="button"
                              className="booking-btn-approve"
                              onClick={() => onUpdateReservationStatus(res.reservation_id, 'confirmed')}
                            >
                              Approve
                            </button>
                          )}
                          {res.reservation_status !== 'cancelled' && (
                            <button
                              type="button"
                              className="booking-btn-cancel"
                              onClick={() => onUpdateReservationStatus(res.reservation_id, 'cancelled')}
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            type="button"
                            className="booking-btn-receipt"
                            onClick={() => onOpenReceipt(res)}
                          >
                            Receipt
                          </button>
                          <button
                            type="button"
                            className="booking-btn-manage"
                            onClick={() => handleOpenDetailsModal(res)}
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

      {/* Ocular Visitations Table */}
      {(typeFilter === 'all' || typeFilter === 'ocular') && (
        <div className="booking-table-card">
          <div className="booking-table-header">
            <h3 className="booking-table-title">
              Ocular Visitations ({filteredVisitations.length})
            </h3>
          </div>

          <div className="booking-table-scroll">
            <table className="booking-data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Visitor Name</th>
                  <th>Contact</th>
                  <th>Date & Timeslot</th>
                  <th>Visitors</th>
                  <th>Inspection Purpose</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVisitations.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="booking-empty-cell">
                      No ocular visitations found.
                    </td>
                  </tr>
                ) : (
                  filteredVisitations.map((vis) => (
                    <tr key={vis.visitation_id}>
                      <td className="booking-id-cell">#{vis.visitation_id}</td>
                      <td><strong>{vis.customer_name}</strong></td>
                      <td>{vis.customer_phone || '0928-xxx-xxxx'}</td>
                      <td>
                        <strong>{vis.visitation_start_date ? vis.visitation_start_date.split('T')[0] : 'N/A'}</strong>
                        <div className="booking-timeslot-sub">{vis.slot_type || 'Morning (9:00 AM - 11:00 AM)'}</div>
                      </td>
                      <td><span className="booking-pax-badge">{vis.guest_count} Visitors</span></td>
                      <td>{vis.purpose || 'Venue preview'}</td>
                      <td>
                        <span className={`booking-status-badge status-${vis.visitation_status}`}>
                          {vis.visitation_status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div className="booking-row-actions">
                          {vis.visitation_status === 'pending' && (
                            <button
                              type="button"
                              className="booking-btn-approve"
                              onClick={() => onUpdateVisitationStatus(vis.visitation_id, 'confirmed')}
                            >
                              Approve
                            </button>
                          )}
                          {vis.visitation_status !== 'cancelled' && (
                            <button
                              type="button"
                              className="booking-btn-cancel"
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
                className="booking-btn-receipt"
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
