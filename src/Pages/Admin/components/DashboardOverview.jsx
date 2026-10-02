import { DataService } from '../../../services/dataService'

function DashboardOverview({
  reservations,
  visitations,
  customers,
  inquiries,
  onNavigateTab,
}) {
  const confirmedRes = reservations.filter((r) => r.reservation_status === 'confirmed')
  const pendingRes = reservations.filter((r) => r.reservation_status === 'pending')
  const cancelledRes = reservations.filter((r) => r.reservation_status === 'cancelled')

  const totalRevenue = confirmedRes.reduce((acc, r) => acc + (r.reservation_cost || 0) + (r.extra_charges || 0), 0)
  const totalSecDeposits = confirmedRes.filter((r) => r.has_paid_sec_dep).length * 2000

  // Booking Types Breakdown
  const dayTours = reservations.filter((r) => r.duration_id === 1).length
  const overnights = reservations.filter((r) => r.duration_id === 2).length
  const twentyTwoHrs = reservations.filter((r) => r.duration_id === 3 || r.duration_id === 4).length
  const ocularVisits = visitations.length

  const totalBookingsCount = reservations.length + visitations.length

  // CSV Export Handlers
  const handleExportReservations = () => {
    const dataToExport = reservations.map((r) => ({
      'Reservation ID': r.reservation_id,
      'Customer Name': r.customer_name || `Customer #${r.customer_id}`,
      'Contact Phone': r.customer_phone || 'N/A',
      'Package Type': r.duration_id === 1 ? 'Day Tour' : r.duration_id === 2 ? 'Overnight' : '22 Hours',
      'Event Name': r.event_name || 'Standard Booking',
      'Guests Count': r.guest_count,
      'Start Time': r.start_date,
      'End Time': r.end_date,
      'Package Price (PHP)': r.reservation_cost,
      'Extra Charges (PHP)': r.extra_charges,
      'Security Deposit (PHP 2000)': r.has_paid_sec_dep ? 'PAID' : 'UNPAID',
      'Reservation Cost Paid': r.has_paid_reservation ? 'PAID' : 'UNPAID',
      'Status': r.reservation_status.toUpperCase(),
      'Payment Method': r.payment_method || 'GCash',
      'Reference No': r.payment_reference || 'N/A',
    }))
    DataService.exportToCsv('Polchat_Reservations_Report', dataToExport)
  }

  const handleExportCustomers = () => {
    const dataToExport = customers.map((c) => ({
      'Customer ID': c.customer_id,
      'First Name': c.first_name,
      'Last Name': c.last_name || '',
      'Phone': c.phone_number || 'N/A',
      'Email': c.email || 'N/A',
      'Date Registered': c.date_create,
    }))
    DataService.exportToCsv('Polchat_Customer_Records', dataToExport)
  }

  const handleExportRevenue = () => {
    const dataToExport = [
      {
        'Metric': 'Total Confirmed Revenue',
        'Amount PHP': totalRevenue,
      },
      {
        'Metric': 'Security Deposits Collected',
        'Amount PHP': totalSecDeposits,
      },
      {
        'Metric': 'Confirmed Resort Bookings',
        'Amount PHP': confirmedRes.length,
      },
      {
        'Metric': 'Pending Bookings In Pipeline',
        'Amount PHP': pendingRes.length,
      },
    ]
    DataService.exportToCsv('Polchat_Financial_Summary', dataToExport)
  }

  return (
    <div className="admin-overview-container">
      {/* Top Stat Cards */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card admin-kpi-forest">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">TOTAL REVENUE (CONFIRMED)</span>
            <span className="admin-kpi-icon">💰</span>
          </div>
          <div className="admin-kpi-value">PHP {totalRevenue.toLocaleString()}</div>
          <div className="admin-kpi-subtext">
            + PHP {totalSecDeposits.toLocaleString()} in Security Deposits
          </div>
        </div>

        <div className="admin-kpi-card admin-kpi-sand">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">TOTAL BOOKINGS & VISITS</span>
            <span className="admin-kpi-icon">📅</span>
          </div>
          <div className="admin-kpi-value">{totalBookingsCount}</div>
          <div className="admin-kpi-subtext">
            {confirmedRes.length} Confirmed • {pendingRes.length} Pending • {cancelledRes.length} Cancelled
          </div>
        </div>

        <div className="admin-kpi-card admin-kpi-sage">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">CUSTOMER DIRECTORY</span>
            <span className="admin-kpi-icon">👥</span>
          </div>
          <div className="admin-kpi-value">{customers.length}</div>
          <div className="admin-kpi-subtext">Registered guest accounts</div>
        </div>

        <div className="admin-kpi-card admin-kpi-lime">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">ACTIVE INQUIRIES</span>
            <span className="admin-kpi-icon">💬</span>
          </div>
          <div className="admin-kpi-value">
            {inquiries.filter((i) => i.inquiry_status === 'open' || i.inquiry_status === 'in-progress').length}
          </div>
          <div className="admin-kpi-subtext">
            {inquiries.filter((i) => i.inquiry_status === 'open').length} requiring response
          </div>
        </div>
      </div>

      {/* Export Reports Action Bar */}
      <div className="admin-export-bar">
        <div className="admin-export-info">
          <h3 className="admin-export-title">Download Management Reports</h3>
          <p className="admin-export-desc">
            Export structured CSV/Excel reports for accounting, auditing, and management records.
          </p>
        </div>
        <div className="admin-export-actions">
          <button
            type="button"
            className="admin-export-btn"
            onClick={handleExportReservations}
          >
            📥 Export Reservations CSV
          </button>
          <button
            type="button"
            className="admin-export-btn"
            onClick={handleExportCustomers}
          >
            📥 Export Customers CSV
          </button>
          <button
            type="button"
            className="admin-export-btn"
            onClick={handleExportRevenue}
          >
            📥 Export Financial Summary
          </button>
        </div>
      </div>

      {/* Charts Section */}
      <div className="admin-charts-grid">
        {/* Bar Chart: Bookings & Revenue by Package */}
        <div className="admin-chart-card">
          <h3 className="admin-chart-title">Package Distribution & Revenue</h3>
          <p className="admin-chart-subtitle">Comparison across Resort Packages & Ocular Visits</p>

          <div className="admin-barchart-container">
            <div className="admin-bar-item">
              <div className="admin-bar-track">
                <div
                  className="admin-bar-fill admin-fill-daytour"
                  style={{ height: `${Math.max(20, (dayTours / (totalBookingsCount || 1)) * 180)}px` }}
                >
                  <span className="admin-bar-val">{dayTours}</span>
                </div>
              </div>
              <span className="admin-bar-label">Day Tour (8h)</span>
              <span className="admin-bar-rate">PHP 9,000</span>
            </div>

            <div className="admin-bar-item">
              <div className="admin-bar-track">
                <div
                  className="admin-bar-fill admin-fill-overnight"
                  style={{ height: `${Math.max(20, (overnights / (totalBookingsCount || 1)) * 180)}px` }}
                >
                  <span className="admin-bar-val">{overnights}</span>
                </div>
              </div>
              <span className="admin-bar-label">Overnight (10h)</span>
              <span className="admin-bar-rate">PHP 10,000</span>
            </div>

            <div className="admin-bar-item">
              <div className="admin-bar-track">
                <div
                  className="admin-bar-fill admin-fill-twentytwo"
                  style={{ height: `${Math.max(20, (twentyTwoHrs / (totalBookingsCount || 1)) * 180)}px` }}
                >
                  <span className="admin-bar-val">{twentyTwoHrs}</span>
                </div>
              </div>
              <span className="admin-bar-label">22 Hours</span>
              <span className="admin-bar-rate">PHP 17,000</span>
            </div>

            <div className="admin-bar-item">
              <div className="admin-bar-track">
                <div
                  className="admin-bar-fill admin-fill-ocular"
                  style={{ height: `${Math.max(20, (ocularVisits / (totalBookingsCount || 1)) * 180)}px` }}
                >
                  <span className="admin-bar-val">{ocularVisits}</span>
                </div>
              </div>
              <span className="admin-bar-label">Ocular Visits</span>
              <span className="admin-bar-rate">FREE</span>
            </div>
          </div>
        </div>

        {/* Pie / Donut Chart: Reservation Status Distribution */}
        <div className="admin-chart-card">
          <h3 className="admin-chart-title">Booking Status Distribution</h3>
          <p className="admin-chart-subtitle">Current status breakdown for all reservation requests</p>

          <div className="admin-pie-section">
            <div className="admin-donut-wrapper">
              <svg viewBox="0 0 36 36" className="admin-donut-chart">
                {/* Background Ring */}
                <path
                  className="admin-donut-bg"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="3.8"
                />
                {/* Confirmed slice */}
                <path
                  className="admin-donut-confirmed"
                  strokeDasharray={`${((confirmedRes.length / (reservations.length || 1)) * 100).toFixed(0)}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#43593B"
                  strokeWidth="4"
                />
              </svg>
              <div className="admin-donut-center">
                <span className="admin-donut-center-num">{reservations.length}</span>
                <span className="admin-donut-center-text">Total</span>
              </div>
            </div>

            <div className="admin-legend-list">
              <div className="admin-legend-item">
                <span className="admin-legend-dot admin-dot-confirmed"></span>
                <span className="admin-legend-label">Confirmed ({confirmedRes.length})</span>
                <span className="admin-legend-pct">
                  {reservations.length ? Math.round((confirmedRes.length / reservations.length) * 100) : 0}%
                </span>
              </div>

              <div className="admin-legend-item">
                <span className="admin-legend-dot admin-dot-pending"></span>
                <span className="admin-legend-label">Pending ({pendingRes.length})</span>
                <span className="admin-legend-pct">
                  {reservations.length ? Math.round((pendingRes.length / reservations.length) * 100) : 0}%
                </span>
              </div>

              <div className="admin-legend-item">
                <span className="admin-legend-dot admin-dot-cancelled"></span>
                <span className="admin-legend-label">Cancelled ({cancelledRes.length})</span>
                <span className="admin-legend-pct">
                  {reservations.length ? Math.round((cancelledRes.length / reservations.length) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Shortcut Cards */}
      <div className="admin-shortcuts-grid">
        <div className="admin-shortcut-card" onClick={() => onNavigateTab('bookings')}>
          <h4 className="admin-shortcut-title">Manage Reservations</h4>
          <p className="admin-shortcut-desc">Verify GCash receipts, update payment status, and confirm reservations.</p>
          <span className="admin-shortcut-link">Open Booking Catalog →</span>
        </div>

        <div className="admin-shortcut-card" onClick={() => onNavigateTab('calendar')}>
          <h4 className="admin-shortcut-title">Resort Schedule Calendar</h4>
          <p className="admin-shortcut-desc">Inspect day tours, night stays, and ocular visitations mapped to calendar dates.</p>
          <span className="admin-shortcut-link">Open Calendar View →</span>
        </div>

        <div className="admin-shortcut-card" onClick={() => onNavigateTab('inquiries')}>
          <h4 className="admin-shortcut-title">Customer Inquiry Center</h4>
          <p className="admin-shortcut-desc">Respond to guest questions, submit admin responder name, and resolve inquiries.</p>
          <span className="admin-shortcut-link">Open Live Inquiries →</span>
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview
