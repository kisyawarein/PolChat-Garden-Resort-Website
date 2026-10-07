import { useState, useRef } from 'react'

function PaymentStep({
  selectedPackage,
  selectedDate,
  formData,
  priceCalculation,
  onBack,
  onConfirmBooking,
  isSubmitting,
}) {
  const [paymentMethod, setPaymentMethod] = useState('gcash') // 'gcash' | 'cash'
  const [paymentProofFile, setPaymentProofFile] = useState(null)
  const [paymentProofPreview, setPaymentProofPreview] = useState(null)
  const [hasConfirmedPaid, setHasConfirmedPaid] = useState(false)
  const [hasConfirmedCashWarning, setHasConfirmedCashWarning] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  // 50% Downpayment calculation
  const totalCost = Number(priceCalculation.totalAmount || 0)
  const downpaymentAmount = Math.round(totalCost * 0.5)
  const remainingBalance = totalCost - downpaymentAmount

  const handleFileChange = (file) => {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (PNG, JPG, JPEG, WEBP).')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('The image size exceeds 10MB. Please choose a smaller file.')
      return
    }

    setErrorMsg('')
    setPaymentProofFile(file)

    const reader = new FileReader()
    reader.onload = (e) => {
      setPaymentProofPreview(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  const handleRemovePhoto = () => {
    setPaymentProofFile(null)
    setPaymentProofPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handlePaySubmit = (e) => {
    e.preventDefault()

    if (paymentMethod === 'gcash') {
      if (!paymentProofFile && !paymentProofPreview) {
        setErrorMsg('Please attach a screenshot or photo of your GCash 50% downpayment receipt.')
        return
      }
      if (!hasConfirmedPaid) {
        setErrorMsg('Please check the confirmation box indicating you completed the downpayment transfer.')
        return
      }
    } else {
      // Cash payment method
      if (!hasConfirmedCashWarning) {
        setErrorMsg('Please acknowledge the cash payment policy that you must pay today at the resort desk to avoid cancellation.')
        return
      }
    }

    setErrorMsg('')
    onConfirmBooking({
      paymentMethod,
      paymentProofFile: paymentMethod === 'gcash' ? paymentProofFile : null,
      paymentProofPreview: paymentMethod === 'gcash' ? paymentProofPreview : null,
      hasPaidReservation: paymentMethod === 'gcash',
      hasPaidSecDep: false,
      downpaymentAmount,
      remainingBalance,
    })
  }

  // Check if confirmation button should be disabled
  const isConfirmDisabled =
    isSubmitting ||
    (paymentMethod === 'gcash'
      ? !hasConfirmedPaid || (!paymentProofFile && !paymentProofPreview)
      : !hasConfirmedCashWarning)

  return (
    <div className="resv-payment-step-wrapper">
      <div className="resv-header-section">
        <h2 className="resv-section-title">Reservation Deposit & Payment</h2>
      </div>

      {/* Switchable Payment Modes (Similar to Admin List/Calendar switch button) */}
      <div className="resv-mode-switcher-container">
        <div className="resv-mode-switcher-bar">
          <button
            type="button"
            className={`resv-mode-switch-btn ${paymentMethod === 'gcash' ? 'resv-mode-switch-btn-active' : ''}`}
            onClick={() => {
              setPaymentMethod('gcash')
              setErrorMsg('')
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
            <span>GCash</span>
          </button>
          <button
            type="button"
            className={`resv-mode-switch-btn ${paymentMethod === 'cash' ? 'resv-mode-switch-btn-active' : ''}`}
            onClick={() => {
              setPaymentMethod('cash')
              setErrorMsg('')
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <circle cx="12" cy="12" r="2" />
              <path d="M6 12h.01M18 12h.01" />
            </svg>
            <span>Cash</span>
          </button>
        </div>
      </div>

      <div className="resv-payment-layout-grid">
        {/* Left Column: Instructions / Warnings */}
        {paymentMethod === 'gcash' ? (
          <div className="resv-gcash-card">
            <div className="resv-gcash-body">
              {/* Payment Details List: Normal text, label left, value right */}
              <div className="resv-payment-plain-box">
                <div className="resv-payment-plain-row">
                  <span className="resv-plain-label">GCash Credentials:</span>
                  <span className="resv-plain-val">PolChat Garden Resort (Admin)</span>
                </div>
                <div className="resv-payment-plain-row">
                  <span className="resv-plain-label">GCash Mobile Number:</span>
                  <span className="resv-plain-val">0953 495 4389</span>
                </div>
                <div className="resv-payment-plain-row">
                  <span className="resv-plain-label">Downpayment:</span>
                  <span className="resv-plain-val">₱{downpaymentAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="resv-payment-instructions">
                <h4 className="resv-instructions-title">Instructions</h4>
                <ol className="resv-instructions-list">
                  <li>Open your GCash App and tap <strong>Send Money / Express Send</strong>.</li>
                  <li>Enter recipient number <strong>0953 495 4389</strong> and the downpayment: <strong>₱{downpaymentAmount.toLocaleString()}</strong>.</li>
                  <li>Take a screenshot or photo of your completed transaction receipt.</li>
                  <li>Upload the photo on the right to verify and complete your booking.</li>
                </ol>
              </div>
            </div>
          </div>
        ) : (
          <div className="resv-cash-card">
            <div className="resv-cash-body">
              {/* Cash Payment Details */}
              <div className="resv-payment-plain-box">
                <div className="resv-payment-plain-row">
                  <span className="resv-plain-label">Payment Mode:</span>
                  <span className="resv-plain-val">Cash on Desk</span>
                </div>
                <div className="resv-payment-plain-row">
                  <span className="resv-plain-label">Downpayment:</span>
                  <span className="resv-plain-val">₱{downpaymentAmount.toLocaleString()}</span>
                </div>
                <div className="resv-payment-plain-row">
                  <span className="resv-plain-label">Payment Deadline:</span>
                  <span className="resv-plain-val">Today (Before 10:00 PM)</span>
                </div>
              </div>

              <div className="resv-cash-warning-banner">
                <div className="resv-warning-icon-wrap">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#991b1b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div>
                  <h4 className="resv-warning-heading">PAYMENT DEADLINE: TODAY</h4>
                  <p className="resv-warning-desc">
                    You must pay the 50% downpayment of ₱{downpaymentAmount.toLocaleString()} in cash at the resort front desk today. If not paid today, your reservation will be cancelled.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Right Column: Submission Form */}
        <div className="resv-payment-form-card">
          <h3 className="resv-payment-form-title">
            {paymentMethod === 'gcash' ? 'Upload Payment Proof' : 'Confirm Cash Booking'}
          </h3>

          <form onSubmit={handlePaySubmit}>
            {errorMsg && (
              <div className="resv-payment-alert-error">
                {errorMsg}
              </div>
            )}

            {paymentMethod === 'gcash' ? (
              /* Photo Upload Zone (Without "GCash Downpayment Receipt" label above) */
              <div className="resv-photo-upload-section">
                {!paymentProofPreview ? (
                  <div
                    className={`resv-upload-dropzone ${isDragging ? 'resv-dropzone-dragging' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="resv-hidden-file-input"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileChange(e.target.files[0])
                        }
                      }}
                    />
                    <div className="resv-upload-icon-circle">
                      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#43593B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                    <div className="resv-upload-text-group">
                      <span className="resv-upload-primary-text">Click or drag & drop receipt photo</span>
                      <span className="resv-upload-sub-text">PNG, JPG, JPEG (Max 10MB)</span>
                    </div>
                  </div>
                ) : (
                  <div className="resv-photo-preview-card">
                    <div className="resv-photo-preview-img-wrap">
                      <img
                        src={paymentProofPreview}
                        alt="Payment Proof"
                        className="resv-photo-preview-img"
                      />
                    </div>
                    <div className="resv-photo-preview-meta">
                      <div className="resv-photo-file-info">
                        <span className="resv-photo-file-name">
                          {paymentProofFile?.name || 'receipt_proof.jpg'}
                        </span>
                        <span className="resv-photo-file-size">
                          {paymentProofFile ? `${(paymentProofFile.size / 1024).toFixed(1)} KB` : 'Ready'}
                        </span>
                      </div>
                      <div className="resv-photo-preview-actions">
                        <button
                          type="button"
                          className="resv-photo-change-btn"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Change Photo
                        </button>
                        <button
                          type="button"
                          className="resv-photo-remove-btn"
                          onClick={handleRemovePhoto}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="resv-hidden-file-input"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileChange(e.target.files[0])
                        }
                      }}
                    />
                  </div>
                )}

                {/* Confirmation Checkbox */}
                <div className="resv-confirmation-checkbox-group">
                  <label className="resv-checkbox-label">
                    <input
                      type="checkbox"
                      className="resv-checkbox-input"
                      checked={hasConfirmedPaid}
                      onChange={(e) => setHasConfirmedPaid(e.target.checked)}
                    />
                    <span className="resv-checkbox-text">
                      I confirm to have sent the downpayment to PolChat Garden Resort and have attached the photo
                    </span>
                  </label>
                </div>
              </div>
            ) : (
              /* Cash Confirmation Block */
              <div className="resv-cash-ack-block">
                <div className="resv-confirmation-checkbox-group">
                  <label className="resv-checkbox-label">
                    <input
                      type="checkbox"
                      className="resv-checkbox-input"
                      checked={hasConfirmedCashWarning}
                      onChange={(e) => setHasConfirmedCashWarning(e.target.checked)}
                    />
                    <span className="resv-checkbox-text">
                      I confirm that I will pay the 50% downpayment of ₱{downpaymentAmount.toLocaleString()} in cash at the resort front desk today
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Quick Order Summary */}
            <div className="resv-order-quick-summary">
              <div className="resv-quick-row">
                <span>Guest:</span>
                <strong>{formData.firstName} {formData.lastName}</strong>
              </div>
              <div className="resv-quick-row">
                <span>Schedule:</span>
                <strong>{new Date(selectedDate + 'T00:00:00').toLocaleDateString()} ({(selectedPackage?.duration_name || '').replace(/_/g, ' ')})</strong>
              </div>
              <div className="resv-quick-row">
                <span>Downpayment:</span>
                <strong className="resv-quick-amount">₱{downpaymentAmount.toLocaleString()}</strong>
              </div>
              <div className="resv-quick-row">
                <span>Payment Mode:</span>
                <strong>{paymentMethod === 'gcash' ? 'GCash' : 'Cash on Desk'}</strong>
              </div>
            </div>

            {/* Actions */}
            <div className="resv-payment-actions">
              <button
                type="button"
                className="resv-back-btn"
                onClick={onBack}
                disabled={isSubmitting}
              >
                Back to Details
              </button>
              <button
                type="submit"
                className="resv-confirm-btn"
                disabled={isConfirmDisabled}
              >
                {isSubmitting ? (
                  <span className="resv-spinner-label">Submitting Reservation...</span>
                ) : (
                  `Confirm ${paymentMethod === 'gcash' ? 'GCash' : 'Cash'} Booking`
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

