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
    <div className="receipt-modal-backdrop" onClick={onClose}>
      <div className="receipt-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="receipt-modal-toolbar no-print">
          <button
            type="button"
            className="receipt-print-btn"
            onClick={handlePrint}
          >
            🖨️ Print Receipt / PDF
          </button>
          <button
            type="button"
            className="receipt-close-btn"
            onClick={onClose}
          >
            ✕ Close
          </button>
        </div>

        {/* Printable Paper Canvas */}
        <div className="receipt-paper" id="printable-sheet">
          <div className="receipt-header">
            <h1 className="receipt-brand-title">POLCHAT GARDEN RESORT</h1>
            <p className="receipt-tagline">Your Serene Garden & Pool Escape</p>
            <p className="receipt-address">Brgy. Garden Bliss, Philippines • Contact: 0917-888-POLCHAT</p>
            <div className="receipt-divider" />
            <h2 className="receipt-doc-title">OFFICIAL RESERVATION CONFIRMATION RECEIPT</h2>
            <div className="receipt-meta-grid">
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

          <div className="receipt-section">
            <h3 className="receipt-section-title">GUEST & EVENT INFORMATION</h3>
            <div className="receipt-info-stack">
              <div className="receipt-info-row">
                <span className="receipt-info-label">Customer Name:</span>
                <span className="receipt-info-val">{item.customer_name || `Customer #${item.customer_id}`}</span>
              </div>
              <div className="receipt-info-row">
                <span className="receipt-info-label">Contact Number:</span>
                <span className="receipt-info-val">{item.customer_phone || '0917-xxx-xxxx'}</span>
              </div>
              <div className="receipt-info-row">
                <span className="receipt-info-label">Event / Occasion:</span>
                <span className="receipt-info-val">{item.event_name || 'Private Gathering'}</span>
              </div>
              <div className="receipt-info-row">
                <span className="receipt-info-label">Package Reserved:</span>
                <span className="receipt-info-val">{getPackageName(item.duration_id)}</span>
              </div>
              <div className="receipt-info-row">
                <span className="receipt-info-label">Scheduled Date:</span>
                <span className="receipt-info-val">{item.start_date ? item.start_date.split('T')[0] : 'N/A'}</span>
              </div>
              <div className="receipt-info-row">
                <span className="receipt-info-label">Guest Count:</span>
                <span className="receipt-info-val">{item.guest_count} Registered Guests</span>
              </div>
            </div>
          </div>

          <div className="receipt-section">
            <h3 className="receipt-section-title">PAYMENT BREAKDOWN</h3>
            <table className="receipt-breakdown-table">
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
                <tr className="receipt-total-row">
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

          <div className="receipt-footer">
            <h4 className="receipt-note-title">IMPORTANT RESORT REMINDERS:</h4>
            <ul className="receipt-note-list">
              <li>Please present this printed receipt or digital copy at the entrance gate upon arrival.</li>
              <li>Exceeding pax charge: PHP 200 per head exceeding package limit.</li>
              <li>Extension fee: PHP 700 - PHP 800 per hour (subject to availability).</li>
              <li>Security deposit of PHP 2,000 is refundable after inspection during check-out.</li>
            </ul>

            <div className="receipt-sign-row">
              <div className="receipt-sign-block">
                <div className="receipt-sign-line" />
                <span>Authorized Resort Staff</span>
              </div>
              <div className="receipt-sign-block">
                <div className="receipt-sign-line" />
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
