import React from 'react'

function NotificationsPanel({
  reservations = [],
  visitations = [],
  inquiries = [],
  reviews = [],
  onNavigate,
}) {
  const notificationsList = []

  const normalizeStatus = (status) =>
    String(status || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')

  const getReservationTypeLabel = (durationId) => {
    if (durationId === 2) return 'Overnight'
    if (durationId === 3 || durationId === 4) {
      return '22h Stay'
    }
    return 'Day Tour'
  }

  // ========================================================
  // REAL RESERVATION DATA
  // ========================================================

  reservations.forEach((r) => {
    const status = normalizeStatus(r.reservation_status)
    const typeLabel = getReservationTypeLabel(r.duration_id)

    const dateStr = r.start_date
      ? r.start_date.split('T')[0]
      : 'Scheduled'

    const customerName =
      r.customer_name ||
      (r.customer_id
        ? `Customer #${r.customer_id}`
        : 'Guest')

    const guestCount = r.guest_count || 1

    // Payment activity
    if (r.has_paid_reservation) {
      notificationsList.push({
        id: `pay-full-${r.reservation_id}`,
        type: 'paid-full',
        title: `${customerName} - Full Payment Received`,
        subtitle:
          `${typeLabel} • ₱${Number(
            r.reservation_cost || 0
          ).toLocaleString()} Paid`,
        time: dateStr,
      })
    } else if (r.has_paid_sec_dep) {
      notificationsList.push({
        id: `pay-dep-${r.reservation_id}`,
        type: 'deposit-paid',
        title: `${customerName} - Security Deposit Paid`,
        subtitle: `${typeLabel} • ₱2,000 Deposit Recorded`,
        time: dateStr,
      })
    }

    // Reservation status activity
    if (
      status === 'confirmed' ||
      status === 'approved'
    ) {
      notificationsList.push({
        id: `res-confirmed-${r.reservation_id}`,
        type: 'confirmed',
        title: `${customerName} - Reservation Confirmed`,
        subtitle: `${typeLabel} • ${guestCount} Pax Approved`,
        time: dateStr,
      })
    }

    if (
      status === 'arrived' ||
      status === 'completed'
    ) {
      notificationsList.push({
        id: `res-arrived-${r.reservation_id}`,
        type: 'arrived',
        title: `${customerName} - Guest Arrived`,
        subtitle: `${typeLabel} • ${guestCount} Pax`,
        time: dateStr,
      })
    }

    if (
      status === 'no_show' ||
      status === 'did_not_arrive' ||
      status === 'not_arrived'
    ) {
      notificationsList.push({
        id: `res-noshow-${r.reservation_id}`,
        type: 'no-show',
        title: `${customerName} - Reservation No Show`,
        subtitle: `${typeLabel} • ${guestCount} Pax`,
        time: dateStr,
      })
    }

    if (
      status === 'cancelled' ||
      status === 'canceled' ||
      status === 'declined' ||
      status === 'rejected'
    ) {
      notificationsList.push({
        id: `res-cancelled-${r.reservation_id}`,
        type: 'cancelled',
        title: `${customerName} - Reservation Cancelled`,
        subtitle: `${typeLabel} • ${guestCount} Pax`,
        time: dateStr,
      })
    }
  })

  // ========================================================
  // REAL OCULAR VISIT DATA
  // ========================================================

  visitations.forEach((v) => {
    const status = normalizeStatus(v.visitation_status)

    const customerName =
      v.customer_name ||
      (v.customer_id
        ? `Customer #${v.customer_id}`
        : 'Guest')

    const visitorCount = v.guest_count || 1

    const dateStr = v.visitation_start_date
      ? v.visitation_start_date.split('T')[0]
      : 'Scheduled'

    const slotLabel =
      v.slot_type || 'Ocular Visit'

    if (
      status === 'confirmed' ||
      status === 'approved'
    ) {
      notificationsList.push({
        id: `vis-confirmed-${v.visitation_id}`,
        type: 'ocular',
        title: `${customerName} - Ocular Visit Confirmed`,
        subtitle:
          `${slotLabel} • ${visitorCount} Visitors`,
        time: dateStr,
      })
    }

    if (
      status === 'arrived' ||
      status === 'completed'
    ) {
      notificationsList.push({
        id: `vis-arrived-${v.visitation_id}`,
        type: 'arrived',
        title: `${customerName} - Ocular Visitor Arrived`,
        subtitle:
          `${slotLabel} • ${visitorCount} Visitors`,
        time: dateStr,
      })
    }

    if (
      status === 'no_show' ||
      status === 'did_not_arrive' ||
      status === 'not_arrived'
    ) {
      notificationsList.push({
        id: `vis-noshow-${v.visitation_id}`,
        type: 'no-show',
        title: `${customerName} - Ocular Visit No Show`,
        subtitle:
          `${slotLabel} • ${visitorCount} Visitors`,
        time: dateStr,
      })
    }

    if (
      status === 'cancelled' ||
      status === 'canceled' ||
      status === 'declined' ||
      status === 'rejected'
    ) {
      notificationsList.push({
        id: `vis-cancelled-${v.visitation_id}`,
        type: 'cancelled',
        title: `${customerName} - Ocular Visit Cancelled`,
        subtitle:
          `${slotLabel} • ${visitorCount} Visitors`,
        time: dateStr,
      })
    }
  })

  // ========================================================
  // REAL INQUIRY DATA
  // ========================================================

  inquiries.slice(0, 2).forEach((inq) => {
    const customerName =
      inq.guest_name ||
      inq.customer_name ||
      (inq.customer_id
        ? `Customer #${inq.customer_id}`
        : 'Guest')

    notificationsList.push({
      id: `inq-${inq.inquiry_id}`,
      type: 'inquiry',
      title: `${customerName} - New Inquiry`,
      subtitle:
        inq.inquiry_label || 'General Inquiry',
      time: inq.created_at
        ? inq.created_at.split('T')[0]
        : 'Recent',
    })
  })

  // ========================================================
  // REAL REVIEW DATA
  // ========================================================

  reviews.slice(0, 2).forEach((review) => {
    const stars = Number(review.review_stars || 0)

    if (stars <= 0) return

    notificationsList.push({
      id: `review-${review.review_id}`,
      type: 'review',
      title:
        `${review.customer_name || 'Customer'} - ` +
        `${stars}-Star Review Submitted`,
      subtitle:
        review.review_comment ||
        review.comment ||
        'Customer review submitted',
      time:
        review.date_submitted ||
        review.created_at ||
        'Recent',
    })
  })

  // Real database activity only.
  const displayItems = notificationsList.slice(0, 8)

  const renderNotifIcon = (type) => {
    switch (type) {
      case 'paid-full':
        return (
          <div className="dash-notif-icon-badge notif-badge-paid">
            <svg
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
              <path d="M7 15h.01" />
              <path d="M11 15h2" />
            </svg>
          </div>
        )

      case 'deposit-paid':
        return (
          <div className="dash-notif-icon-badge notif-badge-deposit">
            <svg
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
        )

      case 'confirmed':
        return (
          <div className="dash-notif-icon-badge notif-badge-confirmed">
            <svg
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect
                x="3"
                y="4"
                width="18"
                height="18"
                rx="2"
                ry="2"
              />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <path d="M9 14l2 2 4-4" />
            </svg>
          </div>
        )

      case 'arrived':
        return (
          <div className="dash-notif-icon-badge notif-badge-confirmed">
            <svg
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
        )

      case 'no-show':
        return (
          <div className="dash-notif-icon-badge notif-badge-deposit">
            <svg
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
        )

      case 'cancelled':
        return (
          <div className="dash-notif-icon-badge notif-badge-deposit">
            <svg
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="8" y1="8" x2="16" y2="16" />
              <line x1="16" y1="8" x2="8" y2="16" />
            </svg>
          </div>
        )

      case 'ocular':
        return (
          <div className="dash-notif-icon-badge notif-badge-ocular">
            <svg
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
        )

      case 'inquiry':
        return (
          <div className="dash-notif-icon-badge notif-badge-inquiry">
            <svg
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
        )

      case 'review':
        return (
          <div className="dash-notif-icon-badge notif-badge-review">
            <svg
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
        )

      default:
        return (
          <div className="dash-notif-icon-badge notif-badge-confirmed">
            <svg
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 14 14" />
            </svg>
          </div>
        )
    }
  }

  return (
    <div className="dash-panel-box dash-active-res-panel">
      {/* Panel Header */}
      <div className="dash-panel-bar">
        <div className="dash-panel-heading">
          <span className="dash-panel-title-text">
            Notifications Panel
          </span>
        </div>
      </div>

      {/* Notifications List */}
      <div className="dash-active-list">
        {displayItems.length === 0 ? (
          <div className="dash-notifications-empty">
            No recent activity yet.
          </div>
        ) : (
          displayItems.map((item) => (
            <div
              key={item.id}
              className="dash-active-row"
              onClick={() =>
                onNavigate(
                  item.type === 'inquiry'
                    ? 'customer-inquiries'
                    : item.type === 'review'
                      ? 'customer-reviews'
                      : 'booking-catalog'
                )
              }
            >
              <div className="dash-active-row-left">
                {renderNotifIcon(item.type)}

                <div className="dash-active-row-info">
                  <span className="dash-active-row-title">
                    {item.title}
                  </span>

                  <span className="dash-active-row-sub">
                    {item.subtitle}
                  </span>
                </div>
              </div>

              <div className="dash-active-row-right">
                <span className="dash-active-row-time">
                  {item.time}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Panel Footer Button */}
      <div className="dash-panel-footer">
        <button
          type="button"
          className="dash-active-view-all-btn"
          onClick={() => onNavigate('booking-catalog')}
        >
          View All Alerts
        </button>
      </div>
    </div>
  )
}

export default NotificationsPanel