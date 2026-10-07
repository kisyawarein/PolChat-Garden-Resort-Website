import { useState } from 'react'

export default function GlobalChargesEditor({ policies, onSavePolicies, isSaving }) {
  const [formData, setFormData] = useState({
    security_deposit: policies.security_deposit || 2000,
    downpayment_percentage: policies.downpayment_percentage || 50,
    cancellation_notice_days: policies.cancellation_notice_days || 5,
    ocular_visit_fee: policies.ocular_visit_fee || 0,
    gcash_number: policies.gcash_number || '0953 495 4389',
    gcash_name: policies.gcash_name || 'PolChat Garden Resort Admin',
  })
  const [isEditing, setIsEditing] = useState(false)
  const [msg, setMsg] = useState('')

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const numericPayload = {
      ...formData,
      security_deposit: Number(formData.security_deposit),
      downpayment_percentage: Number(formData.downpayment_percentage),
      cancellation_notice_days: Number(formData.cancellation_notice_days),
      ocular_visit_fee: Number(formData.ocular_visit_fee),
    }

    const res = await onSavePolicies(numericPayload)
    if (res) {
      setMsg('Global charges and payment accounts updated successfully!')
      setIsEditing(false)
      setTimeout(() => setMsg(''), 4000)
    }
  }

  return (
    <div className="pp-section-card">
      <div className="pp-section-header">
        <div className="pp-header-titles">
          <h2 className="pp-section-title">Global Fees, Security Deposits & Payment Settings</h2>
          <p className="pp-section-desc">
            Configure system-wide fees, required downpayment locks, and receiver account details for GCash verification.
          </p>
        </div>
        {!isEditing && (
          <button
            type="button"
            className="pp-edit-btn"
            onClick={() => setIsEditing(true)}
          >
            Edit Settings
          </button>
        )}
      </div>

      {msg && (
        <div className="pp-success-banner">
          <span>✓</span> {msg}
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSave} className="pp-global-form">
          <div className="pp-form-grid">
            <div className="pp-field-group">
              <label className="pp-label">Standard Security Deposit (₱)</label>
              <input
                type="number"
                className="pp-input"
                value={formData.security_deposit}
                onChange={(e) => handleChange('security_deposit', e.target.value)}
                min="0"
                step="500"
              />
              <span className="pp-field-hint">Refundable upon checkout inspection.</span>
            </div>

            <div className="pp-field-group">
              <label className="pp-label">Required Downpayment (%)</label>
              <input
                type="number"
                className="pp-input"
                value={formData.downpayment_percentage}
                onChange={(e) => handleChange('downpayment_percentage', e.target.value)}
                min="10"
                max="100"
                step="5"
              />
              <span className="pp-field-hint">Initial payment required to verify slot.</span>
            </div>

            <div className="pp-field-group">
              <label className="pp-label">Ocular Inspection Fee (₱)</label>
              <input
                type="number"
                className="pp-input"
                value={formData.ocular_visit_fee}
                onChange={(e) => handleChange('ocular_visit_fee', e.target.value)}
                min="0"
                step="100"
              />
              <span className="pp-field-hint">Set to 0 for complimentary visits.</span>
            </div>

            <div className="pp-field-group">
              <label className="pp-label">Cancellation Notice (Days)</label>
              <input
                type="number"
                className="pp-input"
                value={formData.cancellation_notice_days}
                onChange={(e) => handleChange('cancellation_notice_days', e.target.value)}
                min="1"
              />
              <span className="pp-field-hint">Days required in advance for rescheduling.</span>
            </div>

            <div className="pp-field-group">
              <label className="pp-label">GCash Official Number</label>
              <input
                type="text"
                className="pp-input"
                value={formData.gcash_number}
                onChange={(e) => handleChange('gcash_number', e.target.value)}
                placeholder="09XX XXX XXXX"
              />
            </div>

            <div className="pp-field-group">
              <label className="pp-label">GCash Registered Name</label>
              <input
                type="text"
                className="pp-input"
                value={formData.gcash_name}
                onChange={(e) => handleChange('gcash_name', e.target.value)}
                placeholder="Account Owner Name"
              />
            </div>
          </div>

          <div className="pp-action-buttons">
            <button type="submit" className="pp-save-btn" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
            <button
              type="button"
              className="pp-cancel-btn"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="pp-global-display-grid">
          <div className="pp-global-card">
            <span className="pp-global-card-label">SECURITY DEPOSIT</span>
            <strong className="pp-global-card-val">₱{Number(policies.security_deposit || 2000).toLocaleString()}</strong>
            <span className="pp-global-card-sub">Refundable upon damage inspection</span>
          </div>

          <div className="pp-global-card">
            <span className="pp-global-card-label">CONFIRMATION DEPOSIT</span>
            <strong className="pp-global-card-val">{policies.downpayment_percentage || 50}%</strong>
            <span className="pp-global-card-sub">Of total reservation cost required</span>
          </div>

          <div className="pp-global-card">
            <span className="pp-global-card-label">OCULAR VISIT FEE</span>
            <strong className="pp-global-card-val">
              {Number(policies.ocular_visit_fee) === 0 ? 'FREE' : `₱${Number(policies.ocular_visit_fee).toLocaleString()}`}
            </strong>
            <span className="pp-global-card-sub">Guided site inspection</span>
          </div>

          <div className="pp-global-card">
            <span className="pp-global-card-label">OFFICIAL GCASH</span>
            <strong className="pp-global-card-val">{policies.gcash_number || '0953 495 4389'}</strong>
            <span className="pp-global-card-sub">{policies.gcash_name || 'PolChat Resort Admin'}</span>
          </div>
        </div>
      )}
    </div>
  )
}
