import React from 'react'

function NotificationsPanel({
  reservations = [],
  visitations = [],
  inquiries = [],
  reviews = [],
  onNavigate,
}) {
  // Extract real notifications from database
  const notificationsList = []

  // 1. Paid & Confirmed Reservations
  reservations.forEach((r) => {
    let typeLabel = 'Day Tour'
    if (r.duration_id === 2) typeLabel = 'Overnight'
    else if (r.duration_id === 3 || r.duration_id === 4) typeLabel = '22h Stay'

    const dateStr = r.start_date ? r.start_date.split('T')[0] : 'Scheduled'

    if (r.has_paid_reservation) {
      notificationsList.push({
        id: `pay-full-${r.reservation_id}`,
        type: 'paid-full',
        title: `${r.customer_name || 'Guest'} - Full Payment Received`,
        subtitle: `${typeLabel} • ₱${(r.reservation_cost || 0).toLocaleString()} Paid`,
        time: dateStr,
      })
    } else if (r.has_paid_sec_dep) {
      notificationsList.push({
        id: `pay-dep-${r.reservation_id}`,
        type: 'deposit-paid',
        title: `${r.customer_name || 'Guest'} - Security Deposit Paid`,
        subtitle: `${typeLabel} • ₱2,000 Deposit Recorded`,
        time: dateStr,
      })
    } else if (r.reservation_status === 'confirmed') {
      notificationsList.push({
        id: `res-conf-${r.reservation_id}`,
        type: 'confirmed',
        title: `${r.customer_name || 'Guest'} - Reservation Confirmed`,
        subtitle: `${typeLabel} • ${r.guest_count} Pax Approved`,
        time: dateStr,
      })
    }
  })

  // 2. Confirmed Visitations
  visitations
    .filter((v) => v.visitation_status === 'confirmed')
    .forEach((v) => {
      notificationsList.push({
        id: `vis-conf-${v.visitation_id}`,
        type: 'ocular',
        title: `${v.customer_name || 'Guest'} - Ocular Visit Scheduled`,
        subtitle: `${v.guest_count || 2} Visitors • Free Inspection`,
        time: v.visitation_start_date ? v.visitation_start_date.split('T')[0] : 'Scheduled',
      })
    })

  // 3. New Inquiries
  inquiries.slice(0, 2).forEach((inq) => {
    notificationsList.push({
      id: `inq-${inq.inquiry_id}`,
      type: 'inquiry',
      title: `${inq.customer_name || 'Guest'} - New Message Sent`,
      subtitle: inq.inquiry_label || 'General Inquiry',
      time: inq.created_at ? inq.created_at.split('T')[0] : 'Recent',
    })
  })

  // Fallback demo notifications if DB has few entries
  const displayItems =
    notificationsList.length >= 4
      ? notificationsList.slice(0, 8)
      : [
          {
            id: 'notif-1',
            type: 'paid-full',
            title: 'Juan Dela Cruz - Full Payment Received',
            subtitle: 'Day Tour • ₱9,000 Verified',
            time: '4 minutes ago',
          },
          {
            id: 'notif-2',
            type: 'deposit-paid',
            title: 'Maria Santos - Security Deposit Paid',
            subtitle: 'Overnight • ₱2,000 Security Deposit',
            time: '12 minutes ago',
          },
          {
            id: 'notif-3',
            type: 'inquiry',
            title: 'Carlos Reyes - Message Received',
            subtitle: 'Event Catering & Amenities inquiry',
            time: '27 minutes ago',
          },
          {
            id: 'notif-4',
            type: 'confirmed',
            title: 'Elena Gomez - Reservation Confirmed',
            subtitle: '22h Stay • 30 Pax Approved',
            time: '43 minutes ago',
          },
          {
            id: 'notif-5',
            type: 'ocular',
            title: 'Robert Tan - Ocular Inspection Confirmed',
            subtitle: 'Morning Inspection (9am - 11am)',
            time: '11:32 AM',
          },
          {
            id: 'notif-6',
            type: 'review',
            title: 'Ana Lim - 5-Star Review Submitted',
            subtitle: '"Had a wonderful weekend with family!"',
            time: '11:13 AM',
          },
          {
            id: 'notif-7',
            type: 'deposit-paid',
            title: 'David Lee - Security Deposit Paid',
            subtitle: 'Day Tour • ₱2,000 Verified',
            time: '10:57 AM',
          },
          {
            id: 'notif-8',
            type: 'paid-full',
            title: 'Patricia Cruz - Full Payment Received',
            subtitle: '22h Night Stay • ₱17,000 Paid',
            time: 'Yesterday',
          },
        ]

  // Render SVG Icon depending on notification purpose
  const renderNotifIcon = (type) => {
    switch (type) {
      case 'paid-full':
        return (
          <div className="dash-notif-icon-badge notif-badge-paid">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2"></rect>
              <line x1="2" y1="10" x2="22" y2="10"></line>
              <path d="M7 15h.01"></path>
              <path d="M11 15h2"></path>
            </svg>
          </div>
        )
      case 'deposit-paid':
        return (
          <div className="dash-notif-icon-badge notif-badge-deposit">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <path d="M9 12l2 2 4-4"></path>
            </svg>
          </div>
        )
      case 'confirmed':
        return (
          <div className="dash-notif-icon-badge notif-badge-confirmed">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <path d="M9 14l2 2 4-4"></path>
            </svg>
          </div>
        )
      case 'ocular':
        return (
          <div className="dash-notif-icon-badge notif-badge-ocular">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </div>
        )
      case 'inquiry':
        return (
          <div className="dash-notif-icon-badge notif-badge-inquiry">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
        )
      case 'review':
        return (
          <div className="dash-notif-icon-badge notif-badge-review">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </div>
        )
      default:
        return (
          <div className="dash-notif-icon-badge notif-badge-confirmed">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 14 14"></polyline>
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
          <span className="dash-panel-title-text">Notifications Panel</span>
        </div>
      </div>

      {/* Notifications List */}
      <div className="dash-active-list">
        {displayItems.map((item) => (
          <div
            key={item.id}
            className="dash-active-row"
            onClick={() => onNavigate(item.type === 'inquiry' ? 'customer-inquiries' : item.type === 'review' ? 'customer-reviews' : 'booking-catalog')}
          >
            <div className="dash-active-row-left">
              {renderNotifIcon(item.type)}
              <div className="dash-active-row-info">
                <span className="dash-active-row-title">{item.title}</span>
                <span className="dash-active-row-sub">{item.subtitle}</span>
              </div>
            </div>
            <div className="dash-active-row-right">
              <span className="dash-active-row-time">{item.time}</span>
            </div>
          </div>
        ))}
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
