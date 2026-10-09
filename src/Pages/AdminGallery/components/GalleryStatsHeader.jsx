function GalleryStatsHeader({
  galleryItems = [],
  activeCategory,
  onSelectCategory,
  onResetAll,
  onOpenPreview,
}) {
  const totalSlots = galleryItems.length || 13
  const uploadedCount = galleryItems.filter((i) => i.image_url).length
  const emptyCount = totalSlots - uploadedCount

  const categories = [
    'All',
    'Resort Highlights',
    'Event Gatherings',
    'Scenic Grounds',
    'Cozy Corners',
    'Lush Botanicals',
  ]

  return (
    <div className="adm-gal-stats-card">
      <div className="adm-gal-header-row">
        <div>
          <h1 className="adm-gal-page-title">Gallery Storage & Manager</h1>
          <p className="adm-gal-page-desc">
            Manage and upload the 13 official photos featured on the customer-facing Gallery page. Changes populate live across the resort website.
          </p>
        </div>

        <div className="adm-gal-header-actions">
          <button
            type="button"
            className="adm-gal-preview-btn"
            onClick={onOpenPreview}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>Preview Customer Grid</span>
          </button>
          <button
            type="button"
            className="adm-gal-reset-btn"
            onClick={onResetAll}
            title="Reset all 13 slots to default placeholders"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="adm-gal-kpi-grid">
        <div className="adm-gal-kpi-item">
          <span className="adm-gal-kpi-val">{totalSlots} / {totalSlots}</span>
          <span className="adm-gal-kpi-label">Container Capacity</span>
        </div>
        <div className="adm-gal-kpi-item">
          <span className="adm-gal-kpi-val adm-gal-kpi-green">{uploadedCount}</span>
          <span className="adm-gal-kpi-label">Custom Photos Uploaded</span>
        </div>
        <div className="adm-gal-kpi-item">
          <span className="adm-gal-kpi-val adm-gal-kpi-gold">{emptyCount}</span>
          <span className="adm-gal-kpi-label">Default Themed Slots</span>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="adm-gal-filter-bar">
        <span className="adm-gal-filter-label">Filter Category:</span>
        <div className="adm-gal-filter-pills">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`adm-gal-filter-pill ${
                activeCategory === cat ? 'adm-gal-filter-pill-active' : ''
              }`}
              onClick={() => onSelectCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default GalleryStatsHeader
