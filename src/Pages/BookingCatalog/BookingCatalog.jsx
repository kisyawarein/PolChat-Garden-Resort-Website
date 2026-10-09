import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { DataService } from '../../services/dataService'
import SummaryCards from './components/SummaryCards'
import PriorityPendingList from './components/PriorityPendingList'
import ListView from './components/ListView'
import CalendarView from './components/CalendarView'
import PrintableReceipt from './components/PrintableReceipt'
import './styles.css'

function BookingCatalog() {
  const { isAdmin, openAuthModal } = useAuth()
  const [viewMode, setViewMode] = useState('list') // 'list' | 'calendar'
  const [reservations, setReservations] = useState([])
  const [visitations, setVisitations] = useState([])
  const [receiptItem, setReceiptItem] = useState(null)
  const [toastMsg, setToastMsg] = useState('')

  const loadData = async () => {
    const [resData, visData] = await Promise.all([
      DataService.getReservations(),
      DataService.getVisitations(),
    ])
    setReservations(resData || [])
    setVisitations(visData || [])
  }

  useEffect(() => {
    loadData()
  }, [])

  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => {
      setToastMsg('')
    }, 3500)
  }

  // Optimistic status update for resort reservations
  const handleUpdateReservationStatus = async (reservationId, status) => {
    const target = reservations.find((r) => r.reservation_id === reservationId)
    setReservations((prev) =>
      prev.map((r) => (r.reservation_id === reservationId ? { ...r, reservation_status: status } : r))
    )
    showToast(`Reservation #${reservationId} marked as ${status}.`)
    await DataService.updateReservationStatus(reservationId, status, target?.customer_email)
  }

  // Optimistic payment update for resort reservations
  const handleUpdateReservationPayment = async (reservationId, updates) => {
    setReservations((prev) =>
      prev.map((r) => (r.reservation_id === reservationId ? { ...r, ...updates } : r))
    )
    showToast(`Reservation #${reservationId} payment details saved.`)
    await DataService.updateReservationPayment(reservationId, updates)
  }

  // Optimistic status update for ocular visitations
  const handleUpdateVisitationStatus = async (visitationId, status) => {
    setVisitations((prev) =>
      prev.map((v) => (v.visitation_id === visitationId ? { ...v, visitation_status: status } : v))
    )
    showToast(`Ocular Visitation #${visitationId} marked as ${status}.`)
    await DataService.updateVisitationStatus(visitationId, status)
  }

  if (!isAdmin) {
    return (
      <div className="access-denied-page">
        <div className="access-denied-card">
          <div className="access-denied-badge">STAFF ONLY</div>
          <h2>Booking Catalog Access Restricted</h2>
          <p>Please log in with an administrator account to view the booking catalog.</p>
          <button
            type="button"
            className="access-denied-btn"
            onClick={() => openAuthModal('signin')}
          >
            Sign In as Admin
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="booking-catalog-page">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="catalog-toast-box">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Row: Shared Summary Cards across full width */}
      <div className="catalog-top-summary-wrap">
        <SummaryCards reservations={reservations} visitations={visitations} />
      </div>

      {/* Main 2-Column Layout (Left: Priority Pending Queue, Right: Main Schedule List / Calendar) */}
      <div className="catalog-dashboard-layout">
        {/* Left Column: Priority Pending List */}
        <div className="catalog-left-column">
          <PriorityPendingList
            reservations={reservations}
            visitations={visitations}
            onUpdateReservationStatus={handleUpdateReservationStatus}
            onUpdateVisitationStatus={handleUpdateVisitationStatus}
            onOpenReceipt={setReceiptItem}
          />
        </div>

        {/* Right Column: Consolidated List & Calendar Schedule */}
        <div className="catalog-right-column">
          <div className="catalog-schedule-panel">
            {viewMode === 'list' ? (
              <ListView
                viewMode={viewMode}
                setViewMode={setViewMode}
                reservations={reservations}
                visitations={visitations}
                onUpdateReservationStatus={handleUpdateReservationStatus}
                onUpdateReservationPayment={handleUpdateReservationPayment}
                onUpdateVisitationStatus={handleUpdateVisitationStatus}
                onOpenReceipt={setReceiptItem}
              />
            ) : (
              <CalendarView
                viewMode={viewMode}
                setViewMode={setViewMode}
                reservations={reservations}
                visitations={visitations}
                onUpdateReservationStatus={handleUpdateReservationStatus}
                onOpenReceipt={setReceiptItem}
              />
            )}
          </div>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {receiptItem && (
        <PrintableReceipt item={receiptItem} onClose={() => setReceiptItem(null)} />
      )}
    </div>
  )
}

export default BookingCatalog
