import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { useEffect, useRef } from 'react'



function BookingReceipt({
  reservation,
  selectedPackage,
  formData,
  priceCalculation,
  paymentDetails,
  onReset,
}) {


  const emailedReceiptRef = useRef(null)

  const handlePrint = () => {
    window.print()
  }

  const generateReceiptPDF = async () => {
  const receiptElement = document.getElementById('resv-printable-slip')

  if (!receiptElement) {
    throw new Error('Reservation slip not found.')
  }

  const canvas = await html2canvas(receiptElement, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  })

  const imageData = canvas.toDataURL('image/jpeg', 0.45)

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 10
  const usableWidth = pageWidth - margin * 2

  const imageWidth = usableWidth
  const imageHeight = (canvas.height * imageWidth) / canvas.width

  let heightLeft = imageHeight
  let position = margin

  pdf.addImage(
    imageData,
    'JPEG',
    margin,
    position,
    imageWidth,
    imageHeight
  )

  heightLeft -= pageHeight - margin * 2

 while (heightLeft > 0) {
  pdf.addPage()

  position = margin - (imageHeight - heightLeft)

  pdf.addImage(
    imageData,
    'JPEG',
    margin,
    position,
    imageWidth,
    imageHeight
  )

  heightLeft -= pageHeight - margin * 2
}

return pdf
}

// PASTE THE NEW FUNCTION HERE

const generateEmailReceiptPDF = async () => {
  const receiptElement = document.getElementById('resv-printable-slip')

  if (!receiptElement) {
    throw new Error('Reservation slip not found.')
  }

  const canvas = await html2canvas(receiptElement, {
    scale: 0.65,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  })

  const imageData = canvas.toDataURL('image/jpeg', 0.35)

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 8
  const usableWidth = pageWidth - margin * 2
  const usableHeight = pageHeight - margin * 2

  const imageWidth = usableWidth
  const imageHeight = (canvas.height * imageWidth) / canvas.width

  let heightLeft = imageHeight
  let position = margin

  pdf.addImage(
    imageData,
    'JPEG',
    margin,
    position,
    imageWidth,
    imageHeight,
    undefined,
    'FAST'
  )

  heightLeft -= usableHeight

  while (heightLeft > 0) {
    pdf.addPage()

    position = margin - (imageHeight - heightLeft)

    pdf.addImage(
      imageData,
      'JPEG',
      margin,
      position,
      imageWidth,
      imageHeight,
      undefined,
      'FAST'
    )

    heightLeft -= usableHeight
  }

  return pdf
}

const handleDownloadPDF = async () => {
  try {
    const pdf = await generateReceiptPDF()

    const filename =
      `PolChat-Reservation-${reservation?.reservation_id || 'Receipt'}.pdf`

    pdf.save(filename)
  } catch (error) {
    console.error('Failed to download reservation PDF:', error)
  }
}

