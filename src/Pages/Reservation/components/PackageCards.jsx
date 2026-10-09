import { useState } from 'react'

function PackageCards({ packages, onSelectPackage, onOpenOcular }) {
  const [hovered22Hour, setHovered22Hour] = useState(false)

  // Find packages
  const dayTourPkg = packages.find((p) => p.duration_id === 1) || {
    duration_id: 1,
    duration_name: 'Day Tour (9:00 AM - 5:00 PM)',
    duration_hours: 8,
    duration_price: 9000,
    duration_extra_pax_charge: 200,
    duration_extension_charge: 700,
    max_pax: 35,
    sec_dep: 2000,
  }

  const overnightPkg = packages.find((p) => p.duration_id === 2) || {
    duration_id: 2,
    duration_name: 'Overnight (8:00 PM - 6:00 AM)',
    duration_hours: 10,
    duration_price: 10000,
    duration_extra_pax_charge: 200,
    duration_extension_charge: 800,
    max_pax: 25,
    sec_dep: 2000,
  }

  const day22Pkg = packages.find((p) => p.duration_id === 3) || {
    duration_id: 3,
    duration_name: '22 Hours - Day Start (8:00 AM - 6:00 AM)',
    duration_hours: 22,
    duration_price: 17000,
    duration_extra_pax_charge: 200,
    duration_extension_charge: 700,
    max_pax: 35,
    sec_dep: 2000,
  }

  const night22Pkg = packages.find((p) => p.duration_id === 4) || {
    duration_id: 4,
    duration_name: '22 Hours - Night Start (8:00 PM - 6:00 PM)',
    duration_hours: 22,
    duration_price: 17000,
    duration_extra_pax_charge: 200,
    duration_extension_charge: 800,
    max_pax: 35,
    sec_dep: 2000,
  }

  return (
    <div className="resv-packages-container">
      <div className="resv-header-section">
        <span className="resv-step-badge">Step 1 of 4</span>
        <h2 className="resv-section-title">Select Your Resort Package</h2>
        <p className="resv-section-subtitle">
          Choose the ideal reservation duration for your private stay, family gathering, or company event.
        </p>
      </div>

      {/* 3 Main Package Cards */}
      <div className="resv-cards-grid">
        {/* Card 1: Day Tour */}
        <div className="resv-card resv-card-day">
          <div className="resv-card-badge">8 Hours</div>
          <div className="resv-card-header">
            <h3 className="resv-card-title">Day Tour</h3>
            <p className="resv-card-schedule">9:00 AM – 5:00 PM</p>
          </div>

          <div className="resv-card-pricing">
            <span className="resv-currency">PHP</span>
            <span className="resv-price-amount">{Number(dayTourPkg.duration_price || 9000).toLocaleString()}</span>
            <span className="resv-price-label">/ session</span>
          </div>

          <ul className="resv-card-features">
            <li className="resv-feature-item">
              <span className="resv-feature-dot">✓</span>
              <span><strong>Up to {dayTourPkg.max_pax ?? 0}</strong> maximum guests</span>
            </li>
            <li className="resv-feature-item">
              <span className="resv-feature-dot">✓</span>
              <span>₱{dayTourPkg.duration_extra_pax_charge ?? 200}/head exceeding max pax</span>
            </li>
            <li className="resv-feature-item">
              <span className="resv-feature-dot">✓</span>
              <span>₱{dayTourPkg.duration_extension_charge ?? 700}/hour extension fee</span>
            </li>
            <li className="resv-feature-item">
              <span className="resv-feature-dot">✓</span>
              <span>₱{Number(dayTourPkg.sec_dep ?? 2000).toLocaleString()} refundable security deposit</span>
            </li>
            <li className="resv-feature-item">
              <span className="resv-feature-dot">✓</span>
              <span>Exclusive access to main pool & garden</span>
            </li>
          </ul>

          <button
            type="button"
            className="resv-card-select-btn"
            onClick={() => onSelectPackage(dayTourPkg)}
          >
            Select Day Tour
          </button>
        </div>

        {/* Card 2: Overnight */}
        <div className="resv-card resv-card-overnight">
          <div className="resv-card-badge">10 Hours</div>
          <div className="resv-card-header">
            <h3 className="resv-card-title">Overnight</h3>
            <p className="resv-card-schedule">8:00 PM – 6:00 AM</p>
          </div>

          <div className="resv-card-pricing">
            <span className="resv-currency">PHP</span>
            <span className="resv-price-amount">{Number(overnightPkg.duration_price ?? 0).toLocaleString()}</span>
            <span className="resv-price-label">/ session</span>
          </div>

          <ul className="resv-card-features">
            <li className="resv-feature-item">
              <span className="resv-feature-dot">✓</span>
              <span><strong>Up to {overnightPkg.max_pax ?? 0}</strong> maximum guests</span>
            </li>
            <li className="resv-feature-item">
              <span className="resv-feature-dot">✓</span>
              <span>₱{overnightPkg.duration_extra_pax_charge ?? 200}/head exceeding max pax</span>
            </li>
            <li className="resv-feature-item">
              <span className="resv-feature-dot">✓</span>
              <span>₱{overnightPkg.duration_extension_charge ?? 800}/hour extension fee</span>
            </li>
            <li className="resv-feature-item">
              <span className="resv-feature-dot">✓</span>
              <span>₱{Number(overnightPkg.sec_dep ?? 2000).toLocaleString()} refundable security deposit</span>
            </li>
            <li className="resv-feature-item">
              <span className="resv-feature-dot">✓</span>
              <span>Air-conditioned rooms & illuminated pool</span>
            </li>
          </ul>

          <button
            type="button"
            className="resv-card-select-btn"
            onClick={() => onSelectPackage(overnightPkg)}
          >
            Select Overnight
          </button>
        </div>

        {/* Card 3: 22 Hours with Split-Hover Effect */}
        <div
          className={`resv-card resv-card-22hours ${hovered22Hour ? 'resv-card-22hours-active' : ''}`}
          onMouseEnter={() => setHovered22Hour(true)}
          onMouseLeave={() => setHovered22Hour(false)}
        >
          {/* Default view when NOT hovered */}
          <div className="resv-22h-default-view">
            <div className="resv-card-badge resv-card-badge-special">22 Hours Full Stay</div>
            <div className="resv-card-header">
              <h3 className="resv-card-title">22 Hours</h3>
              <p className="resv-card-schedule">Day Start or Night Start</p>
            </div>

            <div className="resv-card-pricing">
              <span className="resv-currency">PHP</span>
              <span className="resv-price-amount">{Number(day22Pkg.duration_price ?? 0).toLocaleString()}</span>
              <span className="resv-price-label">/ session</span>
            </div>

            <ul className="resv-card-features">
              <li className="resv-feature-item">
                <span className="resv-feature-dot">✓</span>
                <span><strong>Up to {day22Pkg.max_pax ?? 0}</strong> pax capacity</span>
              </li>
              <li className="resv-feature-item">
                <span className="resv-feature-dot">✓</span>
                <span>₱{day22Pkg.duration_extra_pax_charge ?? 200}/head exceeding pax</span>
              </li>
              <li className="resv-feature-item">
                <span className="resv-feature-dot">✓</span>
                <span>₱{Number(day22Pkg.sec_dep ?? 2000).toLocaleString()} refundable security deposit</span>
              </li>
              <li className="resv-feature-item">
                <span className="resv-feature-dot">✓</span>
                <span>Ultimate all-day & all-night retreat</span>
              </li>
            </ul>

            <div className="resv-22h-hint">
              <span className="resv-22h-hint-icon">👆</span> Hover to choose Day or Night Start
            </div>
          </div>

          {/* Split Half Top / Half Bottom Buttons revealed on hover */}
          <div className="resv-22h-split-container">
            {/* Top Half: Day Start */}
            <div
              className="resv-22h-split-half resv-22h-split-top"
              onClick={() => onSelectPackage(day22Pkg)}
            >
              <div className="resv-split-tag">Day Start Option</div>
              <h4 className="resv-split-title">Day Start</h4>
              <p className="resv-split-time">8:00 AM – 6:00 AM Next Day</p>
              <span className="resv-split-rate">₱17,000 • ₱700/hr ext</span>
              <button
                type="button"
                className="resv-split-button resv-split-button-top"
                onClick={(e) => {
                  e.stopPropagation()
                  onSelectPackage(day22Pkg)
                }}
              >
                Book Day Start (8 AM)
              </button>
            </div>

            {/* Bottom Half: Night Start */}
            <div
              className="resv-22h-split-half resv-22h-split-bottom"
              onClick={() => onSelectPackage(night22Pkg)}
            >
              <div className="resv-split-tag">Night Start Option</div>
              <h4 className="resv-split-title">Night Start</h4>
              <p className="resv-split-time">8:00 PM – 6:00 PM Next Day</p>
              <span className="resv-split-rate">₱17,000 • ₱800/hr ext</span>
              <button
                type="button"
                className="resv-split-button resv-split-button-bottom"
                onClick={(e) => {
                  e.stopPropagation()
                  onSelectPackage(night22Pkg)
                }}
              >
                Book Night Start (8 PM)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ocular Visitation Callout */}
      <div className="resv-ocular-banner">
        <div className="resv-ocular-info">
          <span className="resv-ocular-icon">📍</span>
          <div>
            <h4 className="resv-ocular-title">Want to inspect the resort first?</h4>
            <p className="resv-ocular-desc">
              Schedule a free 2-hour ocular inspection visit (Morning 9:00–11:00 AM or Afternoon 2:00–4:00 PM) before making your final booking.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="resv-ocular-btn"
          onClick={onOpenOcular}
        >
          Book Ocular Visit
        </button>
      </div>
    </div>
  )
}

export default PackageCards
