import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { DataService } from '../../services/dataService'
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
    setReservations(resData)
    setVisitations(visData)
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

  const handleUpdateReservationStatus = async (reservationId, status) => {
    setReservations((prev) =>
      prev.map((r) => (r.reservation_id === reservationId ? { ...r, reservation_status: status } : r))
    )
    showToast(`Reservation #${reservationId} marked as ${status}.`)
    await DataService.updateReservationStatus(reservationId, status)
  }

  const handleUpdateReservationPayment = async (reservationId, updates) => {
    setReservations((prev) =>
      prev.map((r) => (r.reservation_id === reservationId ? { ...r, ...updates } : r))
    )
    showToast(`Reservation #${reservationId} payment details saved.`)
    await DataService.updateReservationPayment(reservationId, updates)
  }

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

      {/* Page Header with Mode Switcher */}
      <div className="booking-catalog-header-bar">
        <div className="catalog-title-group">
          <span className="catalog-tag">POLCHAT MANAGEMENT</span>
          <h1 className="catalog-main-title">Reservations & Bookings Catalog</h1>
        </div>

        {/* List Mode / Calendar Mode Toggle */}
        <div className="catalog-mode-switcher">
          <button
            type="button"
            className={`catalog-mode-btn ${viewMode === 'list' ? 'catalog-mode-btn-active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            📋 List View
          </button>
          <button
            type="button"
            className={`catalog-mode-btn ${viewMode === 'calendar' ? 'catalog-mode-btn-active' : ''}`}
            onClick={() => setViewMode('calendar')}
          >
            📅 Calendar View
          </button>
        </div>
      </div>

      {/* Mode View Rendering */}
      <div className="catalog-content-wrapper">
        {viewMode === 'list' ? (
          <ListView
            reservations={reservations}
            visitations={visitations}
            onUpdateReservationStatus={handleUpdateReservationStatus}
            onUpdateReservationPayment={handleUpdateReservationPayment}
            onUpdateVisitationStatus={handleUpdateVisitationStatus}
            onOpenReceipt={setReceiptItem}
          />
        ) : (
          <CalendarView
            reservations={reservations}
            visitations={visitations}
            onUpdateReservationStatus={handleUpdateReservationStatus}
            onOpenReceipt={setReceiptItem}
          />
        )}
      </div>

      {/* Printable Receipt Modal */}
      {receiptItem && (
        <PrintableReceipt item={receiptItem} onClose={() => setReceiptItem(null)} />
      )}
    </div>
  )
}

export default BookingCatalog
