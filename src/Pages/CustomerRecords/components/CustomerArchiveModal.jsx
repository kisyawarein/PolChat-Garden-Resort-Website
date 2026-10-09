import { useState } from 'react'

function CustomerArchiveModal({ customer, reservations = [], visitations = [], inquiries = [], onClose, onDeleteCustomer }) {
  const [activeTab, setActiveTab] = useState('bookings') // 'bookings' | 'visitations' | 'inquiries'

  if (!customer) return null

  const custBookings = reservations.filter((r) => r.customer_id === customer.customer_id)
  const custVisitations = visitations.filter((v) => v.customer_id === customer.customer_id)
  const custInquiries = inquiries.filter((i) => i.customer_id === customer.customer_id)

  const totalSpent = custBookings
    .filter((r) => r.reservation_status !== 'cancelled')
    .reduce((sum, r) => sum + (r.reservation_cost || 0) + (r.extra_charges || 0), 0)

  const getDurationName = (durationId) => {
    switch (durationId) {
      case 1:
        return 'Day Tour (9AM - 5PM)'
      case 2:
        return 'Overnight (8PM - 6AM)'
      case 3:
        return '22 Hours - Day Start (8AM - 6AM)'
      case 4:
        return '22 Hours - Night Start (8PM - 6PM)'
      default:
        return 'Resort Stay'
    }
  }

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A'
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr.split('T')[0]
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="cust-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="cust-modal-box cust-modal-wide" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="cust-modal-header">
          <div className="cust-modal-header-left">
            <span className="cust-modal-avatar">
              {customer.first_name ? customer.first_name[0].toUpperCase() : 'G'}
            </span>
            <div className="cust-modal-title-wrap">
              <div className="cust-modal-title-row">
                <h3 className="cust-modal-title">
                  {customer.first_name} {customer.last_name || ''}
                </h3>
                <span className="cust-modal-id-pill">#{customer.customer_id}</span>
                <span className="cust-modal-verified-pill">Verified Guest</span>
              </div>
              <p className="cust-modal-subtitle">
                Complete guest reservation archive and communication history
              </p>
            </div>
          </div>

          <button
            type="button"
            className="cust-modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Customer Quick Overview Bar */}
        <div className="cust-modal-overview-bar">
          <div className="cust-modal-overview-item">
            <span className="cust-overview-label">Phone Contact</span>
            <span className="cust-overview-val">
              {customer.phone_number ? `0${customer.phone_number}` : 'No phone recorded'}
            </span>
          </div>

          <div className="cust-modal-overview-item">
            <span className="cust-overview-label">Date Registered</span>
            <span className="cust-overview-val">
              {customer.date_create ? formatDateTime(customer.date_create) : 'Recent Account'}
            </span>
          </div>

          <div className="cust-modal-overview-item cust-overview-item-highlight">
            <span className="cust-overview-label">Total Spend</span>
            <span className="cust-overview-val cust-overview-spend">
              ₱{totalSpent.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Modal Segment Navigation Tabs */}
        <div className="cust-modal-tabs-bar">
          <button
            type="button"
            className={`cust-modal-tab-btn ${activeTab === 'bookings' ? 'cust-tab-active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Resort Bookings ({custBookings.length})</span>
          </button>

          <button
            type="button"
            className={`cust-modal-tab-btn ${activeTab === 'visitations' ? 'cust-tab-active' : ''}`}
            onClick={() => setActiveTab('visitations')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>Ocular Visits ({custVisitations.length})</span>
          </button>

          <button
            type="button"
            className={`cust-modal-tab-btn ${activeTab === 'inquiries' ? 'cust-tab-active' : ''}`}
            onClick={() => setActiveTab('inquiries')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>Support Tickets ({custInquiries.length})</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="cust-modal-body">
          {/* 1. BOOKINGS TAB */}
          {activeTab === 'bookings' && (
            <div className="cust-tab-content">
              {custBookings.length === 0 ? (
                <div className="cust-modal-empty-state">
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#ACAD79" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <h4>No Resort Bookings Found</h4>
                  <p>This customer does not have any recorded resort reservations yet.</p>
                </div>
              ) : (
                <div className="cust-history-cards-grid">
                  {custBookings.map((r) => {
                    const totalCost = (r.reservation_cost || 0) + (r.extra_charges || 0)
                    const statusClass = `cust-booking-status-${(r.reservation_status || 'pending').toLowerCase()}`

                    return (
                      <div key={r.reservation_id} className="cust-booking-history-card">
                        {/* Top Card Bar */}
                        <div className="cust-bh-card-header">
                          <div className="cust-bh-title-group">
                            <span className="cust-bh-id-badge">#{r.reservation_id}</span>
                            <strong className="cust-bh-event-title">
                              {r.event_name || getDurationName(r.duration_id)}
                            </strong>
                          </div>
                          <span className={`cust-bh-status-pill ${statusClass}`}>
                            {r.reservation_status ? r.reservation_status.toUpperCase() : 'PENDING'}
                          </span>
                        </div>

                        {/* Package and Schedule Info */}
                        <div className="cust-bh-package-bar">
                          <span className="cust-bh-package-name">
                            {getDurationName(r.duration_id)}
                          </span>
                          <span className="cust-bh-pax-count">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                            </svg>
                            {r.guest_count} Pax
                          </span>
                        </div>

                        {/* Card Grid Details */}
                        <div className="cust-bh-details-grid">
                          <div className="cust-bh-detail-cell">
                            <span className="cust-bh-cell-label">Schedule Date</span>
                            <strong className="cust-bh-cell-val">
                              {formatDateTime(r.start_date)}
                            </strong>
                          </div>

                          <div className="cust-bh-detail-cell">
                            <span className="cust-bh-cell-label">Total Amount</span>
                            <strong className="cust-bh-cell-val cust-bh-val-price">
                              ₱{totalCost.toLocaleString()}
                            </strong>
                          </div>

                          <div className="cust-bh-detail-cell">
                            <span className="cust-bh-cell-label">Payment Status</span>
                            <span className={`cust-bh-pay-pill ${r.has_paid_reservation ? 'cust-bh-paid' : 'cust-bh-unpaid'}`}>
                              {r.has_paid_reservation ? 'Fully Paid' : 'Pending Payment'}
                            </span>
                          </div>

                          <div className="cust-bh-detail-cell">
                            <span className="cust-bh-cell-label">Payment Method</span>
                            <strong className="cust-bh-cell-val">
                              {r.payment_method || 'GCash Transfer'}
                            </strong>
                          </div>
                        </div>

                        {/* Bottom Charges Summary */}
                        <div className="cust-bh-card-footer">
                          <div className="cust-bh-footer-breakdown">
                            <span>Base: ₱{(r.reservation_cost || 0).toLocaleString()}</span>
                            {r.extra_charges > 0 && (
                              <span>• Extra Charges: ₱{r.extra_charges.toLocaleString()}</span>
                            )}
                            {r.has_paid_sec_dep && (
                              <span className="cust-bh-dep-tag">• Security Deposit Verified</span>
                            )}
                          </div>
                          <span className="cust-bh-ref-text">
                            Ref: {r.reference_number || 'Direct Booking'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* 2. VISITATIONS TAB */}
          {activeTab === 'visitations' && (
            <div className="cust-tab-content">
              {custVisitations.length === 0 ? (
                <div className="cust-modal-empty-state">
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#ACAD79" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <h4>No Ocular Visitations</h4>
                  <p>This customer has not scheduled any ocular inspections.</p>
                </div>
              ) : (
                <div className="cust-history-cards-grid">
                  {custVisitations.map((v) => (
                    <div key={v.visitation_id} className="cust-booking-history-card">
                      <div className="cust-bh-card-header">
                        <div className="cust-bh-title-group">
                          <span className="cust-bh-id-badge">#{v.visitation_id}</span>
                          <strong className="cust-bh-event-title">
                            Ocular Visit ({v.slot_type || 'Morning Slot'})
                          </strong>
                        </div>
                        <span className={`cust-bh-status-pill cust-booking-status-${(v.visitation_status || 'pending').toLowerCase()}`}>
                          {v.visitation_status ? v.visitation_status.toUpperCase() : 'PENDING'}
                        </span>
                      </div>

                      <div className="cust-bh-details-grid">
                        <div className="cust-bh-detail-cell">
                          <span className="cust-bh-cell-label">Scheduled Date</span>
                          <strong className="cust-bh-cell-val">
                            {formatDateTime(v.visitation_start_date)}
                          </strong>
                        </div>
                        <div className="cust-bh-detail-cell">
                          <span className="cust-bh-cell-label">Group Size</span>
                          <strong className="cust-bh-cell-val">{v.guest_count || 2} Visitors</strong>
                        </div>
                        <div className="cust-bh-detail-cell" style={{ gridColumn: 'span 2' }}>
                          <span className="cust-bh-cell-label">Visit Purpose</span>
                          <strong className="cust-bh-cell-val">{v.purpose || 'Resort Inspection'}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. INQUIRIES TAB */}
          {activeTab === 'inquiries' && (
            <div className="cust-tab-content">
              {custInquiries.length === 0 ? (
                <div className="cust-modal-empty-state">
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#ACAD79" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <h4>No Support Inquiries</h4>
                  <p>This customer does not have any recorded customer support tickets.</p>
                </div>
              ) : (
                <div className="cust-history-cards-grid">
                  {custInquiries.map((inq) => (
                    <div key={inq.inquiry_id} className="cust-booking-history-card">
                      <div className="cust-bh-card-header">
                        <div className="cust-bh-title-group">
                          <span className="cust-bh-id-badge">#{inq.inquiry_id}</span>
                          <strong className="cust-bh-event-title">
                            {inq.inquiry_label || 'Customer Inquiry'}
                          </strong>
                        </div>
                        <span className={`cust-bh-status-pill cust-booking-status-${(inq.inquiry_status || 'open').toLowerCase()}`}>
                          {inq.inquiry_status ? inq.inquiry_status.toUpperCase() : 'OPEN'}
                        </span>
                      </div>

                      <div className="cust-bh-details-grid">
                        <div className="cust-bh-detail-cell">
                          <span className="cust-bh-cell-label">Created Date</span>
                          <strong className="cust-bh-cell-val">
                            {formatDateTime(inq.created_at)}
                          </strong>
                        </div>
                        <div className="cust-bh-detail-cell">
                          <span className="cust-bh-cell-label">Assigned Staff</span>
                          <strong className="cust-bh-cell-val">
                            {inq.admin_responder || 'Unassigned'}
                          </strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="cust-modal-footer">
          <div className="cust-modal-footer-left">
            {onDeleteCustomer && (
              <button
                type="button"
                className="cust-btn-delete-modal"
                onClick={() => {
                  onDeleteCustomer(customer)
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                <span>Delete Account</span>
              </button>
            )}
            <span className="cust-modal-footer-count">
              Total {custBookings.length} {custBookings.length === 1 ? 'Booking' : 'Bookings'} on file
            </span>
          </div>
          <button type="button" className="cust-btn-close-modal" onClick={onClose}>
            Close Archive
          </button>
        </div>
      </div>
    </div>
  )
}

export default CustomerArchiveModal
