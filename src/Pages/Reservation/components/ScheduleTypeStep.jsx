import { useState } from 'react'
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
          label: 'OVERNIGHT',
          timeRange: '8:00 PM – 6:00 AM (10 Hours)',
          paxLimit: 'Up to 25 Guests',
          price: 'PHP 10,000.00',
        }
      case 3:
        return {
          image: twentytwoImg,
          label: '22 HOURS (DAY START)',
          timeRange: '8:00 AM – 6:00 AM Next Day (22 Hours)',
          paxLimit: 'Up to 35 Guests',
          price: 'PHP 17,000.00',
        }
      case 4:
        return {
          image: twentytwoImg,
          label: '22 HOURS (NIGHT START)',
          timeRange: '8:00 PM – 6:00 PM Next Day (22 Hours)',
          paxLimit: 'Up to 35 Guests',
          price: 'PHP 17,000.00',
        }
      case 1:
      default:
        return {
          image: dayTourImg,
          label: 'DAY',
          timeRange: '9:00 AM – 5:00 PM (8 Hours)',
          paxLimit: 'Up to 35 Guests',
          price: 'PHP 9,000.00',
        }
    }
  }

  const preview = getPreviewInfo()

  return (
    <div className="sched-step-container">
      {/* Back button */}
      <div className="sched-top-nav">
        <button
          type="button"
          className="sched-back-type-btn"
          onClick={onBack}
        >
          ← Change Reservation Type
        </button>
      </div>

      {/* Main Grid: Left side (Image Preview + Schedule List), Right side (Continue Action) */}
      <div className="sched-main-layout">
        {/* Left Side Container */}
        <div className="sched-left-column">
          {/* Top: Large Preview Image Card */}
          <div className="sched-preview-box">
            <img
              src={preview.image}
              alt={preview.label}
              className="sched-preview-image"
            />
            <div className="sched-preview-overlay-text">
              {preview.label}
            </div>
          </div>

          {/* Bottom: Schedule Options List */}
          <div className="sched-list-container">
            {/* 1. DAY */}
            <div
              className={`sched-row-item ${
                currentSelectedId === 1 ? 'sched-row-item-active' : ''
              }`}
            >
              <div className="sched-row-title-col">
                <span className="sched-row-name">DAY</span>
              </div>

              <div className="sched-row-info-col">
                <span className="sched-row-price">PHP 9,000.00</span>
                <span className="sched-row-time">TIME: 9:00 AM - 5:00 PM</span>
              </div>

              <div className="sched-row-btn-col">
                <button
                  type="button"
                  className={`sched-select-btn ${
                    currentSelectedId === 1 ? 'sched-select-btn-active' : ''
                  }`}
                  onClick={() => onSelectPackage(dayPkg)}
                >
                  {currentSelectedId === 1 ? 'SELECTED' : 'SELECT'}
                </button>
              </div>
            </div>

            <div className="sched-divider-line" />

            {/* 2. OVERNIGHT */}
            <div
              className={`sched-row-item ${
                currentSelectedId === 2 ? 'sched-row-item-active' : ''
              }`}
            >
              <div className="sched-row-title-col">
                <span className="sched-row-name">OVERNIGHT</span>
              </div>

              <div className="sched-row-info-col">
                <span className="sched-row-price">PHP 10,000.00</span>
                <span className="sched-row-time">TIME: 8:00 PM - 6:00 AM</span>
              </div>

              <div className="sched-row-btn-col">
                <button
                  type="button"
                  className={`sched-select-btn ${
                    currentSelectedId === 2 ? 'sched-select-btn-active' : ''
                  }`}
                  onClick={() => onSelectPackage(overnightPkg)}
                >
                  {currentSelectedId === 2 ? 'SELECTED' : 'SELECT'}
                </button>
              </div>
            </div>

            <div className="sched-divider-line" />

            {/* 3. 22 HOURS with TWO buttons: Day, Night */}
            <div
              className={`sched-row-item ${
                currentSelectedId === 3 || currentSelectedId === 4
                  ? 'sched-row-item-active'
                  : ''
              }`}
            >
              <div className="sched-row-title-col">
                <span className="sched-row-name">22 HOURS</span>
              </div>

              <div className="sched-row-info-col">
                <span className="sched-row-price">PHP 17,000.00</span>
                <span className="sched-row-time">
                  {currentSelectedId === 4
                    ? 'TIME: 8:00 PM - 6:00 PM (Night Start)'
                    : 'TIME: 8:00 AM - 6:00 AM (Day Start)'}
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
                  {currentSelectedId === 3 ? '✓ DAY' : 'Day'}
                </button>
                <button
                  type="button"
                  className={`sched-select-btn sched-select-btn-sub ${
                    currentSelectedId === 4 ? 'sched-select-btn-active' : ''
                  }`}
                  onClick={() => onSelectPackage(night22Pkg)}
                  title="22 Hours Night Start (8:00 PM - 6:00 PM)"
                >
                  {currentSelectedId === 4 ? '✓ NIGHT' : 'Night'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Container (No tall pointless box, clean continue button & summary) */}
        <div className="sched-right-column">
          <div className="sched-summary-panel">
            <h3 className="sched-summary-title">Selected Schedule</h3>
            
            <div className="sched-summary-detail-row">
              <span className="sched-summary-label">Package:</span>
              <span className="sched-summary-value">{preview.label}</span>
            </div>

            <div className="sched-summary-detail-row">
              <span className="sched-summary-label">Duration:</span>
              <span className="sched-summary-value">{preview.timeRange}</span>
            </div>

            <div className="sched-summary-detail-row">
              <span className="sched-summary-label">Base Rate:</span>
              <span className="sched-summary-value sched-summary-price">{preview.price}</span>
            </div>

            <div className="sched-summary-detail-row">
              <span className="sched-summary-label">Capacity:</span>
              <span className="sched-summary-value">{preview.paxLimit}</span>
            </div>

            <div className="sched-summary-note">
              ₱200/head exceeding capacity • ₱2,000 refundable security deposit
            </div>

            <button
              type="button"
              className="sched-continue-btn"
              onClick={onContinue}
            >
              CONTINUE →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScheduleTypeStep
