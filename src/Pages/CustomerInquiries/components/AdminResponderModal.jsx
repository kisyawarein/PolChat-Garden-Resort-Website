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
    <div className="inq-modal-backdrop" onClick={onCancel} role="dialog" aria-modal="true">
      <div className="inq-modal-box inq-modal-prompt" onClick={(e) => e.stopPropagation()}>
        <div className="inq-modal-header">
          <div className="inq-modal-header-left">
            <span className="inq-modal-badge-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </span>
            <div className="inq-modal-title-wrap">
              <h3 className="inq-modal-title">Admin Identity Verification</h3>
              <p className="inq-modal-subtitle">Assign staff responder for ticket #{inquiry.inquiry_id}</p>
            </div>
          </div>
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
            <div className="inq-ticket-context-card">
              <span className="inq-context-label">TICKET TOPIC</span>
              <strong className="inq-context-val">{inquiry.inquiry_label || 'Customer Inquiry'}</strong>
              <span className="inq-context-guest">Customer: {inquiry.customer_name || `Customer #${inquiry.customer_id}`}</span>
            </div>

            <p className="inq-prompt-desc">
              Before opening and replying to this inquiry ticket, please confirm your staff / admin name. The guest will see this name on the live chat thread.
            </p>

            <div className="inq-input-group">
              <label className="inq-label" htmlFor="admin-responder-input">
                Responding Admin Name *
              </label>
              <input
                id="admin-responder-input"
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
              Confirm & Open Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminResponderModal
