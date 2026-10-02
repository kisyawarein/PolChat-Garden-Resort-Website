function CustomerArchiveModal({ customer, reservations, visitations, inquiries, onClose }) {
  if (!customer) return null

  const custBookings = reservations.filter((r) => r.customer_id === customer.customer_id)
  const custVisitations = visitations.filter((v) => v.customer_id === customer.customer_id)
  const custInquiries = inquiries.filter((i) => i.customer_id === customer.customer_id)

  return (
    <div className="cust-modal-backdrop" onClick={onClose}>
      <div className="cust-modal-box cust-modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="cust-modal-header">
          <h3 className="cust-modal-title">
            Customer Record Archive: {customer.first_name} {customer.last_name}
          </h3>
          <button type="button" className="cust-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="cust-modal-body">
          {/* Customer Profile Summary */}
          <div className="cust-summary-grid">
            <div className="cust-summary-item">
              <span className="cust-summary-label">Customer ID</span>
              <strong className="cust-summary-val">#{customer.customer_id}</strong>
            </div>
            <div className="cust-summary-item">
              <span className="cust-summary-label">Phone Contact</span>
              <strong className="cust-summary-val">{customer.phone_number ? `0${customer.phone_number}` : 'N/A'}</strong>
            </div>
            <div className="cust-summary-item">
              <span className="cust-summary-label">Email Address</span>
              <strong className="cust-summary-val">{customer.email || 'N/A'}</strong>
            </div>
            <div className="cust-summary-item">
              <span className="cust-summary-label">Date Registered</span>
              <strong className="cust-summary-val">{customer.date_create || 'N/A'}</strong>
            </div>
          </div>

          {/* Reservation History */}
          <div className="cust-archive-section">
            <h4 className="cust-archive-title">Resort Reservation History ({custBookings.length})</h4>
            {custBookings.length === 0 ? (
              <p className="cust-empty-hint">No past resort reservations found.</p>
            ) : (
              <div className="cust-cards-list">
                {custBookings.map((r) => (
                  <div key={r.reservation_id} className="cust-archive-card">
                    <div className="cust-card-head">
                      <strong>Booking #{r.reservation_id} - {r.event_name || 'Resort Stay'}</strong>
                      <span className={`cust-status-badge cust-status-${r.reservation_status}`}>
                        {r.reservation_status.toUpperCase()}
                      </span>
                    </div>
                    <div className="cust-card-grid">
                      <div><strong>Date:</strong> {r.start_date ? r.start_date.split('T')[0] : 'N/A'}</div>
                      <div><strong>Guests:</strong> {r.guest_count} Pax</div>
                      <div><strong>Total:</strong> PHP {((r.reservation_cost || 0) + (r.extra_charges || 0)).toLocaleString()}</div>
                      <div><strong>Payment:</strong> {r.has_paid_reservation ? 'Fully Paid' : 'Pending Balance'} ({r.payment_method || 'GCash'})</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Visitation History */}
          <div className="cust-archive-section">
            <h4 className="cust-archive-title">Ocular Visitations ({custVisitations.length})</h4>
            {custVisitations.length === 0 ? (
              <p className="cust-empty-hint">No scheduled ocular inspections.</p>
            ) : (
              <div className="cust-cards-list">
                {custVisitations.map((v) => (
                  <div key={v.visitation_id} className="cust-archive-card">
                    <div className="cust-card-head">
                      <strong>Inspection #{v.visitation_id}</strong>
                      <span className={`cust-status-badge cust-status-${v.visitation_status}`}>
                        {v.visitation_status.toUpperCase()}
                      </span>
                    </div>
                    <div className="cust-card-grid">
                      <div><strong>Schedule:</strong> {v.visitation_start_date ? v.visitation_start_date.split('T')[0] : ''} ({v.slot_type})</div>
                      <div><strong>Visitors:</strong> {v.guest_count}</div>
                      <div><strong>Purpose:</strong> {v.purpose}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Inquiry History */}
          <div className="cust-archive-section">
            <h4 className="cust-archive-title">Support Tickets & Inquiries ({custInquiries.length})</h4>
            {custInquiries.length === 0 ? (
              <p className="cust-empty-hint">No support inquiries filed.</p>
            ) : (
              <div className="cust-cards-list">
                {custInquiries.map((inq) => (
                  <div key={inq.inquiry_id} className="cust-archive-card">
                    <div className="cust-card-head">
                      <strong>Ticket #{inq.inquiry_id}: {inq.inquiry_label}</strong>
                      <span className={`cust-status-badge cust-status-${inq.inquiry_status}`}>
                        {inq.inquiry_status.toUpperCase()}
                      </span>
                    </div>
                    <div className="cust-card-grid">
                      <div><strong>Created:</strong> {inq.created_at ? inq.created_at.split('T')[0] : 'N/A'}</div>
                      <div><strong>Responder:</strong> {inq.admin_responder || 'Unassigned'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="cust-modal-footer">
          <button type="button" className="cust-btn-close" onClick={onClose}>
            Close Archive
          </button>
        </div>
      </div>
    </div>
  )
}

export default CustomerArchiveModal
