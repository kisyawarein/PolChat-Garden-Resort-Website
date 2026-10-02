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
    })

    setFirstName('')
    setLastName('')
    setPhone('')
    setEmail('')
    onClose()
  }

  return (
    <div className="cust-modal-backdrop" onClick={onClose}>
      <div className="cust-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="cust-modal-header">
          <h3 className="cust-modal-title">Register Customer Record</h3>
          <button type="button" className="cust-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="cust-modal-body">
            <div className="cust-input-row">
              <label className="cust-input-label">First Name *</label>
              <input
                type="text"
                className="cust-text-input"
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
            <button type="button" className="cust-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="cust-btn-submit">
              Save Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddCustomerModal
