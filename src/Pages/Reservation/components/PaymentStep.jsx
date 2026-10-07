import { useState } from 'react'

function PaymentStep({
  selectedPackage,
  selectedDate,
  formData,
  priceCalculation,
  onBack,
  onConfirmBooking,
  isSubmitting,
}) {
  const [referenceNumber, setReferenceNumber] = useState('')
  const [hasConfirmedPaid, setHasConfirmedPaid] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handlePaySubmit = (e) => {
    e.preventDefault()
    if (!referenceNumber.trim()) {
      setErrorMsg('Please enter your 13-digit GCash Transaction / Reference Number.')
      return
    }
    if (!hasConfirmedPaid) {
      setErrorMsg('Please check the confirmation box indicating you sent the GCash payment.')
      return
    }
    setErrorMsg('')
    onConfirmBooking({
      referenceNumber: referenceNumber.trim(),
      hasPaidReservation: true,
      hasPaidSecDep: true,
    })
  }

  return (
    <div className="resv-payment-step-wrapper">
      <div className="resv-header-section">
        <span className="resv-step-badge">Step 4 of 4</span>
        <h2 className="resv-section-title">GCash Payment & Confirmation</h2>
        <p className="resv-section-subtitle">
          Complete your reservation deposit via GCash and provide the transaction reference number below.
        </p>
      </div>

      <div className="resv-payment-layout-grid">
        {/* Left Column: GCash Instructions & Card */}
        <div className="resv-gcash-card">
          <div className="resv-gcash-header">
            <div className="resv-gcash-logo-pill">GCash</div>
            <span className="resv-gcash-secure-tag">Official Merchant Account</span>
          </div>

          <div className="resv-gcash-body">
            <div className="resv-gcash-account-box">
              <div className="resv-gcash-account-row">
                <span className="resv-gcash-label">Account Name:</span>
                <span className="resv-gcash-value">PolChat Garden Resort (Sarah P.)</span>
              </div>
              <div className="resv-gcash-account-row">
                <span className="resv-gcash-label">GCash Mobile Number:</span>
                <span className="resv-gcash-value resv-gcash-highlight">0917 888 9999</span>
              </div>
              <div className="resv-gcash-account-row">
                <span className="resv-gcash-label">Total Amount to Pay:</span>
                <span className="resv-gcash-amount">₱{priceCalculation.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="resv-payment-instructions">
              <h4 className="resv-instructions-title">How to complete payment:</h4>
              <ol className="resv-instructions-list">
                <li>Open your <strong>GCash App</strong> and tap <strong>Send Money / Express Send</strong>.</li>
                <li>Enter recipient number <strong>0917 888 9999</strong> and exact amount <strong>₱{priceCalculation.totalAmount.toLocaleString()}</strong>.</li>
                <li>Copy the <strong>13-digit Reference Number</strong> from your GCash receipt SMS or confirmation screen.</li>
                <li>Paste the Reference Number below and submit your reservation.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Right Column: Reference Input & Submission Form */}
        <div className="resv-payment-form-card">
          <h3 className="resv-payment-form-title">Payment Verification</h3>

          <form onSubmit={handlePaySubmit}>
            {errorMsg && (
              <div className="resv-payment-alert-error">
                {errorMsg}
              </div>
            )}

            <div className="resv-input-group">
              <label className="resv-input-label" htmlFor="gcashRef">
                GCash Reference / Transaction No. <span className="resv-req-star">*</span>
              </label>
              <input
                id="gcashRef"
                type="text"
                required
                className="resv-text-input resv-ref-input"
                placeholder="e.g. 1002 8493 0291"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
              />
              <span className="resv-field-note">
                Found on your GCash transaction confirmation slip (13 digits).
              </span>
            </div>

            <div className="resv-confirmation-checkbox-group">
              <label className="resv-checkbox-label">
                <input
                  type="checkbox"
                  className="resv-checkbox-input"
                  checked={hasConfirmedPaid}
                  onChange={(e) => setHasConfirmedPaid(e.target.checked)}
                />
                <span className="resv-checkbox-text">
                  I confirm that I have sent <strong>₱{priceCalculation.totalAmount.toLocaleString()}</strong> to PolChat Garden Resort and the reference number above is accurate.
                </span>
              </label>
            </div>

            <div className="resv-order-quick-summary">
              <div className="resv-quick-row">
                <span>Guest:</span>
                <strong>{formData.firstName} {formData.lastName}</strong>
              </div>
              <div className="resv-quick-row">
                <span>Schedule:</span>
                <strong>{new Date(selectedDate + 'T00:00:00').toLocaleDateString()} ({selectedPackage.duration_name})</strong>
              </div>
              <div className="resv-quick-row">
                <span>Total Pax:</span>
                <strong>{formData.guestCount} Guests</strong>
              </div>
            </div>

            <div className="resv-payment-actions">
              <button
                type="button"
                className="resv-back-btn"
                onClick={onBack}
                disabled={isSubmitting}
              >
                ← Back to Details
              </button>
              <button
                type="submit"
                className="resv-confirm-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="resv-spinner-label">Submitting to Resort...</span>
                ) : (
                  'Confirm & Submit Reservation ✓'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PaymentStep
