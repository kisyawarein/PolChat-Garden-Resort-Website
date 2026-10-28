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
} // <-- ADD THIS closing brace

if (!targetEmail) {
  console.warn('Reservation email skipped: no customer email address found.')
  return null
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

// Do not send a second confirmation email after booking/payment.
// BookingReceipt already sends the official receipt email with PDF.
const normalizedStatus = String(newStatus).toLowerCase()

const isConfirmationStatus =
  normalizedStatus === 'confirmed' ||
  normalizedStatus === 'approved' ||
  normalizedStatus === 'accepted'

if (!isConfirmationStatus) {
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
async sendVisitationStatusEmail({
  visitation,
  newStatus,
  customerEmail,
}) {
  if (!visitation) return null

  const normalizedStatus = String(newStatus || '')
    .trim()
    .toLowerCase()

  // Only send Ocular cancellation emails for now.
const isConfirmed =
  normalizedStatus === 'confirmed' ||
  normalizedStatus === 'approved' ||
  normalizedStatus === 'accepted'

const isCancelled =
  normalizedStatus === 'cancelled' ||
  normalizedStatus === 'canceled' ||
  normalizedStatus === 'declined' ||
  normalizedStatus === 'rejected'

const isArrived =
  normalizedStatus === 'arrived' ||
  normalizedStatus === 'completed'

const isNoShow =
  normalizedStatus === 'no_show' ||
  normalizedStatus === 'did_not_arrive' ||
  normalizedStatus === 'not_arrived'

if (
  !isConfirmed &&
  !isCancelled &&
  !isArrived &&
  !isNoShow
) {
  return null
}



  let targetEmail = String(
    customerEmail ||
    visitation.customer_email ||
    visitation.customer?.email ||
    ''
  ).trim()

  // Fall back to the locally registered customer account.
  if (!targetEmail && typeof window !== 'undefined') {
    try {
      const registeredUsers = JSON.parse(
        localStorage.getItem(
          'polchat_registered_users'
        ) || '[]'
      )

      const customerName = String(
        visitation.customer_name || ''
      )
        .trim()
        .toLowerCase()

      const found = registeredUsers.find((user) => {
        if (
          visitation.customer_id &&
          Number(user.id) ===
            Number(visitation.customer_id)
        ) {
          return true
        }

        const registeredName = String(
          user.name ||
          `${user.first_name || ''} ${
            user.last_name || ''
          }`
        )
          .trim()
          .toLowerCase()

        return (
          registeredName &&
          customerName &&
          (
            registeredName === customerName ||
            customerName.includes(registeredName) ||
            registeredName.includes(customerName)
          )
        )
      })

      if (found?.email) {
        targetEmail = found.email.trim()
      }
    } catch (error) {
      console.warn(
        'Unable to resolve Ocular customer email:',
        error
      )
    }
  }

  if (!targetEmail) {
    console.warn(
      'Ocular cancellation email skipped: no customer email address found.'
    )
    return null
  }

  const guestName =
    visitation.customer_name ||
    visitation.customer?.first_name ||
    'Valued Guest'

  const visitationId =
    visitation.visitation_id || 'N/A'

  const dateText = visitation.visitation_start_date
    ? new Date(
        visitation.visitation_start_date
      ).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'the scheduled date'

  const slotText =
    visitation.slot_type ||
    'the selected ocular timeslot'

let subject = ''
let body = ''

if (isConfirmed) {
  subject =
    `Ocular Visit Confirmed - PolChat Garden Resort ` +
    `[OCULAR-#${visitationId}]`

  body =
    `Dear ${guestName},\n\n` +
    `Your ocular visit at PolChat Garden Resort has been confirmed.\n\n` +
    `--- OCULAR VISIT DETAILS ---\n` +
    `Ocular Visit No: OCULAR-#${visitationId}\n` +
    `Scheduled Date: ${dateText}\n` +
    `Timeslot: ${slotText}\n` +
    `Visitors: ${visitation.guest_count || 1}\n` +
    `Status: CONFIRMED\n\n` +
    `Please arrive during your confirmed schedule.\n\n` +
    `For assistance, contact PolChat Garden Resort at ` +
    `0953 495 4389 or reply to polchat2k20@gmail.com.\n\n` +
    `We look forward to welcoming you!\n\n` +
    `PolChat Garden Resort Team`
}

if (isArrived) {
  subject =
    `Welcome to PolChat Garden Resort - ` +
    `[OCULAR-#${visitationId}]`

  body =
    `Dear ${guestName},\n\n` +
    `Thank you for arriving for your scheduled ocular visit at PolChat Garden Resort.\n\n` +
    `--- OCULAR VISIT DETAILS ---\n` +
    `Ocular Visit No: OCULAR-#${visitationId}\n` +
    `Scheduled Date: ${dateText}\n` +
    `Timeslot: ${slotText}\n` +
    `Visitors: ${visitation.guest_count || 1}\n` +
    `Status: ARRIVED\n\n` +
    `We hope you enjoy your visit and have a pleasant time viewing the resort facilities.\n\n` +
    `If you have questions during your visit, our team will be happy to assist you.\n\n` +
    `Thank you for visiting PolChat Garden Resort!\n\n` +
    `PolChat Garden Resort Team`
}

if (isNoShow) {
  subject =
    `We Missed You - PolChat Garden Resort ` +
    `[OCULAR-#${visitationId}]`

  body =
    `Dear ${guestName},\n\n` +
    `Our team was expecting you for your scheduled ocular visit at PolChat Garden Resort, but you did not arrive during your reserved schedule.\n\n` +
    `--- OCULAR VISIT DETAILS ---\n` +
    `Ocular Visit No: OCULAR-#${visitationId}\n` +
    `Scheduled Date: ${dateText}\n` +
    `Timeslot: ${slotText}\n` +
    `Visitors: ${visitation.guest_count || 1}\n` +
    `Status: NO SHOW\n\n` +
    `If your plans changed, you are welcome to schedule another ocular visit for an available date and timeslot.\n\n` +
    `For assistance, contact PolChat Garden Resort at ` +
    `0953 495 4389 or reply to polchat2k20@gmail.com.\n\n` +
    `Thank you,\n` +
    `PolChat Garden Resort Team`
}

if (isCancelled) {
  subject =
    `Ocular Visit Cancelled - PolChat Garden Resort ` +
    `[OCULAR-#${visitationId}]`

  body =
    `Dear ${guestName},\n\n` +
    `Your ocular visit OCULAR-#${visitationId}, ` +
    `scheduled for ${dateText} during ${slotText}, ` +
    `has been cancelled.\n\n` +
    `The requested schedule may no longer be available. ` +
    `You may submit another ocular visit request for a ` +
    `different date or timeslot.\n\n` +
    `For assistance, contact PolChat Garden Resort at ` +
    `0953 495 4389 or reply to polchat2k20@gmail.com.\n\n` +
    `Thank you,\n` +
    `PolChat Garden Resort Management`
}

if (!subject || !subject.trim() || !body || !body.trim()) {
  console.warn(
    'Ocular status email blocked because subject/body is empty:',
    normalizedStatus
  )
  return null
}

  try {
    fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: targetEmail,
        subject,
        body,
      }),
    }).catch((error) => {
      console.warn(
        'Ocular status email network dispatch note:',
        error
      )
    })
  } catch (error) {
    console.warn(
      'Ocular cancellation email dispatch note:',
      error
    )
  }

  return this.logAndDispatch({
    type: `visitation_${normalizedStatus}`,
    to: targetEmail,
    subject,
    body,
    visitationId,
    status: normalizedStatus,
  })
},
  /**
   * 3. Send Inquiry Reply Email Notification
   */
  /**
 * Notify the resort admin when a new inquiry is submitted.
 */
