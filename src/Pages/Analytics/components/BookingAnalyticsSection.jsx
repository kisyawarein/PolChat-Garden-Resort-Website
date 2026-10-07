import React, { useState } from 'react'

function BookingAnalyticsSection({ reservations = [], visitations = [], scale = 1.0 }) {
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const [hoveredBar, setHoveredBar] = useState(null)

  // Booking trends data
  const trendPeriods = [
    { label: 'Jan', revenue: 35000 * scale, bookings: 5 * scale },
    { label: 'Feb', revenue: 42000 * scale, bookings: 6 * scale },
    { label: 'Mar', revenue: 58000 * scale, bookings: 9 * scale },
    { label: 'Apr', revenue: 82000 * scale, bookings: 13 * scale },
    { label: 'May', revenue: 115000 * scale, bookings: 18 * scale },
    { label: 'Jun', revenue: 140000 * scale, bookings: 22 * scale },
    { label: 'Jul', revenue: 165000 * scale, bookings: 26 * scale },
    { label: 'Aug', revenue: 190000 * scale, bookings: 30 * scale },
    { label: 'Sep', revenue: 210000 * scale, bookings: 34 * scale },
    { label: 'Oct', revenue: 245000 * scale, bookings: 38 * scale },
  ]

  // Distribution by Package
  const dayTourCount = reservations.filter((r) => r.duration_id === 1).length
  const overnightCount = reservations.filter((r) => r.duration_id === 2).length
  const day22Count = reservations.filter((r) => r.duration_id === 3).length
  const night22Count = reservations.filter((r) => r.duration_id === 4).length
  const ocularCount = visitations.length

  const packageBars = [
    { label: 'Day Tour (8h)', count: Math.max(1, Math.round((dayTourCount > 0 ? dayTourCount : 24) * scale)), color: '#7CCE17', price: '₱9,000' },
    { label: 'Overnight (10h)', count: Math.max(1, Math.round((overnightCount > 0 ? overnightCount : 18) * scale)), color: '#43593B', price: '₱10,000' },
    { label: '22h Day Start', count: Math.max(1, Math.round((day22Count > 0 ? day22Count : 12) * scale)), color: '#E6BF5C', price: '₱17,000' },
    { label: '22h Night Start', count: Math.max(1, Math.round((night22Count > 0 ? night22Count : 9) * scale)), color: '#ACAD79', price: '₱17,000' },
    { label: 'Ocular Visit', count: Math.max(1, Math.round((ocularCount > 0 ? ocularCount : 8) * scale)), color: '#58402E', price: 'Free' },
  ]

  // SVG dimensions for Trend line
  const chartWidth = 560
  const chartHeight = 220
  const padLeft = 55
  const padRight = 20
  const padTop = 20
  const padBottom = 30

  const usableWidth = chartWidth - padLeft - padRight
  const usableHeight = chartHeight - padTop - padBottom

  const maxRev = Math.max(...trendPeriods.map((p) => p.revenue), 100000)
  const maxVal = Math.ceil(maxRev / 50000) * 50000

  const getX = (idx) => padLeft + (idx / (trendPeriods.length - 1)) * usableWidth
  const getY = (val) => padTop + usableHeight - (val / maxVal) * usableHeight

  // Path generator
  let areaD = `M ${getX(0)} ${getY(trendPeriods[0].revenue)}`
  for (let i = 0; i < trendPeriods.length - 1; i++) {
    const p0 = { x: getX(i), y: getY(trendPeriods[i].revenue) }
    const p1 = { x: getX(i + 1), y: getY(trendPeriods[i + 1].revenue) }
    const mx = (p0.x + p1.x) / 2
    areaD += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`
  }
  const lineD = areaD
  areaD += ` L ${getX(trendPeriods.length - 1)} ${padTop + usableHeight} L ${getX(0)} ${padTop + usableHeight} Z`

  const yTicks = [0, maxVal * 0.33, maxVal * 0.66, maxVal]

  return (
    <div className="analytics-section-card">
      <div className="analytics-section-header">
        <h3 className="analytics-section-title">Bookings & Revenue Performance</h3>
        <span className="analytics-section-pill">Reservations Intelligence</span>
      </div>

      <div className="analytics-grid-two-col">
        {/* Left: Revenue Trend Chart */}
        <div className="analytics-panel-inner">
          <div className="analytics-inner-heading">
            <h4>Cumulative Revenue Growth (PHP)</h4>
          </div>
          <div className="analytics-chart-wrap">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="analytics-svg">
              <defs>
                <linearGradient id="bookRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#43593B" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#43593B" stopOpacity="0.1" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {yTicks.map((t) => {
                const y = getY(t)
                return (
                  <g key={t}>
                    <line x1={padLeft} y1={y} x2={chartWidth - padRight} y2={y} stroke="#E5E0D8" strokeDasharray="3,3" />
                    <text x={padLeft - 8} y={y + 4} textAnchor="end" className="analytics-axis-text">
                      {t === 0 ? '0' : `₱${(t / 1000).toFixed(0)}k`}
                    </text>
                  </g>
                )
              })}

              {/* X Labels */}
              {trendPeriods.map((p, idx) => (
                <text key={p.label} x={getX(idx)} y={chartHeight - 8} textAnchor="middle" className="analytics-axis-text">
                  {p.label}
                </text>
              ))}

              {/* Area & Line */}
              <path d={areaD} fill="url(#bookRevGrad)" />
              <path d={lineD} fill="none" stroke="#43593B" strokeWidth="2.5" />

              {/* Points */}
              {trendPeriods.map((p, idx) => {
                const x = getX(idx)
                const y = getY(p.revenue)
                return (
                  <circle
                    key={p.label}
                    cx={x}
                    cy={y}
                    r={hoveredPoint?.label === p.label ? 6 : 4}
                    fill="#ffffff"
                    stroke="#43593B"
                    strokeWidth="2"
                    onMouseEnter={() => setHoveredPoint(p)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    style={{ cursor: 'pointer' }}
                  />
                )
              })}
            </svg>

            {hoveredPoint && (
              <div className="analytics-tooltip">
                <strong>{hoveredPoint.label} 2026</strong>: ₱{hoveredPoint.revenue.toLocaleString()} ({Math.round(hoveredPoint.bookings)} Bookings)
              </div>
            )}
          </div>
        </div>

        {/* Right: Package Volume Breakdown */}
        <div className="analytics-panel-inner">
          <div className="analytics-inner-heading">
            <h4>Booking Share by Package Tier</h4>
          </div>
          <div className="analytics-bars-list">
            {packageBars.map((b) => {
              const maxBar = Math.max(...packageBars.map((p) => p.count), 1)
              const pct = Math.round((b.count / maxBar) * 100)
              return (
                <div key={b.label} className="analytics-bar-item" onMouseEnter={() => setHoveredBar(b)} onMouseLeave={() => setHoveredBar(null)}>
                  <div className="analytics-bar-labels">
                    <span className="analytics-bar-name">{b.label}</span>
                    <span className="analytics-bar-stat">{b.count} Bookings ({b.price})</span>
                  </div>
                  <div className="analytics-bar-track">
                    <div className="analytics-bar-fill" style={{ width: `${pct}%`, backgroundColor: b.color }}></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingAnalyticsSection
