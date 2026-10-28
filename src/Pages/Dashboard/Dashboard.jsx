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
  const { isAdmin, openAuthModal } = useAuth()

  const [reservations, setReservations] = useState([])
  const [visitations, setVisitations] = useState([])
  const [customers, setCustomers] = useState([])
  const [inquiries, setInquiries] = useState([])
  const [reviews, setReviews] = useState([])
  const [toastMsg, setToastMsg] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)

      const [
        resData,
        visData,
        custData,
        inqData,
        revData,
      ] = await Promise.all([
        DataService.getReservations(),
        DataService.getVisitations(),
        DataService.getCustomers(),
        DataService.getInquiries(),
        DataService.getReviews(),
      ])

      const safeReservations = Array.isArray(resData)
        ? resData
        : []

      const safeVisitations = Array.isArray(visData)
        ? visData
        : []

      const safeCustomers = Array.isArray(custData)
        ? custData
        : []

      const safeInquiries = Array.isArray(inqData)
        ? inqData
        : []

      const safeReviews = Array.isArray(revData)
        ? revData
        : []

      setReservations(safeReservations)
      setVisitations(safeVisitations)
      setCustomers(safeCustomers)
      setInquiries(safeInquiries)
      setReviews(safeReviews)

      /*
       * Temporary diagnostic information.
       *
       * Open Chrome DevTools -> Console to see exactly how many
       * records DataService is returning to the dashboard.
       */
      console.log(
        'Reservations loaded:',
        safeReservations.length
      )
      console.log(
        'Visitations loaded:',
        safeVisitations.length
      )
      console.log(
        'Customers loaded:',
        safeCustomers.length
      )
      console.log(
        'Inquiries loaded:',
        safeInquiries.length
      )
      console.log(
        'Reviews loaded:',
        safeReviews.length
      )

      if (safeReservations.length > 0) {
        console.log(
          'First reservation record:',
          safeReservations[0]
        )

        console.log(
          'Reservation column names:',
          Object.keys(safeReservations[0])
        )
      }

      if (safeVisitations.length > 0) {
        console.log(
          'First visitation record:',
          safeVisitations[0]
        )

        console.log(
          'Visitation column names:',
          Object.keys(safeVisitations[0])
        )
      }

    } catch (err) {
      console.error(
        'Failed to fetch dashboard data:',
        err
      )

      setReservations([])
      setVisitations([])
      setCustomers([])
      setInquiries([])
      setReviews([])
    } finally {
      setIsLoading(false)
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
      DataService.exportToCsv(
        'polchat_reservations',
        reservations
      )

      showToast(
        'Exported reservation data to CSV.'
      )
    } else {
      showToast(
        'No reservation data to export.'
      )
    }
  }

  if (!isAdmin) {
    return (
      <div className="dash-access-denied-page">
        <div className="dash-access-denied-card">
          <div className="dash-access-denied-badge">
            STAFF ONLY
          </div>

          <h2>
            Admin Dashboard Restricted
          </h2>

          <p>
            Please log in with an administrator
            account to access the dashboard.
          </p>

          <button
            type="button"
            className="dash-access-denied-btn"
            onClick={() =>
              openAuthModal('signin')
            }
          >
            Sign In as Admin
          </button>
        </div>
      </div>
    )
  }

  /*
   * Normalize status values so differences in capitalization
   * or whitespace do not affect dashboard counts.
   */
  const normalizeStatus = (value) =>
    String(value || '')
      .trim()
      .toLowerCase()

  // ----------------------------------------------------
  // 1. ACTIVE RESERVATIONS
  // ----------------------------------------------------

  const confirmedReservations =
    reservations.filter(
      (reservation) =>
        normalizeStatus(
          reservation.reservation_status
        ) === 'confirmed'
    )

  const confirmedVisitations =
    visitations.filter(
      (visitation) =>
        normalizeStatus(
          visitation.visitation_status
        ) === 'confirmed'
    )

  const totalActiveReservations =
    confirmedReservations.length +
    confirmedVisitations.length

  // ----------------------------------------------------
  // 2. PENDING RESERVATIONS
  // ----------------------------------------------------

  const pendingReservations =
    reservations.filter(
      (reservation) =>
        normalizeStatus(
          reservation.reservation_status
        ) === 'pending'
    )

  const pendingVisitations =
    visitations.filter(
      (visitation) =>
        normalizeStatus(
          visitation.visitation_status
        ) === 'pending'
    )

  const totalPendingReservations =
    pendingReservations.length +
    pendingVisitations.length

  // ----------------------------------------------------
  // 3. CUSTOMER ACCOUNTS
  // ----------------------------------------------------

  const totalCustomerAccounts =
    customers.length

  // ----------------------------------------------------
  // 4. OVERALL RESORT RATING
  // ----------------------------------------------------

  const validReviews = reviews.filter(
    (review) => {
      const rating = Number(
        review.review_stars
      )

      return (
        Number.isFinite(rating) &&
        rating > 0
      )
    }
  )

  const averageRating =
    validReviews.length > 0
      ? (
          validReviews.reduce(
            (total, review) =>
              total +
              Number(
                review.review_stars
              ),
            0
          ) / validReviews.length
        ).toFixed(1)
      : '0.0'

  // ----------------------------------------------------
  // 5. CONFIRMED BOOKING VALUE
  // ----------------------------------------------------

  const revenueReservations =
    reservations.filter(
      (reservation) => {
        const status =
          normalizeStatus(
            reservation.reservation_status
          )

        return [
          'confirmed',
          'arrived',
          'completed',
        ].includes(status)
      }
    )

  const totalRevenue =
    revenueReservations.reduce(
      (sum, reservation) => {
        const reservationCost =
          Number(
            reservation.reservation_cost || 0
          )

        const extraCharges =
          Number(
            reservation.extra_charges || 0
          )

        return (
          sum +
          reservationCost +
          extraCharges
        )
      },
      0
    )

  const formattedRevenue =
    totalRevenue > 0
      ? totalRevenue >= 1000000
        ? `₱${(
            totalRevenue / 1000000
          ).toFixed(1)}M`
        : totalRevenue >= 10000
          ? `₱${(
              totalRevenue / 1000
            ).toFixed(0)}k`
          : `₱${totalRevenue.toLocaleString()}`
      : '₱0'

  // ----------------------------------------------------
  // 6. RETURNING CUSTOMERS
  // ----------------------------------------------------

  const bookingCountMap = {}

  reservations.forEach(
    (reservation) => {
      if (reservation.customer_id) {
        bookingCountMap[
          reservation.customer_id
        ] =
          (
            bookingCountMap[
              reservation.customer_id
            ] || 0
          ) + 1
      }
    }
  )

  const repeatBookersCount =
    Object.values(
      bookingCountMap
    ).filter(
      (bookingCount) =>
        bookingCount > 1
    ).length

  return (
    <div className="dash-page-container">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="dash-toast-banner">
          <span>
            {toastMsg}
          </span>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div
          style={{
            padding: '8px 0',
            fontSize: '13px',
            color: '#58402E',
          }}
        >
          Loading dashboard data...
        </div>
      )}

      {/* ========================================== */}
      {/* DASHBOARD STAT CARDS */}
      {/* ========================================== */}

      <div className="dash-stats-grid">

        {/* 1. Active Reservations */}
        <DashboardStatCard
          theme="green"
          icon={
            <svg
              viewBox="0 0 24 24"
              width="34"
              height="34"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect
                x="3"
                y="4"
                width="18"
                height="18"
                rx="2"
                ry="2"
              />
              <line
                x1="16"
                y1="2"
                x2="16"
                y2="6"
              />
              <line
                x1="8"
                y1="2"
                x2="8"
                y2="6"
              />
              <line
                x1="3"
                y1="10"
                x2="21"
                y2="10"
              />
              <path d="M9 16l2 2 4-4" />
            </svg>
          }
          count={totalActiveReservations}
          label="Active Reservations"
          onViewDetails={() =>
            onNavigate('booking-catalog')
          }
        />

        {/* 2. Pending Reservations */}
        <DashboardStatCard
          theme="gold"
          icon={
            <svg
              viewBox="0 0 24 24"
              width="34"
              height="34"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
              />
              <polyline
                points="12 6 12 12 16 14"
              />
            </svg>
          }
          count={totalPendingReservations}
          label="Pending Reservations"
          onViewDetails={() =>
            onNavigate('booking-catalog')
          }
        />

        {/* 3. Customer Accounts */}
        <DashboardStatCard
          theme="forest"
          icon={
            <svg
              viewBox="0 0 24 24"
              width="34"
              height="34"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle
                cx="9"
                cy="7"
                r="4"
              />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
          count={totalCustomerAccounts}
          label="Customer Accounts"
          onViewDetails={() =>
            onNavigate('customer-records')
          }
        />

        {/* 4. Overall Resort Rating */}
        <DashboardStatCard
          theme="earth"
          icon={
            <svg
              viewBox="0 0 24 24"
              width="34"
              height="34"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon
                points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
              />
            </svg>
          }
          count={`${averageRating} ★`}
          label="Overall Resort Rating"
          onViewDetails={() =>
            onNavigate('customer-reviews')
          }
        />

        {/* 5. Confirmed Booking Value */}
        <DashboardStatCard
          theme="deep"
          icon={
            <svg
              viewBox="0 0 24 24"
              width="34"
              height="34"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect
                x="2"
                y="4"
                width="20"
                height="16"
                rx="2"
              />
              <line
                x1="2"
                y1="10"
                x2="22"
                y2="10"
              />
              <circle
                cx="12"
                cy="15"
                r="2"
              />
            </svg>
          }
          count={formattedRevenue}
          label="Confirmed Booking Value"
          onViewDetails={() =>
            onNavigate('booking-catalog')
          }
        />

        {/* 6. Returning Customers */}
        <DashboardStatCard
          theme="sage"
          icon={
            <svg
              viewBox="0 0 24 24"
              width="34"
              height="34"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline
                points="1 4 1 10 7 10"
              />
              <polyline
                points="23 20 23 14 17 14"
              />
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
            </svg>
          }
          count={repeatBookersCount}
          label="Returning Customers"
          onViewDetails={() =>
            onNavigate('customer-records')
          }
        />
      </div>

      {/* ========================================== */}
      {/* MAIN DASHBOARD */}
      {/* ========================================== */}

      <div className="dash-main-layout-grid">

        {/* LEFT COLUMN */}
        <div className="dash-left-charts-col">

          {/* Revenue / Area Chart */}
          <AreaChartPanel
            reservations={reservations}
            onExportCsv={handleExportCsv}
          />

          {/* Bottom Charts */}
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

        {/* RIGHT COLUMN */}
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