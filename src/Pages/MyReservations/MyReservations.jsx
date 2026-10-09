import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { DataService } from '../../services/dataService'
import MyReservationSummaryCards from './components/MyReservationSummaryCards'
import CurrentActiveCard from './components/CurrentActiveCard'
import PastReservationsList from './components/PastReservationsList'
import CheckoutModal from './components/CheckoutModal'
import LeaveReviewModal from './components/LeaveReviewModal'
import PrintableReceipt from '../BookingCatalog/components/PrintableReceipt'
import './styles.css'

function MyReservations({ onNavigate }) {
  const { user, isAuthenticated, openAuthModal } = useAuth()
  const [userReservations, setUserReservations] = useState([])
  const [selectedReceipt, setSelectedReceipt] = useState(null)
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState(null)
  const [checkoutModalRes, setCheckoutModalRes] = useState(null)
  const [reviewPromptRes, setReviewPromptRes] = useState(null)

  const loadData = async () => {
    const all = await DataService.getReservations()

    // Filter reservations strictly belonging to the logged-in customer
    if (user) {
      const userFullName = (user.name || `${user.first_name || ''} ${user.last_name || ''}`).trim().toLowerCase()
      const userFirstName = (user.first_name || '').trim().toLowerCase()
      const userLastName = (user.last_name || '').trim().toLowerCase()

      const filtered = (all || []).filter((r) => {
        if (r.customer_id && user.id && Number(r.customer_id) === Number(user.id)) return true
        const custName = (r.customer_name || '').trim().toLowerCase()
        if (userFullName && custName === userFullName) return true
        if (userFirstName && userLastName && custName.includes(userFirstName) && custName.includes(userLastName)) return true
        return false
      })
      setUserReservations(filtered)
    } else {
      setUserReservations([])
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  const handleCheckoutSuccess = (updatedRes) => {
    setUserReservations((prev) =>
      prev.map((r) =>
        r.reservation_id === updatedRes.reservation_id
          ? { ...r, ...updatedRes, is_checked_out: true, remaining_balance: 0 }
          : r
      )
    )
    // Automatically prompt customer with the Review modal upon check out!
    setReviewPromptRes(updatedRes)
  }

  const handleReviewSubmitted = (result, reservationId) => {
    const targetId = reservationId || reviewPromptRes?.reservation_id
    if (targetId) {
      setUserReservations((prev) =>
        prev.map((r) =>
          r.reservation_id === targetId
            ? {
                ...r,
                reservation_status: 'completed',
                is_checked_out: true,
                is_reviewed: true,
                remaining_balance: 0,
              }
            : r
        )
      )
      DataService.markReservationReviewed(targetId)
    }
  }

  // Identify Current Active Reservation (ongoing/upcoming stay that has not been checked out & reviewed)
  const activeReservation =
    userReservations.find(
      (r) =>
        (r.reservation_status === 'confirmed' || r.reservation_status === 'pending') &&
        !r.is_reviewed &&
        r.reservation_status !== 'completed' &&
        r.reservation_status !== 'cancelled'
    ) || null

  // Past / Historical reservations
  const pastReservations = activeReservation
    ? userReservations.filter((r) => r.reservation_id !== activeReservation.reservation_id)
    : userReservations

  if (!isAuthenticated) {
    return (
      <div className="myres-guest-locked-page">
        <div className="myres-locked-card">
          <div className="myres-locked-icon-badge">
            <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#58402E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 className="myres-locked-title">Sign In to View My Reservations</h2>
          <p className="myres-locked-desc">
            Please log into your PolChat guest account to view your active booking schedule, official receipts, and past reservation history.
          </p>
          <div className="myres-locked-actions">
            <button
              type="button"
              className="myres-locked-login-btn"
              onClick={() => openAuthModal('signin')}
            >
              Sign In to Account
            </button>
            <button
              type="button"
              className="myres-locked-signup-btn"
              onClick={() => openAuthModal('signup')}
            >
              Create Free Account
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="my-reservations-page">
      {/* Top Overview Summary Cards */}
      <div className="catalog-top-summary-wrap">
        <MyReservationSummaryCards reservations={userReservations} />
      </div>

      {/* Main 2-Column Dashboard Layout (Left: Current Active Card, Right: Past Reservations Table) */}
      <div className="myres-dashboard-layout">
        {/* Left Column: Current Active Reservation */}
        <CurrentActiveCard
          activeReservation={activeReservation}
          onBookNew={() => onNavigate && onNavigate('reservation')}
          onOpenReceipt={setSelectedReceipt}
          onOpenPhoto={setSelectedPhotoUrl}
          onOpenCheckout={setCheckoutModalRes}
          onOpenReview={setReviewPromptRes}
        />

        {/* Right Column: Past Reservations & History */}
        <PastReservationsList
          pastReservations={pastReservations}
          onOpenReceipt={setSelectedReceipt}
          onOpenReview={setReviewPromptRes}
        />
      </div>

      {/* Checkout Balance Settlement Modal */}
      {checkoutModalRes && (
        <CheckoutModal
          reservation={checkoutModalRes}
          onClose={() => setCheckoutModalRes(null)}
          onCheckoutSuccess={handleCheckoutSuccess}
        />
      )}

      {/* Leave Review & Feedback Modal */}
      {reviewPromptRes && (
        <LeaveReviewModal
          reservation={reviewPromptRes}
          onClose={() => setReviewPromptRes(null)}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <PrintableReceipt
          item={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}

      {/* Payment Proof Photo Modal */}
      {selectedPhotoUrl && (
        <div className="modal-backdrop" onClick={() => setSelectedPhotoUrl(null)}>
          <div className="modal-dialog-card modal-photo-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-card-header">
              <h3 className="modal-card-title">Submitted Payment Proof</h3>
              <button
                type="button"
                className="modal-close-x"
                onClick={() => setSelectedPhotoUrl(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-card-body modal-photo-body">
              <div className="modal-photo-img-wrap">
                <img
                  src={selectedPhotoUrl}
                  alt="Payment Receipt"
                  className="modal-photo-full-img"
                />
              </div>
            </div>
            <div className="modal-card-footer modal-photo-footer">
              <a
                href={selectedPhotoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="modal-open-tab-link"
              >
                Open Full Image ↗
              </a>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedPhotoUrl(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyReservations
