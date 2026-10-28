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
  const [guestEmailRegistered, setGuestEmailRegistered] = useState(false)
  const [customerInquiries, setCustomerInquiries] = useState([])
  const [activeInquiry, setActiveInquiry] = useState(null)
  const [activeChats, setActiveChats] = useState([])
  const [replyText, setReplyText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successNotice, setSuccessNotice] = useState('')
  const [errorNotice, setErrorNotice] = useState('')

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
useEffect(() => {
  let isMounted = true

  const checkGuestEmail = async () => {
    if (isAuthenticated || !guestEmail.trim()) {
      if (isMounted) {
        setGuestEmailRegistered(false)
      }
      return
    }

    const email = guestEmail.trim().toLowerCase()

    const account = await DataService.findAccountCredential({
      email,
    })

    if (isMounted) {
      setGuestEmailRegistered(Boolean(account))
    }
  }

  const timer = window.setTimeout(checkGuestEmail, 400)

  return () => {
    isMounted = false
    window.clearTimeout(timer)
  }
}, [guestEmail, isAuthenticated])
  // Load inquiries strictly for the current authenticated user or guest email
  useEffect(() => {
    let isMounted = true

    const loadInquiries = async () => {
  const allInquiries = await DataService.getInquiries()
  if (!isMounted) return

  if (isAuthenticated && user) {
    const userInqs = allInquiries.filter((i) => {
      const idMatch =
        user.id && Number(i.customer_id) === Number(user.id)

      return idMatch
    })

    setCustomerInquiries(userInqs)

    if (userInqs.length > 0) {
      setActiveInquiry((prev) => {
        if (
          prev &&
          userInqs.some((q) => q.inquiry_id === prev.inquiry_id)
        ) {
          return prev
        }

        return userInqs[0]
      })
    } else {
      setActiveInquiry(null)
      setActiveChats([])
    }
  } else {
    // Guests must not retrieve inquiry history using only an email address.
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

// Load active chats and keep the current inquiry updated
useEffect(() => {
  let isMounted = true
  let chatInterval = null

  const loadChats = async () => {
    if (!activeInquiry) {
      if (isMounted) {
        setActiveChats([])
      }
      return
    }

    try {
      const chats = await DataService.getChats(
        activeInquiry.inquiry_id
      )

      if (isMounted) {
        setActiveChats(chats || [])
      }
    } catch (error) {
      console.error('Failed to refresh inquiry chats:', error)
    }
  }

  // Load immediately
  loadChats()

  // Then automatically check for new messages
  chatInterval = setInterval(loadChats, 2000)

  return () => {
    isMounted = false

    if (chatInterval) {
      clearInterval(chatInterval)
    }
  }
}, [activeInquiry?.inquiry_id])

  // Submit Inquiry (Logged in or Guest with email) - Optimistic
  const handleCreateInquirySubmit = async (e) => {
  e.preventDefault()

  setErrorNotice('')

  if (!inquiryLabel.trim() || !startingStatement.trim()) {
    setErrorNotice('Please complete the inquiry subject and message.')
    return
  }

  if (!isAuthenticated) {
    const cleanGuestEmail = guestEmail.trim().toLowerCase()
    const emailPattern = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/

    if (!cleanGuestEmail) {
      setErrorNotice('Please enter your email address.')
      return
    }

    if (!emailPattern.test(cleanGuestEmail)) {
      setErrorNotice(
        'Please enter a valid email address, for example: name@gmail.com'
      )
      return
    }

    if (guestEmailRegistered) {
      setErrorNotice(
        'This email is already registered to a PolChat account. Please sign in to continue with this email.'
      )
      return
    }
  }

  const customerId = user ? user.id : null

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

  setCustomerInquiries((prev) => [
    optimisticInquiry,
    ...prev,
  ])

  setActiveInquiry(optimisticInquiry)
  setActiveChats([optimisticChat])
  setInquiryLabel('')
  setStartingStatement('')

  setSuccessNotice(
    'Your inquiry has been submitted! PolChat staff will review and respond.'
  )

  setTimeout(() => {
    setSuccessNotice('')
  }, 5000)

  DataService.createInquiry({
    label: optimisticInquiry.inquiry_label,
    message: optimisticChat.message,
    customerId,
    customerName: customerDisplayName,
    guestName: !isAuthenticated
      ? guestName.trim()
      : null,
    guestEmail: !isAuthenticated
      ? guestEmail.trim().toLowerCase()
      : (user?.email || null),
  }).then((res) => {
    if (res?.newInquiry) {
      setCustomerInquiries((prev) =>
        prev.map((i) =>
          i.inquiry_id === optimisticInquiry.inquiry_id
            ? res.newInquiry
            : i
        )
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

  const requireInquiryLogin = () => {
  if (!isAuthenticated) {
    openAuthModal('signin')
    return true
  }

  return false
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
  <div>
    <h3 className="support-form-card-title">
      Send Us a Question
    </h3>

<p className="support-form-card-desc">
  {isAuthenticated
    ? `Posting as ${user?.name || user?.username || 'Customer'}`
    : 'Send us your question as a guest. Enter your name and email so our team can respond to you.'}
</p>

    {successNotice && (
      <div className="support-inquiry-success-box">
        <span>{successNotice}</span>
      </div>
    )}

    {errorNotice && (
      <div
        className="support-inquiry-email-warning"
        style={{ marginBottom: '12px' }}
      >
        {errorNotice}
      </div>
    )}

<form
  className="support-new-inquiry-form"
  onSubmit={handleCreateInquirySubmit}
>
  
{!isAuthenticated && (
  <>
    <div className="support-form-field">
      <label className="support-field-label">
        Your Name *
      </label>

      <input
        type="text"
        className="support-field-input"
        placeholder="Enter your full name"
        value={guestName}
        onChange={(e) => setGuestName(e.target.value)}
        required
      />
    </div>

    <div className="support-form-field">
      <label className="support-field-label">
        Your Email *
      </label>

      <input
        type="email"
        className="support-field-input"
        placeholder="name@example.com"
        value={guestEmail}
        onChange={(e) => {
          setGuestEmail(e.target.value)
          setErrorNotice('')
        }}
        required
      />

      {guestEmailRegistered && (
        <div
          className="support-inquiry-email-warning"
          style={{ marginTop: '8px' }}
        >
          <div>
            This email is already registered to a PolChat
            account. Please sign in to continue using this
            email.
          </div>

          <button
            type="button"
            className="support-inline-login-btn"
            onClick={() => openAuthModal('signin')}
          >
            Sign In to Account
          </button>
        </div>
      )}
    </div>
  </>
)}
      <div className="support-form-field">
        <label className="support-field-label">
          Inquiry Subject / Topic *
        </label>

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
        <label className="support-field-label">
          Your Message *
        </label>

        <textarea
          className="support-field-textarea"
          rows="4"
          placeholder="Write your question or request here..."
value={startingStatement}
onChange={(e) => setStartingStatement(e.target.value)}
          required
        />
      </div>

<button
  type="submit"
  className="support-submit-inquiry-btn"
  disabled={isSubmitting || (!isAuthenticated && guestEmailRegistered)}
>
  {isSubmitting
    ? 'Submitting...'
    : 'Send Inquiry to Resort Admin'}
</button>
    </form>

    {!isAuthenticated && (
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
    )}

    {customerInquiries.length > 0 && (
      <div className="support-past-inquiries-block">
        <h4 className="support-past-title">
          Your Inquiry Threads
        </h4>

        <div className="support-past-list">
          {customerInquiries.map((inq) => {
            const isActive =
              activeInquiry?.inquiry_id === inq.inquiry_id

            return (
              <button
                key={inq.inquiry_id}
                type="button"
                className={`support-past-item ${
                  isActive
                    ? 'support-past-item-active'
                    : ''
                }`}
                onClick={() => setActiveInquiry(inq)}
              >
                <div className="support-past-header">
                  <span className="support-past-label">
                    {inq.inquiry_label}
                  </span>

                  <span
                    className={`support-status-chip support-chip-${inq.inquiry_status}`}
                  >
                    {inq.inquiry_status}
                  </span>
                </div>

                <span className="support-past-responder">
                  {inq.admin_responder
                    ? `Staff: ${inq.admin_responder}`
                    : 'Waiting for Staff'}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    )}
  </div>
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
