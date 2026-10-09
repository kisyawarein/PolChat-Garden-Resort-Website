function BookingForm({
  selectedPackage,
  selectedDate,
  formData,
  setFormData,
  priceCalculation,
  onBack,
  onNext,
}) {
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleGuestCountChange = (delta) => {
    const current = Number(formData.guestCount) || 1
    const updated = Math.max(1, Math.min(100, current + delta))
    setFormData((prev) => ({
      ...prev,
      guestCount: updated,
    }))
  }

  const handleExtensionHoursChange = (delta) => {
    const current = Number(formData.extensionHours) || 0
    const updated = Math.max(0, Math.min(6, current + delta))
    setFormData((prev) => ({
      ...prev,
      extensionHours: updated,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.phoneNumber.trim()) {
      alert('Please fill in your First Name, Last Name, and Phone Number.')
      return
    }
    onNext()
  }

  // Format Start & End Timestamps
  const getTimestamps = () => {
    if (!selectedDate) return { start: 'N/A', end: 'N/A' }
    const startTimeStr = selectedPackage?.duration_start || '09:00:00'
    const endTimeStr = selectedPackage?.duration_end || '17:00:00'

    const startDate = new Date(`${selectedDate}T${startTimeStr}`)
    let endDate = new Date(`${selectedDate}T${endTimeStr}`)
    if (selectedPackage?.duration_id === 2 || selectedPackage?.duration_id === 3 || selectedPackage?.duration_id === 4) {
      endDate.setDate(endDate.getDate() + 1)
    }

    const formatOpts = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }

    return {
      start: startDate.toLocaleString('en-US', formatOpts),
      end: endDate.toLocaleString('en-US', formatOpts),
    }
  }

  const timestamps = getTimestamps()
  const cleanPackageName = (selectedPackage?.duration_name || 'Resort Package').replace(/_/g, ' ')

  return (
    <div className="resv-form-step-wrapper">
      <div className="resv-header-section">
        <h2 className="resv-section-title">Guest Details & Booking Options</h2>
        <p className="resv-section-subtitle">
          Please provide your contact information and guest headcount. Rates calculate automatically.
        </p>
      </div>

      <form className="resv-form-layout-grid" onSubmit={handleSubmit}>
        {/* Left Column: Form Fields */}
        <div className="resv-booking-form">
          <div className="resv-form-section-title">Personal & Contact Info</div>

          <div className="resv-form-row-2col">
            <div className="resv-input-group">
              <label className="resv-input-label" htmlFor="firstName">
                First Name <span className="resv-req-star">*</span>
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="resv-text-input"
                placeholder="Juan"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>

            <div className="resv-input-group">
              <label className="resv-input-label" htmlFor="lastName">
                Last Name <span className="resv-req-star">*</span>
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                className="resv-text-input"
                placeholder="Dela Cruz"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="resv-form-row-2col">
            <div className="resv-input-group">
              <label className="resv-input-label" htmlFor="companyName">
                Company / Organization (Optional)
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                className="resv-text-input"
                placeholder="e.g. Acme Corp / Smith Family"
                value={formData.companyName}
                onChange={handleChange}
              />
            </div>

            <div className="resv-input-group">
              <label className="resv-input-label" htmlFor="phoneNumber">
                Phone Number <span className="resv-req-star">*</span>
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                required
                className="resv-text-input"
                placeholder="09171234567"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="resv-form-section-title">Event & Capacity Setup</div>

          <div className="resv-form-row-2col">
            {/* Left Col: Event Field (Rate always visible) */}
            <div className="resv-input-group">
              <div className="resv-event-label-row">
                <label className="resv-input-label" htmlFor="eventName">
                  Event / Occasion Name
                </label>
                <label className="resv-event-checkbox-label">
                  <input
                    type="checkbox"
                    className="resv-event-checkbox-input"
                    checked={Boolean(formData.isEvent || formData.eventName)}
                    onChange={(e) => {
                      const checked = e.target.checked
                      setFormData((prev) => ({
                        ...prev,
                        isEvent: checked,
                        eventName: checked ? (prev.eventName || 'Private Event') : '',
                      }))
                    }}
                  />
                  <span>Event</span>
                </label>
              </div>
              <input
                id="eventName"
                name="eventName"
                type="text"
                disabled={!Boolean(formData.isEvent || formData.eventName)}
                className={`resv-text-input ${!Boolean(formData.isEvent || formData.eventName) ? 'resv-input-disabled' : ''}`}
                placeholder={Boolean(formData.isEvent || formData.eventName) ? "e.g. Birthday, Team Building, Vacation" : "Check 'Event' to enable"}
                value={formData.eventName}
                onChange={handleChange}
              />
              <span className="resv-field-note">
                Event charge: ₱{(selectedPackage?.duration_event_rate || 2000).toLocaleString()}
              </span>
            </div>

            {/* Right Col: Number of Guests + Extensions Stacked Below */}
            <div className="resv-capacity-stack">
              <div className="resv-input-group">
                <label className="resv-input-label">
                  Number of Guests <span className="resv-req-star">*</span>
                </label>
                <div className="resv-counter-control">
                  <button
                    type="button"
                    className="resv-counter-btn"
                    onClick={() => handleGuestCountChange(-1)}
                    disabled={formData.guestCount <= 1}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="150"
                    name="guestCount"
                    className="resv-counter-input"
                    value={formData.guestCount}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="resv-counter-btn"
                    onClick={() => handleGuestCountChange(1)}
                  >
                    +
                  </button>
                </div>
                <div className="resv-guest-note-row">
                  <span className="resv-field-note">
                    Extra guests: ₱{selectedPackage?.duration_extra_pax_charge ?? 200} Per head
                  </span>
                  <span className="resv-field-max-pax">
                    Max Pax: {selectedPackage?.max_pax ?? 0}
                  </span>
                </div>
              </div>

              {/* Extension Hours directly below Number of Guests */}
              <div className="resv-input-group" style={{ marginTop: '14px' }}>
                <label className="resv-input-label">
                  Extension Hours (Optional)
                </label>
                <div className="resv-counter-control">
                  <button
                    type="button"
                    className="resv-counter-btn"
                    onClick={() => handleExtensionHoursChange(-1)}
                    disabled={formData.extensionHours <= 0}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="0"
                    max="6"
                    name="extensionHours"
                    className="resv-counter-input"
                    value={formData.extensionHours}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="resv-counter-btn"
                    onClick={() => handleExtensionHoursChange(1)}
                    disabled={formData.extensionHours >= 6}
                  >
                    +
                  </button>
                </div>
                <span className="resv-field-note">
                  Extension charge: ₱{selectedPackage?.duration_extension_charge || 700} per hour.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Price Summary Card + Special Requests + Action Buttons */}
        <div className="resv-summary-sidebar">
          <div className="resv-summary-card">
            <h3 className="resv-summary-header">Reservation Summary</h3>

            <div className="resv-summary-block">
              <span className="resv-summary-label">Package:</span>
              <span className="resv-summary-value">{cleanPackageName}</span>
            </div>

            <div className="resv-summary-block">
              <span className="resv-summary-label">Start Timestamp:</span>
              <span className="resv-summary-value">{timestamps.start}</span>
            </div>

            <div className="resv-summary-block">
              <span className="resv-summary-label">End Timestamp:</span>
              <span className="resv-summary-value">{timestamps.end}</span>
            </div>

            <div className="resv-summary-divider" />

            {/* Price Calculations */}
            <div className="resv-calc-item">
              <span className="resv-calc-item-label">Package Base Price:</span>
              <span className="resv-calc-item-value">₱{priceCalculation.basePrice.toLocaleString()}</span>
            </div>

            {priceCalculation.extraPaxCharge > 0 && (
              <div className="resv-calc-item">
                <span className="resv-calc-item-label">
                  Extra Guests ({priceCalculation.extraPaxCount} × ₱{selectedPackage?.duration_extra_pax_charge || 200}):
                </span>
                <span className="resv-calc-item-value">₱{priceCalculation.extraPaxCharge.toLocaleString()}</span>
              </div>
            )}

            {priceCalculation.extensionCharge > 0 && (
              <div className="resv-calc-item">
                <span className="resv-calc-item-label">
                  Extension ({formData.extensionHours}h × ₱{selectedPackage?.duration_extension_charge || 700}):
                </span>
                <span className="resv-calc-item-value">₱{priceCalculation.extensionCharge.toLocaleString()}</span>
              </div>
            )}

            {priceCalculation.eventCharge > 0 && (
              <div className="resv-calc-item">
                <span className="resv-calc-item-label">
                  Event / Occasion Charge:
                </span>
                <span className="resv-calc-item-value">₱{priceCalculation.eventCharge.toLocaleString()}</span>
              </div>
            )}

            <div className="resv-calc-item">
              <span className="resv-calc-item-label">
                Security Deposit (Refundable):
              </span>
              <span className="resv-calc-item-value">₱{priceCalculation.securityDeposit.toLocaleString()}</span>
            </div>

            <div className="resv-summary-total-block">
              <span className="resv-total-label">Total Payable Amount:</span>
              <span className="resv-total-amount">₱{priceCalculation.totalAmount.toLocaleString()}</span>
            </div>

            {/* Special Requests or Notes (Optional) moved here inside summary */}
            <div className="resv-summary-notes-block">
              <label className="resv-input-label" htmlFor="specialNotes">
                Special Requests or Notes (Optional)
              </label>
              <textarea
                id="specialNotes"
                name="specialNotes"
                rows={2}
                className="resv-summary-notes-textarea"
                placeholder="e.g. Early luggage drop-off, catering setup"
                value={formData.specialNotes}
                onChange={handleChange}
              />
            </div>

            <div className="resv-summary-guarantee">
              <span className="resv-guarantee-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#43593B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </span>
              <span className="resv-guarantee-text">
                Your ₱2,000 security deposit is 100% refundable upon checkout with no property damages.
              </span>
            </div>

            {/* Action Buttons below Reservation Summary Container: Next to each other */}
            <div className="resv-summary-actions-row">
              <button
                type="button"
                className="resv-back-btn"
                onClick={onBack}
              >
                Back to Calendar
              </button>
              <button
                type="submit"
                className="resv-continue-btn"
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default BookingForm
