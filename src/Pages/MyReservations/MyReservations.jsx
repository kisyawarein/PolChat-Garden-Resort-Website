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
  const [userVisitations, setUserVisitations] = useState([])
  const [selectedReceipt, setSelectedReceipt] = useState(null)
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState(null)
  const [checkoutModalRes, setCheckoutModalRes] = useState(null)
  const [reviewPromptRes, setReviewPromptRes] = useState(null)

  const loadData = async () => {
  const [allReservations, allVisitations] = await Promise.all([
    DataService.getReservations({ force: true }),
    DataService.getVisitations({ force: true }),
  ])

    // Filter reservations strictly belonging to the logged-in customer
    if (user) {
      const userFullName = (user.name || `${user.first_name || ''} ${user.last_name || ''}`).trim().toLowerCase()
      const userFirstName = (user.first_name || '').trim().toLowerCase()
      const userLastName = (user.last_name || '').trim().toLowerCase()

      const filtered = (allReservations || []).filter((r) => {
        if (r.customer_id && user.id && Number(r.customer_id) === Number(user.id)) return true
        const custName = (r.customer_name || '').trim().toLowerCase()
        if (userFullName && custName === userFullName) return true
        if (userFirstName && userLastName && custName.includes(userFirstName) && custName.includes(userLastName)) return true
        return false
      })
      setUserReservations(filtered)
      const filteredVisitations = (allVisitations || []).filter((v) => {
  if (
    v.customer_id &&
    user.id &&
    Number(v.customer_id) === Number(user.id)
  ) {
    return true
  }

  const visitationName = (v.customer_name || '')
    .trim()
    .toLowerCase()

  if (userFullName && visitationName === userFullName) {
    return true
  }

  if (
    userFirstName &&
    userLastName &&
    visitationName.includes(userFirstName) &&
    visitationName.includes(userLastName)
  ) {
    return true
  }

  return false
})

setUserVisitations(filteredVisitations)
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

  const [selectedReservationId, setSelectedReservationId] = useState(null)

  // Calculate the booked reservation nearest to come (closest upcoming stay >= today)
  const getNearestUpcomingReservation = (reservations) => {
    if (!reservations || reservations.length === 0) return null
    const booked = reservations.filter((r) => r.reservation_status !== 'cancelled')
    if (booked.length === 0) return null

    const now = new Date()
    const todayTimestamp = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()

    const upcoming = []
    const past = []

    booked.forEach((r) => {
      if (!r.start_date) {
        past.push({ res: r, diff: Infinity })
        return
      }
      const rDate = new Date(r.start_date)
      const rTimestamp = new Date(rDate.getFullYear(), rDate.getMonth(), rDate.getDate()).getTime()
      const diff = rTimestamp - todayTimestamp

      if (diff >= 0) {
        upcoming.push({ res: r, diff })
      } else {
        past.push({ res: r, diff: Math.abs(diff) })
      }
    })

    // 1. Closest upcoming date first (smallest non-negative diff)
    if (upcoming.length > 0) {
      upcoming.sort((a, b) => a.diff - b.diff)
      return upcoming[0].res
    }

    // 2. Fallback to closest past date if all reservations are in the past
    if (past.length > 0) {
      past.sort((a, b) => a.diff - b.diff)
      return past[0].res
    }

    return booked[0]
  }

  const bookedReservations = userReservations.filter(
  (r) =>
    r.reservation_status !== 'cancelled' &&
    !r.is_checked_out &&
    r.reservation_status !== 'completed'
)
  const nearestReservation = getNearestUpcomingReservation(bookedReservations)

  // Ensure selectedReservationId is synchronized, defaulting to the reservation nearest to come
  useEffect(() => {
    if (bookedReservations.length > 0) {
      const exists = bookedReservations.some((r) => r.reservation_id === selectedReservationId)
      if (!exists && nearestReservation) {
        setSelectedReservationId(nearestReservation.reservation_id)
      }
    } else {
      setSelectedReservationId(null)
    }
  }, [userReservations, selectedReservationId, nearestReservation?.reservation_id])

  // Identify Current Displayed Reservation (selected or default nearest)
  const activeReservation =
    bookedReservations.find((r) => r.reservation_id === selectedReservationId) ||
    nearestReservation ||
    null

  // Past / History list contains all user reservations with clear selection highlight
  const pastReservations = userReservations.filter(
  (r) =>
    r.is_checked_out ||
    r.reservation_status === 'completed' ||
    r.reservation_status === 'cancelled'
)

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

      {/* Main 2-Column Dashboard Layout (Left: Current Active Card with Switcher, Right: Past Reservations Table) */}
      <div className="myres-dashboard-layout">
        {/* Left Column: Current Active / Switched Reservation */}
        <CurrentActiveCard
          activeReservation={activeReservation}
          bookedReservations={bookedReservations}
          nearestReservationId={nearestReservation?.reservation_id}
          onSelectReservation={setSelectedReservationId}
          onBookNew={() => onNavigate && onNavigate('reservation')}
          onOpenReceipt={setSelectedReceipt}
          onOpenPhoto={setSelectedPhotoUrl}
          onOpenCheckout={setCheckoutModalRes}
          onOpenReview={setReviewPromptRes}
        />

        {/* Right Column: Past Reservations & History Table */}
        <PastReservationsList
          pastReservations={pastReservations}
          selectedReservationId={activeReservation?.reservation_id}
          nearestReservationId={nearestReservation?.reservation_id}
          onSelectReservation={setSelectedReservationId}
          onOpenReceipt={setSelectedReceipt}
          onOpenReview={setReviewPromptRes}
        />
      </div>
{/* Ocular / Visitation History */}
<div className="myres-visitation-history">
  <div className="catalog-panel-header-card">
    <div className="myres-past-title-row">
      <h2 className="catalog-panel-title">
        Ocular / Visitation History
      </h2>

      <span className="myres-history-badge">
        {userVisitations.length} Records
      </span>
    </div>
  </div>

  <div className="myres-table-panel-card">
    <div className="myres-table-scroll-wrap">
      <table className="myres-data-table">
        <thead>
          <tr>
            <th>Visit ID</th>
            <th>Visit Date</th>
            <th>Time Slot</th>
            <th>Guests</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {userVisitations.length === 0 ? (
            <tr>
              <td colSpan="5" className="myres-empty-cell">
                No ocular visits found in your account history.
              </td>
            </tr>
          ) : (
            userVisitations.map((visit) => {
              const startDate = visit.visitation_start_date
                ? new Date(visit.visitation_start_date)
                : null

              const endDate = visit.visitation_end_date
                ? new Date(visit.visitation_end_date)
                : null

              const visitDate = startDate
                ? startDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : 'N/A'

              const visitTime =
                startDate && endDate
                  ? `${startDate.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })} - ${endDate.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}`
                  : visit.slot_type || 'N/A'

              return (
                <tr
                  key={visit.visitation_id}
                  className="myres-table-row"
                >
                  <td className="col-cell-edge myres-id-cell">
                    #{visit.visitation_id}
                  </td>

                  <td className="myres-plain-text">
                    {visitDate}
                  </td>

                  <td className="myres-plain-text">
                    {visitTime}
                  </td>

                  <td className="myres-plain-text">
                    {visit.guest_count} Pax
                  </td>

                  <td className="myres-status-cell">
                    <span className="myres-plain-status-text">
                      {visit.visitation_status
                        ? visit.visitation_status.charAt(0).toUpperCase() +
                          visit.visitation_status.slice(1)
                        : 'Pending'}
                    </span>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  </div>
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
