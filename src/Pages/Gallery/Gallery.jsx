import galleryImage from '../../../resources/Gallery_Image.jpg'
import './styles.css'

const GALLERY_ROWS = [
  {
    rowId: 1,
    columns: 1,
    heightClass: 'gallery-row-height-large',
    items: [
      { id: 'img-1', title: 'Grand Resort Grounds', label: 'PHOTO 01' },
    ],
  },
  {
    rowId: 2,
    columns: 2,
    heightClass: 'gallery-row-height-medium',
    items: [
      { id: 'img-2', title: 'Pavilion Celebration', label: 'PHOTO 02' },
      { id: 'img-3', title: 'Veranda Sunset View', label: 'PHOTO 03' },
    ],
  },
  {
    rowId: 3,
    columns: 3,
    heightClass: 'gallery-row-height-small',
    items: [
      { id: 'img-4', title: 'Cabin Room Comfort', label: 'PHOTO 04' },
      { id: 'img-5', title: 'Tree House Canopy', label: 'PHOTO 05' },
      { id: 'img-6', title: 'Bahay Kubo Sanctuary', label: 'PHOTO 06' },
    ],
  },
  {
    rowId: 4,
    columns: 1,
    heightClass: 'gallery-row-height-large',
    items: [
      { id: 'img-7', title: 'Lush Botanical Garden', label: 'PHOTO 07' },
    ],
  },
  {
    rowId: 5,
    columns: 2,
    heightClass: 'gallery-row-height-medium',
    items: [
      { id: 'img-8', title: 'Refreshing Swimming Pool', label: 'PHOTO 08' },
      { id: 'img-9', title: 'Evening Garden Lights', label: 'PHOTO 09' },
    ],
  },
  {
    rowId: 6,
    columns: 3,
    heightClass: 'gallery-row-height-small',
    items: [
      { id: 'img-10', title: 'Outdoor Gathering Nook', label: 'PHOTO 10' },
      { id: 'img-11', title: 'Private Family Lounge', label: 'PHOTO 11' },
      { id: 'img-12', title: 'Scenic Landscape Walk', label: 'PHOTO 12' },
    ],
  },
  {
    rowId: 7,
    columns: 1,
    heightClass: 'gallery-row-height-large',
    items: [
      { id: 'img-13', title: 'PolChat Panoramic Horizon', label: 'PHOTO 13' },
    ],
  },
]

function Gallery() {
  return (
    <div className="gallery-page">
      {/* Section 1: Hero Background Picture */}
      <section className="gallery-section-1">
        <img
          className="gallery-hero-image"
          src={galleryImage}
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
            {GALLERY_ROWS.map((row) => (
              <div
                key={row.rowId}
                className={`gallery-row gallery-row-${row.columns}cols ${row.heightClass}`}
              >
                {row.items.map((item) => (
                  <div key={item.id} className="gallery-picture-card">
                    <span className="gallery-picture-label">{item.label}</span>
                    <span className="gallery-picture-title">{item.title}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Gallery
