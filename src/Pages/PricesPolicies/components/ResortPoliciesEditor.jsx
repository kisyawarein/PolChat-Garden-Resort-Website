import { useState } from 'react'

export default function ResortPoliciesEditor({ policies, onSavePolicies, isSaving }) {
  const [formData, setFormData] = useState({
    extra_pax_policy_text: policies.extra_pax_policy_text || '',
    downpayment_policy_text: policies.downpayment_policy_text || '',
    cancellation_policy_text: policies.cancellation_policy_text || '',
  })
  const [isEditing, setIsEditing] = useState(false)
  const [msg, setMsg] = useState('')

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const res = await onSavePolicies(formData)
    if (res) {
      setMsg('Resort policies and customer terms updated successfully!')
      setIsEditing(false)
      setTimeout(() => setMsg(''), 4000)
    }
  }

  return (
    <div className="pp-section-card">
      <div className="pp-section-header">
        <div className="pp-header-titles">
          <h2 className="pp-section-title">Resort Terms, Booking Policies & Rules</h2>
          <p className="pp-section-desc">
            Define customer guidance, payment terms, and cancellation policies displayed to guests during reservation checkout.
          </p>
        </div>
        {!isEditing && (
          <button
            type="button"
            className="pp-edit-btn"
            onClick={() => setIsEditing(true)}
          >
            Edit Policies
          </button>
        )}
      </div>

      {msg && (
        <div className="pp-success-banner">
          <span>✓</span> {msg}
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSave} className="pp-policy-form">
          <div className="pp-field-group">
            <label className="pp-label">Extra Pax & Guest Capacity Terms</label>
            <textarea
              className="pp-textarea"
              rows="3"
              value={formData.extra_pax_policy_text}
              onChange={(e) => handleChange('extra_pax_policy_text', e.target.value)}
            />
          </div>

          <div className="pp-field-group">
            <label className="pp-label">Downpayment & Confirmation Policy</label>
            <textarea
              className="pp-textarea"
              rows="3"
              value={formData.downpayment_policy_text}
              onChange={(e) => handleChange('downpayment_policy_text', e.target.value)}
            />
          </div>

          <div className="pp-field-group">
            <label className="pp-label">Cancellation, Rescheduling & Refund Rules</label>
            <textarea
              className="pp-textarea"
              rows="3"
              value={formData.cancellation_policy_text}
              onChange={(e) => handleChange('cancellation_policy_text', e.target.value)}
            />
          </div>

          <div className="pp-action-buttons">
            <button type="submit" className="pp-save-btn" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Policies'}
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
        <div className="pp-policy-display-stack">
          <div className="pp-policy-block">
            <h4 className="pp-policy-subtitle">Extra Headcount Policy</h4>
            <p className="pp-policy-text">
              {policies.extra_pax_policy_text || 'Maximum capacity strict policy applies. Additional guests above threshold are charged ₱200/head.'}
            </p>
          </div>

          <div className="pp-policy-block">
            <h4 className="pp-policy-subtitle">Reservation & Downpayment Terms</h4>
            <p className="pp-policy-text">
              {policies.downpayment_policy_text || 'A minimum 50% reservation deposit is required to confirm date locks. Balance is payable upon check-in.'}
            </p>
          </div>

          <div className="pp-policy-block">
            <h4 className="pp-policy-subtitle">Cancellation & Rescheduling</h4>
            <p className="pp-policy-text">
              {policies.cancellation_policy_text || 'Rescheduling is permitted up to 5 days prior to arrival. Deposits are non-refundable for same-week cancellations.'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
