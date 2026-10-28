import eventsVideo from '../../../resources/EventsRates_Video.mp4'
import { getWebsiteImageUrl } from '../../services/imageService'
import { useEffect, useState } from 'react'
import { DataService } from '../../services/dataService'
import './styles.css'

const RESERVATION_TYPES = [
  {
    id: 'reservation-day',
    title: 'Day',
    time: '8:00 AM – 5:00 PM',
    label: 'DAY PASS',
    image: 'homepage/day_pool_plant.png',
  },
  {
    id: 'reservation-22hours',
    title: '22 hours',
    time: 'Day Start: 8:00 AM – 6:00 AM\nNight Start: 8:00 PM – 6:00 PM',
    label: '22-HR OVERNIGHT',
    image: 'homepage/portrait-treehouse.png',
  },
  {
    id: 'reservation-night',
    title: 'Night',
    time: '8:00 PM – 6:00 AM',
    label: 'NIGHT STAY',
    image: 'homepage/landscape_wooden.png',
  },
]

const normalizeDurationName = (name) =>
  String(name || '')
    .replaceAll('_', ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())

const mergeRates = (rawRates) => {
  if (!Array.isArray(rawRates)) return []

  const non22HourRates = []
  const twentyTwoHourCandidates = []

  rawRates.forEach((rate) => {
    const formattedName = normalizeDurationName(rate.duration_name)
    if (formattedName.toLowerCase().startsWith('22 hours')) {
      twentyTwoHourCandidates.push({ ...rate, formattedName })
    } else {
      non22HourRates.push({ ...rate, formattedName })
    }
  })

  if (twentyTwoHourCandidates.length > 0) {
    // Prefer the updated 22 Hours Night record (or exact "22 Hours" record) if both exist
    const preferred22Hours =
      twentyTwoHourCandidates.find(
        (r) => r.formattedName.toLowerCase() === '22 hours'
      ) ||
      twentyTwoHourCandidates.find((r) =>
        r.formattedName.toLowerCase().includes('night')
      ) ||
      twentyTwoHourCandidates[0]

    non22HourRates.push({
      ...preferred22Hours,
      formattedName: '22 Hours',
    })
  }

  return non22HourRates
}

