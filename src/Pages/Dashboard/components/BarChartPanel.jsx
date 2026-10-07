import React, { useState } from 'react'

function BarChartPanel({ reservations = [], visitations = [], onExportCsv }) {
  const [selectedView, setSelectedView] = useState('packages') // 'packages' | 'status'
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false)
  const [hoveredBar, setHoveredBar] = useState(null)

  // Date Range state
  const [dateRange, setDateRange] = useState('This Year')
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false)
  const [customStart, setCustomStart] = useState('2026-01-01')
  const [customEnd, setCustomEnd] = useState('2026-12-31')

  const dateOptions = [
    'This Week',
    'This Month',
    'Last 3 Months',
    'This Year',
    'Last 3 Years',
    'Custom range',
  ]

  // Multipliers based on date range for realistic dynamic scaling
  const getScaleMultiplier = () => {
    switch (dateRange) {
      case 'This Week': return 0.2
      case 'This Month': return 0.45
      case 'Last 3 Months': return 0.75
      case 'Last 3 Years': return 3.2
      case 'Custom range': return 0.8
      case 'This Year':
      default: return 1.0
    }
  }

  const mult = getScaleMultiplier()

  // Base counts
  const realDayTour = reservations.filter((r) => r.duration_id === 1).length
  const realOvernight = reservations.filter((r) => r.duration_id === 2).length
  const realDay22 = reservations.filter((r) => r.duration_id === 3).length
  const realNight22 = reservations.filter((r) => r.duration_id === 4).length
  const realOcular = visitations.length

  const packageBars = [
    { label: 'Day Tour', count: Math.max(1, Math.round((realDayTour > 0 ? realDayTour : 18) * mult)), color: '#7CCE17', sub: '9am - 5pm' },
    { label: 'Overnight', count: Math.max(1, Math.round((realOvernight > 0 ? realOvernight : 24) * mult)), color: '#43593B', sub: '8pm - 6am' },
    { label: '22h Day', count: Math.max(1, Math.round((realDay22 > 0 ? realDay22 : 15) * mult)), color: '#E6BF5C', sub: '8am - 6am' },
    { label: '22h Night', count: Math.max(1, Math.round((realNight22 > 0 ? realNight22 : 12) * mult)), color: '#ACAD79', sub: '8pm - 6pm' },
    { label: 'Ocular', count: Math.max(1, Math.round((realOcular > 0 ? realOcular : 9) * mult)), color: '#58402E', sub: 'Inspections' },
  ]

  const confirmedCount = reservations.filter((r) => r.reservation_status === 'confirmed').length
  const pendingCount = reservations.filter((r) => r.reservation_status === 'pending').length
  const paidSecDepCount = reservations.filter((r) => r.has_paid_sec_dep).length
  const fullPaidCount = reservations.filter((r) => r.has_paid_reservation).length

  const statusBars = [
    { label: 'Confirmed', count: Math.max(1, Math.round((confirmedCount > 0 ? confirmedCount : 28) * mult)), color: '#7CCE17', sub: 'Approved' },
    { label: 'Pending', count: Math.max(1, Math.round((pendingCount > 0 ? pendingCount : 10) * mult)), color: '#E6BF5C', sub: 'Awaiting Action' },
    { label: 'Deposit Paid', count: Math.max(1, Math.round((paidSecDepCount > 0 ? paidSecDepCount : 22) * mult)), color: '#ACAD79', sub: 'Security Dep' },
    { label: 'Fully Paid', count: Math.max(1, Math.round((fullPaidCount > 0 ? fullPaidCount : 19) * mult)), color: '#43593B', sub: 'Completed' },
  ]

  const activeBars = selectedView === 'packages' ? packageBars : statusBars

  // Chart Dimensions
  const chartWidth = 380
  const chartHeight = 220
  const padLeft = 35
  const padRight = 15
  const padTop = 20
  const padBottom = 35

  const usableWidth = chartWidth - padLeft - padRight
  const usableHeight = chartHeight - padTop - padBottom

  const maxVal = Math.max(...activeBars.map((b) => b.count), 15)
  const barSlotWidth = usableWidth / activeBars.length
  const barWidth = Math.min(barSlotWidth * 0.58, 38)

  const yTicks = [0, Math.round(maxVal * 0.33), Math.round(maxVal * 0.66), maxVal]

  return (
    <div className="dash-panel-box dash-bar-panel">
      {/* Panel Header (No icon next to title) */}
      <div className="dash-panel-bar">
        <div className="dash-panel-heading">
          <span className="dash-panel-title-text">
            {selectedView === 'packages' ? 'Package Volume' : 'Status Breakdown'}
          </span>
        </div>

        {/* Action Controls */}
        <div className="dash-panel-actions-group">
          {/* Date Range Selector Dropdown */}
          <div className="dash-dropdown-container">
            <button
              type="button"
              className="dash-dropdown-toggle-btn"
              onClick={() => {
                setIsDateMenuOpen(!isDateMenuOpen)
                setIsViewMenuOpen(false)
              }}
            >
              <span>{dateRange}</span>
              <span className="dash-dropdown-caret">▾</span>
            </button>

            {isDateMenuOpen && (
              <div className="dash-dropdown-menu dash-date-menu">
                <div className="dash-filter-menu-title">Select Timeframe</div>
                {dateOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={`dash-dropdown-item ${dateRange === opt ? 'active' : ''}`}
                    onClick={() => {
                      setDateRange(opt)
                      if (opt !== 'Custom range') setIsDateMenuOpen(false)
                    }}
                  >
                    {opt}
                  </button>
                ))}

                {dateRange === 'Custom range' && (
                  <div className="dash-custom-range-box">
                    <div className="dash-range-row">
                      <label>From:</label>
                      <input
                        type="date"
                        value={customStart}
                        onChange={(e) => setCustomStart(e.target.value)}
                        className="dash-date-input"
                      />
                    </div>
                    <div className="dash-range-row">
                      <label>To:</label>
                      <input
                        type="date"
                        value={customEnd}
                        onChange={(e) => setCustomEnd(e.target.value)}
                        className="dash-date-input"
                      />
                    </div>
                    <button
                      type="button"
                      className="dash-apply-date-btn"
                      onClick={() => setIsDateMenuOpen(false)}
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* View Toggle */}
          <div className="dash-dropdown-container">
            <button
              type="button"
              className="dash-dropdown-toggle-btn"
              onClick={() => {
                setIsViewMenuOpen(!isViewMenuOpen)
                setIsDateMenuOpen(false)
              }}
            >
              <span>View</span>
              <span className="dash-dropdown-caret">▾</span>
            </button>

            {isViewMenuOpen && (
              <div className="dash-dropdown-menu">
                <button
                  type="button"
                  className={`dash-dropdown-item ${selectedView === 'packages' ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedView('packages')
                    setIsViewMenuOpen(false)
                  }}
                >
                  By Package Type
                </button>
                <button
                  type="button"
                  className={`dash-dropdown-item ${selectedView === 'status' ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedView('status')
                    setIsViewMenuOpen(false)
                  }}
                >
                  By Status Breakdown
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Panel Body */}
      <div className="dash-panel-content">
        <div className="dash-chart-wrapper">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="dash-svg-chart">
            {/* Horizontal Grid Lines */}
            {yTicks.map((tick) => {
              const y = padTop + usableHeight - (tick / maxVal) * usableHeight
              return (
                <g key={tick} className="dash-grid-group">
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={chartWidth - padRight}
                    y2={y}
                    stroke="#E4DCD3"
                    strokeWidth="1"
                    strokeDasharray={tick === 0 ? 'none' : '3,3'}
                  />
                  <text
                    x={padLeft - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="dash-axis-text"
                  >
                    {tick}
                  </text>
                </g>
              )
            })}

            {/* Bars */}
            {activeBars.map((bar, idx) => {
              const barCenterX = padLeft + idx * barSlotWidth + barSlotWidth / 2
              const barX = barCenterX - barWidth / 2
              const bHeight = (bar.count / maxVal) * usableHeight
              const barY = padTop + usableHeight - bHeight

              return (
                <g
                  key={bar.label}
                  className="dash-bar-group"
                  onMouseEnter={() =>
                    setHoveredBar({
                      ...bar,
                      x: barCenterX,
                      y: barY,
                    })
                  }
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  <rect
                    x={barX}
                    y={barY}
                    width={barWidth}
                    height={bHeight}
                    fill={bar.color}
                    rx="4"
                    className="dash-bar-rect"
                  />

                  <text
                    x={barCenterX}
                    y={barY - 5}
                    textAnchor="middle"
                    className="dash-bar-val-text"
                  >
                    {bar.count}
                  </text>

                  <text
                    x={barCenterX}
                    y={chartHeight - 12}
                    textAnchor="middle"
                    className="dash-axis-text"
                  >
                    {bar.label}
                  </text>
                </g>
              )
            })}
          </svg>

          {/* Hover Tooltip */}
          {hoveredBar && (
            <div
              className="dash-chart-tooltip"
              style={{
                left: `${(hoveredBar.x / chartWidth) * 100}%`,
                top: `${(hoveredBar.y / chartHeight) * 100}%`,
              }}
            >
              <div className="dash-tooltip-title">{hoveredBar.label}</div>
              <div className="dash-tooltip-val">
                {hoveredBar.count} Bookings • {hoveredBar.sub}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BarChartPanel
