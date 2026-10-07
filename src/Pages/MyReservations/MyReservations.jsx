import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { DataService } from '../../services/dataService'
import MyReservationSummaryCards from './components/MyReservationSummaryCards'
import CurrentActiveCard from './components/CurrentActiveCard'
import PastReservationsList from './components/PastReservationsList'
import PrintableReceipt from '../BookingCatalog/components/PrintableReceipt'
import './styles.css'

function MyReservations({ onNavigate }) {
  const { user, isAuthenticated, openAuthModal } = useAuth()
  const [userReservations, setUserReservations] = useState([])
  const [selectedReceipt, setSelectedReceipt] = useState(null)
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadData = async () => {
    setIsLoading(true)
    const all = await DataService.getReservations()

    // Filter reservations belonging to the logged-in customer
    if (user) {
      const filtered = (all || []).filter(
        (r) =>
          r.customer_id === user.id ||
          (r.customer_name && user.name && r.customer_name.toLowerCase().includes(user.name.toLowerCase())) ||
          (r.event_name && user.name && r.event_name.toLowerCase().includes(user.name.toLowerCase()))
      )
      // Fallback: If demo user has no records yet, show relevant bookings
      setUserReservations(filtered.length > 0 ? filtered : all.slice(0, 5))
    } else {
      setUserReservations(all || [])
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [user])

  // Identify Current Active Reservation (latest pending or confirmed stay)
  const activeReservation =
    userReservations.find((r) => r.reservation_status === 'confirmed' || r.reservation_status === 'pending') ||
    null

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
        />

        {/* Right Column: Past Reservations & History */}
        <PastReservationsList
          pastReservations={pastReservations}
          onOpenReceipt={setSelectedReceipt}
        />
      </div>

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