function EventsRates({ onNavigate }) {
  const [rates, setRates] = useState([])
  const [ratesLoading, setRatesLoading] = useState(true)

  useEffect(() => {
    const loadRates = async () => {
      try {
        const data = await DataService.getDurationTypes()
        setRates(mergeRates(data || []))
      } catch (error) {
        console.error('Failed to load rates:', error)
        setRates([])
      } finally {
        setRatesLoading(false)
      }
    }

    loadRates()
  }, [])

  return (
    <div className="events-rates-page">
      {/* Section 1: Video Background */}
      <section className="events-rates-section-1">
        <video
          className="events-rates-hero-video"
          src={eventsVideo}
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="events-rates-hero-overlay" />
        <div className="events-rates-hero-content">
          <h1 className="events-rates-hero-title">Event & Rates</h1>
        </div>
      </section>

      {/* Rate Breakdown */}
      <section id="rate-breakdown" className="events-rates-breakdown">
        <div className="events-rates-breakdown-container">
          <h2 className="events-rates-breakdown-title">RATE BREAKDOWN</h2>

          <p className="events-rates-breakdown-subtitle">
            View our current resort rates and additional charges.
          </p>

          {ratesLoading ? (
            <p className="events-rates-breakdown-status">
              Loading current rates...
            </p>
          ) : rates.length === 0 ? (
            <p className="events-rates-breakdown-status">
              Rate information is currently unavailable.
            </p>
          ) : (
            <div className="events-rates-breakdown-grid">
              {rates.map((rate) => (
                <div
                  key={rate.duration_id}
                  className="events-rates-breakdown-card"
                >
                  <h3>{rate.formattedName}</h3>

                  <div className="events-rates-breakdown-price">
                    ₱{Number(rate.duration_price || 0).toLocaleString('en-PH')}
                  </div>

                  <div className="events-rates-breakdown-details">
                    <p>
                      <span>Maximum Guests</span>
                      <strong>{rate.max_pax}</strong>
                    </p>

                    <p>
                      <span>Extra Guest</span>
                      <strong>
                        ₱
                        {Number(
                          rate.duration_extra_pax_charge || 0
                        ).toLocaleString('en-PH')}
                      </strong>
                    </p>

                    <p>
                      <span>Extension / Hour</span>
                      <strong>
                        ₱
                        {Number(
                          rate.duration_extension_charge || 0
                        ).toLocaleString('en-PH')}
                      </strong>
                    </p>

                    <p>
                      <span>Event Charge</span>
                      <strong>
                        ₱
                        {Number(rate.duration_event_rate || 0).toLocaleString(
                          'en-PH'
                        )}
                      </strong>
                    </p>

                    <p>
                      <span>Security Deposit</span>
                      <strong>
                        ₱{Number(rate.sec_dep || 0).toLocaleString('en-PH')}
                      </strong>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Section 2: 3 Tall Images Aligned in a Row with Titles Below */}
      <section className="events-rates-section-2">
        <div className="events-rates-section-2-container">
          <div className="events-rates-section-2-cards-row">
            {RESERVATION_TYPES.map((type) => (
              <div key={type.id} className="events-rates-reservation-card">
                <div className="events-rates-tall-picture-box">
                  <img
                    className="events-rates-image"
                    src={getWebsiteImageUrl(type.image)}
                    alt={`${type.title} resort package`}
                    loading="lazy"
                  />
                </div>
                <div className="events-rates-card-info">
                  <h2 className="events-rates-card-title">{type.title}</h2>
                  <span
                    className="events-rates-card-time"
                    style={{ whiteSpace: 'pre-line', display: 'block' }}
                  >
                    {type.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Exclusive Packages */}
      <section className="events-rates-section-3">
        <div className="events-rates-section-3-container">
          <div className="events-rates-section-3-row events-rates-section-3-row-reverse">
            <div className="events-rates-section-3-content">
              <h2 className="events-rates-section-3-title">
                EXCLUSIVE PACKAGES
              </h2>
              <div className="events-rates-section-3-info-grid">
                <div className="events-rates-section-3-info-column">
                  <span className="events-rates-section-3-info-text">
                    PRIVATE RESORT RENTAL
                  </span>
                  <span className="events-rates-section-3-info-text">
                    ALL FACILITY ACCESS
                  </span>
                </div>
                <div className="events-rates-section-3-info-column">
                  <span className="events-rates-section-3-info-text">
                    OVERNIGHT CABIN STAYS
                  </span>
                  <span className="events-rates-section-3-info-text">
                    TREE HOUSE ACCESS
                  </span>
                </div>
                <div className="events-rates-section-3-info-column">
                  <span className="events-rates-section-3-info-text">
                    CATERING SETUP AREA
                  </span>
                  <span className="events-rates-section-3-info-text">
                    AUDIO & LIGHTING READY
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="events-rates-section-3-link events-rates-inquire-button"
                onClick={() => onNavigate('support')}
              >
                INQUIRE FOR RESERVATIONS
              </button>
            </div>
            <div className="events-rates-section-3-picture-box">
              <img
                className="events-rates-image"
                src={getWebsiteImageUrl('homepage/entertainmentarea.png')}
                alt="Resort entertainment area for private events"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: EVENTS Headline + 2 Staggered Blocks */}
      <section className="events-rates-section-4">
        <div className="events-rates-section-4-container">
          <h2 className="events-rates-section-4-main-title">EVENTS</h2>

          {/* Block 1 */}
          <div className="events-rates-section-4-block">
            <div className="events-rates-section-4-col-large">
              <h3 className="events-rates-section-4-sample-title">
                FAMILY GATHERING
              </h3>
              <div className="events-rates-section-4-pic-large">
                <img
                  className="events-rates-image"
                  src={getWebsiteImageUrl('homepage/grilling_station.png')}
                  alt="Outdoor grilling area for resort events"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="events-rates-section-4-col-medium">
              <div className="events-rates-section-4-pic-medium">
                <img
                  className="events-rates-image"
                  src={getWebsiteImageUrl('homepage/flowerpots.png')}
                  alt="Garden flowers at the resort"
                  loading="lazy"
                />
              </div>
              <p className="events-rates-section-4-paragraph">
                Every celebration is special, and we want to help you make it
                memorable. Whether you&apos;re spending time with family,
                celebrating a birthday, or gathering with friends, PolChat
                Garden Resort offers a peaceful place to enjoy your special
                moments. Relax, have fun, and create memories together in a
                beautiful natural setting.
              </p>
            </div>
          </div>

          {/* Block 2 (Mirrored) */}
          <div className="events-rates-section-4-block">
            <div className="events-rates-section-4-col-medium">
              <div className="events-rates-section-4-pic-medium">
                <img
                  className="events-rates-image"
                  src={getWebsiteImageUrl('homepage/landscape_stairs.png')}
                  alt="Garden path at the resort"
                  loading="lazy"
                />
              </div>
              <p className="events-rates-section-4-paragraph">
                Feel the magic and mystery distinct to each destination with
                imaginative and authentic celebrations tailored to the
                occasion. Whether hosting a landmark celebration that ignites a
                love for life and a deep appreciation of culture, or marking a
                milestone with a private ceremony, PolChat&apos;s dedicated
                event teams craft extraordinary shared experiences and nights to
                remember – bespoke to the wishes of the guest.
              </p>
            </div>

            <div className="events-rates-section-4-col-large">
              <h3 className="events-rates-section-4-sample-title">
                COMPANY GATHERING
              </h3>
              <div className="events-rates-section-4-pic-large">
                <img
                  className="events-rates-image"
                  src={getWebsiteImageUrl('homepage/day-hallway_two.png')}
                  alt="Covered walkway at the resort"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default EventsRates