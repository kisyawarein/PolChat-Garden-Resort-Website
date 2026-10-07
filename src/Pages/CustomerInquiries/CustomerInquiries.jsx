import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { DataService } from '../../services/dataService'
import InquirySummaryCards from './components/InquirySummaryCards'
import InquiryChatPanel from './components/InquiryChatPanel'
import AdminResponderModal from './components/AdminResponderModal'
import './styles.css'

function CustomerInquiries() {
  const { user, isAdmin, openAuthModal } = useAuth()
  const [inquiries, setInquiries] = useState([])
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'open' | 'in-progress' | 'resolved'
  const [searchTerm, setSearchTerm] = useState('')
  const [responderModalInq, setResponderModalInq] = useState(null)
  const [toastMsg, setToastMsg] = useState('')

  const loadData = async () => {
    const data = await DataService.getInquiries()
    setInquiries(data || [])
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

  const handleInquirySelect = (inq) => {
    // If the inquiry doesn't have an admin responder yet, prompt for admin name
    if (!inq.admin_responder) {
      setResponderModalInq(inq)
    } else {
      setSelectedInquiry(inq)
    }
  }

  const handleConfirmResponder = async (adminName) => {
    if (!responderModalInq) return
    const updated = await DataService.assignAdminResponder(responderModalInq.inquiry_id, adminName)
    setInquiries(updated)
    const opened = updated.find((i) => i.inquiry_id === responderModalInq.inquiry_id)
    setSelectedInquiry(opened || { ...responderModalInq, admin_responder: adminName, inquiry_status: 'in-progress' })
    setResponderModalInq(null)
    showToast(`You are now assisting Inquiry #${responderModalInq.inquiry_id} as ${adminName}.`)
  }

  const handleStatusChange = async (inquiryId, newStatus) => {
    const updated = await DataService.updateInquiryStatus(inquiryId, newStatus)
    setInquiries(updated)
    setSelectedInquiry((prev) => (prev ? { ...prev, inquiry_status: newStatus } : null))
    showToast(`Inquiry #${inquiryId} marked as ${newStatus}.`)
  }

  const filteredInquiries = inquiries.filter((inq) => {
    const matchesStatus = statusFilter === 'all' || inq.inquiry_status === statusFilter
    const q = searchTerm.toLowerCase().trim()
    const labelMatch = (inq.inquiry_label || '').toLowerCase().includes(q)
    const nameMatch = (inq.customer_name || '').toLowerCase().includes(q)
    const idMatch = String(inq.inquiry_id).includes(q)
    const matchesSearch = !q || (labelMatch || nameMatch || idMatch)

    return matchesStatus && matchesSearch
  })

  if (!isAdmin) {
    return (
      <div className="access-denied-page">
        <div className="access-denied-card">
          <div className="access-denied-badge">STAFF ONLY</div>
          <h2>Inquiries Console Restricted</h2>
          <p>Please log in with an administrator account to respond to customer inquiries.</p>
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
    <div className="customer-inquiries-page">
      {/* Toast */}
      {toastMsg && (
        <div className="catalog-toast-box">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Overview Summary Cards */}
      <div className="catalog-top-summary-wrap">
        <InquirySummaryCards inquiries={inquiries} />
      </div>

      {/* Split Console Layout (Left: Tickets Queue, Right: Chat Panel) */}
      <div className="inq-dashboard-layout">
        {/* Left Column: Tickets Queue */}
        <div className="inq-left-column">
          {/* Header Container Card (66px) */}
          <div className="catalog-panel-header-card inq-queue-header-card">
            <div className="inq-queue-title-wrap">
              <h2 className="catalog-panel-title">Inquiry Tickets</h2>
              <span className="inq-queue-badge">{filteredInquiries.length}</span>
            </div>

            <div className="catalog-header-controls">
              {/* Search */}
              <div className="schedule-search-wrap inq-search-wrap">
                <svg
                  className="schedule-search-svg"
                  width="14"
                  height="14"
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
                  className="schedule-search-input inq-search-input"
                  placeholder="Search tickets..."
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
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Status Filter Dropdown */}
              <select
                className="inq-filter-dropdown"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Tickets Scroll List Container */}
          <div className="inq-tickets-list-card">
            <div className="inq-tickets-scroll-area">
              {filteredInquiries.length === 0 ? (
                <div className="inq-no-tickets-box">
                  <p>No inquiries found matching your filter.</p>
                </div>
              ) : (
                filteredInquiries.map((inq) => {
                  const isSelected = selectedInquiry?.inquiry_id === inq.inquiry_id
                  return (
                    <div
                      key={inq.inquiry_id}
                      className={`inq-ticket-item ${isSelected ? 'inq-ticket-item-active' : ''}`}
                      onClick={() => handleInquirySelect(inq)}
                    >
                      <div className="inq-ticket-top">
                        <span className="inq-ticket-id">#{inq.inquiry_id}</span>
                        <span className={`inq-status-badge inq-status-${inq.inquiry_status}`}>
                          {inq.inquiry_status.toUpperCase()}
                        </span>
                      </div>

                      <h4 className="inq-ticket-title">{inq.inquiry_label}</h4>

                      <div className="inq-ticket-meta">
                        <span className="inq-cust-name-meta">
                          {inq.customer_name || `Customer #${inq.customer_id}`}
                        </span>
                        <span className={`inq-staff-badge ${inq.admin_responder ? 'staff-assigned' : 'staff-unassigned'}`}>
                          {inq.admin_responder ? inq.admin_responder : 'Unassigned'}
                        </span>
                      </div>

                      <div className="inq-ticket-foot">
                        <span className="inq-time-text">
                          {inq.created_at ? new Date(inq.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Chat Panel */}
        <div className="inq-right-column">
          <InquiryChatPanel
            inquiry={selectedInquiry}
            adminUser={user}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>

      {/* Admin Responder Modal */}
      {responderModalInq && (
        <AdminResponderModal
          isOpen={!!responderModalInq}
          inquiry={responderModalInq}
          defaultName={user?.name || 'Admin Sarah'}
          onConfirm={handleConfirmResponder}
          onCancel={() => setResponderModalInq(null)}
        />
      )}
    </div>
  )
}

export default CustomerInquiries
