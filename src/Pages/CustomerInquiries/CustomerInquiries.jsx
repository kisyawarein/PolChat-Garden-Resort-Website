import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { DataService } from '../../services/dataService'
import InquiryChatPanel from './components/InquiryChatPanel'
import AdminResponderModal from './components/AdminResponderModal'
import './styles.css'

function CustomerInquiries() {
  const { user, isAdmin, openAuthModal } = useAuth()
  const [inquiries, setInquiries] = useState([])
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'open' | 'in-progress' | 'resolved'
  const [responderModalInq, setResponderModalInq] = useState(null)
  const [toastMsg, setToastMsg] = useState('')

  const loadData = async () => {
    const data = await DataService.getInquiries()
    setInquiries(data)
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
    if (statusFilter === 'all') return true
    return inq.inquiry_status === statusFilter
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
        <div className="inq-toast-box">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="inq-header-bar">
        <div>
          <span className="inq-tag">CUSTOMER SUPPORT</span>
          <h1 className="inq-main-title">Customer Inquiries & Helpdesk</h1>
        </div>

        {/* Filter Pills */}
        <div className="inq-filter-pills">
          <button
            type="button"
            className={`inq-filter-chip ${statusFilter === 'all' ? 'inq-filter-chip-active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All ({inquiries.length})
          </button>
          <button
            type="button"
            className={`inq-filter-chip ${statusFilter === 'open' ? 'inq-filter-chip-active' : ''}`}
            onClick={() => setStatusFilter('open')}
          >
            Open ({inquiries.filter((i) => i.inquiry_status === 'open').length})
          </button>
          <button
            type="button"
            className={`inq-filter-chip ${statusFilter === 'in-progress' ? 'inq-filter-chip-active' : ''}`}
            onClick={() => setStatusFilter('in-progress')}
          >
            In Progress ({inquiries.filter((i) => i.inquiry_status === 'in-progress').length})
          </button>
          <button
            type="button"
            className={`inq-filter-chip ${statusFilter === 'resolved' ? 'inq-filter-chip-active' : ''}`}
            onClick={() => setStatusFilter('resolved')}
          >
            Resolved ({inquiries.filter((i) => i.inquiry_status === 'resolved').length})
          </button>
        </div>
      </div>

      {/* Split Console: Tickets List on Left, Chat on Right */}
      <div className="inq-split-console">
        {/* Left Tickets Column */}
        <div className="inq-tickets-column">
          {filteredInquiries.length === 0 ? (
            <div className="inq-no-tickets">
              No inquiries found for this filter.
            </div>
          ) : (
            filteredInquiries.map((inq) => {
              const isSelected = selectedInquiry?.inquiry_id === inq.inquiry_id
              return (
                <div
                  key={inq.inquiry_id}
                  className={`inq-ticket-card ${isSelected ? 'inq-ticket-card-active' : ''}`}
                  onClick={() => handleInquirySelect(inq)}
                >
                  <div className="inq-ticket-head">
                    <span className="inq-ticket-id">#{inq.inquiry_id}</span>
                    <span className={`inq-status-badge inq-status-${inq.inquiry_status}`}>
                      {inq.inquiry_status.toUpperCase()}
                    </span>
                  </div>

                  <h4 className="inq-ticket-subject">{inq.inquiry_label}</h4>

                  <div className="inq-ticket-meta-line">
                    <span>👤 {inq.customer_name || `Customer #${inq.customer_id}`}</span>
                    <span className="inq-responder-tag">
                      {inq.admin_responder ? `Staff: ${inq.admin_responder}` : '⚠️ Needs Responder'}
                    </span>
                  </div>

                  <span className="inq-ticket-timestamp">
                    {inq.created_at ? new Date(inq.created_at).toLocaleString() : 'Recent'}
                  </span>
                </div>
              )
            })
          )}
        </div>

        {/* Right Chat Panel Column */}
        <div className="inq-chat-column">
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
