import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { DataService } from '../../../services/dataService'

function InquirySection() {
  const { user, isAuthenticated, openAuthModal } = useAuth()

  // State
  const [inquiryLabel, setInquiryLabel] = useState('')
  const [startingStatement, setStartingStatement] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [customerInquiries, setCustomerInquiries] = useState([])
  const [activeInquiry, setActiveInquiry] = useState(null)
  const [activeChats, setActiveChats] = useState([])
  const [replyText, setReplyText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successNotice, setSuccessNotice] = useState('')

  // Load inquiries
  const loadInquiries = async () => {
    const allInquiries = await DataService.getInquiries()
    // Filter by current customer if logged in
    if (user && user.role === 'customer') {
      const userInqs = allInquiries.filter(
        (i) => i.customer_id === user.id || i.customer_name === user.name
      )
      setCustomerInquiries(userInqs.length > 0 ? userInqs : allInquiries)
      if (!activeInquiry && (userInqs.length > 0 || allInquiries.length > 0)) {
        setActiveInquiry(userInqs[0] || allInquiries[0])
      }
    } else if (guestEmail) {
      const emailInqs = allInquiries.filter(
        (i) => (i.customer_name && i.customer_name.toLowerCase().includes(guestEmail.toLowerCase()))
      )
      setCustomerInquiries(emailInqs)
    } else {
      setCustomerInquiries([])
    }
  }

  useEffect(() => {
    loadInquiries()
  }, [user, guestEmail])

  // Load active chats when activeInquiry changes
  useEffect(() => {
    if (activeInquiry) {
      DataService.getChats(activeInquiry.inquiry_id).then((chats) => {
        setActiveChats(chats || [])
      })
    }
  }, [activeInquiry])

  // Submit Inquiry (Logged in or Guest with email)
  const handleCreateInquirySubmit = async (e) => {
    e.preventDefault()
    if (!inquiryLabel.trim() || !startingStatement.trim()) return

    if (!isAuthenticated && !guestEmail.trim()) {
      return
    }

    setIsSubmitting(true)

    const customerId = user ? user.id : 101
    const customerDisplayName = user
      ? (user.name || user.username)
      : `${guestName.trim() || 'Guest'} (${guestEmail.trim()})`

    const result = await DataService.createInquiry({
      label: inquiryLabel.trim(),
      message: startingStatement.trim(),
      customerId: customerId,
      customerName: customerDisplayName,
    })

    if (result && result.newInquiry) {
      setCustomerInquiries((prev) => [result.newInquiry, ...prev])
      setActiveInquiry(result.newInquiry)
      setActiveChats([result.firstChat])
      setInquiryLabel('')
      setStartingStatement('')
      setSuccessNotice('Your inquiry has been submitted! PolChat staff will review and respond.')
    } else {
      setSuccessNotice('Error submitting inquiry. Please check your connection.')
    }
    setIsSubmitting(false)

    setTimeout(() => {
      setSuccessNotice('')
    }, 5000)
  }

  // Customer Send Follow-up Message
  const handleSendFollowUp = async (e) => {
    e.preventDefault()
    if (!replyText.trim() || !activeInquiry) return

    const newChat = await DataService.sendChatMessage({
      inquiryId: activeInquiry.inquiry_id,
      sender: 'customer',
      senderName: user ? (user.name || user.username) : guestName || 'Guest User',
      message: replyText.trim(),
    })

    setActiveChats((prev) => [...prev, newChat])
    setReplyText('')
  }

  return (
    <section id="inquiries" className="support-inquiry-section">
      <div className="support-inquiry-container">
        {/* Section Heading */}
        <div className="support-inquiry-heading-block">
          <span className="support-inquiry-tag">CUSTOMER ASSISTANCE & SUPPORT</span>
          <h2 className="support-inquiry-title">Resort Inquiries & Helpdesk</h2>
          <p className="support-inquiry-subtext">
            Have questions regarding reservations, private pavilions, ocular visits, or payment confirmations? Submit an inquiry to chat directly with Polchat staff.
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="support-inquiry-grid">
          {/* Column 1: Submit Form or Locked Email Card */}
          <div className="support-inquiry-form-card">
            {!isAuthenticated ? (
              <div className="support-locked-inquiry-wrap">
                <div className="support-locked-header-row">
                  <span className="support-locked-badge">🔒 GUEST INQUIRY FORM</span>
                </div>
                <h3 className="support-form-card-title">Send Us a Question</h3>
                <p className="support-form-card-desc">
                  Please enter your email address so our management staff can reply to your inquiry.
                </p>

                {successNotice && (
                  <div className="support-inquiry-success-box">
                    ✓ {successNotice}
                  </div>
                )}

                <form onSubmit={handleCreateInquirySubmit} className="support-new-inquiry-form">
                  <div className="support-form-field">
                    <label className="support-field-label">Your Email Address *</label>
                    <input
                      type="email"
                      className="support-field-input"
                      placeholder="e.g. yourname@email.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      required
                    />
                    <span className="support-field-hint">We'll use this email to send you responses.</span>
                  </div>

                  <div className="support-form-field">
                    <label className="support-field-label">Your Full Name</label>
                    <input
                      type="text"
                      className="support-field-input"
                      placeholder="e.g. Juan Dela Cruz"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                    />
                  </div>

                  <div className="support-form-field">
                    <label className="support-field-label">Inquiry Subject / Topic *</label>
                    <input
                      type="text"
                      className="support-field-input"
                      placeholder="e.g. Day Tour Rates, Pavilion Inclusions"
                      value={inquiryLabel}
                      onChange={(e) => setInquiryLabel(e.target.value)}
                      required
                    />
                  </div>

                  <div className="support-form-field">
                    <label className="support-field-label">Your Message *</label>
                    <textarea
                      className="support-field-textarea"
                      rows="3"
                      placeholder="Write your question or request here..."
                      value={startingStatement}
                      onChange={(e) => setStartingStatement(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="support-submit-inquiry-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Submit Inquiry with Email'}
                  </button>
                </form>

                <div className="support-locked-footer-login">
                  <span>Already have an account?</span>
                  <button
                    type="button"
                    className="support-inline-login-btn"
                    onClick={() => openAuthModal('signin')}
                  >
                    Sign In to Account
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="support-form-card-title">Submit a New Inquiry</h3>
                <p className="support-form-card-desc">
                  Posting as <strong>{user?.name || user?.username}</strong> ({user?.email || 'Customer Account'})
                </p>

                {successNotice && (
                  <div className="support-inquiry-success-box">
                    ✓ {successNotice}
                  </div>
                )}

                <form onSubmit={handleCreateInquirySubmit} className="support-new-inquiry-form">
                  <div className="support-form-field">
                    <label className="support-field-label">Inquiry Subject / Label *</label>
                    <input
                      type="text"
                      className="support-field-input"
                      placeholder="e.g. Pavilion Booking, Payment Confirmation"
                      value={inquiryLabel}
                      onChange={(e) => setInquiryLabel(e.target.value)}
                      required
                    />
                  </div>

                  <div className="support-form-field">
                    <label className="support-field-label">Starting Statement / Question *</label>
                    <textarea
                      className="support-field-textarea"
                      rows="4"
                      placeholder="State your question or request in detail..."
                      value={startingStatement}
                      onChange={(e) => setStartingStatement(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="support-submit-inquiry-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Send Inquiry to Resort Admin'}
                  </button>
                </form>
              </div>
            )}

            {/* Past Inquiries Quick Selector (if available) */}
            {customerInquiries.length > 0 && (
              <div className="support-past-inquiries-block">
                <h4 className="support-past-title">Your Inquiry Threads</h4>
                <div className="support-past-list">
                  {customerInquiries.map((inq) => {
                    const isActive = activeInquiry?.inquiry_id === inq.inquiry_id
                    return (
                      <button
                        key={inq.inquiry_id}
                        type="button"
                        className={`support-past-item ${isActive ? 'support-past-item-active' : ''}`}
                        onClick={() => setActiveInquiry(inq)}
                      >
                        <div className="support-past-header">
                          <span className="support-past-label">{inq.inquiry_label}</span>
                          <span className={`support-status-chip support-chip-${inq.inquiry_status}`}>
                            {inq.inquiry_status}
                          </span>
                        </div>
                        <span className="support-past-responder">
                          {inq.admin_responder ? `Staff: ${inq.admin_responder}` : 'Waiting for Staff'}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Column 2: Live Chat Thread with Admin */}
          <div className="support-inquiry-chat-card">
            {activeInquiry ? (
              <div className="support-chat-wrapper">
                {/* Chat Top Banner */}
                <div className="support-chat-head">
                  <div className="support-chat-head-titles">
                    <span className="support-chat-id">Ticket #{activeInquiry.inquiry_id}</span>
                    <h3 className="support-chat-label">{activeInquiry.inquiry_label}</h3>
                  </div>

                  <div className="support-chat-responder-pill">
                    {activeInquiry.admin_responder ? (
                      <span className="support-responder-assigned">
                        🟢 Staff: <strong>{activeInquiry.admin_responder}</strong>
                      </span>
                    ) : (
                      <span className="support-responder-waiting">
                        ⏳ Waiting for staff responder...
                      </span>
                    )}
                  </div>
                </div>

                {/* Messages Body */}
                <div className="support-messages-stream">
                  {activeChats.length === 0 ? (
                    <div className="support-no-messages">
                      No messages recorded yet.
                    </div>
                  ) : (
                    activeChats.map((c) => {
                      const isCustomer = c.sender === 'customer'
                      return (
                        <div
                          key={c.chat_id}
                          className={`support-msg-row ${isCustomer ? 'support-msg-customer' : 'support-msg-admin'}`}
                        >
                          <div className={`support-bubble ${isCustomer ? 'support-bubble-client' : 'support-bubble-staff'}`}>
                            <div className="support-bubble-meta">
                              <span className="support-msg-sender">
                                {isCustomer ? 'You' : (c.sender_name || activeInquiry.admin_responder || 'Polchat Staff')}
                              </span>
                              <span className="support-msg-time">
                                {c.sent_at ? new Date(c.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                            </div>
                            <p className="support-msg-text">{c.message}</p>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Follow-up Message Input */}
                <form onSubmit={handleSendFollowUp} className="support-reply-bar">
                  <input
                    type="text"
                    className="support-reply-input"
                    placeholder="Type your message here..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <button type="submit" className="support-reply-send-btn">
                    Send
                  </button>
                </form>
              </div>
            ) : (
              <div className="support-chat-empty-box">
                <span className="support-empty-chat-icon">💬</span>
                <h3>Customer Helpdesk Live Chat</h3>
                <p>
                  {isAuthenticated
                    ? 'Submit a new inquiry using the form on the left or select an existing thread to chat with our management staff.'
                    : 'Submit an inquiry with your email address on the left to start a support request.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default InquirySection