useEffect(() => {
  const reservationId = reservation?.reservation_id
  const customerEmail = String(
    reservation?.customer_email || ''
  ).trim()

  if (!reservationId || !customerEmail) {
    return
  }

  // Do not email optimistic temporary reservations
  if (String(reservationId).startsWith('temp_')) {
    return
  }

  const emailKey = `polchat_receipt_emailed_${reservationId}`

  // Prevent duplicate sending during rerenders and remounts
 const existingEmailState = localStorage.getItem(emailKey)

if (
  emailedReceiptRef.current === reservationId ||
  existingEmailState === 'sending' ||
  existingEmailState === 'true'
) {
  return
}

  const sendReceiptEmail = async () => {
  try {
    emailedReceiptRef.current = reservationId
    localStorage.setItem(emailKey, 'sending')

      const pdf = await generateEmailReceiptPDF()
      const pdfDataUri = pdf.output('datauristring')
      const pdfBase64 = pdfDataUri.split(',')[1]

      if (!pdfBase64) {
        throw new Error('Generated receipt PDF is empty.')
      }

      const filename =
        `PolChat-Reservation-${reservationId}.pdf`

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: customerEmail,
          subject:
            `Your PolChat Garden Resort Receipt [RES-#${reservationId}]`,
          body:
            `Dear ${reservation?.customer_name || 'Valued Guest'},\n\n` +
            `Thank you for your reservation at PolChat Garden Resort.\n\n` +
            `Your reservation receipt is attached to this email as a PDF.\n\n` +
            `Reservation No: RES-#${reservationId}\n` +
            `Payment Method: ${reservation?.payment_type || paymentDetails?.paymentMethod || 'Recorded'}\n\n` +
            `Please keep the attached receipt and present a printed or digital copy upon arrival.\n\n` +
            `PolChat Garden Resort Team`,
          pdfBase64,
          pdfFilename: filename,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || 'Receipt email could not be delivered.'
        )
      }

      localStorage.setItem(emailKey, 'true')

      console.log(
        `Receipt email delivered to ${customerEmail}`
      )
    } catch (error) {
  emailedReceiptRef.current = null
  localStorage.removeItem(emailKey)

  console.error('Failed to email reservation receipt:', error)
}
  }

  // Allow the receipt DOM to finish rendering before html2canvas captures it
  const timer = window.setTimeout(sendReceiptEmail, 600)

  return () => {
    window.clearTimeout(timer)
  }
}, [
  reservation?.reservation_id,
  reservation?.customer_email,
])

  const resId = reservation?.reservation_id || Date.now().toString().slice(-6)
  const isCash = paymentDetails?.paymentMethod === 'cash' || reservation?.payment_type === 'cash'
  const bookingDateStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const downpayment = paymentDetails?.downpaymentAmount || reservation?.downpayment_amount || Math.round((priceCalculation.totalAmount || 0) * 0.5)
  const remainingBalance = Math.max(0, paymentDetails?.remainingBalance !== undefined ? paymentDetails.remainingBalance : (priceCalculation.totalAmount - downpayment))

  return (
    <div className="resv-receipt-step-wrapper">
      <div className="resv-success-banner">
        <div className="resv-success-icon-badge">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="resv-success-title">
          {isCash ? 'Cash Reservation Placed!' : 'Reservation Successfully Placed!'}
        </h2>
        <p className="resv-success-subtext">
          {isCash
            ? 'Your reservation has been recorded. Please save or print this official slip and present it to the resort front desk reception today to pay your 50% downpayment.'
            : 'Thank you for reserving your stay with PolChat Garden Resort. Your booking and GCash payment proof have been recorded directly into our system.'}
        </p>
      </div>

      {/* Official Printable Receipt Card */}
      <div className="resv-receipt-document" id="resv-printable-slip">
        {/* Receipt Header */}
        <div className="resv-receipt-doc-header">
          <div>
            <h1 className="resv-receipt-resort-title">PolChat Garden Resort</h1>
            <p className="resv-receipt-resort-sub">PolChat Garden, 346 Monaco Street Antipolo Calabarzon</p>
            <p className="resv-receipt-resort-sub">Contact: 0953 495 4389 • polchat2k20@gmail.com</p>
          </div>
          <div className="resv-receipt-id-box">
            <span className="resv-receipt-id-label">OFFICIAL RESERVATION SLIP</span>
            <span className="resv-receipt-id-number">RES-#{resId}</span>
            <span className={`resv-receipt-status-badge ${isCash ? 'badge-cash-pending' : ''}`}>
              {isCash ? 'PAY CASH AT DESK TODAY' : 'PENDING REVIEW'}
            </span>
          </div>
        </div>

        <div className="resv-receipt-hr" />

        {/* Guest & Schedule Info */}
        <div className="resv-receipt-info-grid">
          <div className="resv-receipt-col">
            <span className="resv-receipt-field-title">GUEST INFORMATION</span>
            <div className="resv-receipt-field-row">
              <span className="resv-receipt-label">Guest Name:</span>
              <span className="resv-receipt-val">{formData.firstName} {formData.lastName}</span>
            </div>
            {formData.companyName && (
              <div className="resv-receipt-field-row">
                <span className="resv-receipt-label">Company:</span>
                <span className="resv-receipt-val">{formData.companyName}</span>
              </div>
            )}
            <div className="resv-receipt-field-row">
              <span className="resv-receipt-label">Contact No:</span>
              <span className="resv-receipt-val">{formData.phoneNumber}</span>
            </div>
            <div className="resv-receipt-field-row">
              <span className="resv-receipt-label">Booking Date:</span>
              <span className="resv-receipt-val">{bookingDateStr}</span>
            </div>
          </div>

          <div className="resv-receipt-col">
            <span className="resv-receipt-field-title">RESERVATION SCHEDULE</span>
            <div className="resv-receipt-field-row">
              <span className="resv-receipt-label">Package:</span>
              <span className="resv-receipt-val">{(selectedPackage?.duration_name || '').replace(/_/g, ' ')}</span>
            </div>
            <div className="resv-receipt-field-row">
              <span className="resv-receipt-label">Scheduled Date:</span>
              <span className="resv-receipt-val">{reservation?.start_date ? new Date(reservation.start_date).toLocaleDateString() : 'Confirmed Date'}</span>
            </div>
            <div className="resv-receipt-field-row">
              <span className="resv-receipt-label">Guest Count:</span>
              <span className="resv-receipt-val">{formData.guestCount} Pax</span>
            </div>
            <div className="resv-receipt-field-row">
              <span className="resv-receipt-label">Event:</span>
              <span className="resv-receipt-val">{formData.eventName || 'Resort Stay'}</span>
            </div>
          </div>
        </div>

        <div className="resv-receipt-hr" />

        {/* Financial Breakdown Table */}
        <table className="resv-receipt-table">
          <thead>
            <tr>
              <th className="resv-th-desc">Description / Item</th>
              <th className="resv-th-qty">Qty / Unit</th>
              <th className="resv-th-amount">Amount (PHP)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{(selectedPackage?.duration_name || '').replace(/_/g, ' ')} ({selectedPackage?.duration_hours}h)</td>
              <td>1 Session</td>
              <td className="resv-td-num">₱{priceCalculation.basePrice.toLocaleString()}</td>
            </tr>
            {priceCalculation.extraPaxCharge > 0 && (
              <tr>
                <td>Extra Guest Headcount Charge (Exceeding max capacity)</td>
                <td>{priceCalculation.extraPaxCount} Pax</td>
                <td className="resv-td-num">₱{priceCalculation.extraPaxCharge.toLocaleString()}</td>
              </tr>
            )}
            {priceCalculation.extensionCharge > 0 && (
              <tr>
                <td>Extended Stay Duration</td>
                <td>{formData.extensionHours} Hour(s)</td>
                <td className="resv-td-num">₱{priceCalculation.extensionCharge.toLocaleString()}</td>
              </tr>
            )}
            {priceCalculation.eventCharge > 0 && (
              <tr>
                <td>Event / Occasion Charge</td>
                <td>1 Event</td>
                <td className="resv-td-num">₱{priceCalculation.eventCharge.toLocaleString()}</td>
              </tr>
            )}
            <tr>
              <td>Security Deposit (100% Refundable upon checkout)</td>
              <td>1 Deposit</td>
              <td className="resv-td-num">₱{priceCalculation.securityDeposit.toLocaleString()}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="resv-tfoot-total-row">
              <td colSpan="2" className="resv-tfoot-label">TOTAL BOOKING COST:</td>
              <td className="resv-tfoot-amount">₱{priceCalculation.totalAmount.toLocaleString()}</td>
            </tr>
            <tr className="resv-tfoot-sub-row">
              <td colSpan="2" className="resv-tfoot-label">
                {isCash ? '50% DOWNPAYMENT DUE TODAY (CASH):' : '50% DOWNPAYMENT PAID (GCASH):'}
              </td>
              <td className="resv-tfoot-amount" style={{ color: isCash ? '#92400E' : '#386B06' }}>
                ₱{downpayment.toLocaleString()}
              </td>
            </tr>
            <tr className="resv-tfoot-sub-row">
              <td colSpan="2" className="resv-tfoot-label">REMAINING BALANCE ON CHECKOUT:</td>
              <td className="resv-tfoot-amount">₱{remainingBalance.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        {/* Payment Verification Footnote */}
        <div className="resv-receipt-payment-note">
          <div className="resv-receipt-note-row">
            <span>Payment Mode: <strong>{isCash ? 'Cash at Front Desk' : 'GCash Online Transfer'}</strong></span>
            <span>
              Status: <strong className={isCash ? 'resv-proof-cash-tag' : 'resv-proof-verified-tag'}>
                {isCash ? 'Pay 50% Deposit Today at Desk' : 'Screenshot Attached & Verified'}
              </strong>
            </span>
          </div>
          <p className="resv-receipt-terms">
            {isCash
              ? '* Please present this printed slip or digital screenshot to the front desk reception upon your arrival today. Cash payment of 50% downpayment is required today to avoid automatic cancellation.'
              : '* Please present this printed slip or digital confirmation upon arrival at PolChat Garden Resort. Resort check-in policy applies. The ₱2,000 security deposit is refundable upon checkout inspection.'}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="resv-receipt-actions">

        <button
  type="button"
  className="resv-print-btn"
  onClick={handleDownloadPDF}
>
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>

  Download PDF
</button>

        <button
  type="button"
  className="resv-print-btn"
  onClick={handlePrint}
>
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>

  Print Slip
</button>
        <button
          type="button"
          className="resv-new-resv-btn"
          onClick={onReset}
        >
          Book Another Stay
        </button>
      </div>
    </div>
  )
}

export default BookingReceipt
