import { useState, useEffect } from 'react'
import { DataService } from '../../services/dataService'
import { getWebsiteImageUrl } from '../../services/imageService'
import GalleryModal from './components/GalleryModal'
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
  const [selectedImageIndex, setSelectedImageIndex] = useState(null)

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

  // Build sequential list of all images across the gallery layout
  const allImages = GALLERY_ROW_LAYOUTS.flatMap((row) =>
    row.slotIds.map((slotId) => {
      const item = slotMap[slotId]
      const fallbackImage = GALLERY_FALLBACK_IMAGES[(slotId - 1) % GALLERY_FALLBACK_IMAGES.length]
      const imageUrl = item?.image_url || getWebsiteImageUrl(`homepage/${fallbackImage}`)
      return {
        slotId,
        imageUrl,
        alt: `PolChat Garden Resort Photo ${slotId}`,
      }
    })
  )

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
                  const imageIndex = allImages.findIndex((img) => img.slotId === slotId)
                  const imageObj = allImages[imageIndex]

                  return (
                    <div
                      key={slotId}
                      className="gallery-picture-card"
                      onClick={() => setSelectedImageIndex(imageIndex)}
                      role="button"
                      tabIndex={0}
                      aria-label={`View photo ${imageIndex + 1}`}
                    >
                      <img
                        src={imageObj?.imageUrl}
                        alt={imageObj?.alt}
                        className="gallery-photo-img"
                        loading="lazy"
                      />
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fullscreen Lightbox Modal */}
      <GalleryModal
        isOpen={selectedImageIndex !== null}
        images={allImages}
        currentIndex={selectedImageIndex}
        onClose={() => setSelectedImageIndex(null)}
        onNavigate={(newIndex) => setSelectedImageIndex(newIndex)}
      />
    </div>
  )
}

export default Gallery
