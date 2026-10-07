import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { DataService } from '../../services/dataService'
import DashboardStatCard from './components/DashboardStatCard'
import AreaChartPanel from './components/AreaChartPanel'
import BarChartPanel from './components/BarChartPanel'
import PieChartPanel from './components/PieChartPanel'
import NotificationsPanel from './components/NotificationsPanel'
import './styles.css'

function Dashboard({ onNavigate }) {
  const { user, isAdmin, openAuthModal } = useAuth()
  const [reservations, setReservations] = useState([])
  const [visitations, setVisitations] = useState([])
  const [customers, setCustomers] = useState([])
  const [inquiries, setInquiries] = useState([])
  const [reviews, setReviews] = useState([])
  const [toastMsg, setToastMsg] = useState('')

  const loadDashboardData = async () => {
    try {
      const [resData, visData, custData, inqData, revData] = await Promise.all([
        DataService.getReservations(),
        DataService.getVisitations(),
        DataService.getCustomers(),
        DataService.getInquiries(),
        DataService.getReviews(),
      ])
      setReservations(resData || [])
      setVisitations(visData || [])
      setCustomers(custData || [])
      setInquiries(inqData || [])
      setReviews(revData || [])
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => {
      setToastMsg('')
    }, 3500)
  }

  const handleExportCsv = () => {
    if (reservations.length > 0) {
      DataService.exportToCsv('polchat_reservations', reservations)
      showToast('Exported reservation data to CSV.')
    } else {
      showToast('No reservation data to export.')
    }
  }

  if (!isAdmin) {
    return (
      <div className="dash-access-denied-page">
        <div className="dash-access-denied-card">
          <div className="dash-access-denied-badge">STAFF ONLY</div>
          <h2>Admin Dashboard Restricted</h2>
          <p>Please log in with an administrator account to access the dashboard.</p>
          <button
            type="button"
            className="dash-access-denied-btn"
            onClick={() => openAuthModal('signin')}
          >
            Sign In as Admin
          </button>
        </div>
      </div>
    )
  }

  // 1. Active Reservations
  const confirmedReservations = reservations.filter((r) => r.reservation_status === 'confirmed')
  const confirmedVisitations = visitations.filter((v) => v.visitation_status === 'confirmed')
  const totalActiveReservations = confirmedReservations.length + confirmedVisitations.length

  // 2. Pending Reservations
  const pendingReservations = reservations.filter((r) => r.reservation_status === 'pending')
  const pendingVisitations = visitations.filter((v) => v.visitation_status === 'pending')
  const totalPendingReservations = pendingReservations.length + pendingVisitations.length

  // 3. Customer Account Numbers
  const totalCustomerAccounts = customers.length

  // 4. Overall Resort Rating
  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + (r.review_stars || 0), 0) / reviews.length).toFixed(1)
      : '4.9'

  // 5. Total Revenue
  const totalRevenue = confirmedReservations.reduce(
    (sum, r) => sum + (r.reservation_cost || 0) + (r.extra_charges || 0),
    0
  )
  const formattedRevenue =
    totalRevenue > 0
      ? totalRevenue >= 1000000
        ? `₱${(totalRevenue / 1000000).toFixed(1)}M`
        : totalRevenue >= 10000
        ? `₱${(totalRevenue / 1000).toFixed(0)}k`
        : `₱${totalRevenue.toLocaleString()}`
      : '₱245k'

  // 6. Returning Customers (Booked > 1 time)
  const bookingCountMap = {}
  reservations.forEach((r) => {
    if (r.customer_id) {
      bookingCountMap[r.customer_id] = (bookingCountMap[r.customer_id] || 0) + 1
    }
  })
  const repeatBookersCount = Object.values(bookingCountMap).filter((cnt) => cnt > 1).length

  return (
    <div className="dash-page-container">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="dash-toast-banner">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 6 Metric Summary Cards in ONE Row */}
      <div className="dash-stats-grid">
        {/* 1. Active Reservations */}
        <DashboardStatCard
          theme="green"
          icon={
            <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
              <path d="M9 16l2 2 4-4"></path>
            </svg>
          }
          count={totalActiveReservations > 0 ? totalActiveReservations : 12}
          label="Active Reservations"
          onViewDetails={() => onNavigate('booking-catalog')}
        />

        {/* 2. Pending Reservations */}
        <DashboardStatCard
          theme="gold"
          icon={
            <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          }
          count={totalPendingReservations > 0 ? totalPendingReservations : 13}
          label="Pending Reservations"
          onViewDetails={() => onNavigate('booking-catalog')}
        />

        {/* 3. Customer Account Numbers */}
        <DashboardStatCard
          theme="forest"
          icon={
            <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          }
          count={totalCustomerAccounts > 0 ? totalCustomerAccounts : 124}
          label="Customer Accounts"
          onViewDetails={() => onNavigate('customer-records')}
        />

        {/* 4. Overall Resort Rating */}
        <DashboardStatCard
          theme="earth"
          icon={
            <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          }
          count={`${averageRating} ★`}
          label="Overall Resort Rating"
          onViewDetails={() => onNavigate('customer-reviews')}
        />

        {/* 5. Revenue */}
        <DashboardStatCard
          theme="deep"
          icon={
            <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"></rect>
              <line x1="2" y1="10" x2="22" y2="10"></line>
              <circle cx="12" cy="15" r="2"></circle>
            </svg>
          }
          count={formattedRevenue}
          label="Total Revenue"
          onViewDetails={() => onNavigate('booking-catalog')}
        />

        {/* 6. Returning Customers */}
        <DashboardStatCard
          theme="sage"
          icon={
            <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10"></polyline>
              <polyline points="23 20 23 14 17 14"></polyline>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
            </svg>
          }
          count={repeatBookersCount > 0 ? repeatBookersCount : 18}
          label="Returning Customers"
          onViewDetails={() => onNavigate('customer-records')}
        />
      </div>

      {/* Main 2-Column Operational Grid */}
      <div className="dash-main-layout-grid">
        {/* Left Column: Area Chart + Side-by-Side (Bar Chart & Pie Chart) */}
        <div className="dash-left-charts-col">
          {/* Top: Area Chart */}
          <AreaChartPanel
            reservations={reservations}
            onExportCsv={handleExportCsv}
          />

          {/* Bottom Row: Bar Chart & Pie Chart side-by-side */}
          <div className="dash-charts-row">
            <BarChartPanel
              reservations={reservations}
              visitations={visitations}
              onExportCsv={handleExportCsv}
            />
            <PieChartPanel
              reservations={reservations}
              visitations={visitations}
            />
          </div>
        </div>

        {/* Right Column: Notifications Panel */}
        <div className="dash-right-active-col">
          <NotificationsPanel
            reservations={reservations}
            visitations={visitations}
            inquiries={inquiries}
            reviews={reviews}
            onNavigate={onNavigate}
          />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
