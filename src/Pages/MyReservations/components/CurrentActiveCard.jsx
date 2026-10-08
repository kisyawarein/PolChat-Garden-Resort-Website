import React from 'react'
import dayTourImg from '../../../assets/pkg_daytour.jpg'
import overnightImg from '../../../assets/pkg_overnight.jpg'
import twentytwoImg from '../../../assets/pkg_twentytwo.jpg'

function CurrentActiveCard({
  activeReservation,
  onBookNew,
  onOpenReceipt,
  onOpenPhoto,
  onOpenCheckout,
  onOpenReview,
}) {
  const getPackageImage = (durationId) => {
    switch (durationId) {
      case 1: return dayTourImg
      case 2: return overnightImg
      case 3:
      case 4: return twentytwoImg
      default: return dayTourImg
    }
  }

  const getPackageName = (durationId) => {
    switch (durationId) {
      case 1: return 'Day Tour (9:00 AM - 5:00 PM)'
      case 2: return 'Overnight (8:00 PM - 6:00 AM)'
      case 3: return '22 Hours - Day Start (8:00 AM - 6:00 AM)'
      case 4: return '22 Hours - Night Start (8:00 PM - 6:00 PM)'
      default: return 'Resort Reservation'
    }
  }

  const totalCost = activeReservation
    ? (activeReservation.reservation_cost || 0) + (activeReservation.extra_charges || 0)
    : 0
  const downpayment = activeReservation?.downpayment_amount || Math.round(totalCost * 0.5)
  const balance = activeReservation?.remaining_balance ?? (totalCost - downpayment)
  const isCheckedOut = !!activeReservation?.is_checked_out

  return (
    <div className="myres-active-column">
      {/* Header Container Card (66px) */}
      <div className="catalog-panel-header-card">
        <h2 className="catalog-panel-title">Current Active Reservation</h2>
        {activeReservation && (
          <div className="myres-status-group">
            {isCheckedOut ? (
              <span className="myres-status-tag status-checked-out">✓ CHECKED OUT</span>
            ) : (
              <span className={`myres-status-tag status-${activeReservation.reservation_status}`}>
                {activeReservation.reservation_status === 'confirmed' ? 'CONFIRMED' : 'PENDING REVIEW'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main Active Card Surface */}
      <div className="myres-active-panel-card">
        {!activeReservation ? (
          <div className="myres-no-active-box">
            <div className="myres-empty-icon-wrap">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ACAD79" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <h3 className="myres-empty-title">No Active Reservations</h3>
            <p className="myres-empty-desc">
              You do not have any upcoming resort stays currently booked. Ready to plan your next gathering?
            </p>
            <button
              type="button"
              className="myres-book-now-btn"
              onClick={onBookNew}
            >
              + Book a Stay Now
            </button>
          </div>
        ) : (
          <div className="myres-active-details">
            {/* Package Banner Image */}
            <div className="myres-active-img-wrap">
              <img
                src={getPackageImage(activeReservation.duration_id)}
                alt="Reserved Package"
                className="myres-active-img"
              />
              <div className="myres-active-img-overlay">
                <span className="myres-active-res-id">RES-#{activeReservation.reservation_id}</span>
                <span className="myres-active-tier-name">{getPackageName(activeReservation.duration_id)}</span>
              </div>
            </div>

            {/* Info Stack */}
            <div className="myres-active-body">
              <div className="myres-info-grid">
                <div className="myres-info-item">
                  <span className="myres-info-label">Scheduled Date</span>
                  <span className="myres-info-val">
                    {activeReservation.start_date ? new Date(activeReservation.start_date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                  </span>
                </div>

                <div className="myres-info-item">
                  <span className="myres-info-label">Guest Headcount</span>
                  <span className="myres-info-val">{activeReservation.guest_count} Registered Guests</span>
                </div>

                <div className="myres-info-item">
                  <span className="myres-info-label">Payment Mode</span>
                  <span className="myres-info-val" style={{ textTransform: 'uppercase' }}>
                    {activeReservation.payment_type === 'cash' ? '💵 Cash on Desk' : '📱 GCash Transfer'}
                  </span>
                </div>

                <div className="myres-info-item">
                  <span className="myres-info-label">Total Booking Cost</span>
                  <span className="myres-info-val myres-val-amount">
                    ₱{totalCost.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* 50% Downpayment vs Remaining Balance Progress */}
              <div className="myres-balance-card">
                <div className="myres-balance-col">
                  <span className="myres-bal-label">50% Downpayment:</span>
                  <span className="myres-bal-val myres-bal-paid">
                    {activeReservation.has_paid_reservation ? `✓ ₱${downpayment.toLocaleString()} (Paid)` : `₱${downpayment.toLocaleString()} (Due)`}
                  </span>
                </div>
                <div className="myres-balance-col">
                  <span className="myres-bal-label">Remaining Balance:</span>
                  <span className="myres-bal-val myres-bal-due">
                    {isCheckedOut ? '✓ ₱0 (Fully Settled)' : `₱${balance.toLocaleString()} (Due on Checkout)`}
                  </span>
                </div>
              </div>

              {/* Security Deposit Note */}
              <div className="myres-deposit-card">
                <div className="myres-deposit-left">
                  <span className="myres-deposit-title">Security Deposit (₱2,000)</span>
                  <span className="myres-deposit-sub">100% refundable upon checkout inspection</span>
                </div>
                <span className="myres-deposit-badge">
                  {activeReservation.has_paid_sec_dep || isCheckedOut ? '✓ SETTLED' : 'DUE ON CHECK-IN'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="myres-active-actions">
                {/* Checkout & Settle Balance CTA */}
                {!isCheckedOut ? (
                  <button
                    type="button"
                    className="myres-btn-checkout-cta"
                    onClick={() => onOpenCheckout && onOpenCheckout(activeReservation)}
                  >
                    <span>Check Out & Settle Balance →</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="myres-btn-leave-review"
                    onClick={() => onOpenReview && onOpenReview(activeReservation)}
                  >
                    <span>⭐ Leave a Review</span>
                  </button>
                )}

                {activeReservation.payment_proof_url && (
                  <button
                    type="button"
                    className="myres-btn-proof"
                    onClick={() => onOpenPhoto(activeReservation.payment_proof_url)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span>View Payment Proof</span>
                  </button>
                )}

                <button
                  type="button"
                  className="myres-btn-receipt"
                  onClick={() => onOpenReceipt(activeReservation)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  <span>Official Receipt</span>
                </button>

                <button
                  type="button"
                  className="myres-btn-book-another"
                  onClick={onBookNew}
                >
                  <span>+ Book Another Stay</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CurrentActiveCard
