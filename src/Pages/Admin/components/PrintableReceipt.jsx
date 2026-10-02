function PrintableReceipt({ item, onClose }) {
  if (!item) return null

  const handlePrint = () => {
    window.print()
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
        return 'Resort Reservation'
    }
  }

  const basePrice = item.reservation_cost || 9000
  const extraCharges = item.extra_charges || 0
  const totalAmount = basePrice + extraCharges
  const secDepStatus = item.has_paid_sec_dep ? 'PAID (PHP 2,000)' : 'UNPAID (Due on check-in)'

  return (
    <div className="admin-receipt-overlay" onClick={onClose}>
      <div className="admin-receipt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-receipt-toolbar no-print">
          <button
            type="button"
            className="admin-receipt-action-btn admin-btn-print"
            onClick={handlePrint}
          >
            🖨️ Print Receipt / Save as PDF
          </button>
          <button
            type="button"
            className="admin-receipt-action-btn admin-btn-close-modal"
            onClick={onClose}
          >
            ✕ Close
          </button>
        </div>

        {/* Printable Paper Canvas */}
        <div className="admin-receipt-paper" id="printable-receipt-sheet">
          {/* Receipt Header */}
          <div className="admin-receipt-header">
            <h1 className="admin-receipt-resort-title">POLCHAT GARDEN RESORT</h1>
            <p className="admin-receipt-tagline">Your Serene Garden & Pool Escape</p>
            <p className="admin-receipt-address">Brgy. Garden Bliss, Philippines • Contact: 0917-888-POLCHAT</p>
            <div className="admin-receipt-divider" />
            <h2 className="admin-receipt-doc-title">OFFICIAL RESERVATION CONFIRMATION RECEIPT</h2>
            <div className="admin-receipt-meta-grid">
              <div>
                <strong>Receipt No:</strong> PGR-REC-{item.reservation_id}
              </div>
              <div>
                <strong>Date Issued:</strong> {new Date().toLocaleDateString()}
              </div>
              <div>
                <strong>Booking Status:</strong> {(item.reservation_status || 'CONFIRMED').toUpperCase()}
              </div>
              <div>
                <strong>Payment Ref:</strong> {item.payment_reference || 'GCASH-VERIFIED'}
              </div>
            </div>
          </div>

          {/* Customer & Event Details */}
          <div className="admin-receipt-section">
            <h3 className="admin-receipt-sec-title">GUEST & EVENT INFORMATION</h3>
            <div className="admin-receipt-info-table">
              <div className="admin-receipt-info-row">
                <span className="admin-receipt-info-label">Customer Name:</span>
                <span className="admin-receipt-info-val">{item.customer_name || `Customer #${item.customer_id}`}</span>
              </div>
              <div className="admin-receipt-info-row">
                <span className="admin-receipt-info-label">Contact Number:</span>
                <span className="admin-receipt-info-val">{item.customer_phone || '0917-xxx-xxxx'}</span>
              </div>
              <div className="admin-receipt-info-row">
                <span className="admin-receipt-info-label">Event / Occasion:</span>
                <span className="admin-receipt-info-val">{item.event_name || 'Private Gathering'}</span>
              </div>
              <div className="admin-receipt-info-row">
                <span className="admin-receipt-info-label">Package Reserved:</span>
                <span className="admin-receipt-info-val">{getPackageName(item.duration_id)}</span>
              </div>
              <div className="admin-receipt-info-row">
                <span className="admin-receipt-info-label">Scheduled Date:</span>
                <span className="admin-receipt-info-val">{item.start_date ? item.start_date.split('T')[0] : 'N/A'}</span>
              </div>
              <div className="admin-receipt-info-row">
                <span className="admin-receipt-info-label">Guest Count:</span>
                <span className="admin-receipt-info-val">{item.guest_count} Registered Guests</span>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown Table */}
          <div className="admin-receipt-section">
            <h3 className="admin-receipt-sec-title">PAYMENT BREAKDOWN</h3>
            <table className="admin-receipt-calc-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Rate Type</th>
                  <th style={{ textAlign: 'right' }}>Amount (PHP)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{getPackageName(item.duration_id)}</td>
                  <td>Base Package</td>
                  <td style={{ textAlign: 'right' }}>PHP {basePrice.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>Security Deposit (Refundable upon checkout)</td>
                  <td>Fixed Deposit</td>
                  <td style={{ textAlign: 'right' }}>{secDepStatus}</td>
                </tr>
                {extraCharges > 0 && (
                  <tr>
                    <td>Additional Pax / Hourly Extension Fee</td>
                    <td>Extra Surcharge</td>
                    <td style={{ textAlign: 'right' }}>PHP {extraCharges.toLocaleString()}</td>
                  </tr>
                )}
                <tr className="admin-receipt-total-row">
                  <td colSpan="2">
                    <strong>TOTAL RESERVATION AMOUNT</strong>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <strong>PHP {totalAmount.toLocaleString()}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Gate Verification & Instructions */}
          <div className="admin-receipt-footer">
            <h4 className="admin-receipt-note-heading">IMPORTANT RESORT REMINDERS:</h4>
            <ul className="admin-receipt-notes-list">
              <li>Please present this printed receipt or digital copy at the entrance gate upon arrival.</li>
              <li>Exceeding pax charge: PHP 200 per head exceeding package limit.</li>
              <li>Extension fee: PHP 700 - PHP 800 per hour (subject to availability).</li>
              <li>Security deposit of PHP 2,000 is refundable after inspection during check-out.</li>
            </ul>

            <div className="admin-receipt-signature-row">
              <div className="admin-receipt-sign-box">
                <div className="admin-receipt-sign-line" />
                <span>Authorized Resort Staff Signature</span>
              </div>
              <div className="admin-receipt-sign-box">
                <div className="admin-receipt-sign-line" />
                <span>Guest Signature Upon Arrival</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrintableReceipt
