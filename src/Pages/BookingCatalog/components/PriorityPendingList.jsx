import React from 'react'

function PriorityPendingList({
  reservations = [],
  visitations = [],
  onUpdateReservationStatus,
  onUpdateVisitationStatus,
  onOpenReceipt,
}) {
  const getPackageName = (durationId) => {
    switch (durationId) {
      case 1: return 'Day Tour (9am - 5pm)'
      case 2: return 'Overnight (8pm - 6am)'
      case 3: return '22 Hours (Day Start)'
      case 4: return '22 Hours (Night Start)'
      default: return 'Resort Package'
    }
  }

  // Filter only pending items
  const pendingReservations = reservations.filter((r) => r.reservation_status === 'pending')
  const pendingVisitations = visitations.filter((v) => v.visitation_status === 'pending')

  const pendingQueue = [
    ...pendingReservations.map((r) => ({
      uniqueKey: `pending-res-${r.reservation_id}`,
      id: r.reservation_id,
      itemType: 'resort',
      title: r.customer_name || `Customer #${r.customer_id}`,
      phone: r.customer_phone || '0917-xxx-xxxx',
      package: getPackageName(r.duration_id),
      event: r.event_name || 'Resort Stay',
      date: r.start_date ? r.start_date.split('T')[0] : 'N/A',
      pax: `${r.guest_count} Guests`,
      amount: `PHP ${((r.reservation_cost || 0) + (r.extra_charges || 0)).toLocaleString()}`,
      raw: r,
    })),
    ...pendingVisitations.map((v) => ({
      uniqueKey: `pending-vis-${v.visitation_id}`,
      id: v.visitation_id,
      itemType: 'ocular',
      title: v.customer_name || `Customer #${v.customer_id}`,
      phone: v.customer_phone || '0928-xxx-xxxx',
      package: 'Ocular Visit',
      event: v.slot_type || 'Morning Slot',
      date: v.visitation_start_date ? v.visitation_start_date.split('T')[0] : 'N/A',
      pax: `${v.guest_count || 2} Visitors`,
      amount: 'Free Inspection',
      raw: v,
    })),
  ]

  return (
    <div className="dash-panel-box pending-queue-panel">
      {/* Panel Header */}
      <div className="dash-panel-bar">
        <div className="dash-panel-heading">
          <span className="dash-panel-title-text">Priority Pending Queue</span>
        </div>
        <span className="dash-count-pill">{pendingQueue.length} Action Needed</span>
      </div>

      {/* Panel Content Body */}
      <div className="dash-panel-content">
        <div className="pending-queue-list">
          {pendingQueue.length === 0 ? (
            <div className="pending-empty-box">
              <div className="pending-empty-icon">✅</div>
              <h4 className="pending-empty-title">All Caught Up!</h4>
              <p className="pending-empty-desc">
                There are no pending resort bookings or ocular visits awaiting approval.
              </p>
            </div>
          ) : (
            pendingQueue.map((item) => (
              <div key={item.uniqueKey} className={`pending-item-card pending-item-${item.itemType}`}>
                <div className="pending-item-top">
                  <span className={`pending-type-tag tag-${item.itemType}`}>
                    {item.itemType === 'resort' ? 'Resort Stay' : 'Ocular Visit'}
                  </span>
                  <span className="pending-amount-tag">{item.amount}</span>
                </div>

                <div className="pending-cust-info">
                  <strong className="pending-cust-name">{item.title}</strong>
                  <span className="pending-cust-phone">📞 {item.phone}</span>
                </div>

                <div className="pending-details-grid">
                  <div className="pending-meta-row">
                    <span className="pending-meta-label">📅 Date:</span>
                    <span className="pending-meta-val">{item.date}</span>
                  </div>
                  <div className="pending-meta-row">
                    <span className="pending-meta-label">🏷️ Tier:</span>
                    <span className="pending-meta-val">{item.package}</span>
                  </div>
                  <div className="pending-meta-row">
                    <span className="pending-meta-label">👥 Pax:</span>
                    <span className="pending-meta-val">{item.pax}</span>
                  </div>
                </div>

                <div className="pending-actions-row">
                  <button
                    type="button"
                    className="pending-btn-approve"
                    onClick={() => {
                      if (item.itemType === 'resort') {
                        onUpdateReservationStatus(item.id, 'confirmed')
                      } else {
                        onUpdateVisitationStatus(item.id, 'confirmed')
                      }
                    }}
                  >
                    ✓ Approve
                  </button>
                  <button
                    type="button"
                    className="pending-btn-cancel"
                    onClick={() => {
                      if (item.itemType === 'resort') {
                        onUpdateReservationStatus(item.id, 'cancelled')
                      } else {
                        onUpdateVisitationStatus(item.id, 'cancelled')
                      }
                    }}
                  >
                    ✕ Decline
                  </button>
                  {item.itemType === 'resort' && (
                    <button
                      type="button"
                      className="pending-btn-view"
                      onClick={() => onOpenReceipt(item.raw)}
                    >
                      Receipt
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default PriorityPendingList
