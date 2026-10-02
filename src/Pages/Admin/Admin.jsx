import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { DataService } from '../../services/dataService'
import DashboardOverview from './components/DashboardOverview'
import BookingCatalog from './components/BookingCatalog'
import ReservationCalendar from './components/ReservationCalendar'
import CustomerCatalog from './components/CustomerCatalog'
import InquiriesManagement from './components/InquiriesManagement'
import CustomerReviews from './components/CustomerReviews'
import PrintableReceipt from './components/PrintableReceipt'
import './styles.css'

function Admin({ activeTab: controlledTab, onSelectTab }) {
  const { user, isAdmin, openAuthModal } = useAuth()
  const [internalTab, setInternalTab] = useState('overview') // 'overview' | 'bookings' | 'calendar' | 'customers' | 'inquiries' | 'reviews'

  const activeTab = controlledTab || internalTab
  const setActiveTab = (tab) => {
    if (onSelectTab) {
      onSelectTab(tab)
    }
    setInternalTab(tab)
  }


  // Data states
  const [reservations, setReservations] = useState([])
  const [visitations, setVisitations] = useState([])
  const [customers, setCustomers] = useState([])
  const [inquiries, setInquiries] = useState([])
  const [reviews, setReviews] = useState([])
  const [receiptItem, setReceiptItem] = useState(null)
  const [notificationMsg, setNotificationMsg] = useState('')

  const loadAllData = async () => {
    const [resData, visData, custData, inqData, revData] = await Promise.all([
      DataService.getReservations(),
      DataService.getVisitations(),
      DataService.getCustomers(),
      DataService.getInquiries(),
      DataService.getReviews(),
    ])
    setReservations(resData)
    setVisitations(visData)
    setCustomers(custData)
    setInquiries(inqData)
    setReviews(revData)
  }


  useEffect(() => {
    loadAllData()
  }, [])

  const showToast = (msg) => {
    setNotificationMsg(msg)
    setTimeout(() => {
      setNotificationMsg('')
    }, 3500)
  }

  // Optimistic Handlers for Reservations
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
    showToast(`Reservation #${reservationId} payment details updated.`)
    await DataService.updateReservationPayment(reservationId, updates)
  }

  const handleUpdateVisitationStatus = async (visitationId, status) => {
    setVisitations((prev) =>
      prev.map((v) => (v.visitation_id === visitationId ? { ...v, visitation_status: status } : v))
    )
    showToast(`Ocular Visitation #${visitationId} marked as ${status}.`)
    await DataService.updateVisitationStatus(visitationId, status)
  }

  const handleOpenReceipt = (item) => {
    setReceiptItem(item)
  }

  const handleCloseReceipt = () => {
    setReceiptItem(null)
  }

  if (!isAdmin) {
    return (
      <div className="admin-access-denied-page">
        <div className="admin-access-card">
          <div className="admin-access-badge">ADMIN ACCESS REQUIRED</div>
          <h1 className="admin-access-title">PolChat Staff & Management Portal</h1>
          <p className="admin-access-text">
            You must be logged in as an Administrator to view and manage resort reservations, customer accounts, and inquiries.
          </p>
          <div className="admin-access-actions">
            <button
              type="button"
              className="admin-login-switch-btn"
              onClick={() => openAuthModal('signin')}
            >
              Sign In as Admin
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="admin-toast-banner">
          <span className="admin-toast-text">{notificationMsg}</span>
        </div>
      )}

      {/* Admin Header */}
      <div className="admin-header-banner">
        <div className="admin-header-content">
          <div className="admin-header-titles">
            <span className="admin-tag-pill">POLCHAT RESORT MANAGEMENT</span>
            <h1 className="admin-main-title">Admin Operations Dashboard</h1>
            <p className="admin-welcome-text">
              Welcome back, <strong>{user?.name || 'Administrator'}</strong>. Monitor bookings, calendar, customers, and live inquiries.
            </p>
          </div>
          <div className="admin-header-stats-row">
            <div className="admin-mini-stat-box">
              <span className="admin-mini-stat-label">Total Bookings</span>
              <span className="admin-mini-stat-value">{reservations.length + visitations.length}</span>
            </div>
            <div className="admin-mini-stat-box">
              <span className="admin-mini-stat-label">Pending Review</span>
              <span className="admin-mini-stat-value admin-stat-pending">
                {reservations.filter((r) => r.reservation_status === 'pending').length +
                  visitations.filter((v) => v.visitation_status === 'pending').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="admin-tabs-bar-wrapper">
        <div className="admin-tabs-bar">
          <button
            type="button"
            className={activeTab === 'overview' ? 'admin-tab-btn admin-tab-btn-active' : 'admin-tab-btn'}
            onClick={() => setActiveTab('overview')}
          >
            📊 Dashboard Overview
          </button>
          <button
            type="button"
            className={activeTab === 'bookings' ? 'admin-tab-btn admin-tab-btn-active' : 'admin-tab-btn'}
            onClick={() => setActiveTab('bookings')}
          >
            📋 Booking Catalog
          </button>
          <button
            type="button"
            className={activeTab === 'calendar' ? 'admin-tab-btn admin-tab-btn-active' : 'admin-tab-btn'}
            onClick={() => setActiveTab('calendar')}
          >
            📅 Calendar View
          </button>
          <button
            type="button"
            className={activeTab === 'customers' ? 'admin-tab-btn admin-tab-btn-active' : 'admin-tab-btn'}
            onClick={() => setActiveTab('customers')}
          >
            👥 Customer Accounts
          </button>
          <button
            type="button"
            className={activeTab === 'inquiries' ? 'admin-tab-btn admin-tab-btn-active' : 'admin-tab-btn'}
            onClick={() => setActiveTab('inquiries')}
          >
            💬 Inquiries ({inquiries.filter((i) => i.inquiry_status === 'open').length} Open)
          </button>
          <button
            type="button"
            className={activeTab === 'reviews' ? 'admin-tab-btn admin-tab-btn-active' : 'admin-tab-btn'}
            onClick={() => setActiveTab('reviews')}
          >
            ⭐ Reviews & Feedback
          </button>
        </div>
      </div>

      {/* Tab Content Panels */}
      <div className="admin-content-container">
        {activeTab === 'overview' && (
          <DashboardOverview
            reservations={reservations}
            visitations={visitations}
            customers={customers}
            inquiries={inquiries}
            reviews={reviews}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'bookings' && (
          <BookingCatalog
            reservations={reservations}
            visitations={visitations}
            onUpdateReservationStatus={handleUpdateReservationStatus}
            onUpdateReservationPayment={handleUpdateReservationPayment}
            onUpdateVisitationStatus={handleUpdateVisitationStatus}
            onOpenReceipt={handleOpenReceipt}
          />
        )}

        {activeTab === 'calendar' && (
          <ReservationCalendar
            reservations={reservations}
            visitations={visitations}
            onUpdateReservationStatus={handleUpdateReservationStatus}
            onOpenReceipt={handleOpenReceipt}
          />
        )}

        {activeTab === 'customers' && (
          <CustomerCatalog
            customers={customers}
            reservations={reservations}
            visitations={visitations}
            inquiries={inquiries}
            onCustomerAdded={(newCust) => {
              setCustomers((prev) => [newCust, ...prev])
              showToast(`Customer account for ${newCust.first_name} created.`)
            }}
          />
        )}

        {activeTab === 'inquiries' && (
          <InquiriesManagement
            adminUser={user}
            inquiries={inquiries}
            onInquiryUpdated={(updatedInquiries) => {
              setInquiries(updatedInquiries)
            }}
            showToast={showToast}
          />
        )}

        {activeTab === 'reviews' && (
          <CustomerReviews reviews={reviews} />
        )}
      </div>

      {/* Printable Receipt Modal */}
      {receiptItem && (
        <PrintableReceipt item={receiptItem} onClose={handleCloseReceipt} />
      )}
    </div>
  )
}

export default Admin
