import { useState, useEffect } from 'react'
import { DataService } from '../../services/dataService'
import { getWebsiteImageUrl } from '../../services/imageService'
import './styles.css'

const GALLERY_FALLBACK_IMAGES = [
  'day-hallway_two.png',
  'day_hallway.png',
  'day_pool_kubo.png',
  'day_pool_plant.png',
  'entertainmentarea.png',
  'flowerpots.png',
  'landscape_bathtub.png',
  'grilling_station.png',
  'landscape_stairs.png',
  'landscape_wooden.png',
  'portrait-treehouse.png',
]

const GALLERY_ROW_LAYOUTS = [
  { rowId: 1, columns: 1, heightClass: 'gallery-row-height-large', slotIds: [1] },
  { rowId: 2, columns: 2, heightClass: 'gallery-row-height-medium', slotIds: [2, 3] },
  { rowId: 3, columns: 3, heightClass: 'gallery-row-height-small', slotIds: [4, 5, 6] },
  { rowId: 4, columns: 1, heightClass: 'gallery-row-height-large', slotIds: [7] },
  { rowId: 5, columns: 2, heightClass: 'gallery-row-height-medium', slotIds: [8, 9] },
  { rowId: 6, columns: 3, heightClass: 'gallery-row-height-small', slotIds: [10, 11, 12] },
  { rowId: 7, columns: 1, heightClass: 'gallery-row-height-large', slotIds: [13] },
]

function Gallery() {
  const [galleryItems, setGalleryItems] = useState([])
  const [activeLightboxItem, setActiveLightboxItem] = useState(null)

  useEffect(() => {
    async function loadGallery() {
      const items = await DataService.getGalleryItems()
      setGalleryItems(items || [])
    }
    loadGallery()

    const handleUpdated = (e) => {
      if (e.detail) setGalleryItems(e.detail)
    }
    window.addEventListener('polchat_gallery_updated', handleUpdated)
    return () => window.removeEventListener('polchat_gallery_updated', handleUpdated)
  }, [])

  // Create slot lookup map for efficient rendering
  const slotMap = {}
  galleryItems.forEach((item) => {
    slotMap[item.slot_id] = item
  })

  return (
    <div className="gallery-page">
      {/* Section 1: Hero Background Picture */}
      <section className="gallery-section-1">
        <img
          className="gallery-hero-image"
          src={getWebsiteImageUrl('homepage/landscape_wooden.png')}
          alt="PolChat Garden Resort Gallery"
        />
        <div className="gallery-hero-overlay" />
      </section>

      {/* Section 2: Huge Title, Info Text & Brick-Pattern Picture Grid */}
      <section className="gallery-section-2">
        <div className="gallery-section-2-container">
          {/* Header with Huge Title and Info Grid */}
          <div className="gallery-header">
            <h1 className="gallery-title">GALLERY</h1>
            <div className="gallery-info-grid">
              <div className="gallery-info-column">
                <span className="gallery-info-text">RESORT HIGHLIGHTS</span>
                <span className="gallery-info-text">SCENIC GROUNDS</span>
              </div>
              <div className="gallery-info-column">
                <span className="gallery-info-text">MEMORABLE MOMENTS</span>
                <span className="gallery-info-text">LUSH BOTANICALS</span>
              </div>
              <div className="gallery-info-column">
                <span className="gallery-info-text">COZY CORNERS</span>
                <span className="gallery-info-text">EVENT GATHERINGS</span>
              </div>
            </div>
          </div>

          {/* Staggered Brick Pattern Grid */}
          <div className="gallery-grid">
            {GALLERY_ROW_LAYOUTS.map((row) => (
              <div
                key={row.rowId}
                className={`gallery-row gallery-row-${row.columns}cols ${row.heightClass}`}
              >
                {row.slotIds.map((slotId) => {
                  const item = slotMap[slotId] || {
                    slot_id: slotId,
                    label: `PHOTO ${String(slotId).padStart(2, '0')}`,
                    title: `Resort Feature ${slotId}`,
                    category: 'General',
                  }

                  const hasPhoto = Boolean(item.image_url)
                  const fallbackImage = GALLERY_FALLBACK_IMAGES[(slotId - 1) % GALLERY_FALLBACK_IMAGES.length]

                  return (
                    <div
                      key={item.slot_id}
                      className={`gallery-picture-card ${hasPhoto ? 'gallery-card-with-photo' : 'gallery-card-default'}`}
                      onClick={() => hasPhoto && setActiveLightboxItem(item)}
                      role="button"
                      tabIndex={0}
                      aria-label={`${item.label}: ${item.title}`}
                    >
                      {hasPhoto ? (
                        <>
                          <img
                            src={item.image_url}
                            alt={item.title || item.label}
                            className="gallery-photo-img"
                            loading="lazy"
                          />
                          <div className="gallery-photo-overlay">
                            <span className="gallery-photo-pill">{item.label}</span>
                            <div className="gallery-photo-content">
                              {item.category && (
                                <span className="gallery-photo-category">{item.category}</span>
                              )}
                              <h3 className="gallery-photo-title">{item.title}</h3>
                              {item.caption && (
                                <p className="gallery-photo-caption">{item.caption}</p>
                              )}
                            </div>
                            <span className="gallery-photo-zoom-hint" title="Click to enlarge">
                              🔍 Click to enlarge
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <img
                            src={getWebsiteImageUrl(`homepage/${fallbackImage}`)}
                            alt={`${item.title} at PolChat Garden Resort`}
                            className="gallery-default-image"
                            loading="lazy"
                          />
                          <div className="gallery-default-inner">
                            <span className="gallery-picture-label">{item.label}</span>
                            <span className="gallery-picture-title">{item.title}</span>
                            {item.category && (
                              <span className="gallery-picture-tag">{item.category}</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fullscreen Lightbox Modal */}
      {activeLightboxItem && (
        <div
          className="gallery-lightbox-backdrop"
          onClick={() => setActiveLightboxItem(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="gallery-lightbox-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="gallery-lightbox-close-btn"
              onClick={() => setActiveLightboxItem(null)}
              aria-label="Close Lightbox"
            >
              ✕
            </button>
            <div className="gallery-lightbox-image-wrap">
              <img
                src={activeLightboxItem.image_url}
                alt={activeLightboxItem.title}
                className="gallery-lightbox-image"
              />
            </div>
            <div className="gallery-lightbox-meta">
              <div className="gallery-lightbox-tags">
                <span className="gallery-lightbox-pill">{activeLightboxItem.label}</span>
                {activeLightboxItem.category && (
                  <span className="gallery-lightbox-cat">{activeLightboxItem.category}</span>
                )}
              </div>
              <h2 className="gallery-lightbox-title">{activeLightboxItem.title}</h2>
              {activeLightboxItem.caption && (
                <p className="gallery-lightbox-desc">{activeLightboxItem.caption}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Gallery
