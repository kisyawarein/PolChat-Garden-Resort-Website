import { useState } from 'react'

function AdminResponderModal({ isOpen, inquiry, defaultName, onConfirm, onCancel }) {
  const [nameInput, setNameInput] = useState(defaultName || 'Admin Sarah')

  if (!isOpen || !inquiry) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!nameInput.trim()) return
    onConfirm(nameInput.trim())
  }

  return (
    <div className="inq-modal-backdrop" onClick={onCancel}>
      <div className="inq-modal-box inq-modal-prompt" onClick={(e) => e.stopPropagation()}>
        <div className="inq-modal-header">
          <h3 className="inq-modal-title">Admin Identity Verification</h3>
          <button
            type="button"
            className="inq-close-x"
            onClick={onCancel}
            aria-label="Close modal"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="inq-modal-body">
            <p className="inq-prompt-desc">
              Before opening and responding to Inquiry <strong>#{inquiry.inquiry_id} ({inquiry.inquiry_label})</strong>, please confirm your staff / admin name. The customer will see this name as the responder.
            </p>

            <div className="inq-input-group">
              <label className="inq-label">Your Responding Admin Name *</label>
              <input
                type="text"
                className="inq-text-input"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Admin Sarah, Staff Michael"
                required
                autoFocus
              />
            </div>
          </div>

          <div className="inq-modal-footer">
            <button type="button" className="inq-btn-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="inq-btn-confirm">
              Confirm & Open Inquiry
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminResponderModal
