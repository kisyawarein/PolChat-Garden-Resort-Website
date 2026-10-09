import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { DataService } from '../../services/dataService'
import AnalyticsKPIs from './components/AnalyticsKPIs'
import BookingAnalyticsSection from './components/BookingAnalyticsSection'
import CustomerAnalyticsSection from './components/CustomerAnalyticsSection'
import ReviewAnalyticsSection from './components/ReviewAnalyticsSection'
import './styles.css'

function Analytics() {
  const { isAdmin, openAuthModal } = useAuth()
  const [reservations, setReservations] = useState([])
  const [visitations, setVisitations] = useState([])
  const [customers, setCustomers] = useState([])
  const [inquiries, setInquiries] = useState([])
  const [reviews, setReviews] = useState([])
  const [activeCategory, setActiveCategory] = useState('all') // 'all' | 'bookings' | 'customers' | 'reviews'
  const [dateRange, setDateRange] = useState('This Year')
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false)
  const [customStart, setCustomStart] = useState('2026-01-01')
  const [customEnd, setCustomEnd] = useState('2026-12-31')
  const [toastMsg, setToastMsg] = useState('')

  const dateOptions = [
    'This Week',
    'This Month',
    'Last 3 Months',
    'This Year',
    'Last 3 Years',
    'Custom range',
  ]

  const loadData = async () => {
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
      console.error('Failed to load analytics data:', err)
    }
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

  const handleExportAnalyticsCSV = () => {
    const exportData = [
      ...reservations.map((r) => ({
        Type: 'Reservation',
        ID: r.reservation_id,
        Customer: r.customer_name,
        Date: r.start_date,
        Amount: (r.reservation_cost || 0) + (r.extra_charges || 0),
        Status: r.reservation_status,
      })),
      ...visitations.map((v) => ({
        Type: 'Ocular Visit',
        ID: v.visitation_id,
        Customer: v.customer_name,
        Date: v.visitation_start_date,
        Amount: 0,
        Status: v.visitation_status,
      })),
    ]
    DataService.exportToCsv('Polchat_Executive_Analytics', exportData)
    showToast('Analytics summary exported to CSV.')
  }

  // Multiplier scaling for timeframe simulation
  const getScale = () => {
    switch (dateRange) {
      case 'This Week': return 0.2
      case 'This Month': return 0.45
      case 'Last 3 Months': return 0.75
      case 'Last 3 Years': return 2.8
      case 'Custom range': return 0.85
      case 'This Year':
      default: return 1.0
    }
  }

  if (!isAdmin) {
    return (
      <div className="analytics-access-denied">
        <div className="analytics-access-card">
          <div className="analytics-access-badge">STAFF ONLY</div>
          <h2>Analytics Intelligence Restricted</h2>
          <p>Please log in with an administrator account to access resort analytics & reports.</p>
          <button
            type="button"
            className="analytics-access-btn"
            onClick={() => openAuthModal('signin')}
          >
            Sign In as Admin
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="analytics-page-container">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="analytics-toast-box">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Top Header Bar */}
      <div className="analytics-header-bar">
        <div className="analytics-title-group">
          <h1 className="analytics-main-title">Resort Intelligence & Analytics</h1>
          <p className="analytics-subtitle">
            Consolidated operational data, revenue trends, customer lifetime value, and sentiment metrics.
          </p>
        </div>

        {/* Global Action Header Controls */}
        <div className="analytics-header-actions">
          {/* Timeframe Selector */}
          <div className="analytics-dropdown-container">
            <button
              type="button"
              className="analytics-dropdown-btn"
              onClick={() => setIsDateMenuOpen(!isDateMenuOpen)}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>{dateRange}</span>
              <span className="analytics-caret">▾</span>
            </button>

            {isDateMenuOpen && (
              <div className="analytics-dropdown-menu">
                <div className="analytics-dropdown-header">Select Timeframe</div>
                {dateOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={`analytics-dropdown-item ${dateRange === opt ? 'active' : ''}`}
                    onClick={() => {
                      setDateRange(opt)
                      if (opt !== 'Custom range') setIsDateMenuOpen(false)
                    }}
                  >
                    {opt}
                  </button>
                ))}

                {dateRange === 'Custom range' && (
                  <div className="analytics-custom-date-box">
                    <div className="analytics-date-row">
                      <label>From:</label>
                      <input
                        type="date"
                        value={customStart}
                        onChange={(e) => setCustomStart(e.target.value)}
                        className="analytics-date-input"
                      />
                    </div>
                    <div className="analytics-date-row">
                      <label>To:</label>
                      <input
                        type="date"
                        value={customEnd}
                        onChange={(e) => setCustomEnd(e.target.value)}
                        className="analytics-date-input"
                      />
                    </div>
                    <button
                      type="button"
                      className="analytics-apply-date-btn"
                      onClick={() => setIsDateMenuOpen(false)}
                    >
                      Apply Range
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Export CSV Button */}
          <button
            type="button"
            className="analytics-btn-export"
            onClick={handleExportAnalyticsCSV}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Export Report (CSV)</span>
          </button>
        </div>
      </div>

      {/* Category Tab Switchers */}
      <div className="analytics-tabs-bar">
        <button
          type="button"
          className={`analytics-tab-btn ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          <span>All Analytics Overview</span>
        </button>
        <button
          type="button"
          className={`analytics-tab-btn ${activeCategory === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveCategory('bookings')}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <path d="M9 16l2 2 4-4" />
          </svg>
          <span>Bookings & Revenue</span>
        </button>
        <button
          type="button"
          className={`analytics-tab-btn ${activeCategory === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveCategory('customers')}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>Customer Directory</span>
        </button>
        <button
          type="button"
          className={`analytics-tab-btn ${activeCategory === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveCategory('reviews')}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span>Reviews & Sentiment</span>
        </button>
      </div>

      {/* Top 6 KPI Stat Cards */}
      <AnalyticsKPIs
        reservations={reservations}
        visitations={visitations}
        customers={customers}
        reviews={reviews}
        scale={getScale()}
      />

      {/* Main Analytics Sections */}
      <div className="analytics-sections-stack">
        {(activeCategory === 'all' || activeCategory === 'bookings') && (
          <BookingAnalyticsSection
            reservations={reservations}
            visitations={visitations}
            scale={getScale()}
          />
        )}

        {(activeCategory === 'all' || activeCategory === 'customers') && (
          <CustomerAnalyticsSection
            customers={customers}
            reservations={reservations}
            scale={getScale()}
          />
        )}

        {(activeCategory === 'all' || activeCategory === 'reviews') && (
          <ReviewAnalyticsSection
            reviews={reviews}
          />
        )}
      </div>
    </div>
  )
}

export default Analytics
