import { useState } from 'react'

function PriorityPendingList({
  reservations = [],
  visitations = [],
  onUpdateReservationStatus,
  onUpdateVisitationStatus,
}) {
  const [selectedDetailsItem, setSelectedDetailsItem] = useState(null)
  const [selectedPhotoItem, setSelectedPhotoItem] = useState(null)
  const [declineModalItem, setDeclineModalItem] = useState(null)
  const [declineReason, setDeclineReason] = useState('')

  const getPackageName = (durationId) => {
    switch (durationId) {
      case 1:
        return 'Day Tour (9am - 5pm)'
      case 2:
        return 'Overnight (8pm - 6am)'
      case 3:
        return '22 Hours (Day Start)'
      case 4:
        return '22 Hours (Night Start)'
      default:
        return 'Resort Package'
    }
  }

  // Pending reservations, newest first
  const pendingReservations = reservations
    .filter((r) => r.reservation_status === 'pending')
    .sort(
      (a, b) =>
        Number(b.reservation_id) - Number(a.reservation_id)
    )

  // Pending ocular visits, newest first
  const pendingVisitations = visitations
    .filter((v) => v.visitation_status === 'pending')
    .sort(
      (a, b) =>
        Number(b.visitation_id) - Number(a.visitation_id)
    )

  const reservationItems = pendingReservations.map((r) => {
    const totalCost =
      Number(r.reservation_cost || 0) +
      Number(r.extra_charges || 0)

    const paymentType =
      r.payment_type ||
      (r.payment_proof_url ? 'gcash' : 'cash')

    const downpayment =
      r.downpayment_amount ??
      Math.ceil(totalCost * 0.5)

    const balance =
      r.remaining_balance !== undefined &&
      r.remaining_balance !== null
        ? Number(r.remaining_balance)
        : Math.floor(totalCost * 0.5)

    return {
      uniqueKey: `pending-res-${r.reservation_id}`,
      id: r.reservation_id,
      itemType: 'resort',
      title:
        r.customer_name ||
        `Customer #${r.customer_id}`,
      phone: r.customer_phone || '0917-xxx-xxxx',
      package: getPackageName(r.duration_id),
      event: r.event_name || 'Resort Stay',
      date: r.start_date
        ? r.start_date.split('T')[0]
        : 'N/A',
      startTime:
        r.start_date && r.start_date.includes('T')
          ? r.start_date.split('T')[1].substring(0, 5)
          : '',
      endTime:
        r.end_date && r.end_date.includes('T')
          ? r.end_date.split('T')[1].substring(0, 5)
          : '',
      pax: `${r.guest_count} Guests`,
      amount: `PHP ${totalCost.toLocaleString()}`,
      cost: totalCost,
      paymentType,
      downpaymentAmount: downpayment,
      remainingBalance: balance,
      hasSecDep: r.has_paid_sec_dep,
      photoUrl: r.payment_proof_url || null,
      raw: r,
    }
  })

  const visitationItems = pendingVisitations.map((v) => ({
    uniqueKey: `pending-vis-${v.visitation_id}`,
    id: v.visitation_id,
    itemType: 'ocular',
    title:
      v.customer_name ||
      `Customer #${v.customer_id}`,
    phone: v.customer_phone || '0928-xxx-xxxx',
    package: 'Ocular Visit',
    event: v.slot_type || 'Inspection Slot',
    date: v.visitation_start_date
      ? v.visitation_start_date.split('T')[0]
      : 'N/A',
    startTime:
      v.visitation_start_date &&
      v.visitation_start_date.includes('T')
        ? v.visitation_start_date
            .split('T')[1]
            .substring(0, 5)
        : '',
    endTime:
      v.visitation_end_date &&
      v.visitation_end_date.includes('T')
        ? v.visitation_end_date
            .split('T')[1]
            .substring(0, 5)
        : '',
    pax: `${v.guest_count || 2} Visitors`,
    amount: 'Free Visit',
    cost: 0,
    paymentType: 'none',
    downpaymentAmount: 0,
    remainingBalance: 0,
    hasSecDep: false,
    photoUrl: null,
    raw: v,
  }))

  const totalPending =
    reservationItems.length + visitationItems.length

  const handleOpenDeclineModal = (item) => {
    setDeclineModalItem(item)
    setDeclineReason('')
  }

  const handleConfirmDecline = () => {
    if (!declineModalItem) return

    if (declineModalItem.itemType === 'resort') {
      onUpdateReservationStatus(
        declineModalItem.id,
        'cancelled'
      )
    } else {
      onUpdateVisitationStatus(
        declineModalItem.id,
        'cancelled'
      )
    }

    setDeclineModalItem(null)
    setDeclineReason('')
  }

  const renderPendingCard = (item) => (
    <div
      key={item.uniqueKey}
      className="pending-item-card"
    >
      {/* Type & Amount */}
      <div className="pending-item-top">
        <div
          style={{
            display: 'flex',
            gap: '6px',
            alignItems: 'center',
          }}
        >
          <span
            className={`pending-type-tag tag-${item.itemType}`}
          >
            {item.itemType === 'resort'
              ? 'Resort Stay'
              : 'Ocular Visit'}
          </span>

          {item.itemType === 'resort' && (
            <span
              className={`pending-payment-pill ${
                item.paymentType === 'cash'
                  ? 'cash-pill'
                  : 'gcash-pill'
              }`}
            >
              {item.paymentType === 'cash'
                ? '💵 Cash'
                : '📱 GCash'}
            </span>
          )}
        </div>

        <span className="pending-amount-tag">
          {item.amount}
        </span>
      </div>

      {/* Customer */}
      <div className="pending-cust-info">
        <strong className="pending-cust-name">
          {item.title}
        </strong>

        <span className="pending-cust-phone">
          {item.phone}
        </span>
      </div>

      {/* Details */}
      <div className="pending-details-grid">
        <div className="pending-meta-row">
          <span className="pending-meta-label">
            Date:
          </span>
          <span className="pending-meta-val">
            {item.date}
          </span>
        </div>

        <div className="pending-meta-row">
          <span className="pending-meta-label">
            Tier:
          </span>
          <span className="pending-meta-val">
            {item.package}
          </span>
        </div>

        <div className="pending-meta-row">
          <span className="pending-meta-label">
            Pax:
          </span>
          <span className="pending-meta-val">
            {item.pax}
          </span>
        </div>

        {item.itemType === 'resort' && (
          <div className="pending-meta-row">
            <span className="pending-meta-label">
              50% Deposit:
            </span>

            <span
              className="pending-meta-val"
              style={{ color: '#43593B' }}
            >
              ₱
              {item.downpaymentAmount?.toLocaleString()}{' '}
              (
              {item.paymentType === 'cash'
                ? 'Pay at Desk'
                : 'Verified via GCash'}
              )
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="pending-actions-stack">
        <div className="pending-actions-main-row">
          <button
            type="button"
            className="pending-btn-approve"
            onClick={() => {
              if (item.itemType === 'resort') {
                onUpdateReservationStatus(
                  item.id,
                  'confirmed'
                )
              } else {
                onUpdateVisitationStatus(
                  item.id,
                  'confirmed'
                )
              }
            }}
          >
            Approve
          </button>

          <button
            type="button"
            className="pending-btn-cancel"
            onClick={() =>
              handleOpenDeclineModal(item)
            }
          >
            Decline
          </button>
        </div>

        <div className="pending-actions-sub-row">
          <button
            type="button"
            className="pending-btn-details"
            onClick={() =>
              setSelectedDetailsItem(item)
            }
          >
            <span>Details</span>
          </button>

          {item.itemType === 'resort' &&
            (item.photoUrl ||
              item.raw?.payment_proof_url) && (
              <button
                type="button"
                className="pending-btn-photo"
                onClick={() =>
                  setSelectedPhotoItem(item)
                }
              >
                <span>View Photo</span>
              </button>
            )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="pending-queue-section">
      {/* Main Header */}
      <div className="catalog-panel-header-card">
        <h2 className="catalog-panel-title">
          Priority Pending Queue
        </h2>

        <span className="pending-count-pill">
          {totalPending} Action Needed
        </span>
      </div>

      {totalPending === 0 ? (
        <div className="pending-queue-list-card">
          <div className="pending-empty-box">
            <div className="pending-empty-icon">
              ✓
            </div>

            <h4 className="pending-empty-title">
              All Caught Up!
            </h4>

            <p className="pending-empty-desc">
              There are no pending resort bookings or
              ocular visits awaiting approval.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* ============================
              PENDING RESERVATIONS
          ============================ */}
          <div className="pending-queue-list-card">
            <div className="pending-section-heading">
              <strong>Pending Reservations</strong>

              <span>
                {reservationItems.length}
              </span>
            </div>

            <div className="pending-queue-list">
              {reservationItems.length === 0 ? (
                <div className="pending-empty-box">
                  <p className="pending-empty-desc">
                    No pending reservations.
                  </p>
                </div>
              ) : (
                reservationItems.map(renderPendingCard)
              )}
            </div>
          </div>

          {/* ============================
              PENDING OCULAR VISITS
          ============================ */}
          <div className="pending-queue-list-card">
            <div className="pending-section-heading">
              <strong>
                Pending Ocular Visits
              </strong>

              <span>
                {visitationItems.length}
              </span>
            </div>

            <div className="pending-queue-list">
              {visitationItems.length === 0 ? (
                <div className="pending-empty-box">
                  <p className="pending-empty-desc">
                    No pending ocular visits.
                  </p>
                </div>
              ) : (
                visitationItems.map(renderPendingCard)
              )}
            </div>
          </div>
        </>
      )}

      {/* Reservation / Ocular Details Modal */}
      {selectedDetailsItem && (
        <div
          className="modal-backdrop"
          onClick={() =>
            setSelectedDetailsItem(null)
          }
        >
          <div
            className="modal-dialog-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-card-header">
              <h3 className="modal-card-title">
                {selectedDetailsItem.itemType ===
                'resort'
                  ? 'Reservation'
                  : 'Ocular Visit'}{' '}
                #{selectedDetailsItem.id} Details
              </h3>

              <button
                type="button"
                className="modal-close-x"
                onClick={() =>
                  setSelectedDetailsItem(null)
                }
              >
                ✕
              </button>
            </div>

            <div className="modal-card-body">
              <div className="modal-info-grid">
                <div className="modal-field-unit">
                  <label className="modal-unit-label">
                    Customer Name
                  </label>
                  <span className="modal-unit-val">
                    {selectedDetailsItem.title}
                  </span>
                </div>

                <div className="modal-field-unit">
                  <label className="modal-unit-label">
                    Phone Contact
                  </label>
                  <span className="modal-unit-val">
                    {selectedDetailsItem.phone}
                  </span>
                </div>

                <div className="modal-field-unit">
                  <label className="modal-unit-label">
                    Scheduled Date
                  </label>
                  <span className="modal-unit-val">
                    {selectedDetailsItem.date}
                  </span>
                </div>

                <div className="modal-field-unit">
                  <label className="modal-unit-label">
                    Package / Slot
                  </label>
                  <span className="modal-unit-val">
                    {selectedDetailsItem.package}
                  </span>
                </div>

                <div className="modal-field-unit">
                  <label className="modal-unit-label">
                    Headcount
                  </label>
                  <span className="modal-unit-val">
                    {selectedDetailsItem.pax}
                  </span>
                </div>

                <div className="modal-field-unit">
                  <label className="modal-unit-label">
                    Event Occasion
                  </label>
                  <span className="modal-unit-val">
                    {selectedDetailsItem.event}
                  </span>
                </div>
              </div>

              {selectedDetailsItem.itemType ===
                'resort' && (
                <div className="modal-charges-card">
                  <h4 className="modal-charges-title">
                    Financial Breakdown
                  </h4>

                  <div className="modal-financial-row">
                    <span>Payment Mode:</span>
                    <strong>
                      {selectedDetailsItem.paymentType ===
                      'cash'
                        ? 'Cash on Desk (Due Today)'
                        : 'GCash Online'}
                    </strong>
                  </div>

                  <div className="modal-financial-row">
                    <span>
                      Total Booking Cost:
                    </span>
                    <strong>
                      {selectedDetailsItem.amount}
                    </strong>
                  </div>

                  <div className="modal-financial-row">
                    <span>50% Downpayment:</span>
                    <strong
                      style={{ color: '#43593B' }}
                    >
                      ₱
                      {selectedDetailsItem.downpaymentAmount?.toLocaleString()}
                    </strong>
                  </div>

                  <div className="modal-financial-row">
                    <span>
                      Remaining Balance at Checkout:
                    </span>
                    <strong
                      style={{ color: '#58402E' }}
                    >
                      ₱
                      {selectedDetailsItem.remainingBalance?.toLocaleString()}
                    </strong>
                  </div>

                  {selectedDetailsItem.paymentType ===
                    'cash' && (
                    <div
                      style={{
                        marginTop: '8px',
                        padding: '8px 10px',
                        backgroundColor: '#FFFBEB',
                        border:
                          '1px solid #F2D17E',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        color: '#78350F',
                      }}
                    >
                      <strong>
                        Cash Reservation:
                      </strong>{' '}
                      Guest is instructed to pay
                      50% downpayment in cash today.
                      No payment receipt photo is
                      required.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-card-footer">
              <button
                type="button"
                className="modal-close-btn"
                onClick={() =>
                  setSelectedDetailsItem(null)
                }
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Proof Modal */}
      {selectedPhotoItem && (
        <div
          className="modal-backdrop"
          onClick={() =>
            setSelectedPhotoItem(null)
          }
        >
          <div
            className="modal-dialog-card modal-photo-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-card-header">
              <h3 className="modal-card-title">
                Payment Proof Verification - #
                {selectedPhotoItem.id}
              </h3>

              <button
                type="button"
                className="modal-close-x"
                onClick={() =>
                  setSelectedPhotoItem(null)
                }
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="modal-card-body modal-photo-body">
              <div className="modal-photo-meta-bar">
                <div>
                  <span className="photo-meta-label">
                    Customer:
                  </span>{' '}
                  <strong>
                    {selectedPhotoItem.title}
                  </strong>
                </div>

                <div>
                  <span className="photo-meta-label">
                    Expected Amount:
                  </span>{' '}
                  <strong
                    style={{ color: '#43593B' }}
                  >
                    {selectedPhotoItem.amount}
                  </strong>
                </div>
              </div>

              {selectedPhotoItem.photoUrl ? (
                <div className="modal-photo-img-wrap">
                  <img
                    src={selectedPhotoItem.photoUrl}
                    alt="GCash Payment Proof"
                    className="modal-photo-full-img"
                  />
                </div>
              ) : (
                <div className="modal-photo-empty-box">
                  <p>
                    No receipt image was attached to
                    this booking record.
                  </p>
                </div>
              )}
            </div>

            <div className="modal-card-footer modal-photo-footer">
              <button
                type="button"
                className="modal-close-btn"
                onClick={() =>
                  setSelectedPhotoItem(null)
                }
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Modal */}
      {declineModalItem && (
        <div
          className="modal-backdrop"
          onClick={() =>
            setDeclineModalItem(null)
          }
        >
          <div
            className="modal-dialog-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-card-header modal-decline-header">
              <h3
                className="modal-card-title"
                style={{ color: '#991b1b' }}
              >
                Decline Booking #
                {declineModalItem.id}
              </h3>

              <button
                type="button"
                className="modal-close-x"
                onClick={() =>
                  setDeclineModalItem(null)
                }
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="modal-card-body">
              <p className="modal-decline-desc">
                Please provide the reason why this
                booking for{' '}
                <strong>
                  {declineModalItem.title}
                </strong>{' '}
                is being rejected:
              </p>

              <div className="modal-field-unit">
                <label
                  className="modal-unit-label"
                  htmlFor="decline-reason-input"
                >
                  Reason for Rejection:
                </label>

                <textarea
                  id="decline-reason-input"
                  className="modal-decline-textarea"
                  rows={4}
                  placeholder="e.g. Requested date is unavailable due to maintenance / Invalid GCash transaction receipt / Duplicate schedule request..."
                  value={declineReason}
                  onChange={(e) =>
                    setDeclineReason(e.target.value)
                  }
                />
              </div>
            </div>

            <div className="modal-card-footer modal-decline-footer">
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={() =>
                  setDeclineModalItem(null)
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="modal-confirm-decline-btn"
                onClick={handleConfirmDecline}
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PriorityPendingList