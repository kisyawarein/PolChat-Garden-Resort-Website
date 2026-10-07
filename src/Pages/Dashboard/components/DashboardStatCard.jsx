import React from 'react'

function DashboardStatCard({
  theme = 'forest', // 'forest', 'green', 'gold', 'earth', 'sage', 'deep'
  icon,
  count,
  label,
  onViewDetails,
}) {
  return (
    <div className={`dash-stat-card theme-${theme}`} onClick={onViewDetails}>
      <div className="dash-stat-top">
        <div className="dash-stat-icon-wrap">
          {icon}
        </div>
        <div className="dash-stat-text-wrap">
          <div className="dash-stat-number">{count}</div>
          <div className="dash-stat-label">{label}</div>
        </div>
      </div>
      <div className="dash-stat-bottom">
        <span className="dash-stat-link-text">View Details</span>
        <span className="dash-stat-arrow-icon">➔</span>
      </div>
    </div>
  )
}

export default DashboardStatCard
