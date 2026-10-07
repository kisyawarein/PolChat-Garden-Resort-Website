import { useState } from 'react'

export default function PackageRatesEditor({ packages, onSavePackage, isSaving }) {
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({})
  const [feedbackMsg, setFeedbackMsg] = useState('')

  const startEdit = (pkg) => {
    setEditingId(pkg.duration_id)
    setFormData({
      duration_price: pkg.duration_price,
      max_pax: pkg.max_pax,
      duration_extra_pax_charge: pkg.duration_extra_pax_charge,
      duration_extension_charge: pkg.duration_extension_charge,
      duration_event_rate: pkg.duration_event_rate,
      duration_start: pkg.duration_start || '09:00:00',
      duration_end: pkg.duration_end || '17:00:00',
      sec_dep: pkg.sec_dep || 2000,
    })
    setFeedbackMsg('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setFormData({})
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async (durationId) => {
    const numericPayload = {
      duration_price: Number(formData.duration_price),
      max_pax: Number(formData.max_pax),
      duration_extra_pax_charge: Number(formData.duration_extra_pax_charge),
      duration_extension_charge: Number(formData.duration_extension_charge),
      duration_event_rate: Number(formData.duration_event_rate),
      duration_start: formData.duration_start,
      duration_end: formData.duration_end,
      sec_dep: Number(formData.sec_dep),
    }

    const success = await onSavePackage(durationId, numericPayload)
    if (success) {
      setFeedbackMsg(`Package #${durationId} updated and synced with database successfully!`)
      setEditingId(null)
      setTimeout(() => setFeedbackMsg(''), 4000)
    } else {
      setFeedbackMsg('Failed to sync changes. Please try again.')
    }
  }

  const getPackageBadge = (id) => {
    switch (id) {
      case 1: return { label: 'DAY TOUR (8h)', color: '#43593B' }
      case 2: return { label: 'OVERNIGHT (10h)', color: '#58402E' }
      case 3: return { label: '22H DAY START', color: '#43593B' }
      case 4: return { label: '22H NIGHT START', color: '#58402E' }
      default: return { label: 'PACKAGE', color: '#43593B' }
    }
  }

  return (
    <div className="pp-section-card">
      <div className="pp-section-header">
        <div className="pp-header-titles">
          <h2 className="pp-section-title">Resort Stay Packages & Rate Configuration</h2>
          <p className="pp-section-desc">
            Edit base pricing, guest capacity, and per-package add-on charges. Changes reflect across all customer booking forms immediately.
          </p>
        </div>
      </div>

      {feedbackMsg && (
        <div className="pp-success-banner">
          <span>✓</span> {feedbackMsg}
        </div>
      )}

      <div className="pp-packages-grid">
        {packages.map((pkg) => {
          const isEditing = editingId === pkg.duration_id
          const badge = getPackageBadge(pkg.duration_id)

          return (
            <div key={pkg.duration_id} className={`pp-package-card ${isEditing ? 'pp-package-editing' : ''}`}>
              <div className="pp-package-header">
                <div className="pp-package-title-wrap">
                  <span className="pp-pkg-badge" style={{ backgroundColor: badge.color }}>
                    {badge.label}
                  </span>
                  <h3 className="pp-pkg-name">{pkg.duration_name}</h3>
                </div>
                {!isEditing && (
                  <button
                    type="button"
                    className="pp-edit-btn"
                    onClick={() => startEdit(pkg)}
                  >
                    Edit Rates
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="pp-edit-form">
                  <div className="pp-field-group">
                    <label className="pp-label">Base Rate (₱)</label>
                    <input
                      type="number"
                      className="pp-input"
                      value={formData.duration_price}
                      onChange={(e) => handleInputChange('duration_price', e.target.value)}
                      min="0"
                      step="500"
                    />
                  </div>

                  <div className="pp-field-group">
                    <label className="pp-label">Max Included Pax</label>
                    <input
                      type="number"
                      className="pp-input"
                      value={formData.max_pax}
                      onChange={(e) => handleInputChange('max_pax', e.target.value)}
                      min="1"
                    />
                  </div>

                  <div className="pp-field-group">
                    <label className="pp-label">Exceeding Pax Rate (₱ / head)</label>
                    <input
                      type="number"
                      className="pp-input"
                      value={formData.duration_extra_pax_charge}
                      onChange={(e) => handleInputChange('duration_extra_pax_charge', e.target.value)}
                      min="0"
                      step="50"
                    />
                  </div>

                  <div className="pp-field-group">
                    <label className="pp-label">Hourly Extension Rate (₱ / hr)</label>
                    <input
                      type="number"
                      className="pp-input"
                      value={formData.duration_extension_charge}
                      onChange={(e) => handleInputChange('duration_extension_charge', e.target.value)}
                      min="0"
                      step="100"
                    />
                  </div>

                  <div className="pp-field-group">
                    <label className="pp-label">Event Premium Charge (₱)</label>
                    <input
                      type="number"
                      className="pp-input"
                      value={formData.duration_event_rate}
                      onChange={(e) => handleInputChange('duration_event_rate', e.target.value)}
                      min="0"
                      step="500"
                    />
                  </div>

                  <div className="pp-field-group">
                    <label className="pp-label">Security Deposit (₱)</label>
                    <input
                      type="number"
                      className="pp-input"
                      value={formData.sec_dep}
                      onChange={(e) => handleInputChange('sec_dep', e.target.value)}
                      min="0"
                      step="500"
                    />
                  </div>

                  <div className="pp-time-row">
                    <div className="pp-field-group">
                      <label className="pp-label">Check-in Time</label>
                      <input
                        type="time"
                        className="pp-input"
                        value={formData.duration_start?.substring(0, 5) || '09:00'}
                        onChange={(e) => handleInputChange('duration_start', `${e.target.value}:00`)}
                      />
                    </div>
                    <div className="pp-field-group">
                      <label className="pp-label">Check-out Time</label>
                      <input
                        type="time"
                        className="pp-input"
                        value={formData.duration_end?.substring(0, 5) || '17:00'}
                        onChange={(e) => handleInputChange('duration_end', `${e.target.value}:00`)}
                      />
                    </div>
                  </div>

                  <div className="pp-action-buttons">
                    <button
                      type="button"
                      className="pp-save-btn"
                      disabled={isSaving}
                      onClick={() => handleSave(pkg.duration_id)}
                    >
                      {isSaving ? 'Saving...' : 'Save & Sync'}
                    </button>
                    <button
                      type="button"
                      className="pp-cancel-btn"
                      onClick={cancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pp-details-view">
                  <div className="pp-price-hero">
                    <span className="pp-currency">₱</span>
                    <span className="pp-amount">{Number(pkg.duration_price).toLocaleString()}</span>
                    <span className="pp-period">/ base stay</span>
                  </div>

                  <div className="pp-spec-grid">
                    <div className="pp-spec-item">
                      <span className="pp-spec-label">Capacity Limit</span>
                      <span className="pp-spec-val">{pkg.max_pax} Guests</span>
                    </div>
                    <div className="pp-spec-item">
                      <span className="pp-spec-label">Exceeding Pax</span>
                      <span className="pp-spec-val">₱{pkg.duration_extra_pax_charge} / head</span>
                    </div>
                    <div className="pp-spec-item">
                      <span className="pp-spec-label">Extension Rate</span>
                      <span className="pp-spec-val">₱{pkg.duration_extension_charge} / hr</span>
                    </div>
                    <div className="pp-spec-item">
                      <span className="pp-spec-label">Event Premium</span>
                      <span className="pp-spec-val">₱{pkg.duration_event_rate}</span>
                    </div>
                    <div className="pp-spec-item">
                      <span className="pp-spec-label">Security Deposit</span>
                      <span className="pp-spec-val">₱{Number(pkg.sec_dep || 2000).toLocaleString()}</span>
                    </div>
                    <div className="pp-spec-item">
                      <span className="pp-spec-label">Time Window</span>
                      <span className="pp-spec-val">{pkg.duration_start?.substring(0, 5)} - {pkg.duration_end?.substring(0, 5)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
