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

  return (
    <div className="resv-form-step-wrapper">
      <div className="resv-header-section">
        <span className="resv-step-badge">Step 3 of 4</span>
        <h2 className="resv-section-title">Guest Details & Booking Options</h2>
        <p className="resv-section-subtitle">
          Please provide your contact information and guest headcount. Rates calculate automatically.
        </p>
      </div>

      <div className="resv-form-layout-grid">
        {/* Left Column: Form Fields */}
        <form className="resv-booking-form" onSubmit={handleSubmit}>
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
            <div className="resv-input-group">
              <label className="resv-input-label" htmlFor="eventName">
                Event / Occasion Name <span className="resv-req-star">*</span>
              </label>
              <input
                id="eventName"
                name="eventName"
                type="text"
                required
                className="resv-text-input"
                placeholder="e.g. 30th Birthday, Team Building, Family Outing"
                value={formData.eventName}
                onChange={handleChange}
              />
            </div>

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
              <span className="resv-field-note">
                Base package covers up to {selectedPackage?.max_pax || 35} pax. Extra guests: ₱200/head.
              </span>
            </div>
          </div>

          <div className="resv-form-row-2col">
            <div className="resv-input-group">
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
                Rate: ₱{selectedPackage?.duration_extension_charge || 700}/hour.
              </span>
            </div>

            <div className="resv-input-group">
              <label className="resv-input-label" htmlFor="specialNotes">
                Special Requests or Notes (Optional)
              </label>
              <input
                id="specialNotes"
                name="specialNotes"
                type="text"
                className="resv-text-input"
                placeholder="e.g. Early luggage drop-off, catering setup"
                value={formData.specialNotes}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="resv-form-actions-bar">
            <button
              type="button"
              className="resv-back-btn"
              onClick={onBack}
            >
              ← Back to Calendar
            </button>
            <button
              type="submit"
              className="resv-continue-btn"
            >
              Proceed to GCash Payment →
            </button>
          </div>
        </form>

        {/* Right Column: Dynamic Price Summary Card */}
        <div className="resv-summary-sidebar">
          <div className="resv-summary-card">
            <h3 className="resv-summary-header">Reservation Summary</h3>

            <div className="resv-summary-block">
              <span className="resv-summary-label">Package:</span>
              <span className="resv-summary-value">{selectedPackage?.duration_name}</span>
            </div>

            <div className="resv-summary-block">
              <span className="resv-summary-label">Date:</span>
              <span className="resv-summary-value">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
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
                  Extra Guests ({priceCalculation.extraPaxCount} × ₱200):
                </span>
                <span className="resv-calc-item-value">₱{priceCalculation.extraPaxCharge.toLocaleString()}</span>
              </div>
            )}

            {priceCalculation.extensionCharge > 0 && (
              <div className="resv-calc-item">
                <span className="resv-calc-item-label">
                  Extension ({formData.extensionHours}h × ₱{selectedPackage.duration_extension_charge}):
                </span>
                <span className="resv-calc-item-value">₱{priceCalculation.extensionCharge.toLocaleString()}</span>
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

            <div className="resv-summary-guarantee">
              <span className="resv-guarantee-icon">🛡️</span>
              <span className="resv-guarantee-text">
                Your ₱2,000 security deposit is 100% refundable upon checkout with no property damages.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingForm
