import { useState } from 'react'
import heroVideo from '../../../resources/Homepage_Video.mp4'
import './styles.css'

const TOTAL_ITEMS = 14
const SLOT_SIZES = ['small', 'large', 'small', 'large', 'small', 'large', 'small']

function Home() {
  const [startIndex, setStartIndex] = useState(0)
  const [shiftDirection, setShiftDirection] = useState(null) // null | 'left' | 'right'

  const getItemId = (offset) => {
    return (((startIndex + offset) % TOTAL_ITEMS) + TOTAL_ITEMS) % TOTAL_ITEMS + 1
  }

  const handleShift = (direction) => {
    if (shiftDirection) return // prevent double clicks during animation

    if (direction === 'left') {
      // Shift left: leftmost item exits left, new item enters from right
      setShiftDirection('left')
      setTimeout(() => {
        setStartIndex((prev) => (prev + 1) % TOTAL_ITEMS)
        setShiftDirection(null)
      }, 350)
    } else if (direction === 'right') {
      // Shift right: rightmost item exits right, new item enters from left
      setShiftDirection('right')
      setTimeout(() => {
        setStartIndex((prev) => (prev - 1 + TOTAL_ITEMS) % TOTAL_ITEMS)
        setShiftDirection(null)
      }, 350)
    }
  }

  // Determine which items to render based on shiftDirection
  let visibleCards = []

  if (shiftDirection === 'left') {
    // 8 items: 0 is exiting left, 1-6 shift left, 7 enters from right
    visibleCards = [
      {
        id: `card-${getItemId(0)}`,
        size: 'small',
        animClass: 'home-section-4-card-exit-left',
        isClickable: false,
      },
      {
        id: `card-${getItemId(1)}`,
        size: SLOT_SIZES[0],
        animClass: '',
        isClickable: false,
      },
      {
        id: `card-${getItemId(2)}`,
        size: SLOT_SIZES[1],
        animClass: '',
        isClickable: false,
      },
      {
        id: `card-${getItemId(3)}`,
        size: SLOT_SIZES[2],
        animClass: '',
        isClickable: false,
      },
      {
        id: `card-${getItemId(4)}`,
        size: SLOT_SIZES[3],
        animClass: '',
        isClickable: false,
      },
      {
        id: `card-${getItemId(5)}`,
        size: SLOT_SIZES[4],
        animClass: '',
        isClickable: false,
      },
      {
        id: `card-${getItemId(6)}`,
        size: SLOT_SIZES[5],
        animClass: '',
        isClickable: false,
      },
      {
        id: `card-${getItemId(7)}`,
        size: SLOT_SIZES[6],
        animClass: 'home-section-4-card-enter-right',
        isClickable: false,
      },
    ]
  } else if (shiftDirection === 'right') {
    // 8 items: -1 enters from left, 0-5 shift right, 6 exits right
    visibleCards = [
      {
        id: `card-${getItemId(-1)}`,
        size: SLOT_SIZES[0],
        animClass: 'home-section-4-card-enter-left',
        isClickable: false,
      },
      {
        id: `card-${getItemId(0)}`,
        size: SLOT_SIZES[1],
        animClass: '',
        isClickable: false,
      },
      {
        id: `card-${getItemId(1)}`,
        size: SLOT_SIZES[2],
        animClass: '',
        isClickable: false,
      },
      {
        id: `card-${getItemId(2)}`,
        size: SLOT_SIZES[3],
        animClass: '',
        isClickable: false,
      },
      {
        id: `card-${getItemId(3)}`,
        size: SLOT_SIZES[4],
        animClass: '',
        isClickable: false,
      },
      {
        id: `card-${getItemId(4)}`,
        size: SLOT_SIZES[5],
        animClass: '',
        isClickable: false,
      },
      {
        id: `card-${getItemId(5)}`,
        size: SLOT_SIZES[6],
        animClass: '',
        isClickable: false,
      },
      {
        id: `card-${getItemId(6)}`,
        size: 'small',
        animClass: 'home-section-4-card-exit-right',
        isClickable: false,
      },
    ]
  } else {
    // Steady state: exactly 7 items
    visibleCards = [0, 1, 2, 3, 4, 5, 6].map((offset, index) => {
      const isLeft = index === 0
      const isRight = index === 6
      return {
        id: `card-${getItemId(offset)}`,
        size: SLOT_SIZES[index],
        animClass: '',
        isLeftEdge: isLeft,
        isRightEdge: isRight,
        isClickable: isLeft || isRight,
      }
    })
  }

  return (
    <div className="home-page">
      {/* Section 1: Hero Video Background */}
      <section className="home-section-1">
        <video
          className="home-hero-video"
          src={heroVideo}
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="home-hero-overlay" />
        <div className="home-hero-content">
          <h1 className="home-hero-title">WELCOME TO POLCHAT!</h1>
          <div className="home-hero-info-row">
            <span className="home-hero-info-item"> A brief escape to reconnect, refresh, and recharge your energy.</span>
            {/* <span className="home-hero-info-item">INFORMATION</span> 
            <span className="home-hero-info-item">INFORMATION</span> */}
          </div>
        </div>
      </section>

      {/* Section 2 */}
      {/*<section className="home-section-2">
        <div className="home-section-2-container">
          <div className="home-section-2-content">
            <span className="home-section-2-text">INFORMATION</span>
          </div>
        </div>
      </section>*/}

      {/* Section 3 */}
      <section className="home-section-3">
        <div className="home-section-3-container">
          {/* Top Picture Placeholder Area */}
          <div className="home-section-3-picture-box">
            <span className="home-section-3-picture-label">PICTURE</span>
          </div>

          {/* Bottom Left Content */}
          <div className="home-section-3-content">
            <h2 className="home-section-3-title"> Your Perfect Getaway Awaits</h2>

            <div className="home-section-3-info-grid">
              <div className="home-section-3-info-column">
                <span className="home-section-3-info-text">It is designed to give you a refreshing experience.
This is for family outings, barkada bonding, birthday celebrations, and simply taking a break.</span>
              {/*  <span className="home-section-3-info-text">INFORMATION</span> */}
              </div>
          {/*    <div className="home-section-3-info-column">
                <span className="home-section-3-info-text">INFORMATION</span>
                <span className="home-section-3-info-text">INFORMATION</span>
              </div>
              <div className="home-section-3-info-column">
                <span className="home-section-3-info-text">INFORMATION</span>
                <span className="home-section-3-info-text">INFORMATION</span>
              </div> */}
            </div>

            <a href="#information" className="home-section-3-link">
              INFORMATION LINK
            </a>
          </div>
        </div>
      </section>

      {/* Section 4 */}
      <section className="home-section-4">
        {/* Top Centered Header & Information */}
        <div className="home-section-4-header">
          <h2 className="home-section-4-title">HIGHLIGHTS OF POLCHAT</h2>
          <div className="home-section-4-info-grid">
            <div className="home-section-4-info-column">
              <span className="home-section-4-info-text">INFORMATION</span>
              {/*<span className="home-section-4-info-text">INFORMATION</span>*/}
            </div>
          {/*}  <div className="home-section-4-info-column">
              <span className="home-section-4-info-text">INFORMATION</span>
              <span className="home-section-4-info-text">INFORMATION</span>
            </div>
            <div className="home-section-4-info-column">
              <span className="home-section-4-info-text">INFORMATION</span>
              <span className="home-section-4-info-text">INFORMATION</span>
            </div>*/}
          </div>
        </div>

        {/* Picture Row with Single-Item Shift & Edge Fading */}
        <div className="home-section-4-picture-row">
          {visibleCards.map((card) => {
            const sizeClass =
              card.size === 'small'
                ? 'home-section-4-picture-card-small'
                : 'home-section-4-picture-card-large'

            const edgeClass = card.isLeftEdge
              ? 'home-section-4-picture-card-edge home-section-4-picture-card-edge-left'
              : card.isRightEdge
              ? 'home-section-4-picture-card-edge home-section-4-picture-card-edge-right'
              : ''

            const handleClick = () => {
              if (card.isLeftEdge) {
                handleShift('left') // Click left edge -> shift left
              } else if (card.isRightEdge) {
                handleShift('right') // Click right edge -> shift right
              }
            }

            return (
              <div
                key={card.id}
                className={`home-section-4-picture-card ${sizeClass} ${edgeClass} ${card.animClass}`.trim()}
                onClick={card.isClickable ? handleClick : undefined}
                role={card.isClickable ? 'button' : undefined}
                tabIndex={card.isClickable ? 0 : undefined}
                title={
                  card.isLeftEdge
                    ? 'Click to shift left'
                    : card.isRightEdge
                    ? 'Click to shift right'
                    : undefined
                }
              >
                <span className="home-section-4-picture-label">PICTURE</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* Section 5 */}
      <section className="home-section-5">
        <div className="home-section-5-container">
          {/* Row 1: Picture on Left, Info on Right */}
          <div className="home-section-5-row home-section-5-row-1">
            <div className="home-section-5-picture-box">
              <span className="home-section-5-picture-label">PICTURE</span>
            </div>
            <div className="home-section-5-content">
              <h2 className="home-section-5-title">Nature & Serenity:</h2>
              <div className="home-section-5-info-grid">
                <div className="home-section-5-info-column">
                  <span className="home-section-5-info-text">Escape the noise. Our lush green gardens and refreshing pools offer the perfect peaceful environment to unwind with family and friends.</span>
                  {/*<span className="home-section-5-info-text">INFORMATION</span>*/}
                </div>
            {/*     <div className="home-section-5-info-column">
                  <span className="home-section-5-info-text">INFORMATION</span>
                  <span className="home-section-5-info-text">INFORMATION</span>
                </div>
                <div className="home-section-5-info-column">
                  <span className="home-section-5-info-text">INFORMATION</span>
                  <span className="home-section-5-info-text">INFORMATION</span>
                </div> */}
              </div>
              <a href="#information" className="home-section-5-link">
                INFORMATION LINK
              </a>
            </div>
          </div>

          {/* Row 2: Info on Left, Picture on Right */}
          <div className="home-section-5-row home-section-5-row-2">
            <div className="home-section-5-content">
              <h2 className="home-section-5-title">Private Events & Day Tours</h2>
              <div className="home-section-5-info-grid">
                <div className="home-section-5-info-column">
                  <span className="home-section-5-info-text">Explore our amenities, view available facilities, and prepare for a relaxing stay. Plan your day trip or private celebration with us. </span>
                {/*  <span className="home-section-5-info-text">INFORMATION</span> */}
                </div> 
               {/* <div className="home-section-5-info-column">
                  <span className="home-section-5-info-text">INFORMATION</span>
                  <span className="home-section-5-info-text">INFORMATION</span>
                </div> */}
               {/*  <div className="home-section-5-info-column">
                  <span className="home-section-5-info-text">INFORMATION</span>
                  <span className="home-section-5-info-text">INFORMATION</span>
                </div> */}
              </div>
              <a href="#information" className="home-section-5-link">
                INFORMATION LINK
              </a>
            </div>
            <div className="home-section-5-picture-box">
              <span className="home-section-5-picture-label">PICTURE</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Highlights Interlocking Triangular Grid */}
      <section className="home-section-6">
        <div className="home-section-6-header">
          <h2 className="home-section-6-title">HIGHLIGHTS</h2>
          <p className="home-section-6-subtitle">INFORMATION</p>
        </div>

        <div className="home-section-6-mosaic">
          {/* Top Row: Half-Left, Up, Down, Up, Down, Up, Half-Right */}
          <div className="home-section-6-triangle-row home-section-6-triangle-row-top">
            <div className="home-section-6-triangle-half home-section-6-triangle-half-top-left">
              <svg viewBox="0 0 100 173" className="home-section-6-triangle-svg">
                <polygon points="6,6 94,6 6,167" className="home-section-6-polygon" />
              </svg>
            </div>
            <div className="home-section-6-triangle-item home-section-6-triangle-up home-section-6-triangle-nested">
              <svg viewBox="0 0 200 173" className="home-section-6-triangle-svg">
                <polygon points="100,6 6,167 194,167" className="home-section-6-polygon" />
              </svg>
            </div>
            <div className="home-section-6-triangle-item home-section-6-triangle-down home-section-6-triangle-nested">
              <svg viewBox="0 0 200 173" className="home-section-6-triangle-svg">
                <polygon points="6,6 194,6 100,167" className="home-section-6-polygon" />
              </svg>
            </div>
            <div className="home-section-6-triangle-item home-section-6-triangle-up home-section-6-triangle-nested">
              <svg viewBox="0 0 200 173" className="home-section-6-triangle-svg">
                <polygon points="100,6 6,167 194,167" className="home-section-6-polygon" />
              </svg>
            </div>
            <div className="home-section-6-triangle-item home-section-6-triangle-down home-section-6-triangle-nested">
              <svg viewBox="0 0 200 173" className="home-section-6-triangle-svg">
                <polygon points="6,6 194,6 100,167" className="home-section-6-polygon" />
              </svg>
            </div>
            <div className="home-section-6-triangle-item home-section-6-triangle-up home-section-6-triangle-nested">
              <svg viewBox="0 0 200 173" className="home-section-6-triangle-svg">
                <polygon points="100,6 6,167 194,167" className="home-section-6-polygon" />
              </svg>
            </div>
            <div className="home-section-6-triangle-half home-section-6-triangle-half-top-right home-section-6-triangle-nested">
              <svg viewBox="0 0 100 173" className="home-section-6-triangle-svg">
                <polygon points="6,6 94,6 94,167" className="home-section-6-polygon" />
              </svg>
            </div>
          </div>

          {/* Bottom Row: Half-Left, Down, Up, Down, Up, Down, Half-Right */}
          <div className="home-section-6-triangle-row home-section-6-triangle-row-bottom">
            <div className="home-section-6-triangle-half home-section-6-triangle-half-bottom-left">
              <svg viewBox="0 0 100 173" className="home-section-6-triangle-svg">
                <polygon points="6,6 6,167 94,167" className="home-section-6-polygon" />
              </svg>
            </div>
            <div className="home-section-6-triangle-item home-section-6-triangle-down home-section-6-triangle-nested">
              <svg viewBox="0 0 200 173" className="home-section-6-triangle-svg">
                <polygon points="6,6 194,6 100,167" className="home-section-6-polygon" />
              </svg>
            </div>
            <div className="home-section-6-triangle-item home-section-6-triangle-up home-section-6-triangle-nested">
              <svg viewBox="0 0 200 173" className="home-section-6-triangle-svg">
                <polygon points="100,6 6,167 194,167" className="home-section-6-polygon" />
              </svg>
            </div>
            <div className="home-section-6-triangle-item home-section-6-triangle-down home-section-6-triangle-nested">
              <svg viewBox="0 0 200 173" className="home-section-6-triangle-svg">
                <polygon points="6,6 194,6 100,167" className="home-section-6-polygon" />
              </svg>
            </div>
            <div className="home-section-6-triangle-item home-section-6-triangle-up home-section-6-triangle-nested">
              <svg viewBox="0 0 200 173" className="home-section-6-triangle-svg">
                <polygon points="100,6 6,167 194,167" className="home-section-6-polygon" />
              </svg>
            </div>
            <div className="home-section-6-triangle-item home-section-6-triangle-down home-section-6-triangle-nested">
              <svg viewBox="0 0 200 173" className="home-section-6-triangle-svg">
                <polygon points="6,6 194,6 100,167" className="home-section-6-polygon" />
              </svg>
            </div>
            <div className="home-section-6-triangle-half home-section-6-triangle-half-bottom-right home-section-6-triangle-nested">
              <svg viewBox="0 0 100 173" className="home-section-6-triangle-svg">
                <polygon points="94,6 6,167 94,167" className="home-section-6-polygon" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7 */}
      <section className="home-section-7">
        {/* Top Centered Header with 3-column information grid identical to Section 4 */}
        <div className="home-section-7-header">
          <h2 className="home-section-7-title">POLCHAT</h2>
          <div className="home-section-7-info-grid">
            <div className="home-section-7-info-column">
              <span className="home-section-7-info-text">INFORMATION</span>
              <span className="home-section-7-info-text">INFORMATION</span>
            </div>
            <div className="home-section-7-info-column">
              <span className="home-section-7-info-text">INFORMATION</span>
              <span className="home-section-7-info-text">INFORMATION</span>
            </div>
            <div className="home-section-7-info-column">
              <span className="home-section-7-info-text">INFORMATION</span>
              <span className="home-section-7-info-text">INFORMATION</span>
            </div>
          </div>
        </div>

        {/* Container inside like Section 3 */}
        <div className="home-section-7-container">
          <div className="home-section-7-picture-box">
            <span className="home-section-7-picture-label">PICTURE</span>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
