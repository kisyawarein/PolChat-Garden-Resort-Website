import { useState } from 'react'

function AddCustomerModal({ isOpen, onClose, onAddCustomer }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!firstName.trim()) return

    onAddCustomer({
      customer_id: Date.now(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone_number: Number(phone) || 9170000000,
      email: email.trim(),
      date_create: new Date().toISOString(),
    })

    setFirstName('')
    setLastName('')
    setPhone('')
    setEmail('')
    onClose()
  }

  return (
    <div className="cust-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="cust-modal-box cust-modal-form-box" onClick={(e) => e.stopPropagation()}>
        <div className="cust-modal-header">
          <div className="cust-modal-header-left">
            <span className="cust-modal-avatar cust-modal-avatar-add">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
            </span>
            <div className="cust-modal-title-wrap">
              <h3 className="cust-modal-title">Register Customer Record</h3>
              <p className="cust-modal-subtitle">Add a verified guest or customer to the local directory</p>
            </div>
          </div>
          <button
            type="button"
            className="cust-modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="cust-modal-body cust-modal-form-body">
            <div className="cust-input-row">
              <label className="cust-input-label">First Name *</label>
              <input
                type="text"
                className="cust-text-input"
                placeholder="e.g. Juan"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="cust-input-row">
              <label className="cust-input-label">Last Name</label>
              <input
                type="text"
                className="cust-text-input"
                placeholder="e.g. Dela Cruz"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <div className="cust-input-row">
              <label className="cust-input-label">Phone Contact Number</label>
              <input
                type="tel"
                className="cust-text-input"
                placeholder="e.g. 09171234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="cust-input-row">
              <label className="cust-input-label">Email Address</label>
              <input
                type="email"
                className="cust-text-input"
                placeholder="guest@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="cust-modal-footer">
            <button type="button" className="cust-btn-cancel-modal" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="cust-btn-submit-modal">
              Save Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddCustomerModal
