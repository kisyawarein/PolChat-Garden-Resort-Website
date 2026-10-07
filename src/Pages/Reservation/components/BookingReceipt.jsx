function BookingReceipt({
  reservation,
  selectedPackage,
  formData,
  priceCalculation,
  paymentDetails,
  onReset,
}) {
  const handlePrint = () => {
    window.print()
  }

  const resId = reservation?.reservation_id || Date.now().toString().slice(-6)
  const bookingDateStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="resv-receipt-step-wrapper">
      <div className="resv-success-banner">
        <div className="resv-success-icon-badge">✓</div>
        <h2 className="resv-success-title">Reservation Successfully Placed!</h2>
        <p className="resv-success-subtext">
          Thank you for reserving your stay with PolChat Garden Resort. Your booking has been recorded directly into our system and sent to the resort administration for review and approval.
        </p>
      </div>

      {/* Official Printable Receipt Card */}
      <div className="resv-receipt-document" id="resv-printable-slip">
        {/* Receipt Header */}
        <div className="resv-receipt-doc-header">
          <div>
            <h1 className="resv-receipt-resort-title">PolChat Garden Resort</h1>
            <p className="resv-receipt-resort-sub">Private Resort & Event Venue • Bulacan, Philippines</p>
            <p className="resv-receipt-resort-sub">Contact: 0917-888-9999 • bookings@polchatresort.com</p>
          </div>
          <div className="resv-receipt-id-box">
            <span className="resv-receipt-id-label">OFFICIAL RESERVATION SLIP</span>
            <span className="resv-receipt-id-number">RES-#{resId}</span>
            <span className="resv-receipt-status-badge">PENDING REVIEW</span>
          </div>
        </div>

        <div className="resv-receipt-hr" />

        {/* Guest & Schedule Info */}
        <div className="resv-receipt-info-grid">
          <div className="resv-receipt-col">
            <span className="resv-receipt-field-title">GUEST INFORMATION</span>
            <div className="resv-receipt-field-row">
              <span className="resv-receipt-label">Guest Name:</span>
              <span className="resv-receipt-val">{formData.firstName} {formData.lastName}</span>
            </div>
            {formData.companyName && (
              <div className="resv-receipt-field-row">
                <span className="resv-receipt-label">Company:</span>
                <span className="resv-receipt-val">{formData.companyName}</span>
              </div>
            )}
            <div className="resv-receipt-field-row">
              <span className="resv-receipt-label">Contact No:</span>
              <span className="resv-receipt-val">{formData.phoneNumber}</span>
            </div>
            <div className="resv-receipt-field-row">
              <span className="resv-receipt-label">Booking Date:</span>
              <span className="resv-receipt-val">{bookingDateStr}</span>
            </div>
          </div>

          <div className="resv-receipt-col">
            <span className="resv-receipt-field-title">RESERVATION SCHEDULE</span>
            <div className="resv-receipt-field-row">
              <span className="resv-receipt-label">Package:</span>
              <span className="resv-receipt-val">{selectedPackage?.duration_name}</span>
            </div>
            <div className="resv-receipt-field-row">
              <span className="resv-receipt-label">Scheduled Date:</span>
              <span className="resv-receipt-val">{reservation?.start_date ? new Date(reservation.start_date).toLocaleDateString() : 'Confirmed Date'}</span>
            </div>
            <div className="resv-receipt-field-row">
              <span className="resv-receipt-label">Guest Count:</span>
              <span className="resv-receipt-val">{formData.guestCount} Pax</span>
            </div>
            <div className="resv-receipt-field-row">
              <span className="resv-receipt-label">Event:</span>
              <span className="resv-receipt-val">{formData.eventName || 'Resort Stay'}</span>
            </div>
          </div>
        </div>

        <div className="resv-receipt-hr" />

        {/* Financial Breakdown Table */}
        <table className="resv-receipt-table">
          <thead>
            <tr>
              <th className="resv-th-desc">Description / Item</th>
              <th className="resv-th-qty">Qty / Unit</th>
              <th className="resv-th-amount">Amount (PHP)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{selectedPackage?.duration_name} ({selectedPackage?.duration_hours}h)</td>
              <td>1 Session</td>
              <td className="resv-td-num">₱{priceCalculation.basePrice.toLocaleString()}</td>
            </tr>
            {priceCalculation.extraPaxCharge > 0 && (
              <tr>
                <td>Extra Guest Headcount Charge (Exceeding max capacity)</td>
                <td>{priceCalculation.extraPaxCount} Pax</td>
                <td className="resv-td-num">₱{priceCalculation.extraPaxCharge.toLocaleString()}</td>
              </tr>
            )}
            {priceCalculation.extensionCharge > 0 && (
              <tr>
                <td>Extended Stay Duration</td>
                <td>{formData.extensionHours} Hour(s)</td>
                <td className="resv-td-num">₱{priceCalculation.extensionCharge.toLocaleString()}</td>
              </tr>
            )}
            <tr>
              <td>Security Deposit (100% Refundable upon checkout)</td>
              <td>1 Deposit</td>
              <td className="resv-td-num">₱{priceCalculation.securityDeposit.toLocaleString()}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="resv-tfoot-total-row">
              <td colSpan="2" className="resv-tfoot-label">TOTAL PAID VIA GCASH:</td>
              <td className="resv-tfoot-amount">₱{priceCalculation.totalAmount.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        {/* Payment Verification Footnote */}
        <div className="resv-receipt-payment-note">
          <div className="resv-receipt-note-row">
            <span>Payment Method: <strong>GCash</strong></span>
            <span>GCash Ref No: <strong>{paymentDetails?.referenceNumber || 'N/A'}</strong></span>
          </div>
          <p className="resv-receipt-terms">
            * Please present this printed slip or digital confirmation upon arrival at PolChat Garden Resort. Resort check-in policy applies. The ₱2,000 security deposit will be handed back or refunded via GCash upon checkout inspection.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="resv-receipt-actions">
        <button
          type="button"
          className="resv-print-btn"
          onClick={handlePrint}
        >
          🖨️ Print / Save Receipt
        </button>
        <button
          type="button"
          className="resv-new-resv-btn"
          onClick={onReset}
        >
          Book Another Stay
        </button>
      </div>
    </div>
  )
}

export default BookingReceipt
