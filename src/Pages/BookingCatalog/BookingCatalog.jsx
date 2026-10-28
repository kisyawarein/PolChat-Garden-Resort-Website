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
  const [catalogMode, setCatalogMode] = useState('pending')
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
// Optimistic status update for resort reservations
const handleUpdateReservationStatus = async (reservationId, status) => {
  const target = reservations.find(
    (r) => r.reservation_id === reservationId
  )

  if (!target) {
    showToast(`Reservation #${reservationId} was not found.`)
    return
  }

  const normalizedStatus = String(status || '')
    .trim()
    .toLowerCase()

  let competingReservations = []

  if (normalizedStatus === 'confirmed') {
    const targetStartDate = String(target.start_date || '')
      .trim()

    competingReservations = reservations.filter((r) => {
      if (r.reservation_id === reservationId) {
        return false
      }

      const reservationStartDate = String(r.start_date || '')
        .trim()

      const reservationStatus = String(
        r.reservation_status || 'pending'
      )
        .trim()
        .toLowerCase()

      return (
        targetStartDate !== '' &&
        reservationStartDate === targetStartDate &&
        reservationStatus === 'pending'
      )
    })
  }

  setReservations((prev) =>
    prev.map((r) => {
      if (r.reservation_id === reservationId) {
        return {
          ...r,
          reservation_status: normalizedStatus,
        }
      }

      const isCompetingReservation =
        competingReservations.some(
          (conflict) =>
            conflict.reservation_id === r.reservation_id
        )

      if (isCompetingReservation) {
        return {
          ...r,
          reservation_status: 'cancelled',
        }
      }

      return r
    })
  )

  await DataService.updateReservationStatus(
    reservationId,
    normalizedStatus,
    target.customer_email
  )

  if (competingReservations.length > 0) {
    await Promise.all(
      competingReservations.map((r) =>
        DataService.updateReservationStatus(
          r.reservation_id,
          'cancelled',
          r.customer_email
        )
      )
    )

    showToast(
      `Reservation #${reservationId} confirmed. ${competingReservations.length} competing reservation(s) automatically cancelled.`
    )
  } else {
    showToast(
      `Reservation #${reservationId} marked as ${normalizedStatus}.`
    )
  }
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
  const target = visitations.find(
    (v) => v.visitation_id === visitationId
  )

  if (!target) {
    showToast(`Ocular Visitation #${visitationId} was not found.`)
    return
  }

  const normalizedStatus = String(status || '')
    .trim()
    .toLowerCase()

  let competingVisitations = []

  if (normalizedStatus === 'confirmed') {
    const targetDate = String(
      target.visitation_start_date || ''
    ).slice(0, 10)

    const targetSlot = String(target.slot_type || '')
      .trim()
      .toLowerCase()

    competingVisitations = visitations.filter((v) => {
      if (v.visitation_id === visitationId) return false

      const visitationDate = String(
        v.visitation_start_date || ''
      ).slice(0, 10)

      const visitationSlot = String(v.slot_type || '')
        .trim()
        .toLowerCase()

      const visitationStatus = String(
        v.visitation_status || 'pending'
      )
        .trim()
        .toLowerCase()

      return (
        visitationDate === targetDate &&
        visitationSlot === targetSlot &&
        visitationStatus === 'pending'
      )
    })
  }

  setVisitations((prev) =>
    prev.map((v) => {
      if (v.visitation_id === visitationId) {
        return {
          ...v,
          visitation_status: normalizedStatus,
        }
      }

      const isCompetingVisit = competingVisitations.some(
        (conflict) =>
          conflict.visitation_id === v.visitation_id
      )

      if (isCompetingVisit) {
        return {
          ...v,
          visitation_status: 'cancelled',
        }
      }

      return v
    })
  )

  await DataService.updateVisitationStatus(
    visitationId,
    normalizedStatus
  )

  if (competingVisitations.length > 0) {
    await Promise.all(
      competingVisitations.map((v) =>
        DataService.updateVisitationStatus(
          v.visitation_id,
          'cancelled'
        )
      )
    )

    showToast(
      `Ocular Visitation #${visitationId} confirmed. ${competingVisitations.length} competing request(s) automatically cancelled.`
    )
  } else {
    showToast(
      `Ocular Visitation #${visitationId} marked as ${normalizedStatus}.`
    )
  }
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
      {/* Booking Management Mode Switcher */}
<div className="catalog-main-mode-switcher">
  <button
    type="button"
    className={`catalog-main-mode-btn ${
      catalogMode === 'pending'
        ? 'catalog-main-mode-btn-active'
        : ''
    }`}
    onClick={() => setCatalogMode('pending')}
  >
    <span>Priority Pending</span>

    <span className="catalog-main-mode-count">
      {
        reservations.filter(
          (r) => r.reservation_status === 'pending'
        ).length +
        visitations.filter(
          (v) => v.visitation_status === 'pending'
        ).length
      }
    </span>
  </button>

  <button
    type="button"
    className={`catalog-main-mode-btn ${
      catalogMode === 'all'
        ? 'catalog-main-mode-btn-active'
        : ''
    }`}
    onClick={() => setCatalogMode('all')}
  >
    <span>All Reservations & Schedules</span>
  </button>
</div>

{/* Full Width Content */}
<div className="catalog-mode-content">
{catalogMode === 'pending' ? (
  <div className="catalog-schedule-panel">
    <ListView
      reservations={reservations}
      visitations={visitations}
      onUpdateReservationStatus={
        handleUpdateReservationStatus
      }
      onUpdateReservationPayment={
        handleUpdateReservationPayment
      }
      onUpdateVisitationStatus={
        handleUpdateVisitationStatus
      }
      onOpenReceipt={setReceiptItem}
      pendingOnly={true}
      title="Priority Pending Queue"
    />
  </div>
) : (
    <div className="catalog-schedule-panel">
      {viewMode === 'list' ? (
        <ListView
          viewMode={viewMode}
          setViewMode={setViewMode}
          reservations={reservations}
          visitations={visitations}
          onUpdateReservationStatus={
            handleUpdateReservationStatus
          }
          onUpdateReservationPayment={
            handleUpdateReservationPayment
          }
          onUpdateVisitationStatus={
            handleUpdateVisitationStatus
          }
          onOpenReceipt={setReceiptItem}
        />
      ) : (
        <CalendarView
          viewMode={viewMode}
          setViewMode={setViewMode}
          reservations={reservations}
          visitations={visitations}
          onUpdateReservationStatus={
            handleUpdateReservationStatus
          }
          onUpdateVisitationStatus={
            handleUpdateVisitationStatus
          }
          onOpenReceipt={setReceiptItem}
        />
      )}
    </div>
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
