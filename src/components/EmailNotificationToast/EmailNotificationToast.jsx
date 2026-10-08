import { useState, useEffect } from 'react'
import './styles.css'

export default function EmailNotificationToast() {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    const handleEmailEvent = (e) => {
      const email = e.detail
      if (!email) return

      // Do NOT show website popups for OTP verification
      if (email.type === 'otp_verification' || email.silentToast) {
        return
      }

      const id = email.id || Date.now()
      setNotifications((prev) => [email, ...prev.slice(0, 2)])

      // Auto dismiss individual toast after 6s
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => (n.id || n) !== id))
      }, 6000)
    }

    window.addEventListener('polchat_email_notification', handleEmailEvent)
    return () => {
      window.removeEventListener('polchat_email_notification', handleEmailEvent)
    }
  }, [])

  if (notifications.length === 0) return null

  return (
    <div className="email-toast-container" aria-live="polite">
      {notifications.map((item) => (
        <div key={item.id} className="email-toast-card">
          <div className="email-toast-header">
            <div className="email-toast-badge-group">
              <span className="email-toast-icon">✉️</span>
              <span className="email-toast-tag">EMAIL NOTIFICATION SENT</span>
            </div>
            <button
              type="button"
              className="email-toast-close"
              onClick={() => setNotifications((prev) => prev.filter((n) => n.id !== item.id))}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div className="email-toast-body">
            <p className="email-toast-to">
              <span>To:</span> <strong>{item.to}</strong>
            </p>
            <p className="email-toast-subject">{item.subject}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
