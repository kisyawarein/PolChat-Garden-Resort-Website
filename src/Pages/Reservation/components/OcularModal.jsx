import { useState } from 'react'
import { DataService } from '../../../services/dataService'

function OcularModal({ isOpen, onClose, user, onSuccess }) {
  const [visitationDate, setVisitationDate] = useState('')
  const [slot, setSlot] = useState('morning') // 'morning' (9-11am) | 'afternoon' (2-4pm)
  const [guestCount, setGuestCount] = useState(2)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  const todayStr = new Date().toISOString().split('T')[0]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!visitationDate) {
      setErrorMsg('Please select a preferred date for the ocular visit.')
      return
    }
    if (visitationDate < todayStr) {
      setErrorMsg('Ocular visit date cannot be in the past.')
      return
    }

    setIsSubmitting(true)
    setErrorMsg('')

    const startTime = slot === 'morning' ? `${visitationDate}T09:00:00` : `${visitationDate}T14:00:00`
    const endTime = slot === 'morning' ? `${visitationDate}T11:00:00` : `${visitationDate}T16:00:00`

    try {
      const newVisit = await DataService.createVisitation({
        customer_id: user?.id || 101,
        guest_count: Number(guestCount),
        visitation_start_date: startTime,
        visitation_end_date: endTime,
        visitation_status: 'pending',
      })

      setIsSubmitting(false)
      if (onSuccess) onSuccess(newVisit)
      onClose()
    } catch (err) {
      console.error('Failed to submit ocular visitation:', err)
      setIsSubmitting(false)
      setErrorMsg('Could not submit ocular visit. Please try again.')
    }
  }

  return (
    <div className="resv-modal-overlay">
      <div className="resv-modal-backdrop" onClick={onClose} />
      <div className="resv-ocular-modal-card">
        <div className="resv-modal-header">
          <h3 className="resv-modal-title">Schedule an Ocular Visit</h3>
          <button
            type="button"
            className="resv-modal-close-btn"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <p className="resv-modal-desc">
          Take a complimentary 2-hour tour of our resort grounds, swimming pools, private rooms, and pavilion areas before reserving.
        </p>

        {errorMsg && (
          <div className="resv-payment-alert-error">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="resv-modal-form">
          <div className="resv-input-group">
            <label className="resv-input-label" htmlFor="ocularDate">
              Preferred Date <span className="resv-req-star">*</span>
            </label>
            <input
              id="ocularDate"
              type="date"
              min={todayStr}
              required
              className="resv-text-input"
              value={visitationDate}
              onChange={(e) => setVisitationDate(e.target.value)}
            />
          </div>

          <div className="resv-input-group">
            <label className="resv-input-label">
              Time Slot <span className="resv-req-star">*</span>
            </label>
            <div className="resv-slot-options">
              <label className={`resv-slot-card ${slot === 'morning' ? 'resv-slot-card-active' : ''}`}>
                <input
                  type="radio"
                  name="timeSlot"
                  value="morning"
                  checked={slot === 'morning'}
                  onChange={() => setSlot('morning')}
                  className="resv-slot-radio"
                />
                <div className="resv-slot-info">
                  <span className="resv-slot-title">Morning Slot</span>
                  <span className="resv-slot-time">9:00 AM – 11:00 AM</span>
                </div>
              </label>

              <label className={`resv-slot-card ${slot === 'afternoon' ? 'resv-slot-card-active' : ''}`}>
                <input
                  type="radio"
                  name="timeSlot"
                  value="afternoon"
                  checked={slot === 'afternoon'}
                  onChange={() => setSlot('afternoon')}
                  className="resv-slot-radio"
                />
                <div className="resv-slot-info">
                  <span className="resv-slot-title">Afternoon Slot</span>
                  <span className="resv-slot-time">2:00 PM – 4:00 PM</span>
                </div>
              </label>
            </div>
          </div>

          <div className="resv-input-group">
            <label className="resv-input-label" htmlFor="ocularGuests">
              Number of Attendees (Max 5 recommended)
            </label>
            <input
              id="ocularGuests"
              type="number"
              min="1"
              max="10"
              className="resv-text-input"
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
            />
          </div>

          <div className="resv-modal-actions">
            <button
              type="button"
              className="resv-back-btn"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="resv-confirm-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Scheduling Visit...' : 'Book Ocular Visit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default OcularModal
