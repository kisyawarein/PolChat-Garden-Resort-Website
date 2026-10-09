import facilitiesVideo from '../../../resources/Facilities_Video.mp4'
import { getWebsiteImageUrl } from '../../services/imageService'
import './styles.css'

const FACILITIES_LIST = [
  {
    id: 'facility-pavilion',
    name: 'Pavilion',
    subtitle: 'Spacious open-air event venue for grand celebrations and gatherings',
    image: 'homepage/entertainmentarea.png',
  },
  {
    id: 'facility-veranda',
    name: 'Veranda',
    subtitle: 'Scenic covered deck overlooking lush greenery and refreshing breezes',
    image: 'homepage/day-hallway_two.png',
  },
  {
    id: 'facility-cabin-room',
    name: 'Cabin Room',
    subtitle: 'Cozy and air-conditioned private retreat for relaxing overnight stays',
    image: 'homepage/landscape_wooden.png',
  },
  {
    id: 'facility-tree-house',
    name: 'Tree House',
    subtitle: 'Unique elevated sanctuary nestled amidst shaded branches and nature',
    image: 'homepage/portrait-treehouse.png',
  },
  {
    id: 'facility-bahay-kubo',
    name: 'Bahay Kubo',
    subtitle: 'Authentic traditional Filipino bamboo hut offering native comfort',
    image: 'homepage/day_pool_kubo.png',
  },
  {
    id: 'facility-garden',
    name: 'Garden',
    subtitle: 'Expansive landscaped botanical grounds with vibrant flora and pathways',
    image: 'homepage/flowerpots.png',
  },
]

function Facilities() {
  const scrollToFacility = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="facilities-page">
      {/* Section 1: Hero Video Section */}
      <section className="facilities-section-1">
        <video
          className="facilities-hero-video"
          src={facilitiesVideo}
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="facilities-hero-overlay" />
        <div className="facilities-hero-content">
          <h1 className="facilities-hero-title">RESORT FACILITIES</h1>
          <div className="facilities-hero-info-row">
            <span className="facilities-hero-info-item">EVENT VENUES</span>
            <span className="facilities-hero-info-item">COZY ACCOMMODATIONS</span>
            <span className="facilities-hero-info-item">GARDEN SANCTUARY</span>
          </div>
        </div>
      </section>

      {/* Section 2: Header, 3 Pictures, Description & 6 Nav Buttons */}
      <section className="facilities-section-2">
        <div className="facilities-section-2-container">
          {/* Header layout similar to Section 4 of Homepage */}
          <div className="facilities-section-2-header">
            <h2 className="facilities-section-2-title">EXPLORE OUR SPACES</h2>
            <div className="facilities-section-2-info-grid">
              <div className="facilities-section-2-info-column">
                <span className="facilities-section-2-info-text">FAMILY GATHERINGS</span>
                <span className="facilities-section-2-info-text">PRIVATE CELEBRATIONS</span>
              </div>
              <div className="facilities-section-2-info-column">
                <span className="facilities-section-2-info-text">DAY & NIGHT STAYS</span>
                <span className="facilities-section-2-info-text">NATURE ESCAPES</span>
              </div>
              <div className="facilities-section-2-info-column">
                <span className="facilities-section-2-info-text">SWIMMING & RELAXATION</span>
                <span className="facilities-section-2-info-text">PHOTO OP VENUES</span>
              </div>
            </div>
          </div>

          {/* 3 picture containers in a single row */}
          <div className="facilities-section-2-pictures-row">
            <div className="facilities-section-2-picture-card">
              <img
                className="facilities-image"
                src={getWebsiteImageUrl('homepage/landscape_stairs.png')}
                alt="Garden stairs among the resort greenery"
                loading="lazy"
              />
            </div>
            <div className="facilities-section-2-picture-card">
              <img
                className="facilities-image"
                src={getWebsiteImageUrl('homepage/day_pool_plant.png')}
                alt="Swimming pool surrounded by plants"
                loading="lazy"
              />
            </div>
            <div className="facilities-section-2-picture-card">
              <img
                className="facilities-image"
                src={getWebsiteImageUrl('homepage/landscape_bathtub.png')}
                alt="Outdoor bathtub among the resort landscape"
                loading="lazy"
              />
            </div>
          </div>

          {/* Brief paragraph below the 3 pictures */}
          <p className="facilities-section-2-description">
            Discover a harmonious blend of nature, comfort, and celebration at PolChat Garden Resort.
            Whether you are planning a memorable milestone celebration, a refreshing family weekend, or a peaceful
            retreat under lush green canopies, our versatile resort facilities offer the perfect setting for every occasion.
          </p>

          {/* 6 Clickable facility buttons in a row */}
          <div className="facilities-section-2-buttons-row">
            {FACILITIES_LIST.map((facility) => (
              <button
                key={facility.id}
                type="button"
                className="facilities-section-2-btn"
                onClick={() => scrollToFacility(facility.id)}
              >
                {facility.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Background Picture Section */}
      <section className="facilities-section-3">
        <div className="facilities-section-3-picture-box">
          <img
            className="facilities-image"
            src={getWebsiteImageUrl('homepage/landscape_wooden.png')}
            alt="Wooden resort structures nestled in the garden"
            loading="lazy"
          />
        </div>
      </section>

      {/* Section 4: 6 Large Pictures with Titles for the 6 Facilities */}
      <section className="facilities-section-4">
        <div className="facilities-section-4-container">
          {FACILITIES_LIST.map((facility, index) => (
            <div
              key={facility.id}
              id={facility.id}
              className="facilities-section-4-facility-card"
            >
              {/* Title and subtitle above the picture */}
              <div className="facilities-section-4-header">
                <span className="facilities-section-4-number">0{index + 1}</span>
                <h3 className="facilities-section-4-title">{facility.name}</h3>
                <p className="facilities-section-4-subtitle">{facility.subtitle}</p>
              </div>

              {/* Large Picture Box */}
              <div className="facilities-section-4-picture-box">
                <img
                  className="facilities-image"
                  src={getWebsiteImageUrl(facility.image)}
                  alt={`${facility.name} at PolChat Garden Resort`}
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Facilities
