import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { DataService } from '../../services/dataService'
import CustomerSummaryCards from './components/CustomerSummaryCards'
import CustomerArchiveModal from './components/CustomerArchiveModal'
import AddCustomerModal from './components/AddCustomerModal'
import DeleteCustomerModal from './components/DeleteCustomerModal'
import './styles.css'

function CustomerRecords() {
  const { isAdmin, openAuthModal } = useAuth()
  const [customers, setCustomers] = useState([])
  const [reservations, setReservations] = useState([])
  const [visitations, setVisitations] = useState([])
  const [inquiries, setInquiries] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all') // 'all' | 'active' | 'repeat' | 'inactive'
  const [sortField, setSortField] = useState('id') // 'id' | 'name' | 'date' | 'bookings'
  const [sortDirection, setSortDirection] = useState('desc') // 'asc' | 'desc'
  const [openDropdown, setOpenDropdown] = useState(null) // 'segment' | null
  const [selectedArchive, setSelectedArchive] = useState(null)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleteAll, setIsDeleteAll] = useState(false)

  const headerRef = useRef(null)

  const loadData = async () => {
    // Automatically sanitize any legacy polluted records in Supabase
    DataService.cleanAllCustomerPollutedData().catch(() => {})

    const [custData, resData, visData, inqData] = await Promise.all([
      DataService.getCustomers({ force: true }),
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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
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
      'Date Registered': c.date_create || '',
    }))
    DataService.exportToCsv('Polchat_Customer_Records', dataToExport)
    showToast('Customer directory exported to CSV.')
  }

  const handleRequestDeleteCustomer = (customer) => {
    setDeleteTarget(customer)
    setIsDeleteAll(false)
    setIsDeleteModalOpen(true)
  }

  const handleRequestDeleteAll = () => {
    if (customers.length === 0) {
      showToast('No customer accounts to delete.')
      return
    }
    setDeleteTarget(null)
    setIsDeleteAll(true)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (isDeleteAll) {
      // Optimistic delete all
      setCustomers([])
      setSelectedArchive(null)
      setIsDeleteModalOpen(false)
      showToast('Deleting all customer accounts and registered emails...')
      
      const res = await DataService.deleteAllCustomers()
      if (res && res.success) {
        showToast('All customer accounts and registered emails successfully deleted from Supabase.')
      } else {
        showToast('Error deleting customer accounts from Supabase.')
        loadData()
      }
    } else if (deleteTarget) {
      const targetId = deleteTarget.customer_id
      const targetName = `${deleteTarget.first_name} ${deleteTarget.last_name || ''}`.trim()
      
      // Optimistic delete single
      setCustomers((prev) => prev.filter((c) => c.customer_id !== targetId))
      if (selectedArchive?.customer_id === targetId) {
        setSelectedArchive(null)
      }
      setIsDeleteModalOpen(false)
      showToast(`Account for ${targetName} deleted.`)

      const res = await DataService.deleteCustomer(targetId)
      if (!res || !res.success) {
        showToast(`Failed to delete customer from Supabase: ${res?.error?.message || 'Error'}`)
        loadData()
      }
    }
  }

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection(field === 'name' ? 'asc' : 'desc')
    }
  }

  // Consistent Chevron Icon
  const renderChevron = (isOpenOrUp) => (
    <svg
      className={`col-chevron-icon ${isOpenOrUp ? 'col-chevron-up' : 'col-chevron-down'}`}
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )

  const filteredCustomers = customers.filter((c) => {
    const fullName = `${c.first_name} ${c.last_name || ''}`.toLowerCase()
    const phone = String(c.phone_number || '')
    const id = String(c.customer_id)
    const term = searchTerm.toLowerCase().trim()
    const matchSearch = !term || fullName.includes(term) || phone.includes(term) || id.includes(term)

    const custBookings = reservations.filter((r) => r.customer_id === c.customer_id)
    if (filterType === 'active') return matchSearch && custBookings.length >= 1
    if (filterType === 'repeat') return matchSearch && custBookings.length > 1
    if (filterType === 'inactive') return matchSearch && custBookings.length === 0
    return matchSearch
  })

  // Sort
  filteredCustomers.sort((a, b) => {
    let res = 0
    if (sortField === 'name') {
      const nameA = `${a.first_name} ${a.last_name || ''}`
      const nameB = `${b.first_name} ${b.last_name || ''}`
      res = nameA.localeCompare(nameB)
    } else if (sortField === 'bookings') {
      const countA = reservations.filter((r) => r.customer_id === a.customer_id).length
      const countB = reservations.filter((r) => r.customer_id === b.customer_id).length
      res = countA - countB
    } else if (sortField === 'date') {
      const dateA = a.date_create || ''
      const dateB = b.date_create || ''
      res = dateA.localeCompare(dateB)
    } else {
      res = a.customer_id - b.customer_id
    }
    return sortDirection === 'asc' ? res : -res
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
      {/* Toast Notification */}
      {toastMsg && (
        <div className="catalog-toast-box">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Overview Summary Cards */}
      <div className="catalog-top-summary-wrap">
        <CustomerSummaryCards
          customers={customers}
          reservations={reservations}
          inquiries={inquiries}
        />
      </div>

      {/* Main Section */}
      <div className="cust-main-section">
        {/* Header Container Card */}
        <div className="catalog-panel-header-card">
          <h2 className="catalog-panel-title">Customer Records & Directory</h2>

          <div className="catalog-header-controls">
            {/* Search Bar */}
            <div className="schedule-search-wrap">
              <svg
                className="schedule-search-svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="schedule-search-input"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="schedule-search-clear-btn"
                  onClick={() => setSearchTerm('')}
                  title="Clear search"
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <button
              type="button"
              className="cust-header-btn cust-btn-primary"
              onClick={() => setIsAddOpen(true)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add Customer</span>
            </button>

            <button
              type="button"
              className="cust-header-btn cust-btn-export"
              onClick={handleExportCSV}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              className="cust-header-btn cust-btn-delete-all"
              onClick={handleRequestDeleteAll}
              title="Delete all registered customer accounts and their emails"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
              <span>Delete All Accounts</span>
            </button>
          </div>
        </div>

        {/* Customer Directory Table Panel */}
        <div className="cust-table-panel-card">
          <div className="cust-table-scroll-wrap">
            <table className="cust-data-table">
              <colgroup>
                <col style={{ width: '15%' }} />
                <col style={{ width: '31%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '8%' }} />
              </colgroup>
              <thead ref={headerRef}>
                <tr>
                  {/* Customer ID */}
                  <th className="col-cell-edge">
                    <button
                      type="button"
                      className="col-header-btn"
                      onClick={() => toggleSort('id')}
                    >
                      <span>Customer ID</span>
                      {renderChevron(sortField === 'id' && sortDirection === 'asc')}
                    </button>
                  </th>

                  {/* Full Name */}
                  <th>
                    <button
                      type="button"
                      className="col-header-btn"
                      onClick={() => toggleSort('name')}
                    >
                      <span>Full Name</span>
                      {renderChevron(sortField === 'name' && sortDirection === 'asc')}
                    </button>
                  </th>

                  {/* Phone */}
                  <th>
                    <div className="col-header-static">
                      <span>Phone Contact</span>
                    </div>
                  </th>

                  {/* Date */}
                  <th>
                    <button
                      type="button"
                      className="col-header-btn"
                      onClick={() => toggleSort('date')}
                    >
                      <span>Registered Date</span>
                      {renderChevron(sortField === 'date' && sortDirection === 'asc')}
                    </button>
                  </th>

                  {/* Booking History / Segment Dropdown */}
                  <th className="col-dropdown-th">
                    <button
                      type="button"
                      className={`col-header-btn ${filterType !== 'all' ? 'col-header-active-filter' : ''}`}
                      onClick={() => setOpenDropdown((prev) => (prev === 'segment' ? null : 'segment'))}
                    >
                      <span>
                        {filterType === 'all'
                          ? 'Booking History'
                          : filterType === 'active'
                          ? 'Active Bookers'
                          : filterType === 'repeat'
                          ? 'Repeat (2+)'
                          : 'Inactive'}
                      </span>
                      {renderChevron(openDropdown === 'segment')}
                    </button>

                    {openDropdown === 'segment' && (
                      <div className="col-dropdown-menu col-dropdown-right">
                        <button
                          type="button"
                          className={`col-dropdown-item ${filterType === 'all' ? 'dropdown-item-selected' : ''}`}
                          onClick={() => {
                            setFilterType('all')
                            setOpenDropdown(null)
                          }}
                        >
                          All Accounts ({customers.length})
                        </button>
                        <button
                          type="button"
                          className={`col-dropdown-item ${filterType === 'active' ? 'dropdown-item-selected' : ''}`}
                          onClick={() => {
                            setFilterType('active')
                            setOpenDropdown(null)
                          }}
                        >
                          Active Bookers (1+ Bookings)
                        </button>
                        <button
                          type="button"
                          className={`col-dropdown-item ${filterType === 'repeat' ? 'dropdown-item-selected' : ''}`}
                          onClick={() => {
                            setFilterType('repeat')
                            setOpenDropdown(null)
                          }}
                        >
                          Repeat Guests (2+ Bookings)
                        </button>
                        <button
                          type="button"
                          className={`col-dropdown-item ${filterType === 'inactive' ? 'dropdown-item-selected' : ''}`}
                          onClick={() => {
                            setFilterType('inactive')
                            setOpenDropdown(null)
                          }}
                        >
                          Inactive (0 Bookings)
                        </button>
                      </div>
                    )}
                  </th>

                  {/* Actions (Delete) */}
                  <th className="cust-th-actions">
                    <div className="col-header-static">
                      <span>Actions</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="cust-empty-cell">
                      No customer accounts found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c) => {
                    const custBookings = reservations.filter((r) => r.customer_id === c.customer_id)
                    return (
                      <tr key={c.customer_id} className="cust-table-row">
                        <td className="col-cell-edge cust-id-text">#{c.customer_id}</td>
                        <td>
                          <div className="cust-name-cell">
                            <span className="cust-avatar-badge">
                              {c.first_name ? c.first_name[0].toUpperCase() : 'G'}
                            </span>
                            <div className="cust-name-info">
                              <span className="cust-full-name">{c.first_name} {c.last_name || ''}</span>
                              <span className="cust-verified-sub">Verified Guest</span>
                            </div>
                          </div>
                        </td>
                        <td className="cust-plain-text">{c.phone_number ? `0${c.phone_number}` : '—'}</td>
                        <td className="cust-plain-text">{c.date_create || 'Recent'}</td>
                        <td>
                          <button
                            type="button"
                            className="cust-profile-link-btn"
                            onClick={() => setSelectedArchive(c)}
                          >
                            <span>{custBookings.length} {custBookings.length === 1 ? 'Booking' : 'Bookings'}</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </button>
                        </td>
                        <td className="cust-td-actions">
                          <button
                            type="button"
                            className="cust-row-delete-btn"
                            onClick={() => handleRequestDeleteCustomer(c)}
                            title={`Delete account for ${c.first_name} ${c.last_name || ''}`}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              <line x1="10" y1="11" x2="10" y2="17" />
                              <line x1="14" y1="11" x2="14" y2="17" />
                            </svg>
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
          onDeleteCustomer={handleRequestDeleteCustomer}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteCustomerModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        customer={deleteTarget}
        isDeleteAll={isDeleteAll}
        count={customers.length}
      />
    </div>
  )
}

export default CustomerRecords

