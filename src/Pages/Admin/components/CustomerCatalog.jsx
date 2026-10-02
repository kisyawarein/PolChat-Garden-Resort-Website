import { useState } from 'react'
import { DataService } from '../../../services/dataService'

function CustomerCatalog({
  customers,
  reservations,
  visitations,
  inquiries,
  onCustomerAdded,
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomerArchive, setSelectedCustomerArchive] = useState(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // New Customer Form State
  const [newFirstName, setNewFirstName] = useState('')
  const [newLastName, setNewLastName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newEmail, setNewEmail] = useState('')

  const filteredCustomers = customers.filter((c) => {
    const fullName = `${c.first_name} ${c.last_name || ''}`.toLowerCase()
    const phone = String(c.phone_number || '')
    const email = (c.email || '').toLowerCase()
    const id = String(c.customer_id)
    const term = searchTerm.toLowerCase()
    return fullName.includes(term) || phone.includes(term) || email.includes(term) || id.includes(term)
  })

  const handleAddCustomerSubmit = async (e) => {
    e.preventDefault()
    if (!newFirstName.trim()) return

    const newCust = await DataService.addCustomer({
      customer_id: Date.now(),
      first_name: newFirstName.trim(),
      last_name: newLastName.trim(),
      phone_number: Number(newPhone) || 9170000000,
      email: newEmail.trim(),
    })

    onCustomerAdded(newCust)
    setIsAddModalOpen(false)
    setNewFirstName('')
    setNewLastName('')
    setNewPhone('')
    setNewEmail('')
  }

  const handleExportCSV = () => {
    const dataToExport = customers.map((c) => ({
      'Customer ID': c.customer_id,
      'First Name': c.first_name,
      'Last Name': c.last_name || '',
      'Phone': c.phone_number || '',
      'Email': c.email || '',
      'Date Registered': c.date_create,
    }))
    DataService.exportToCsv('Polchat_Customer_Catalog', dataToExport)
  }

  // Get customer's booking records
  const getCustomerBookings = (customerId) => {
    return reservations.filter((r) => r.customer_id === customerId)
  }

  const getCustomerVisitations = (customerId) => {
    return visitations.filter((v) => v.customer_id === customerId)
  }

  const getCustomerInquiries = (customerId) => {
    return inquiries.filter((i) => i.customer_id === customerId)
  }

  return (
    <div className="admin-customer-catalog-container">
      {/* Header & Controls Toolbar */}
      <div className="admin-toolbar-row">
        <div className="admin-search-wrapper">
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search customers by name, phone number, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="admin-search-clear-btn"
              onClick={() => setSearchTerm('')}
            >
              ✕
            </button>
          )}
        </div>

        <div className="admin-toolbar-actions">
          <button
            type="button"
            className="admin-btn-primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            + Add Customer Account
          </button>
          <button
            type="button"
            className="admin-export-btn"
            onClick={handleExportCSV}
          >
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="admin-table-section">
        <div className="admin-table-header-bar">
          <h3 className="admin-table-title">
            Customer Records Archive ({filteredCustomers.length})
          </h3>
          <span className="admin-table-subtitle">
            Catalog of all registered guests and their resort booking history
          </span>
        </div>

        <div className="admin-table-scroll-wrap">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th className="admin-th">Customer ID</th>
                <th className="admin-th">Full Name</th>
                <th className="admin-th">Phone Contact</th>
                <th className="admin-th">Email Address</th>
                <th className="admin-th">Date Registered</th>
                <th className="admin-th">Resort Bookings</th>
                <th className="admin-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="admin-empty-table-cell">
                    No customer records matched your query.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const custBookings = getCustomerBookings(c.customer_id)
                  return (
                    <tr key={c.customer_id} className="admin-table-row">
                      <td className="admin-td admin-td-id">#{c.customer_id}</td>
                      <td className="admin-td">
                        <div className="admin-customer-avatar-row">
                          <span className="admin-cust-avatar-circle">
                            {c.first_name[0]}
                          </span>
                          <span className="admin-customer-name-text">
                            {c.first_name} {c.last_name || ''}
                          </span>
                        </div>
                      </td>
                      <td className="admin-td">
                        {c.phone_number ? `0${c.phone_number}` : 'N/A'}
                      </td>
                      <td className="admin-td">{c.email || 'N/A'}</td>
                      <td className="admin-td">{c.date_create || 'Recent'}</td>
                      <td className="admin-td">
                        <span className="admin-guest-count-badge">
                          {custBookings.length} Reservation{custBookings.length === 1 ? '' : 's'}
                        </span>
                      </td>
                      <td className="admin-td">
                        <button
                          type="button"
                          className="admin-action-btn admin-btn-details"
                          onClick={() => setSelectedCustomerArchive(c)}
                        >
                          View History Archive
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Register Customer Record</h3>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => setIsAddModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomerSubmit}>
              <div className="admin-modal-body">
                <div className="admin-input-group">
                  <label className="admin-modal-label">First Name *</label>
                  <input
                    type="text"
                    className="admin-modal-input"
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    required
                  />
                </div>

                <div className="admin-input-group">
                  <label className="admin-modal-label">Last Name</label>
                  <input
                    type="text"
                    className="admin-modal-input"
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                  />
                </div>

                <div className="admin-input-group">
                  <label className="admin-modal-label">Phone Number</label>
                  <input
                    type="tel"
                    className="admin-modal-input"
                    placeholder="e.g. 09171234567"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                  />
                </div>

                <div className="admin-input-group">
                  <label className="admin-modal-label">Email Address</label>
                  <input
                    type="email"
                    className="admin-modal-input"
                    placeholder="customer@gmail.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-footer-btn admin-btn-close"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-footer-btn admin-btn-confirm">
                  Save Customer Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Record Archive Modal */}
      {selectedCustomerArchive && (
        <div className="admin-modal-overlay" onClick={() => setSelectedCustomerArchive(null)}>
          <div className="admin-modal-box admin-modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                Customer Record Archive: {selectedCustomerArchive.first_name} {selectedCustomerArchive.last_name}
              </h3>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => setSelectedCustomerArchive(null)}
              >
                ✕
              </button>
            </div>

            <div className="admin-modal-body">
              {/* Customer Profile Summary */}
              <div className="admin-modal-info-grid">
                <div className="admin-modal-field">
                  <label className="admin-modal-label">Customer ID</label>
                  <span className="admin-modal-value">#{selectedCustomerArchive.customer_id}</span>
                </div>
                <div className="admin-modal-field">
                  <label className="admin-modal-label">Phone Contact</label>
                  <span className="admin-modal-value">{selectedCustomerArchive.phone_number || 'N/A'}</span>
                </div>
                <div className="admin-modal-field">
                  <label className="admin-modal-label">Email</label>
                  <span className="admin-modal-value">{selectedCustomerArchive.email || 'N/A'}</span>
                </div>
                <div className="admin-modal-field">
                  <label className="admin-modal-label">Account Created</label>
                  <span className="admin-modal-value">{selectedCustomerArchive.date_create || 'N/A'}</span>
                </div>
              </div>

              {/* Reservation History */}
              <div className="admin-archive-section">
                <h4 className="admin-archive-title">Resort Reservation History</h4>
                {getCustomerBookings(selectedCustomerArchive.customer_id).length === 0 ? (
                  <p className="admin-archive-empty">No resort reservations on record for this customer.</p>
                ) : (
                  <div className="admin-archive-cards-list">
                    {getCustomerBookings(selectedCustomerArchive.customer_id).map((r) => (
                      <div key={r.reservation_id} className="admin-archive-card">
                        <div className="admin-archive-card-header">
                          <strong>Booking #{r.reservation_id} - {r.event_name || 'Resort Stay'}</strong>
                          <span className={`admin-status-badge admin-status-${r.reservation_status}`}>
                            {r.reservation_status.toUpperCase()}
                          </span>
                        </div>
                        <div className="admin-archive-card-details">
                          <div><strong>Date:</strong> {r.start_date ? r.start_date.split('T')[0] : 'N/A'}</div>
                          <div><strong>Guests:</strong> {r.guest_count} Pax</div>
                          <div><strong>Total:</strong> PHP {((r.reservation_cost || 0) + (r.extra_charges || 0)).toLocaleString()}</div>
                          <div><strong>Payment:</strong> {r.has_paid_reservation ? 'Fully Paid' : 'Pending'} ({r.payment_method || 'GCash'})</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ocular Visitation History */}
              <div className="admin-archive-section">
                <h4 className="admin-archive-title">Ocular Visitations</h4>
                {getCustomerVisitations(selectedCustomerArchive.customer_id).length === 0 ? (
                  <p className="admin-archive-empty">No scheduled ocular inspections.</p>
                ) : (
                  <div className="admin-archive-cards-list">
                    {getCustomerVisitations(selectedCustomerArchive.customer_id).map((v) => (
                      <div key={v.visitation_id} className="admin-archive-card">
                        <div className="admin-archive-card-header">
                          <strong>Inspection #{v.visitation_id}</strong>
                          <span className={`admin-status-badge admin-status-${v.visitation_status}`}>
                            {v.visitation_status.toUpperCase()}
                          </span>
                        </div>
                        <div className="admin-archive-card-details">
                          <div><strong>Schedule:</strong> {v.visitation_start_date ? v.visitation_start_date.split('T')[0] : ''} ({v.slot_type})</div>
                          <div><strong>Visitors:</strong> {v.guest_count}</div>
                          <div><strong>Purpose:</strong> {v.purpose}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Support Inquiries History */}
              <div className="admin-archive-section">
                <h4 className="admin-archive-title">Inquiry Threads</h4>
                {getCustomerInquiries(selectedCustomerArchive.customer_id).length === 0 ? (
                  <p className="admin-archive-empty">No support tickets or inquiries submitted.</p>
                ) : (
                  <div className="admin-archive-cards-list">
                    {getCustomerInquiries(selectedCustomerArchive.customer_id).map((inq) => (
                      <div key={inq.inquiry_id} className="admin-archive-card">
                        <div className="admin-archive-card-header">
                          <strong>Ticket #{inq.inquiry_id}: {inq.inquiry_label}</strong>
                          <span className={`admin-status-badge admin-status-${inq.inquiry_status}`}>
                            {inq.inquiry_status.toUpperCase()}
                          </span>
                        </div>
                        <div className="admin-archive-card-details">
                          <div><strong>Created:</strong> {inq.created_at ? inq.created_at.split('T')[0] : 'N/A'}</div>
                          <div><strong>Admin Responder:</strong> {inq.admin_responder || 'Unassigned'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-footer-btn admin-btn-close"
                onClick={() => setSelectedCustomerArchive(null)}
              >
                Close Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerCatalog
