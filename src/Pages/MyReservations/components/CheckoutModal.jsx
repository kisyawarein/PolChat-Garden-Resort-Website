import { useState, useRef } from 'react'
import { DataService } from '../../../services/dataService'

export default function CheckoutModal({
  reservation,
  onClose,
  onCheckoutSuccess,
}) {
  const [checkoutMode, setCheckoutMode] = useState('gcash') // 'gcash' | 'cash'
  const [proofFile, setProofFile] = useState(null)
  const [proofPreview, setProofPreview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const fileInputRef = useRef(null)

  const totalAmount = (reservation?.reservation_cost || 0) + (reservation?.extra_charges || 0)
  const downpayment = reservation?.downpayment_amount || Math.round(totalAmount * 0.5)
  const balanceDue = reservation?.remaining_balance ?? (totalAmount - downpayment)

  const handleFileChange = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (PNG, JPG, JPEG).')
      return
    }
    setErrorMsg('')
    setProofFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setProofPreview(e.target.result)
    reader.readAsDataURL(file)
  }

  const handleCompleteCheckout = async (e) => {
    e.preventDefault()
    if (checkoutMode === 'gcash' && !proofFile && !proofPreview) {
      setErrorMsg('Please attach proof photo of your remaining GCash balance settlement.')
      return
    }

    setIsSubmitting(true)
    setErrorMsg('')

    let finalProofUrl = proofPreview || null
    if (proofFile) {
      const uploaded = await DataService.uploadPaymentProof(proofFile)
      if (uploaded) finalProofUrl = uploaded
    }

    const updated = await DataService.checkoutReservation(reservation.reservation_id, {
      checkout_payment_type: checkoutMode,
      checkout_proof_url: finalProofUrl,
    })

    setIsSubmitting(false)
    if (updated) {
      onCheckoutSuccess(updated)
      onClose()
    } else {
      setErrorMsg('Failed to complete checkout. Please check connection and try again.')
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog-card myres-checkout-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-card-header">
          <div className="myres-checkout-header-titles">
            <span className="myres-checkout-badge">CHECKOUT SETTLEMENT</span>
            <h3 className="modal-card-title">Settle Balance & Check Out</h3>
          </div>
          <button type="button" className="modal-close-x" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-card-body myres-checkout-body">
          {/* Reservation Breakdown */}
          <div className="myres-checkout-summary-card">
            <div className="myres-checkout-row">
              <span>Booking Reference:</span>
              <strong>RES-#{reservation.reservation_id} ({reservation.event_name || 'Resort Stay'})</strong>
            </div>
            <div className="myres-checkout-row">
              <span>Total Booking Cost:</span>
              <span>₱{totalAmount.toLocaleString()}</span>
            </div>
            <div className="myres-checkout-row">
              <span>50% Downpayment (Already Paid):</span>
              <span className="myres-paid-text">✓ ₱{downpayment.toLocaleString()}</span>
            </div>
            <div className="myres-checkout-row myres-checkout-balance-row">
              <span>Final Remaining Balance Due:</span>
              <strong className="myres-checkout-due-amount">₱{balanceDue.toLocaleString()}</strong>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="myres-checkout-tabs">
            <button
              type="button"
              className={`myres-co-tab-btn ${checkoutMode === 'gcash' ? 'myres-co-tab-active' : ''}`}
              onClick={() => {
                setCheckoutMode('gcash')
                setErrorMsg('')
              }}
            >
              📱 GCash Online
            </button>
            <button
              type="button"
              className={`myres-co-tab-btn ${checkoutMode === 'cash' ? 'myres-co-tab-active' : ''}`}
              onClick={() => {
                setCheckoutMode('cash')
                setErrorMsg('')
              }}
            >
              💵 Cash at Front Desk
            </button>
          </div>

          {errorMsg && (
            <div className="resv-payment-alert-error">
              {errorMsg}
            </div>
          )}

          {checkoutMode === 'gcash' ? (
            <div className="myres-co-gcash-box">
              <div className="myres-co-account-info">
                <div>
                  <span className="myres-co-info-label">GCash Account Name:</span>
                  <strong>PolChat Garden Resort (Admin)</strong>
                </div>
                <div>
                  <span className="myres-co-info-label">GCash Number:</span>
                  <strong className="myres-co-highlight">0953 495 4389</strong>
                </div>
                <div>
                  <span className="myres-co-info-label">Amount to Send:</span>
                  <strong className="myres-co-highlight">₱{balanceDue.toLocaleString()}</strong>
                </div>
              </div>

              {/* Photo Upload */}
              <div className="myres-co-upload-wrap">
                <label className="resv-input-label">
                  Remaining Balance Payment Screenshot <span className="resv-req-star">*</span>
                </label>
                {!proofPreview ? (
                  <div
                    className="resv-upload-dropzone myres-co-dropzone"
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
                    <div className="resv-upload-text-group">
                      <span className="resv-upload-primary-text">Click to upload GCash receipt</span>
                      <span className="resv-upload-sub-text">PNG, JPG, JPEG</span>
                    </div>
                  </div>
                ) : (
                  <div className="resv-photo-preview-card myres-co-preview-card">
                    <img src={proofPreview} alt="Receipt" className="myres-co-preview-thumb" />
                    <button
                      type="button"
                      className="resv-photo-change-btn"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change Photo
                    </button>
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
            </div>
          ) : (
            <div className="myres-co-cash-box">
              <div className="myres-co-cash-notice">
                <span className="myres-co-cash-icon">💵</span>
                <div>
                  <h4 className="myres-co-cash-title">Cash Settlement at Reception</h4>
                  <p className="myres-co-cash-text">
                    Please hand over the remaining <strong>₱{balanceDue.toLocaleString()}</strong> in cash to the resort front desk staff before final departure inspection.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-card-footer">
          <button type="button" className="modal-close-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="myres-confirm-checkout-btn"
            disabled={isSubmitting}
            onClick={handleCompleteCheckout}
          >
            {isSubmitting ? 'Processing Checkout...' : `Confirm & Settle ₱${balanceDue.toLocaleString()} ✓`}
          </button>
        </div>
      </div>
    </div>
  )
}
