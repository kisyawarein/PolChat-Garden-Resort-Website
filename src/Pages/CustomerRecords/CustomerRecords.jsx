import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { DataService } from '../../services/dataService'
import CustomerSummaryCards from './components/CustomerSummaryCards'
import CustomerArchiveModal from './components/CustomerArchiveModal'
import AddCustomerModal from './components/AddCustomerModal'
import './styles.css'

function CustomerRecords() {
  const { isAdmin, openAuthModal } = useAuth()
  const [customers, setCustomers] = useState([])
  const [reservations, setReservations] = useState([])
  const [visitations, setVisitations] = useState([])
  const [inquiries, setInquiries] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all') // 'all' | 'active' | 'repeat' | 'inactive'
  const [selectedArchive, setSelectedArchive] = useState(null)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const loadData = async () => {
    const [custData, resData, visData, inqData] = await Promise.all([
      DataService.getCustomers(),
      DataService.getReservations(),
      DataService.getVisitations(),
      DataService.getInquiries(),
    ])
    setCustomers(custData || [])
    setReservations(resData || [])
    setVisitations(visData || [])
    setInquiries(inqData || [])
  }

  useEffect(() => {
    loadData()
  }, [])

  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => {
      setToastMsg('')
    }, 3500)
  }

  const handleAddCustomer = async (newCustomerData) => {
    const created = await DataService.addCustomer(newCustomerData)
    setCustomers((prev) => [created, ...prev])
    showToast(`Customer ${created.first_name} added to directory.`)
  }

  const handleExportCSV = () => {
    const dataToExport = customers.map((c) => ({
      'Customer ID': c.customer_id,
      'First Name': c.first_name,
      'Last Name': c.last_name || '',
      'Phone': c.phone_number ? `0${c.phone_number}` : '',
      'Email': c.email || '',
      'Date Registered': c.date_create,
    }))
    DataService.exportToCsv('Polchat_Customer_Records', dataToExport)
    showToast('Customer directory exported to CSV.')
  }

  const filteredCustomers = customers.filter((c) => {
    const fullName = `${c.first_name} ${c.last_name || ''}`.toLowerCase()
    const phone = String(c.phone_number || '')
    const email = (c.email || '').toLowerCase()
    const id = String(c.customer_id)
    const term = searchTerm.toLowerCase()
    const matchSearch = fullName.includes(term) || phone.includes(term) || email.includes(term) || id.includes(term)

    const custBookings = reservations.filter((r) => r.customer_id === c.customer_id)
    if (filterType === 'active') return matchSearch && custBookings.length >= 1
    if (filterType === 'repeat') return matchSearch && custBookings.length > 1
    if (filterType === 'inactive') return matchSearch && custBookings.length === 0
    return matchSearch
  })

  if (!isAdmin) {
    return (
      <div className="access-denied-page">
        <div className="access-denied-card">
          <div className="access-denied-badge">STAFF ONLY</div>
          <h2>Customer Directory Restricted</h2>
          <p>Please log in with an administrator account to view customer records.</p>
          <button
            type="button"
            className="access-denied-btn"
            onClick={() => openAuthModal('signin')}
          >
            Sign In as Admin
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="customer-records-page">
      {/* Toast Floating Notification */}
      {toastMsg && (
        <div className="cust-toast-box">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Top Header Bar */}
      <div className="cust-header-bar">
        <div className="cust-title-group">
          <h1 className="cust-main-title">Customer Records & Directory</h1>
        </div>

        <div className="cust-header-actions">
          <button
            type="button"
            className="cust-btn-primary"
            onClick={() => setIsAddOpen(true)}
          >
            + Add New Customer
          </button>
          <button
            type="button"
            className="cust-btn-export"
            onClick={handleExportCSV}
          >
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* Top Overview Summary Cards */}
      <div className="cust-top-summary-wrap">
        <CustomerSummaryCards
          customers={customers}
          reservations={reservations}
          inquiries={inquiries}
        />
      </div>

      {/* Main Full-Width Customer Directory Card */}
      <div className="cust-main-directory-card">
        {/* Search & Filter Toolbar */}
        <div className="cust-toolbar-card">
          <div className="cust-search-wrap">
            <span className="cust-search-icon">🔍</span>
            <input
              type="text"
              className="cust-search-input"
              placeholder="Search customers by name, phone, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="cust-search-clear"
                onClick={() => setSearchTerm('')}
              >
                ✕
              </button>
            )}
          </div>

          {/* Dropdown Filter */}
          <div className="cust-filters-wrap">
            <div className="cust-filter-item">
              <label className="cust-filter-label" htmlFor="cust-status-filter">Segment:</label>
              <select
                id="cust-status-filter"
                className="cust-select-dropdown"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Customers ({customers.length})</option>
                <option value="active">Active Bookers</option>
                <option value="repeat">Repeat Guests (2+ Bookings)</option>
                <option value="inactive">Registered (No Bookings)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Customer Data Table */}
        <div className="cust-table-card">
          <div className="cust-table-scroll">
            <table className="cust-data-table">
              <thead>
                <tr>
                  <th>Customer ID</th>
                  <th>Full Name</th>
                  <th>Phone Contact</th>
                  <th>Email Address</th>
                  <th>Registered Date</th>
                  <th>Booking History</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="cust-empty-cell">
                      No customer accounts found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c) => {
                    const custBookings = reservations.filter((r) => r.customer_id === c.customer_id)
                    return (
                      <tr key={c.customer_id}>
                        <td className="cust-id-cell">#{c.customer_id}</td>
                        <td>
                          <div className="cust-avatar-name-cell">
                            <span className="cust-avatar-circle">{c.first_name ? c.first_name[0].toUpperCase() : 'G'}</span>
                            <div className="cust-name-stack">
                              <span className="cust-full-name">{c.first_name} {c.last_name || ''}</span>
                              <span className="cust-role-badge">Verified Guest</span>
                            </div>
                          </div>
                        </td>
                        <td>{c.phone_number ? `0${c.phone_number}` : '—'}</td>
                        <td>{c.email || '—'}</td>
                        <td>
                          <span className="cust-date-text">{c.date_create || 'Recent'}</span>
                        </td>
                        <td>
                          <span className={`cust-bookings-pill ${custBookings.length > 0 ? 'bookings-pill-active' : 'bookings-pill-zero'}`}>
                            {custBookings.length} {custBookings.length === 1 ? 'Booking' : 'Bookings'}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="cust-btn-view-archive"
                            onClick={() => setSelectedArchive(c)}
                          >
                            View Profile
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
      </div>

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAddCustomer={handleAddCustomer}
      />

      {/* Archive Modal */}
      {selectedArchive && (
        <CustomerArchiveModal
          customer={selectedArchive}
          reservations={reservations}
          visitations={visitations}
          inquiries={inquiries}
          onClose={() => setSelectedArchive(null)}
        />
      )}
    </div>
  )
}

export default CustomerRecords