async sendNewInquiryAdminEmail({
  inquiry,
  message,
  customerName,
  guestName,
  guestEmail,
}) {
  if (!inquiry) return null

  const adminEmail = 'polchat2k20@gmail.com'

  const inquiryId =
    inquiry.inquiry_id || 'N/A'

  const senderName =
    guestName ||
    customerName ||
    inquiry.guest_name ||
    inquiry.customer_name ||
    'Guest'

  const senderEmail =
    guestEmail ||
    inquiry.guest_email ||
    inquiry.customer_email ||
    ''

  const inquiryLabel =
    inquiry.inquiry_label ||
    'General Inquiry'

  const safeMessage =
    String(message || '').trim()

  const subject =
    `New PolChat Inquiry #${inquiryId} - ${inquiryLabel}`

  const body =
    `A new inquiry has been submitted through the PolChat Garden Resort website.\n\n` +
    `--- INQUIRY DETAILS ---\n` +
    `Inquiry No: #${inquiryId}\n` +
    `Guest/Customer: ${senderName}\n` +
    `Email: ${senderEmail || 'Registered customer'}\n` +
    `Subject: ${inquiryLabel}\n\n` +
    `Message:\n${safeMessage || 'No message provided.'}\n\n` +
    `Please log in to the PolChat Admin dashboard to review and respond to this inquiry.\n\n` +
    `PolChat Garden Resort`

  try {
    await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: adminEmail,
        subject,
        body,
      }),
    })
  } catch (err) {
    console.warn(
      'Admin inquiry notification email failed:',
      err
    )
  }

  return this.logAndDispatch({
    type: 'new_inquiry_admin',
    to: adminEmail,
    subject,
    body,
    inquiryId,
    silentToast: true,
  })
},
  async sendInquiryReplyEmail({ inquiry, replyMessage, customerEmail, adminName = 'PolChat Staff' }) {
    if (!inquiry) return null

    let targetEmail =
  inquiry.guest_email ||
  customerEmail ||
  inquiry.customer_email ||
  inquiry.customer?.email ||
  ''
    if (!targetEmail && inquiry.customer_name && inquiry.customer_name.includes('(')) {
      const match = inquiry.customer_name.match(/\(([^)]+)\)/)


      if (match && match[1] && match[1].includes('@')) {
        targetEmail = match[1].trim()
      }
    }

    if (!targetEmail) {
      targetEmail = 'polchat2k20@gmail.com'
    }
const recipientName =
  inquiry.guest_name ||
  inquiry.customer_name ||
  inquiry.customer?.name ||
  'Guest'

    const inquiryId = inquiry.inquiry_id || 'N/A'
    const subject = `PolChat Support: New Reply on Inquiry #${inquiryId} (${inquiry.inquiry_label || 'Support'})`
    const body = `Dear ${recipientName},\n\n${adminName} from PolChat Garden Resort has responded to your inquiry #${inquiryId}:\n\n"${replyMessage}"\n\nYou can view full conversation history and reply anytime by visiting the Resort Support portal on our website.\n\nPolChat Garden Resort Support Team\nEmail: polchat2k20@gmail.com\nAddress: PolChat Garden, 346 Monaco Street Antipolo Calabarzon`
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
