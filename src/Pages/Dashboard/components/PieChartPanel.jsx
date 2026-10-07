import React, { useState } from 'react'

function PieChartPanel({ reservations = [], visitations = [] }) {
  const [hoveredSlice, setHoveredSlice] = useState(null)

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

  // Multiplier based on date range
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

  // Package distribution calculation
  const dayTourCount = reservations.filter((r) => r.duration_id === 1).length
  const overnightCount = reservations.filter((r) => r.duration_id === 2).length
  const twentyTwoCount = reservations.filter((r) => r.duration_id === 3 || r.duration_id === 4).length
  const ocularCount = visitations.length

  const totalReal = dayTourCount + overnightCount + twentyTwoCount + ocularCount

  const rawData = [
    {
      label: 'Day Tour',
      count: Math.max(1, Math.round((totalReal > 0 ? dayTourCount : 24) * mult)),
      color: '#7CCE17',
      sub: '8 Hours (9am-5pm)',
    },
    {
      label: 'Overnight',
      count: Math.max(1, Math.round((totalReal > 0 ? overnightCount : 18) * mult)),
      color: '#43593B',
      sub: '10 Hours (8pm-6am)',
    },
    {
      label: '22 Hours',
      count: Math.max(1, Math.round((totalReal > 0 ? twentyTwoCount : 15) * mult)),
      color: '#E6BF5C',
      sub: 'Day/Night Start',
    },
    {
      label: 'Ocular Visits',
      count: Math.max(1, Math.round((totalReal > 0 ? ocularCount : 9) * mult)),
      color: '#ACAD79',
      sub: 'Free Inspection',
    },
  ]

  const totalSum = rawData.reduce((acc, d) => acc + d.count, 0)

  // Calculate slice angles for SVG donut/pie chart
  let cumulativeAngle = 0
  const slices = rawData.map((d) => {
    const fraction = totalSum > 0 ? d.count / totalSum : 0
    const startAngle = cumulativeAngle
    const angle = fraction * 2 * Math.PI
    cumulativeAngle += angle
    const endAngle = cumulativeAngle
    const percent = Math.round(fraction * 100)

    return {
      ...d,
      startAngle,
      endAngle,
      percent,
    }
  })

  // SVG dimensions
  const size = 180
  const center = size / 2
  const outerRadius = 75
  const innerRadius = 42

  const getArcPath = (startAngle, endAngle, isHovered) => {
    const rOuter = isHovered ? outerRadius + 4 : outerRadius
    const rInner = innerRadius

    const x1 = center + rOuter * Math.cos(startAngle - Math.PI / 2)
    const y1 = center + rOuter * Math.sin(startAngle - Math.PI / 2)
    const x2 = center + rOuter * Math.cos(endAngle - Math.PI / 2)
    const y2 = center + rOuter * Math.sin(endAngle - Math.PI / 2)

    const x3 = center + rInner * Math.cos(endAngle - Math.PI / 2)
    const y3 = center + rInner * Math.sin(endAngle - Math.PI / 2)
    const x4 = center + rInner * Math.cos(startAngle - Math.PI / 2)
    const y4 = center + rInner * Math.sin(startAngle - Math.PI / 2)

    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0

    return `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${largeArc} 0 ${x4} ${y4} Z`
  }

  return (
    <div className="dash-panel-box dash-pie-panel">
      {/* Panel Header (Without Icon next to title) */}
      <div className="dash-panel-bar">
        <div className="dash-panel-heading">
          <span className="dash-panel-title-text">Reservation Types Breakdown</span>
        </div>

        {/* Date Range Selector Dropdown */}
        <div className="dash-panel-actions-group">
          <div className="dash-dropdown-container">
            <button
              type="button"
              className="dash-dropdown-toggle-btn"
              onClick={() => setIsDateMenuOpen(!isDateMenuOpen)}
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
        </div>
      </div>

      {/* Panel Body */}
      <div className="dash-pie-content">
        <div className="dash-pie-chart-wrap">
          <svg viewBox={`0 0 ${size} ${size}`} className="dash-pie-svg">
            {slices.map((s) => {
              const isHovered = hoveredSlice?.label === s.label
              return (
                <path
                  key={s.label}
                  d={getArcPath(s.startAngle, s.endAngle, isHovered)}
                  fill={s.color}
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="dash-pie-slice"
                  onMouseEnter={() => setHoveredSlice(s)}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
              )
            })}
            {/* Center Label */}
            <text
              x={center}
              y={center - 3}
              textAnchor="middle"
              className="dash-pie-center-val"
            >
              {hoveredSlice ? `${hoveredSlice.percent}%` : `${totalSum}`}
            </text>
            <text
              x={center}
              y={center + 12}
              textAnchor="middle"
              className="dash-pie-center-label"
            >
              {hoveredSlice ? hoveredSlice.label : 'Bookings'}
            </text>
          </svg>
        </div>

        {/* Legend List */}
        <div className="dash-pie-legend">
          {slices.map((s) => (
            <div
              key={s.label}
              className={`dash-pie-legend-row ${hoveredSlice?.label === s.label ? 'highlight' : ''}`}
              onMouseEnter={() => setHoveredSlice(s)}
              onMouseLeave={() => setHoveredSlice(null)}
            >
              <div className="dash-pie-legend-left">
                <span className="dash-pie-legend-color" style={{ backgroundColor: s.color }}></span>
                <div className="dash-pie-legend-names">
                  <span className="dash-pie-legend-title">{s.label}</span>
                  <span className="dash-pie-legend-sub">{s.sub}</span>
                </div>
              </div>
              <div className="dash-pie-legend-right">
                <span className="dash-pie-legend-count">{s.count}</span>
                <span className="dash-pie-legend-percent">{s.percent}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PieChartPanel
