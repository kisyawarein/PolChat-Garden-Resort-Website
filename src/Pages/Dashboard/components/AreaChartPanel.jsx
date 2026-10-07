import React, { useState } from 'react'

function AreaChartPanel({ reservations = [], onExportCsv }) {
  // Layer toggles
  const [layers, setLayers] = useState({
    revenue: true,
    volume: true,
    bookings: true,
  })
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false)
  const [hoveredPoint, setHoveredPoint] = useState(null)

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

  // Toggle single layer
  const toggleLayer = (layerKey) => {
    setLayers((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey],
    }))
  }

  // Dynamic datasets based on chosen date range
  const getPeriodsForRange = () => {
    switch (dateRange) {
      case 'This Week':
        return [
          { label: 'Mon', subLabel: 'Oct 05', revenue: 9000, volume: 22, bookings: 2 },
          { label: 'Tue', subLabel: 'Oct 06', revenue: 15000, volume: 35, bookings: 3 },
          { label: 'Wed', subLabel: 'Oct 07', revenue: 12000, volume: 28, bookings: 2 },
          { label: 'Thu', subLabel: 'Oct 08', revenue: 26000, volume: 55, bookings: 4 },
          { label: 'Fri', subLabel: 'Oct 09', revenue: 45000, volume: 90, bookings: 7 },
          { label: 'Sat', subLabel: 'Oct 10', revenue: 68000, volume: 140, bookings: 10 },
          { label: 'Sun', subLabel: 'Oct 11', revenue: 52000, volume: 110, bookings: 8 },
        ]
      case 'This Month':
        return [
          { label: 'Wk 1', subLabel: 'Oct', revenue: 38000, volume: 75, bookings: 6 },
          { label: 'Wk 2', subLabel: 'Oct', revenue: 64000, volume: 130, bookings: 10 },
          { label: 'Wk 3', subLabel: 'Oct', revenue: 89000, volume: 180, bookings: 14 },
          { label: 'Wk 4', subLabel: 'Oct', revenue: 76000, volume: 150, bookings: 12 },
        ]
      case 'Last 3 Months':
        return [
          { label: 'Aug', subLabel: '2026', revenue: 110000, volume: 220, bookings: 18 },
          { label: 'Sep', subLabel: '2026', revenue: 165000, volume: 330, bookings: 26 },
          { label: 'Oct', subLabel: '2026', revenue: 245000, volume: 490, bookings: 38 },
        ]
      case 'Last 3 Years':
        return [
          { label: '2024', subLabel: 'Annual', revenue: 480000, volume: 950, bookings: 82 },
          { label: '2025', subLabel: 'Annual', revenue: 760000, volume: 1520, bookings: 128 },
          { label: '2026', subLabel: 'YTD', revenue: 980000, volume: 1960, bookings: 165 },
        ]
      case 'Custom range':
        return [
          { label: 'Period 1', subLabel: customStart.slice(5), revenue: 55000, volume: 110, bookings: 9 },
          { label: 'Period 2', subLabel: 'Mid', revenue: 125000, volume: 250, bookings: 20 },
          { label: 'Period 3', subLabel: customEnd.slice(5), revenue: 195000, volume: 390, bookings: 31 },
        ]
      case 'This Year':
      default:
        return [
          { label: 'Q1', subLabel: '2025', revenue: 45000, volume: 85, bookings: 8 },
          { label: 'Q2', subLabel: '2025', revenue: 78000, volume: 145, bookings: 14 },
          { label: 'Q3', subLabel: '2025', revenue: 110000, volume: 210, bookings: 20 },
          { label: 'Q4', subLabel: '2025', revenue: 95000, volume: 180, bookings: 16 },
          { label: 'Q1', subLabel: '2026', revenue: 140000, volume: 260, bookings: 24 },
          { label: 'Q2', subLabel: '2026', revenue: 265000, volume: 510, bookings: 42 },
          { label: 'Q3', subLabel: '2026', revenue: 195000, volume: 380, bookings: 32 },
        ]
    }
  }

  const periods = getPeriodsForRange()

  // If real reservations exist, enrich latest data point
  const totalRealRevenue = reservations
    .filter((r) => r.reservation_status === 'confirmed')
    .reduce((sum, r) => sum + (r.reservation_cost || 0) + (r.extra_charges || 0), 0)

  if (totalRealRevenue > 0 && periods.length > 0) {
    periods[periods.length - 1].revenue = Math.max(periods[periods.length - 1].revenue, totalRealRevenue)
  }

  // Chart layout dimensions
  const chartWidth = 650
  const chartHeight = 270
  const padLeft = 55
  const padRight = 25
  const padTop = 25
  const padBottom = 45

  const usableWidth = chartWidth - padLeft - padRight
  const usableHeight = chartHeight - padTop - padBottom

  // Dynamic maximum calculation
  const rawMaxRev = Math.max(...periods.map((p) => p.revenue), 100000)
  const maxRevenue = Math.ceil(rawMaxRev / 50000) * 50000
  const maxVolume = Math.max(...periods.map((p) => p.volume), 100) * 1.2
  const maxBookings = Math.max(...periods.map((p) => p.bookings), 10) * 1.25

  const getX = (idx) => padLeft + (idx / Math.max(periods.length - 1, 1)) * usableWidth
  const getY = (val, max) => padTop + usableHeight - (val / max) * usableHeight

  // Generate SVG curve paths
  const generateAreaPath = (key, max) => {
    const points = periods.map((p, idx) => ({
      x: getX(idx),
      y: getY(p[key], max),
    }))

    if (points.length === 0) return ''

    let d = `M ${points[0].x} ${points[0].y}`
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i]
      const p1 = points[i + 1]
      const mx = (p0.x + p1.x) / 2
      d += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`
    }

    const lastX = points[points.length - 1].x
    const firstX = points[0].x
    const bottomY = padTop + usableHeight
    d += ` L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`
    return d
  }

  const generateLinePath = (key, max) => {
    const points = periods.map((p, idx) => ({
      x: getX(idx),
      y: getY(p[key], max),
    }))

    if (points.length === 0) return ''

    let d = `M ${points[0].x} ${points[0].y}`
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i]
      const p1 = points[i + 1]
      const mx = (p0.x + p1.x) / 2
      d += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`
    }
    return d
  }

  const yTicks = [
    0,
    Math.round(maxRevenue * 0.25),
    Math.round(maxRevenue * 0.5),
    Math.round(maxRevenue * 0.75),
    maxRevenue,
  ]

  return (
    <div className="dash-panel-box">
      {/* Panel Header (Without Icon next to title) */}
      <div className="dash-panel-bar">
        <div className="dash-panel-heading">
          <span className="dash-panel-title-text">Revenue & Reservation Trends</span>
        </div>

        {/* Right Action Header Buttons */}
        <div className="dash-panel-actions-group">
          {/* Date Range Selector Dropdown */}
          <div className="dash-dropdown-container">
            <button
              type="button"
              className="dash-dropdown-toggle-btn"
              onClick={() => {
                setIsDateMenuOpen(!isDateMenuOpen)
                setIsFilterMenuOpen(false)
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

                {/* Custom Range Inputs */}
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
                      Apply Range
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Export Button (Separated) */}
          <button
            type="button"
            className="dash-action-btn-export"
            onClick={onExportCsv}
            title="Download CSV report"
          >
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Export CSV</span>
          </button>

          {/* Filters Dropdown with Checkboxes */}
          <div className="dash-dropdown-container">
            <button
              type="button"
              className="dash-dropdown-toggle-btn"
              onClick={() => {
                setIsFilterMenuOpen(!isFilterMenuOpen)
                setIsDateMenuOpen(false)
              }}
            >
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
              <span>Filters</span>
              <span className="dash-dropdown-caret">▾</span>
            </button>

            {isFilterMenuOpen && (
              <div className="dash-dropdown-menu dash-filters-menu">
                <div className="dash-filter-menu-title">Toggle Chart Layers</div>
                
                <label className="dash-filter-checkbox-item">
                  <input
                    type="checkbox"
                    checked={layers.revenue}
                    onChange={() => toggleLayer('revenue')}
                    className="dash-checkbox-input"
                  />
                  <span className="dash-color-dot dot-forest"></span>
                  <span className="dash-filter-label">Revenue (PHP)</span>
                </label>

                <label className="dash-filter-checkbox-item">
                  <input
                    type="checkbox"
                    checked={layers.volume}
                    onChange={() => toggleLayer('volume')}
                    className="dash-checkbox-input"
                  />
                  <span className="dash-color-dot dot-green"></span>
                  <span className="dash-filter-label">Guest Volume (Pax)</span>
                </label>

                <label className="dash-filter-checkbox-item">
                  <input
                    type="checkbox"
                    checked={layers.bookings}
                    onChange={() => toggleLayer('bookings')}
                    className="dash-checkbox-input"
                  />
                  <span className="dash-color-dot dot-sage"></span>
                  <span className="dash-filter-label">Booking Counts</span>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Panel Body / Chart */}
      <div className="dash-panel-content">
        <div className="dash-chart-wrapper">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="dash-svg-chart">
            <defs>
              <linearGradient id="areaForestGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#43593B" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#43593B" stopOpacity="0.15" />
              </linearGradient>

              <linearGradient id="areaGreenGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7CCE17" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#7CCE17" stopOpacity="0.15" />
              </linearGradient>

              <linearGradient id="areaSageGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ACAD79" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#ACAD79" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid Lines */}
            {yTicks.map((tick) => {
              const y = getY(tick, maxRevenue)
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
                    x={padLeft - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="dash-axis-text"
                  >
                    {tick === 0 ? '0' : `${(tick / 1000).toLocaleString()}k`}
                  </text>
                </g>
              )
            })}

            {/* X Axis Labels: Q1 on top, Year directly below it */}
            {periods.map((p, idx) => {
              const x = getX(idx)
              return (
                <g key={`${p.label}-${p.subLabel}-${idx}`} className="dash-xaxis-group">
                  {/* Top Label (e.g. Q1) */}
                  <text
                    x={x}
                    y={chartHeight - 20}
                    textAnchor="middle"
                    className="dash-axis-text"
                  >
                    {p.label}
                  </text>
                  {/* Year / Sub-label directly below */}
                  <text
                    x={x}
                    y={chartHeight - 7}
                    textAnchor="middle"
                    className="dash-axis-subtext"
                  >
                    {p.subLabel}
                  </text>
                </g>
              )
            })}

            {/* Area Layers based on checkbox filters */}
            {layers.revenue && (
              <>
                <path d={generateAreaPath('revenue', maxRevenue)} fill="url(#areaForestGrad)" />
                <path d={generateLinePath('revenue', maxRevenue)} fill="none" stroke="#43593B" strokeWidth="2.5" />
              </>
            )}

            {layers.volume && (
              <>
                <path d={generateAreaPath('volume', maxVolume)} fill="url(#areaGreenGrad)" />
                <path d={generateLinePath('volume', maxVolume)} fill="none" stroke="#7CCE17" strokeWidth="2" />
              </>
            )}

            {layers.bookings && (
              <>
                <path d={generateAreaPath('bookings', maxBookings)} fill="url(#areaSageGrad)" />
                <path d={generateLinePath('bookings', maxBookings)} fill="none" stroke="#ACAD79" strokeWidth="2" />
              </>
            )}

            {/* Interactive Data Dots */}
            {periods.map((p, idx) => {
              const x = getX(idx)
              const y = getY(p.revenue, maxRevenue)
              return (
                <g
                  key={idx}
                  className="dash-chart-dot-group"
                  onMouseEnter={() => setHoveredPoint({ ...p, x, y })}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={hoveredPoint?.label === p.label && hoveredPoint?.subLabel === p.subLabel ? 6 : 4}
                    fill="#ffffff"
                    stroke="#43593B"
                    strokeWidth="2.5"
                    className="dash-chart-dot"
                  />
                </g>
              )
            })}
          </svg>

          {/* Hover Tooltip */}
          {hoveredPoint && (
            <div
              className="dash-chart-tooltip"
              style={{
                left: `${(hoveredPoint.x / chartWidth) * 100}%`,
                top: `${(hoveredPoint.y / chartHeight) * 100}%`,
              }}
            >
              <div className="dash-tooltip-title">{hoveredPoint.label} {hoveredPoint.subLabel}</div>
              {layers.revenue && (
                <div className="dash-tooltip-val">Revenue: PHP {hoveredPoint.revenue.toLocaleString()}</div>
              )}
              {layers.volume && (
                <div className="dash-tooltip-val">Guests: {hoveredPoint.volume} Pax</div>
              )}
              {layers.bookings && (
                <div className="dash-tooltip-val">Bookings: {hoveredPoint.bookings}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AreaChartPanel
