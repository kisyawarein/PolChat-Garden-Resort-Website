import dayTourImg from '../../../assets/pkg_daytour.jpg'
import overnightImg from '../../../assets/pkg_overnight.jpg'
import twentytwoImg from '../../../assets/pkg_twentytwo.jpg'

function ScheduleTypeStep({
  packages = [],
  selectedPackage,
  onSelectPackage,
  onContinue,
  onBack,
}) {
  // Find packages from database list or fallback defaults
  const dayPkg = packages.find((p) => p.duration_id === 1) || {
    duration_id: 1,
    duration_name: 'Day Tour (9:00 AM - 5:00 PM)',
    duration_hours: 8,
    duration_price: 9000,
    duration_extra_pax_charge: 200,
    duration_extension_charge: 700,
    duration_start: '09:00:00',
    duration_end: '17:00:00',
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
    duration_start: '20:00:00',
    duration_end: '06:00:00',
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
    duration_start: '08:00:00',
    duration_end: '06:00:00',
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
    duration_start: '20:00:00',
    duration_end: '18:00:00',
    max_pax: 35,
    sec_dep: 2000,
  }

  // Active preview state (defaults to selected package or day tour)
  const currentSelectedId = selectedPackage ? selectedPackage.duration_id : 1

  const getPreviewInfo = () => {
    switch (currentSelectedId) {
      case 2:
        return {
          image: overnightImg,
          label: overnightPkg.duration_name || 'Overnight',
          duration: `${overnightPkg.duration_hours || 10} Hours`,
          timeRange: '8:00 PM – 6:00 AM',
          paxLimit: `Up to ${overnightPkg.max_pax ?? 0} Guests`,
          price: `PHP ${Math.round(Number(overnightPkg.duration_price ?? 0)).toLocaleString()}`,
          extraPaxRate: overnightPkg.duration_extra_pax_charge ?? 200,
        }
      case 3:
        return {
          image: twentytwoImg,
          label: day22Pkg.duration_name || '22 Hours (Day Start)',
          duration: `${day22Pkg.duration_hours || 22} Hours`,
          timeRange: '8:00 AM – 6:00 AM',
          paxLimit: `Up to ${day22Pkg.max_pax ?? 0} Guests`,
          price: `PHP ${Math.round(Number(day22Pkg.duration_price ?? 0)).toLocaleString()}`,
          extraPaxRate: day22Pkg.duration_extra_pax_charge ?? 200,
        }
      case 4:
        return {
          image: twentytwoImg,
          label: night22Pkg.duration_name || '22 Hours (Night Start)',
          duration: `${night22Pkg.duration_hours || 22} Hours`,
          timeRange: '8:00 PM – 6:00 PM',
          paxLimit: `Up to ${night22Pkg.max_pax ?? 0} Guests`,
          price: `PHP ${Math.round(Number(night22Pkg.duration_price ?? 0)).toLocaleString()}`,
          extraPaxRate: night22Pkg.duration_extra_pax_charge ?? 200,
        }
      case 1:
      default:
        return {
          image: dayTourImg,
          label: dayPkg.duration_name || 'Day Tour',
          duration: `${dayPkg.duration_hours || 8} Hours`,
          timeRange: '9:00 AM – 5:00 PM',
          paxLimit: `Up to ${dayPkg.max_pax ?? 0} Guests`,
          price: `PHP ${Math.round(Number(dayPkg.duration_price ?? 0)).toLocaleString()}`,
          extraPaxRate: dayPkg.duration_extra_pax_charge ?? 200,
        }
    }
  }

  const preview = getPreviewInfo()

  return (
    <div className="sched-step-container">
      {/* Main Grid: Left side (Image Preview + Schedule List), Right side (Summary Card) */}
      <div className="sched-main-layout">
        {/* Left Side Container */}
        <div className="sched-left-column">
          {/* Top: Large Preview Image Card (No label overlay on image) */}
          <div className="sched-preview-box">
            <img
              src={preview.image}
              alt={preview.label}
              className="sched-preview-image"
            />
          </div>

          {/* Bottom: Schedule Options List */}
          <div className="sched-list-container">
            {/* 1. Day Tour */}
            <div
              className={`sched-row-item ${
                currentSelectedId === 1 ? 'sched-row-item-active' : ''
              }`}
            >
              <div className="sched-row-title-col">
                <span className="sched-row-name">{dayPkg.duration_name || 'Day Tour'}</span>
              </div>

              <div className="sched-row-info-col">
                <span className="sched-row-price">PHP {Math.round(Number(dayPkg.duration_price ?? 0)).toLocaleString()}</span>
                <span className="sched-row-time">
                  TIME: 9:00 AM - 5:00 PM ({dayPkg.duration_hours || 8} Hours) • Max {dayPkg.max_pax ?? 0} Guests
                </span>
              </div>

              <div className="sched-row-btn-col">
                <button
                  type="button"
                  className={`sched-select-btn ${
                    currentSelectedId === 1 ? 'sched-select-btn-active' : ''
                  }`}
                  onClick={() => onSelectPackage(dayPkg)}
                >
                  {currentSelectedId === 1 ? 'Selected' : 'Select'}
                </button>
              </div>
            </div>

            <div className="sched-divider-line" />

            {/* 2. Overnight */}
            <div
              className={`sched-row-item ${
                currentSelectedId === 2 ? 'sched-row-item-active' : ''
              }`}
            >
              <div className="sched-row-title-col">
                <span className="sched-row-name">{overnightPkg.duration_name || 'Overnight'}</span>
              </div>

              <div className="sched-row-info-col">
                <span className="sched-row-price">PHP {Math.round(Number(overnightPkg.duration_price ?? 0)).toLocaleString()}</span>
                <span className="sched-row-time">
                  TIME: 8:00 PM - 6:00 AM ({overnightPkg.duration_hours || 10} Hours) • Max {overnightPkg.max_pax ?? 0} Guests
                </span>
              </div>

              <div className="sched-row-btn-col">
                <button
                  type="button"
                  className={`sched-select-btn ${
                    currentSelectedId === 2 ? 'sched-select-btn-active' : ''
                  }`}
                  onClick={() => onSelectPackage(overnightPkg)}
                >
                  {currentSelectedId === 2 ? 'Selected' : 'Select'}
                </button>
              </div>
            </div>

            <div className="sched-divider-line" />

            {/* 3. 22 Hours with TWO buttons: Day, Night */}
            <div
              className={`sched-row-item ${
                currentSelectedId === 3 || currentSelectedId === 4
                  ? 'sched-row-item-active'
                  : ''
              }`}
            >
              <div className="sched-row-title-col">
                <span className="sched-row-name">22 Hours</span>
              </div>

              <div className="sched-row-info-col">
                <span className="sched-row-price">PHP {Math.round(Number((currentSelectedId === 4 ? night22Pkg : day22Pkg).duration_price ?? 0)).toLocaleString()}</span>
                <span className="sched-row-time">
                  {currentSelectedId === 4
                    ? `TIME: 8:00 PM - 6:00 PM (22 Hours) • Max ${night22Pkg.max_pax ?? 0} Guests`
                    : `TIME: 8:00 AM - 6:00 AM (22 Hours) • Max ${day22Pkg.max_pax ?? 0} Guests`}
                </span>
              </div>

              <div className="sched-row-btn-col sched-row-btn-col-double">
                <button
                  type="button"
                  className={`sched-select-btn sched-select-btn-sub ${
                    currentSelectedId === 3 ? 'sched-select-btn-active' : ''
                  }`}
                  onClick={() => onSelectPackage(day22Pkg)}
                  title="22 Hours Day Start (8:00 AM - 6:00 AM)"
                >
                  Day Start
                </button>
                <button
                  type="button"
                  className={`sched-select-btn sched-select-btn-sub ${
                    currentSelectedId === 4 ? 'sched-select-btn-active' : ''
                  }`}
                  onClick={() => onSelectPackage(night22Pkg)}
                  title="22 Hours Night Start (8:00 PM - 6:00 PM)"
                >
                  Night Start
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Container: Summary details */}
        <div className="sched-right-column">
          <div className="sched-summary-panel">
            <h3 className="sched-summary-title">Selected Schedule</h3>
            
            <div className="sched-summary-detail-row">
              <span className="sched-summary-label">Package:</span>
              <span className="sched-summary-value">{preview.label}</span>
            </div>

            <div className="sched-summary-detail-row">
              <span className="sched-summary-label">Duration:</span>
              <span className="sched-summary-value">{preview.duration}</span>
            </div>

            <div className="sched-summary-detail-row">
              <span className="sched-summary-label">Time:</span>
              <span className="sched-summary-value">{preview.timeRange}</span>
            </div>

            <div className="sched-summary-detail-row">
              <span className="sched-summary-label">Capacity:</span>
              <span className="sched-summary-value">{preview.paxLimit}</span>
            </div>

            <div className="sched-summary-detail-row">
              <span className="sched-summary-label">Base Rate:</span>
              <span className="sched-summary-value sched-summary-price">{preview.price}</span>
            </div>

            <div className="sched-summary-note">
              ₱{preview.extraPaxRate} Charge per head exceeding the max guest count
            </div>

            <div className="sched-summary-actions-row">
              <button
                type="button"
                className="sched-back-type-btn"
                onClick={onBack}
              >
                Change Reservation Type
              </button>
              <button
                type="button"
                className="sched-continue-btn"
                onClick={onContinue}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScheduleTypeStep
