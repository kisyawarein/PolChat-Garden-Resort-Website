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
  const isCash = paymentDetails?.paymentMethod === 'cash' || reservation?.payment_type === 'cash'
  const bookingDateStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const downpayment = paymentDetails?.downpaymentAmount || reservation?.downpayment_amount || Math.round((priceCalculation.totalAmount || 0) * 0.5)
  const remainingBalance = paymentDetails?.remainingBalance !== undefined ? paymentDetails.remainingBalance : (priceCalculation.totalAmount - downpayment)

  return (
    <div className="resv-receipt-step-wrapper">
      <div className="resv-success-banner">
        <div className="resv-success-icon-badge">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="resv-success-title">
          {isCash ? 'Cash Reservation Placed!' : 'Reservation Successfully Placed!'}
        </h2>
        <p className="resv-success-subtext">
          {isCash
            ? 'Your reservation has been recorded. Please save or print this official slip and present it to the resort front desk reception today to pay your 50% downpayment.'
            : 'Thank you for reserving your stay with PolChat Garden Resort. Your booking and GCash payment proof have been recorded directly into our system.'}
        </p>
      </div>

      {/* Official Printable Receipt Card */}
      <div className="resv-receipt-document" id="resv-printable-slip">
        {/* Receipt Header */}
        <div className="resv-receipt-doc-header">
          <div>
            <h1 className="resv-receipt-resort-title">PolChat Garden Resort</h1>
            <p className="resv-receipt-resort-sub">PolChat Garden, 346 Monaco Street Antipolo Calabarzon</p>
            <p className="resv-receipt-resort-sub">Contact: 0953 495 4389 • polchat2k20@gmail.com</p>
          </div>
          <div className="resv-receipt-id-box">
            <span className="resv-receipt-id-label">OFFICIAL RESERVATION SLIP</span>
            <span className="resv-receipt-id-number">RES-#{resId}</span>
            <span className={`resv-receipt-status-badge ${isCash ? 'badge-cash-pending' : ''}`}>
              {isCash ? 'PAY CASH AT DESK TODAY' : 'PENDING REVIEW'}
            </span>
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
              <span className="resv-receipt-val">{(selectedPackage?.duration_name || '').replace(/_/g, ' ')}</span>
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
              <td>{(selectedPackage?.duration_name || '').replace(/_/g, ' ')} ({selectedPackage?.duration_hours}h)</td>
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
            {priceCalculation.eventCharge > 0 && (
              <tr>
                <td>Event / Occasion Charge</td>
                <td>1 Event</td>
                <td className="resv-td-num">₱{priceCalculation.eventCharge.toLocaleString()}</td>
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
              <td colSpan="2" className="resv-tfoot-label">TOTAL BOOKING COST:</td>
              <td className="resv-tfoot-amount">₱{priceCalculation.totalAmount.toLocaleString()}</td>
            </tr>
            <tr className="resv-tfoot-sub-row">
              <td colSpan="2" className="resv-tfoot-label">
                {isCash ? '50% DOWNPAYMENT DUE TODAY (CASH):' : '50% DOWNPAYMENT PAID (GCASH):'}
              </td>
              <td className="resv-tfoot-amount" style={{ color: isCash ? '#92400E' : '#386B06' }}>
                ₱{downpayment.toLocaleString()}
              </td>
            </tr>
            <tr className="resv-tfoot-sub-row">
              <td colSpan="2" className="resv-tfoot-label">REMAINING BALANCE ON CHECKOUT:</td>
              <td className="resv-tfoot-amount">₱{remainingBalance.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        {/* Payment Verification Footnote */}
        <div className="resv-receipt-payment-note">
          <div className="resv-receipt-note-row">
            <span>Payment Mode: <strong>{isCash ? 'Cash at Front Desk' : 'GCash Online Transfer'}</strong></span>
            <span>
              Status: <strong className={isCash ? 'resv-proof-cash-tag' : 'resv-proof-verified-tag'}>
                {isCash ? 'Pay 50% Deposit Today at Desk' : 'Screenshot Attached & Verified'}
              </strong>
            </span>
          </div>
          <p className="resv-receipt-terms">
            {isCash
              ? '* Please present this printed slip or digital screenshot to the front desk reception upon your arrival today. Cash payment of 50% downpayment is required today to avoid automatic cancellation.'
              : '* Please present this printed slip or digital confirmation upon arrival at PolChat Garden Resort. Resort check-in policy applies. The ₱2,000 security deposit is refundable upon checkout inspection.'}
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
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          Download / Print Slip
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
