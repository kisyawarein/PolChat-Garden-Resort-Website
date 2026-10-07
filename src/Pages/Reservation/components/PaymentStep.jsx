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
  const [paymentProofFile, setPaymentProofFile] = useState(null)
  const [paymentProofPreview, setPaymentProofPreview] = useState(null)
  const [hasConfirmedPaid, setHasConfirmedPaid] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = (file) => {
    if (!file) return

    // Verify it's an image
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (PNG, JPG, JPEG, WEBP).')
      return
    }

    // Limit to 10MB
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
    if (!paymentProofFile && !paymentProofPreview) {
      setErrorMsg('Please attach a screenshot or photo of your GCash payment receipt.')
      return
    }
    if (!hasConfirmedPaid) {
      setErrorMsg('Please check the confirmation box indicating you completed the payment transfer.')
      return
    }
    setErrorMsg('')
    onConfirmBooking({
      paymentProofFile: paymentProofFile,
      paymentProofPreview: paymentProofPreview,
      hasPaidReservation: true,
      hasPaidSecDep: true,
    })
  }

  return (
    <div className="resv-payment-step-wrapper">
      <div className="resv-header-section">
        <span className="resv-step-badge">Step 4 of 4</span>
        <h2 className="resv-section-title">GCash Payment & Proof Upload</h2>
        <p className="resv-section-subtitle">
          Complete your reservation deposit via GCash and upload a photo or screenshot of your receipt.
        </p>
      </div>

      <div className="resv-payment-layout-grid">
        {/* Left Column: GCash Instructions & Account Card */}
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
                <li>Take a <strong>screenshot or photo</strong> of your completed GCash transaction screen.</li>
                <li>Upload the photo on the right to verify and secure your reservation.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Right Column: Photo Upload Form */}
        <div className="resv-payment-form-card">
          <h3 className="resv-payment-form-title">Upload Payment Proof</h3>

          <form onSubmit={handlePaySubmit}>
            {errorMsg && (
              <div className="resv-payment-alert-error">
                {errorMsg}
              </div>
            )}

            {/* Photo Upload Zone */}
            <div className="resv-photo-upload-section">
              <label className="resv-input-label">
                Receipt Screenshot / Photo <span className="resv-req-star">*</span>
              </label>

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
                    <span className="resv-upload-primary-text">Click or drag & drop to upload photo</span>
                    <span className="resv-upload-sub-text">Supports PNG, JPG, JPEG, WEBP (Max 10MB)</span>
                  </div>
                </div>
              ) : (
                <div className="resv-photo-preview-card">
                  <div className="resv-photo-preview-img-wrap">
                    <img
                      src={paymentProofPreview}
                      alt="GCash Payment Proof"
                      className="resv-photo-preview-img"
                    />
                  </div>
                  <div className="resv-photo-preview-meta">
                    <div className="resv-photo-file-info">
                      <span className="resv-photo-file-name">
                        {paymentProofFile?.name || 'payment_proof_receipt.jpg'}
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
            </div>

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
                  I confirm that I have sent <strong>₱{priceCalculation.totalAmount.toLocaleString()}</strong> to PolChat Garden Resort and the attached receipt photo is genuine.
                </span>
              </label>
            </div>

            {/* Quick Order Summary */}
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

            {/* Actions */}
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
                  <span className="resv-spinner-label">Uploading & Submitting...</span>
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
