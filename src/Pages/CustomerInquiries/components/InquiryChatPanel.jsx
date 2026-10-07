import { useState, useEffect } from 'react'
import { DataService } from '../../../services/dataService'

function InquiryChatPanel({
  inquiry,
  adminUser,
  onStatusChange,
}) {
  const [chats, setChats] = useState([])
  const [replyText, setReplyText] = useState('')

  useEffect(() => {
    if (inquiry) {
      DataService.getChats(inquiry.inquiry_id).then((data) => {
        setChats(data || [])
      })
    }
  }, [inquiry])

  if (!inquiry) {
    return (
      <div className="inq-chat-panel-container">
        <div className="inq-chat-placeholder">
          <svg className="inq-placeholder-svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ACAD79" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <h3 className="inq-placeholder-title">Select an Inquiry Ticket</h3>
          <p className="inq-placeholder-desc">Choose any ticket from the queue on the left to view message history and send customer support responses.</p>
        </div>
      </div>
    )
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!replyText.trim()) return

    const newChat = await DataService.sendChatMessage({
      inquiryId: inquiry.inquiry_id,
      sender: 'admin',
      senderName: inquiry.admin_responder || adminUser?.name || 'Admin Staff',
      message: replyText.trim(),
    })

    setChats((prev) => [...prev, newChat])
    setReplyText('')
  }

  return (
    <div className="inq-chat-panel-container">
      {/* Header Container Card (66px) */}
      <div className="catalog-panel-header-card inq-chat-header-card">
        <div className="inq-chat-header-left">
          <div className="inq-chat-title-row">
            <span className="inq-chat-id-badge">#{inquiry.inquiry_id}</span>
            <h3 className="catalog-panel-title inq-chat-subject-title">{inquiry.inquiry_label}</h3>
          </div>
          <div className="inq-chat-meta-tags">
            <span>Customer: <strong>{inquiry.customer_name || `Customer #${inquiry.customer_id}`}</strong></span>
            <span className="inq-meta-dot">•</span>
            <span>Staff: <strong>{inquiry.admin_responder || 'Unassigned'}</strong></span>
          </div>
        </div>

        <div className="inq-chat-header-right">
          <label className="inq-status-select-label" htmlFor="inq-chat-status-sel">Status:</label>
          <select
            id="inq-chat-status-sel"
            className="inq-status-dropdown-select"
            value={inquiry.inquiry_status}
            onChange={(e) => onStatusChange(inquiry.inquiry_id, e.target.value)}
          >
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Messages Stream Card */}
      <div className="inq-messages-stream-box">
        <div className="inq-messages-scroll-area">
          {chats.length === 0 ? (
            <div className="inq-empty-chat-state">No messages recorded in this inquiry yet.</div>
          ) : (
            chats.map((chat) => {
              const isAdmin = chat.sender === 'admin'
              return (
                <div
                  key={chat.chat_id}
                  className={`inq-msg-bubble-row ${isAdmin ? 'inq-row-admin' : 'inq-row-customer'}`}
                >
                  <div className={`inq-bubble ${isAdmin ? 'inq-bubble-admin' : 'inq-bubble-customer'}`}>
                    <div className="inq-bubble-header">
                      <span className="inq-sender-name">{chat.sender_name || (isAdmin ? 'Admin' : 'Customer')}</span>
                      <span className="inq-timestamp">
                        {chat.sent_at ? new Date(chat.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className="inq-msg-body">{chat.message}</p>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Reply Input Bar */}
        <form onSubmit={handleSend} className="inq-reply-bar">
          <input
            type="text"
            className="inq-reply-input"
            placeholder={`Reply to ${inquiry.customer_name || 'Customer'} as ${inquiry.admin_responder || 'Admin'}...`}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <button type="submit" className="inq-reply-btn" disabled={!replyText.trim()}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  )
}

export default InquiryChatPanel
