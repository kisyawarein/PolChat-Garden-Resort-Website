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
        setChats(data)
      })
    }
  }, [inquiry])

  if (!inquiry) {
    return (
      <div className="inq-chat-placeholder">
        <span className="inq-placeholder-icon">💬</span>
        <h3>Select an Inquiry Ticket</h3>
        <p>Choose any customer inquiry from the left to view the messages and reply directly.</p>
      </div>
    )
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!replyText.trim()) return

    const newChat = await DataService.sendChatMessage({
      inquiryId: inquiry.inquiry_id,
      sender: 'admin',
      senderName: inquiry.admin_responder || adminUser?.name || 'Admin',
      message: replyText.trim(),
    })

    setChats((prev) => [...prev, newChat])
    setReplyText('')
  }

  return (
    <div className="inq-chat-view">
      {/* Header */}
      <div className="inq-chat-header">
        <div className="inq-chat-title-block">
          <span className="inq-chat-id">Ticket #{inquiry.inquiry_id}</span>
          <h3 className="inq-chat-subject">{inquiry.inquiry_label}</h3>
          <div className="inq-chat-meta">
            <span>Customer: <strong>{inquiry.customer_name}</strong></span>
            <span>•</span>
            <span>Responding Admin: <strong>{inquiry.admin_responder || 'Unassigned'}</strong></span>
          </div>
        </div>

        <div className="inq-chat-status-select">
          <label className="inq-status-label">Status:</label>
          <select
            className="inq-status-dropdown"
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

      {/* Messages Stream */}
      <div className="inq-messages-stream">
        {chats.length === 0 ? (
          <div className="inq-empty-stream-text">No messages recorded in this inquiry yet.</div>
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
          placeholder={`Reply to ${inquiry.customer_name} as ${inquiry.admin_responder || 'Admin'}...`}
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
        />
        <button type="submit" className="inq-reply-btn">
          Send Reply
        </button>
      </form>
    </div>
  )
}

export default InquiryChatPanel
