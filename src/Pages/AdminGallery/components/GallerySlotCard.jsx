function GallerySlotCard({
  slot,
  onEdit,
  onRemovePhoto,
}) {
  const isCustomUploaded = Boolean(slot.image_url)

  const getDimensionLabel = (rowType) => {
    switch (rowType) {
      case 'large':
        return 'Full Width (1-Col)'
      case 'medium':
        return 'Half Width (2-Col)'
      case 'small':
        return 'Compact Tile (3-Col)'
      default:
        return 'Standard'
    }
  }

  return (
    <div className={`adm-gal-slot-card ${isCustomUploaded ? 'adm-gal-card-populated' : ''}`}>
      {/* Top Slot Header */}
      <div className="adm-gal-slot-header">
        <div className="adm-gal-slot-badge-group">
          <span className="adm-gal-slot-id-badge">{slot.label}</span>
          <span className="adm-gal-dimension-tag">{getDimensionLabel(slot.row_type)}</span>
        </div>
        <span className="adm-gal-cat-tag">{slot.category}</span>
      </div>

      {/* Visual Image Preview Box */}
      <div className="adm-gal-slot-preview-box" onClick={() => onEdit(slot)}>
        {slot.image_url ? (
          <img
            src={slot.image_url}
            alt={slot.title}
            className="adm-gal-slot-img"
          />
        ) : (
          <div className="adm-gal-placeholder-box">
            <span className="adm-gal-placeholder-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </span>
            <span className="adm-gal-placeholder-text">Default Theme Card</span>
            <span className="adm-gal-upload-hint">Click to Upload Photo</span>
          </div>
        )}

        <div className="adm-gal-preview-overlay">
          <span>Edit Slot</span>
        </div>
      </div>

      {/* Slot Details Info */}
      <div className="adm-gal-slot-info">
        <h3 className="adm-gal-slot-title">{slot.title}</h3>
        {slot.caption && (
          <p className="adm-gal-slot-caption">{slot.caption}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="adm-gal-slot-actions">
        <button
          type="button"
          className="adm-gal-edit-btn"
          onClick={() => onEdit(slot)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          <span>{isCustomUploaded ? 'Change Photo & Info' : 'Upload Photo'}</span>
        </button>

        {isCustomUploaded && (
          <button
            type="button"
            className="adm-gal-remove-btn"
            onClick={() => onRemovePhoto(slot.slot_id)}
            title="Remove uploaded photo and restore default placeholder"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

export default GallerySlotCard
