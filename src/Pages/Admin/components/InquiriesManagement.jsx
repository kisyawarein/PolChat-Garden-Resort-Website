import { useState, useEffect } from 'react'
import { DataService } from '../../../services/dataService'

function InquiriesManagement({ adminUser, inquiries, onInquiryUpdated, showToast }) {
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const [chats, setChats] = useState([])
  const [replyMessage, setReplyMessage] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'open' | 'in-progress' | 'resolved'

  // Admin Responder Prompt Modal
  const [showResponderPrompt, setShowResponderPrompt] = useState(false)
  const [inquiryPendingOpen, setInquiryPendingOpen] = useState(null)
  const [responderNameInput, setResponderNameInput] = useState(adminUser?.name || 'Admin Sarah')

  const filteredInquiries = inquiries.filter((inq) => {
    if (statusFilter === 'all') return true
    return inq.inquiry_status === statusFilter
  })

  // Load chats when an inquiry is selected
  useEffect(() => {
    if (selectedInquiry) {
      DataService.getChats(selectedInquiry.inquiry_id).then((c) => {
        setChats(c)
      })
    }
  }, [selectedInquiry])

  const handleInquiryClick = (inq) => {
    // If the inquiry doesn't have an assigned admin responder yet, prompt the admin
    if (!inq.admin_responder) {
      setInquiryPendingOpen(inq)
      setResponderNameInput(adminUser?.name || 'Admin Sarah')
      setShowResponderPrompt(true)
    } else {
      setSelectedInquiry(inq)
    }
  }

  const handleConfirmResponderName = async (e) => {
    e.preventDefault()
    if (!responderNameInput.trim() || !inquiryPendingOpen) return

    const adminName = responderNameInput.trim()
    const updated = await DataService.assignAdminResponder(
      inquiryPendingOpen.inquiry_id,
      adminName
    )

    onInquiryUpdated(updated)
    const opened = updated.find((i) => i.inquiry_id === inquiryPendingOpen.inquiry_id)
    setSelectedInquiry(opened || { ...inquiryPendingOpen, admin_responder: adminName, inquiry_status: 'in-progress' })
    setShowResponderPrompt(false)
    setInquiryPendingOpen(null)
    showToast(`You joined Inquiry #${opened?.inquiry_id || ''} as ${adminName}.`)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!replyMessage.trim() || !selectedInquiry) return

    const newChat = await DataService.sendChatMessage({
      inquiryId: selectedInquiry.inquiry_id,
      sender: 'admin',
      senderName: selectedInquiry.admin_responder || adminUser?.name || 'Admin',
      message: replyMessage.trim(),
    })

    setChats((prev) => [...prev, newChat])
    setReplyMessage('')
  }

  const handleStatusChange = async (newStatus) => {
    if (!selectedInquiry) return
    const updated = await DataService.updateInquiryStatus(selectedInquiry.inquiry_id, newStatus)
    onInquiryUpdated(updated)
    setSelectedInquiry((prev) => (prev ? { ...prev, inquiry_status: newStatus } : null))
    showToast(`Inquiry #${selectedInquiry.inquiry_id} status updated to ${newStatus}.`)
  }

  return (
    <div className="admin-inquiries-container">
      {/* Top Filter Bar */}
      <div className="admin-toolbar-row">
        <div className="admin-pill-selector">
          <span className="admin-selector-label">Filter Inquiries:</span>
          <button
            type="button"
            className={statusFilter === 'all' ? 'admin-filter-pill admin-filter-pill-active' : 'admin-filter-pill'}
            onClick={() => setStatusFilter('all')}
          >
            All ({inquiries.length})
          </button>
          <button
            type="button"
            className={statusFilter === 'open' ? 'admin-filter-pill admin-filter-pill-active' : 'admin-filter-pill'}
            onClick={() => setStatusFilter('open')}
          >
            Open ({inquiries.filter((i) => i.inquiry_status === 'open').length})
          </button>
          <button
            type="button"
            className={statusFilter === 'in-progress' ? 'admin-filter-pill admin-filter-pill-active' : 'admin-filter-pill'}
            onClick={() => setStatusFilter('in-progress')}
          >
            In Progress ({inquiries.filter((i) => i.inquiry_status === 'in-progress').length})
          </button>
          <button
            type="button"
            className={statusFilter === 'resolved' ? 'admin-filter-pill admin-filter-pill-active' : 'admin-filter-pill'}
            onClick={() => setStatusFilter('resolved')}
          >
            Resolved ({inquiries.filter((i) => i.inquiry_status === 'resolved').length})
          </button>
        </div>
      </div>

      {/* Main Split Layout: Inquiries List on Left, Active Chat on Right */}
      <div className="admin-inquiry-split-layout">
        {/* Left Side: Inquiry Tickets List */}
        <div className="admin-inquiry-tickets-list">
          {filteredInquiries.length === 0 ? (
            <div className="admin-inquiry-empty-state">
              <p>No customer inquiries found for this status.</p>
            </div>
          ) : (
            filteredInquiries.map((inq) => {
              const isSelected = selectedInquiry?.inquiry_id === inq.inquiry_id
              return (
                <div
                  key={inq.inquiry_id}
                  className={`admin-inquiry-ticket-card ${isSelected ? 'admin-inquiry-ticket-active' : ''}`}
                  onClick={() => handleInquiryClick(inq)}
                >
                  <div className="admin-inquiry-ticket-header">
                    <span className="admin-inquiry-ticket-id">#{inq.inquiry_id}</span>
                    <span className={`admin-status-badge admin-status-${inq.inquiry_status}`}>
                      {inq.inquiry_status.toUpperCase()}
                    </span>
                  </div>

                  <h4 className="admin-inquiry-ticket-label">{inq.inquiry_label}</h4>

                  <div className="admin-inquiry-ticket-meta">
                    <span className="admin-inquiry-cust-name">
                      👤 {inq.customer_name || `Customer #${inq.customer_id}`}
                    </span>
                    <span className="admin-inquiry-responder-name">
                      {inq.admin_responder ? `Staff: ${inq.admin_responder}` : '⚠️ Needs Responder'}
                    </span>
                  </div>

                  <div className="admin-inquiry-ticket-date">
                    {inq.created_at ? new Date(inq.created_at).toLocaleString() : 'Recent'}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Right Side: Chat Conversation Panel */}
        <div className="admin-inquiry-chat-panel">
          {selectedInquiry ? (
            <div className="admin-chat-view-wrapper">
              {/* Chat Panel Header */}
              <div className="admin-chat-header">
                <div className="admin-chat-header-info">
                  <h3 className="admin-chat-ticket-title">
                    Ticket #{selectedInquiry.inquiry_id}: {selectedInquiry.inquiry_label}
                  </h3>
                  <div className="admin-chat-header-meta">
                    <span>Customer: <strong>{selectedInquiry.customer_name}</strong></span>
                    <span>•</span>
                    <span>Responding Admin: <strong>{selectedInquiry.admin_responder || 'Not Set'}</strong></span>
                  </div>
                </div>

                {/* Status Switcher Dropdown */}
                <div className="admin-chat-status-select-wrap">
                  <label className="admin-chat-status-label">Status:</label>
                  <select
                    className="admin-chat-status-dropdown"
                    value={selectedInquiry.inquiry_status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* Chat Messages Stream */}
              <div className="admin-chat-messages-container">
                {chats.length === 0 ? (
                  <div className="admin-chat-empty-hint">
                    No messages yet in this conversation thread.
                  </div>
                ) : (
                  chats.map((chat) => {
                    const isAdmin = chat.sender === 'admin'
                    return (
                      <div
                        key={chat.chat_id}
                        className={`admin-chat-bubble-row ${isAdmin ? 'admin-chat-row-admin' : 'admin-chat-row-customer'}`}
                      >
                        <div className={`admin-chat-bubble ${isAdmin ? 'admin-bubble-admin' : 'admin-bubble-customer'}`}>
                          <div className="admin-chat-bubble-header">
                            <span className="admin-chat-sender-tag">
                              {chat.sender_name || (isAdmin ? 'Admin' : 'Customer')}
                            </span>
                            <span className="admin-chat-time-tag">
                              {chat.sent_at ? new Date(chat.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </div>
                          <p className="admin-chat-message-text">{chat.message}</p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Chat Reply Input Bar */}
              <form onSubmit={handleSendMessage} className="admin-chat-input-bar">
                <input
                  type="text"
                  className="admin-chat-input-field"
                  placeholder={`Reply to ${selectedInquiry.customer_name} as ${selectedInquiry.admin_responder || 'Admin'}...`}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                />
                <button type="submit" className="admin-chat-send-btn">
                  Send Reply
                </button>
              </form>
            </div>
          ) : (
            <div className="admin-chat-placeholder">
              <div className="admin-placeholder-inner">
                <span className="admin-placeholder-icon">💬</span>
                <h3>Select a Customer Inquiry</h3>
                <p>Choose an inquiry ticket from the left column to view the conversation and reply.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Responder Name Prompt Modal */}
      {showResponderPrompt && (
        <div className="admin-modal-overlay" onClick={() => setShowResponderPrompt(false)}>
          <div className="admin-modal-box admin-modal-prompt" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Admin Identity Verification</h3>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => setShowResponderPrompt(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmResponderName}>
              <div className="admin-modal-body">
                <p className="admin-prompt-description">
                  Before opening this inquiry, please enter your Admin Name. This lets the customer know which staff member is assisting them.
                </p>

                <div className="admin-input-group">
                  <label className="admin-modal-label">Your Admin Responder Name *</label>
                  <input
                    type="text"
                    className="admin-modal-input"
                    value={responderNameInput}
                    onChange={(e) => setResponderNameInput(e.target.value)}
                    placeholder="e.g. Admin Sarah, Staff Michael"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-footer-btn admin-btn-close"
                  onClick={() => setShowResponderPrompt(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-footer-btn admin-btn-confirm">
                  Confirm & Open Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default InquiriesManagement
