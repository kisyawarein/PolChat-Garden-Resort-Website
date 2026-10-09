function CustomerPreviewModal({
  isOpen,
  onClose,
  galleryItems = [],
}) {
  if (!isOpen) return null

  // Group 13 items into the exact rows of the customer gallery
  const rows = [
    { rowId: 1, columns: 1, heightClass: 'adm-preview-row-large', items: galleryItems.slice(0, 1) },
    { rowId: 2, columns: 2, heightClass: 'adm-preview-row-medium', items: galleryItems.slice(1, 3) },
    { rowId: 3, columns: 3, heightClass: 'adm-preview-row-small', items: galleryItems.slice(3, 6) },
    { rowId: 4, columns: 1, heightClass: 'adm-preview-row-large', items: galleryItems.slice(6, 7) },
    { rowId: 5, columns: 2, heightClass: 'adm-preview-row-medium', items: galleryItems.slice(7, 9) },
    { rowId: 6, columns: 3, heightClass: 'adm-preview-row-small', items: galleryItems.slice(9, 12) },
    { rowId: 7, columns: 1, heightClass: 'adm-preview-row-large', items: galleryItems.slice(12, 13) },
  ]

  return (
    <div className="adm-gal-modal-overlay">
      <div className="adm-gal-modal-backdrop" onClick={onClose} />
      <div className="adm-gal-modal-dialog adm-gal-preview-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="adm-gal-modal-header">
          <div>
            <span className="adm-gal-modal-badge">LIVE SIMULATION</span>
            <h2 className="adm-gal-modal-title">Customer Gallery Page Preview</h2>
          </div>
          <button
            type="button"
            className="adm-gal-modal-close"
            onClick={onClose}
            aria-label="Close preview"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="adm-gal-preview-viewport">
          <div className="adm-gal-preview-header">
            <h1 className="adm-gal-preview-main-title">GALLERY</h1>
            <p className="adm-gal-preview-sub">LIVE RESORT HIGHLIGHTS & GROUNDS</p>
          </div>

          <div className="adm-gal-preview-grid">
            {rows.map((row) => (
              <div
                key={row.rowId}
                className={`adm-gal-preview-row adm-gal-preview-${row.columns}cols ${row.heightClass}`}
              >
                {row.items.map((item) => (
                  <div key={item.slot_id} className="adm-gal-preview-card">
                    {item.image_url ? (
                      <>
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="adm-gal-preview-card-img"
                        />
                        <div className="adm-gal-preview-card-overlay">
                          <span className="adm-gal-preview-card-label">{item.label}</span>
                          <span className="adm-gal-preview-card-title">{item.title}</span>
                        </div>
                      </>
                    ) : (
                      <div className="adm-gal-preview-card-theme">
                        <span className="adm-gal-preview-card-label">{item.label}</span>
                        <span className="adm-gal-preview-card-title">{item.title}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="adm-gal-modal-footer">
          <button
            type="button"
            className="adm-gal-btn-save"
            onClick={onClose}
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  )
}

export default CustomerPreviewModal
