/**
 * PolChat Garden Resort - Customer Email Notification Service
 * Handles transactional and status notifications for:
 * 1. Account OTP email verification (Sends real OTP to Gmail/inbox)
 * 2. Reservation Confirmation & Cancellation notices
 * 3. Inquiry Support responses from staff
 */

export const EmailService = {
  // Store notification in history
  logAndDispatch(emailData) {
    const payload = {
      id: `email_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...emailData,
    }

    try {
      const existing = JSON.parse(localStorage.getItem('polchat_email_notifications') || '[]')
      const updated = [payload, ...existing].slice(0, 50)
      localStorage.setItem('polchat_email_notifications', JSON.stringify(updated))
    } catch (e) {
      console.warn('LocalStorage notification save error:', e)
    }

    // Only dispatch UI toast for non-OTP emails
    if (!emailData.silentToast && emailData.type !== 'otp_verification' && typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('polchat_email_notification', {
          detail: payload,
        })
      )
    }

    return payload
  },

  /**
   * 1. Send 6-Digit OTP Code directly to Customer's Email
   */
  async sendOtpEmail({ email, otpCode }) {
    const subject = `Your OTP Is: ${otpCode}`
    const body = `Your OTP Is: ${otpCode}`

    return this.logAndDispatch({
      type: 'otp_verification',
      to: email,
      subject,
      body,
      otpCode,
      silentToast: true,
    })
  },

  /**
   * 2. Send Reservation Status Email (Confirmed or Cancelled)
   */
  async sendReservationStatusEmail({ reservation, newStatus, customerEmail }) {
    if (!reservation) return null

    let targetEmail = (customerEmail || reservation.customer_email || '').trim()

    if (!targetEmail) {
      // 1. Try parsing __EMAIL__ from event_name if present
      if (reservation.event_name && reservation.event_name.includes('__EMAIL__')) {
        const match = reservation.event_name.match(/__EMAIL__(.*?)__(?:PROOF|PAY|DOWN|REM|CHECKOUT|$)/)
        if (match && match[1] && match[1].includes('@')) {
          targetEmail = match[1].trim()
        }
      }

      // 2. Try looking up in localStorage registered users
      if (!targetEmail && typeof window !== 'undefined') {
        try {
          const registeredUsers = JSON.parse(localStorage.getItem('polchat_registered_users') || '[]')
          const found = registeredUsers.find((u) => {
            if (reservation.customer_id && Number(u.id) === Number(reservation.customer_id)) return true
            const uName = (u.name || `${u.first_name || ''} ${u.last_name || ''}`).trim().toLowerCase()
            const resName = (reservation.customer_name || '').trim().toLowerCase()
            return uName && resName && (uName === resName || resName.includes(uName))
          })
          if (found?.email) {
            targetEmail = found.email.trim()
          }
        } catch (e) {}
      }

      // 3. Check customer object on reservation
      if (!targetEmail && reservation.customer?.email) {
        targetEmail = reservation.customer.email.trim()
      }
    }

    if (!targetEmail) {
      targetEmail = 'polchat2k20@gmail.com'
    }

    const guestName = reservation.customer_name || reservation.event_name || 'Valued Guest'
    const resId = reservation.reservation_id || 'N/A'
    const dateStr = reservation.start_date
      ? new Date(reservation.start_date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'Scheduled Date'

    let subject = ''
    let body = ''

    if (newStatus === 'confirmed' || newStatus === 'approved' || newStatus === 'accepted') {
      subject = `Reservation Confirmed - PolChat Garden Resort [RES-#${resId}]`
      body = `Dear ${guestName},\n\nWe are delighted to confirm your reservation at PolChat Garden Resort!\n\n--- BOOKING DETAILS ---\nReservation No: RES-#${resId}\nScheduled Date: ${dateStr}\nGuests: ${reservation.guest_count || 1} Pax\nStatus: CONFIRMED ✓\n\nResort Address: PolChat Garden, 346 Monaco Street Antipolo Calabarzon\nFor inquiries or directions, contact us at 0953 495 4389 or reply to polchat2k20@gmail.com.\n\nWe look forward to welcoming you to our garden oasis!\n\nPolChat Garden Resort Team`
    } else if (newStatus === 'cancelled' || newStatus === 'declined' || newStatus === 'rejected') {
      subject = `Reservation Cancelled - PolChat Garden Resort [RES-#${resId}]`
      body = `Dear ${guestName},\n\nYour reservation RES-#${resId} scheduled for ${dateStr} has been cancelled.\n\nIf this cancellation was in error or if you wish to reschedule your visit, please reach out to our team directly at polchat2k20@gmail.com or call 0953 495 4389.\n\nThank you,\nPolChat Garden Resort Management`
    } else {
      return null
    }

    // 1. Dispatch real email via /api/send-email (matching OTP mailer mechanism)
    try {
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          subject,
          body,
        }),
      }).catch((err) => {
        console.warn('Status email network dispatch note:', err)
      })
    } catch (netErr) {
      console.warn('Status email dispatch note:', netErr)
    }

    // 2. Log and dispatch local UI toast
    return this.logAndDispatch({
      type: `reservation_${newStatus}`,
      to: targetEmail,
      subject,
      body,
      reservationId: resId,
      status: newStatus,
    })
  },

  /**
   * 3. Send Inquiry Reply Email Notification
   */
  async sendInquiryReplyEmail({ inquiry, replyMessage, customerEmail, adminName = 'PolChat Staff' }) {
    if (!inquiry) return null

    let targetEmail = customerEmail
    if (!targetEmail && inquiry.customer_name && inquiry.customer_name.includes('(')) {
      const match = inquiry.customer_name.match(/\(([^)]+)\)/)
      if (match && match[1] && match[1].includes('@')) {
        targetEmail = match[1].trim()
      }
    }
    if (!targetEmail) {
      targetEmail = 'polchat2k20@gmail.com'
    }

    const inquiryId = inquiry.inquiry_id || 'N/A'
    const subject = `PolChat Support: New Reply on Inquiry #${inquiryId} (${inquiry.inquiry_label || 'Support'})`
    const body = `Dear ${inquiry.customer_name || 'Guest'},\n\n${adminName} from PolChat Garden Resort has responded to your inquiry #${inquiryId}:\n\n"${replyMessage}"\n\nYou can view full conversation history and reply anytime by visiting the Resort Support portal on our website.\n\nPolChat Garden Resort Support Team\nEmail: polchat2k20@gmail.com\nAddress: PolChat Garden, 346 Monaco Street Antipolo Calabarzon`

    try {
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          subject,
          body,
        }),
      }).catch((err) => {
        console.warn('Inquiry email network dispatch note:', err)
      })
    } catch (e) {}

    return this.logAndDispatch({
      type: 'inquiry_reply',
      to: targetEmail,
      subject,
      body,
      inquiryId,
      adminName,
    })
  },
}
