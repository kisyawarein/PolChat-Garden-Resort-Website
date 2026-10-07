import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../context/AuthContext'
import { DataService } from '../../services/dataService'
import ReservationTypeStep from './components/ReservationTypeStep'
import ScheduleTypeStep from './components/ScheduleTypeStep'
import DateCalendar from './components/DateCalendar'
import BookingForm from './components/BookingForm'
import PaymentStep from './components/PaymentStep'
import BookingReceipt from './components/BookingReceipt'
import OcularModal from './components/OcularModal'
import './styles.css'

function Reservation() {
  const { user, isAuthenticated, isAdmin, openAuthModal } = useAuth()

  // Steps: 'type' -> 'schedule' -> 'date' -> 'form' -> 'payment' -> 'receipt'
  const [currentStep, setCurrentStep] = useState('type')
  const [packages, setPackages] = useState([])
  const [reservations, setReservations] = useState([])
  const [visitations, setVisitations] = useState([])
  const [isOcularOpen, setIsOcularOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Booking details state
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    phoneNumber: '',
    guestCount: 20,
    extensionHours: 0,
    eventName: 'Family Outing',
    specialNotes: '',
  })

  const [paymentDetails, setPaymentDetails] = useState(null)
  const [createdReservation, setCreatedReservation] = useState(null)

  // Fetch actual data from Supabase
  useEffect(() => {
    async function loadData() {
      const [pkgs, resvs, visits] = await Promise.all([
        DataService.getDurationTypes(),
        DataService.getReservations(),
        DataService.getVisitations(),
      ])
      setPackages(pkgs || [])
      setReservations(resvs || [])
      setVisitations(visits || [])
      // Default to day tour
      if (pkgs && pkgs.length > 0 && !selectedPackage) {
        setSelectedPackage(pkgs[0])
      }
    }
    loadData()
  }, [])

  // Auto-populate customer fields from logged in user
  useEffect(() => {
    if (user) {
      const nameParts = (user.name || user.username || '').split(' ')
      setFormData((prev) => ({
        ...prev,
        firstName: prev.firstName || nameParts[0] || '',
        lastName: prev.lastName || nameParts.slice(1).join(' ') || '',
        phoneNumber: prev.phoneNumber || user.phone || '09171234567',
      }))
    }
  }, [user])

  // Real-time dynamic pricing calculation
  const priceCalculation = useMemo(() => {
    const pkg = selectedPackage || packages[0] || {
      duration_price: 9000,
      max_pax: 35,
      duration_extra_pax_charge: 200,
      duration_extension_charge: 700,
    }

    const basePrice = Number(pkg.duration_price || 9000)
    const maxPax = Number(pkg.max_pax || 35)
    const currentGuests = Number(formData.guestCount) || 1
    const extraPaxCount = Math.max(0, currentGuests - maxPax)
    const extraPaxRate = Number(pkg.duration_extra_pax_charge || 200)
    const extraPaxCharge = extraPaxCount * extraPaxRate

    const extHours = Number(formData.extensionHours) || 0
    const extRate = Number(pkg.duration_extension_charge || 700)
    const extensionCharge = extHours * extRate

    const securityDeposit = 2000
    const totalAmount = basePrice + extraPaxCharge + extensionCharge + securityDeposit

    return {
      basePrice,
      maxPax,
      extraPaxCount,
      extraPaxCharge,
      extensionCharge,
      securityDeposit,
      totalAmount,
    }
  }, [selectedPackage, packages, formData.guestCount, formData.extensionHours])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 4000)
  }

  // Handlers
  const handleSelectReservationType = (type) => {
    if (type === 'resort') {
      setCurrentStep('schedule')
      if (!selectedPackage && packages.length > 0) {
        setSelectedPackage(packages[0])
      }
    } else if (type === 'ocular') {
      setIsOcularOpen(true)
    }
  }

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg)
  }

  const handleContinueFromSchedule = () => {
    if (!selectedPackage && packages.length > 0) {
      setSelectedPackage(packages[0])
    }
    setCurrentStep('date')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSelectDate = (dateStr) => {
    setSelectedDate(dateStr)
  }

  const handleConfirmDate = () => {
    if (!selectedDate) return
    setCurrentStep('form')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleProceedToPayment = () => {
    setCurrentStep('payment')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFinalBookingSubmit = async (paymentInfo) => {
    setIsSubmitting(true)
    setPaymentDetails(paymentInfo)

    const activePkg = selectedPackage || packages[0]
    const startTimeStr = activePkg.duration_start || '09:00:00'
    const endTimeStr = activePkg.duration_end || '17:00:00'
    const startIso = `${selectedDate}T${startTimeStr}`
    
    let endDateObj = new Date(`${selectedDate}T${endTimeStr}`)
    if (activePkg.duration_id === 2 || activePkg.duration_id === 3 || activePkg.duration_id === 4) {
      endDateObj.setDate(endDateObj.getDate() + 1)
    }
    const endIso = endDateObj.toISOString().split('.')[0]

    const reservationPayload = {
      customer_id: user?.id || 101,
      guest_count: Number(formData.guestCount),
      duration_id: Number(activePkg.duration_id),
      start_date: startIso,
      end_date: endIso,
      extension_duration: formData.extensionHours > 0 ? `${formData.extensionHours} hours` : null,
      has_paid_sec_dep: true,
      has_paid_reservation: true,
      reservation_cost: priceCalculation.basePrice + priceCalculation.extensionCharge,
      extra_charges: priceCalculation.extraPaxCharge + priceCalculation.securityDeposit,
      reservation_status: 'pending',
      event_name: `${formData.eventName} (${formData.firstName} ${formData.lastName})`,
    }

    try {
      const savedReservation = await DataService.createReservation(reservationPayload)
      setCreatedReservation(savedReservation)
      setIsSubmitting(false)
      setCurrentStep('receipt')
      showToast('Reservation submitted successfully! Your booking is now in the database.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.error('Error submitting reservation:', err)
      setIsSubmitting(false)
      showToast('Error submitting reservation to database. Please check your connection.')
    }
  }

  const handleResetBooking = () => {
    setSelectedPackage(null)
    setSelectedDate('')
    setCreatedReservation(null)
    setPaymentDetails(null)
    setCurrentStep('type')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Guard 1: Logged Out View
  if (!isAuthenticated) {
    return (
      <div className="resv-auth-gate-page">
        <div className="resv-auth-gate-card">
          <div className="resv-gate-icon">🔒</div>
          <h2 className="resv-gate-title">Customer Login Required</h2>
          <p className="resv-gate-desc">
            To make an online reservation and ensure secure booking verification, please sign in or create a customer account.
          </p>
          <div className="resv-gate-actions">
            <button
              type="button"
              className="resv-gate-signup-btn"
              onClick={() => openAuthModal('signup')}
            >
              Sign Up to Reserve
            </button>
            <button
              type="button"
              className="resv-gate-login-btn"
              onClick={() => openAuthModal('signin')}
            >
              Log In to Account
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Guard 2: Admin View (Admins manage, not book)
  if (isAdmin) {
    return (
      <div className="resv-auth-gate-page">
        <div className="resv-auth-gate-card">
          <div className="resv-gate-icon">🛡️</div>
          <h2 className="resv-gate-title">Administrator Portal</h2>
          <p className="resv-gate-desc">
            You are logged in as an Administrator. Admins manage and verify reservations directly through the Booking Catalog.
          </p>
          <div className="resv-gate-actions">
            <button
              type="button"
              className="resv-gate-signup-btn"
              onClick={() => window.location.reload()}
            >
              Open Booking Catalog
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="reservation-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="resv-toast-notification">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Progress Stepper (Shown for schedule and subsequent steps) */}
      {currentStep !== 'type' && (
        <div className="resv-progress-container">
          <div className="resv-stepper-track">
            <div
              className={`resv-stepper-step ${
                currentStep === 'schedule'
                  ? 'resv-step-current'
                  : 'resv-step-done'
              }`}
            >
              <div className="resv-step-num">1</div>
              <span className="resv-step-label">Schedule</span>
            </div>

            <div className="resv-step-line" />

            <div
              className={`resv-stepper-step ${
                currentStep === 'date'
                  ? 'resv-step-current'
                  : currentStep === 'form' || currentStep === 'payment' || currentStep === 'receipt'
                  ? 'resv-step-done'
                  : 'resv-step-pending'
              }`}
            >
              <div className="resv-step-num">2</div>
              <span className="resv-step-label">Date</span>
            </div>

            <div className="resv-step-line" />

            <div
              className={`resv-stepper-step ${
                currentStep === 'form'
                  ? 'resv-step-current'
                  : currentStep === 'payment' || currentStep === 'receipt'
                  ? 'resv-step-done'
                  : 'resv-step-pending'
              }`}
            >
              <div className="resv-step-num">3</div>
              <span className="resv-step-label">Details</span>
            </div>

            <div className="resv-step-line" />

            <div
              className={`resv-stepper-step ${
                currentStep === 'payment'
                  ? 'resv-step-current'
                  : currentStep === 'receipt'
                  ? 'resv-step-done'
                  : 'resv-step-pending'
              }`}
            >
              <div className="resv-step-num">4</div>
              <span className="resv-step-label">Payment</span>
            </div>
          </div>
        </div>
      )}

      {/* Active Step Content */}
      <div className="resv-content-wrapper">
        {currentStep === 'type' && (
          <ReservationTypeStep
            onSelectType={handleSelectReservationType}
          />
        )}

        {currentStep === 'schedule' && (
          <ScheduleTypeStep
            packages={packages}
            selectedPackage={selectedPackage}
            onSelectPackage={handleSelectPackage}
            onContinue={handleContinueFromSchedule}
            onBack={() => setCurrentStep('type')}
          />
        )}

        {currentStep === 'date' && (
          <DateCalendar
            selectedPackage={selectedPackage}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            reservations={reservations}
            visitations={visitations}
            onBack={() => setCurrentStep('schedule')}
            onNext={handleConfirmDate}
          />
        )}

        {currentStep === 'form' && (
          <BookingForm
            selectedPackage={selectedPackage}
            selectedDate={selectedDate}
            formData={formData}
            setFormData={setFormData}
            priceCalculation={priceCalculation}
            onBack={() => setCurrentStep('date')}
            onNext={handleProceedToPayment}
          />
        )}

        {currentStep === 'payment' && (
          <PaymentStep
            selectedPackage={selectedPackage}
            selectedDate={selectedDate}
            formData={formData}
            priceCalculation={priceCalculation}
            onBack={() => setCurrentStep('form')}
            onConfirmBooking={handleFinalBookingSubmit}
            isSubmitting={isSubmitting}
          />
        )}

        {currentStep === 'receipt' && (
          <BookingReceipt
            reservation={createdReservation}
            selectedPackage={selectedPackage}
            formData={formData}
            priceCalculation={priceCalculation}
            paymentDetails={paymentDetails}
            onReset={handleResetBooking}
          />
        )}
      </div>

      {/* Ocular Visit Modal */}
      <OcularModal
        isOpen={isOcularOpen}
        onClose={() => setIsOcularOpen(false)}
        user={user}
        onSuccess={(newVisit) => {
          setVisitations((prev) => [newVisit, ...prev])
          showToast('Ocular visit booked! Awaiting resort confirmation.')
        }}
      />
    </div>
  )
}

export default Reservation
