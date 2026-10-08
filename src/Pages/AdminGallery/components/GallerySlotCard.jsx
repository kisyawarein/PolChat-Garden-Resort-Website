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
            <span className="adm-gal-placeholder-icon">📷</span>
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
          ✏️ {isCustomUploaded ? 'Change Photo & Info' : 'Upload Photo'}
        </button>

        {isCustomUploaded && (
          <button
            type="button"
            className="adm-gal-remove-btn"
            onClick={() => onRemovePhoto(slot.slot_id)}
            title="Remove uploaded photo and restore default placeholder"
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  )
}

export default GallerySlotCard
