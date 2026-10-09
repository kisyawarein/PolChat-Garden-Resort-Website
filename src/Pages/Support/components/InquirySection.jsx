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

  // Reset state when auth changes (e.g. logging out or switching accounts)
  useEffect(() => {
    if (!isAuthenticated) {
      setActiveInquiry(null)
      setActiveChats([])
      setCustomerInquiries([])
      setGuestEmail('')
      setGuestName('')
      setReplyText('')
      setInquiryLabel('')
      setStartingStatement('')
    } else {
      setActiveInquiry(null)
      setActiveChats([])
      setReplyText('')
    }
  }, [isAuthenticated, user?.id])

  // Load inquiries strictly for the current authenticated user or guest email
  useEffect(() => {
    let isMounted = true

    const loadInquiries = async () => {
      const allInquiries = await DataService.getInquiries()
      if (!isMounted) return

      if (isAuthenticated && user) {
        const userInqs = allInquiries.filter((i) => {
          const idMatch = user.id && Number(i.customer_id) === Number(user.id)
          const nameMatch = user.name && i.customer_name?.toLowerCase() === user.name.toLowerCase()
          const usernameMatch = user.username && i.customer_name?.toLowerCase() === user.username.toLowerCase()
          const emailMatch = user.email && i.customer_name?.toLowerCase().includes(user.email.toLowerCase())
          return idMatch || nameMatch || usernameMatch || emailMatch
        })

        setCustomerInquiries(userInqs)
        if (userInqs.length > 0) {
          setActiveInquiry((prev) => {
            if (prev && userInqs.some((q) => q.inquiry_id === prev.inquiry_id)) {
              return prev
            }
            return userInqs[0]
          })
        } else {
          setActiveInquiry(null)
          setActiveChats([])
        }
      } else if (!isAuthenticated && guestEmail.trim()) {
        const emailInqs = allInquiries.filter(
          (i) => i.customer_name && i.customer_name.toLowerCase().includes(guestEmail.trim().toLowerCase())
        )
        setCustomerInquiries(emailInqs)
        if (emailInqs.length > 0) {
          setActiveInquiry((prev) => {
            if (prev && emailInqs.some((q) => q.inquiry_id === prev.inquiry_id)) {
              return prev
            }
            return emailInqs[0]
          })
        } else {
          setActiveInquiry(null)
          setActiveChats([])
        }
      } else {
        setCustomerInquiries([])
        setActiveInquiry(null)
        setActiveChats([])
      }
    }

    loadInquiries()

    return () => {
      isMounted = false
    }
  }, [user, isAuthenticated, guestEmail])

  // Load active chats when activeInquiry changes
  useEffect(() => {
    let isMounted = true
    if (activeInquiry) {
      DataService.getChats(activeInquiry.inquiry_id).then((chats) => {
        if (isMounted) {
          setActiveChats(chats || [])
        }
      })
    } else {
      setActiveChats([])
    }
    return () => {
      isMounted = false
    }
  }, [activeInquiry])

  // Submit Inquiry (Logged in or Guest with email) - Optimistic
  const handleCreateInquirySubmit = async (e) => {
    e.preventDefault()
    if (!inquiryLabel.trim() || !startingStatement.trim()) return

    if (!isAuthenticated && !guestEmail.trim()) {
      return
    }

    const customerId = user ? user.id : 101
    const customerDisplayName = user
      ? (user.name || user.username)
      : `${guestName.trim() || 'Guest'} (${guestEmail.trim()})`

    const optimisticInquiry = {
      inquiry_id: `temp_${Date.now()}`,
      inquiry_label: inquiryLabel.trim(),
      customer_id: customerId,
      customer_name: customerDisplayName,
      created_at: new Date().toISOString(),
      date_created: new Date().toISOString().split('T')[0],
      inquiry_status: 'open',
      is_resolved: false,
    }

    const optimisticChat = {
      chat_id: `chat_${Date.now()}`,
      inquiry_id: optimisticInquiry.inquiry_id,
      sender: 'customer',
      sender_name: customerDisplayName,
      message: startingStatement.trim(),
      created_at: new Date().toISOString(),
    }

    // Instant optimistic update
    setCustomerInquiries((prev) => [optimisticInquiry, ...prev])
    setActiveInquiry(optimisticInquiry)
    setActiveChats([optimisticChat])
    setInquiryLabel('')
    setStartingStatement('')
    setSuccessNotice('Your inquiry has been submitted! PolChat staff will review and respond.')

    setTimeout(() => {
      setSuccessNotice('')
    }, 5000)

    // Sync in background
    DataService.createInquiry({
      label: optimisticInquiry.inquiry_label,
      message: optimisticChat.message,
      customerId: customerId,
      customerName: customerDisplayName,
    }).then((res) => {
      if (res?.newInquiry) {
        setCustomerInquiries((prev) =>
          prev.map((i) => (i.inquiry_id === optimisticInquiry.inquiry_id ? res.newInquiry : i))
        )
        setActiveInquiry(res.newInquiry)
      }
    })
  }

  // Customer Send Follow-up Message - Optimistic
  const handleSendFollowUp = (e) => {
    e.preventDefault()
    if (!replyText.trim() || !activeInquiry) return

    const msg = replyText.trim()
    const senderName = user ? (user.name || user.username) : guestName || 'Guest User'

    const optimisticMsg = {
      chat_id: `chat_${Date.now()}`,
      inquiry_id: activeInquiry.inquiry_id,
      sender: 'customer',
      sender_name: senderName,
      message: msg,
      created_at: new Date().toISOString(),
    }

    // Instantly append to chat
    setActiveChats((prev) => [...prev, optimisticMsg])
    setReplyText('')

    // Sync in background
    DataService.sendChatMessage({
      inquiryId: activeInquiry.inquiry_id,
      sender: 'customer',
      senderName: senderName,
      message: msg,
    })
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
                  <span className="support-locked-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span>GUEST INQUIRY FORM</span>
                  </span>
                </div>
                <h3 className="support-form-card-title">Send Us a Question</h3>
                <p className="support-form-card-desc">
                  Please enter your email address so our management staff can reply to your inquiry.
                </p>

                {successNotice && (
                  <div className="support-inquiry-success-box">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{successNotice}</span>
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
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{successNotice}</span>
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
                      <span className="support-responder-assigned" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16a34a', display: 'inline-block' }} />
                        <span>Staff: <strong>{activeInquiry.admin_responder}</strong></span>
                      </span>
                    ) : (
                      <span className="support-responder-waiting" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>Waiting for staff responder...</span>
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
                  <button type="submit" className="support-reply-send-btn" disabled={!replyText.trim()}>
                    Send
                  </button>
                </form>
              </div>
            ) : (
              <div className="support-chat-empty-box">
                <span className="support-empty-chat-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ACAD79" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </span>
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
