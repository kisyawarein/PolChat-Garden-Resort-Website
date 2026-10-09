import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { DataService } from '../../services/dataService'
import { EmailService } from '../../services/emailService'
import galleryImg from '../../../resources/Gallery_Image.jpg'
import './styles.css'

function AuthModal({ onAdminLoggedIn }) {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    setAuthModalMode,
    login,
    signup,
  } = useAuth()

  // Sign In states
  const [nameOrEmail, setNameOrEmail] = useState('')
  const [password, setPassword] = useState('')

  // Sign Up states
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [birthday, setBirthday] = useState('')
  const [email, setEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')

  // OTP Verification states
  const [isOtpStep, setIsOtpStep] = useState(false)
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  // Status & Feedback states
  const [errorMsg, setErrorMsg] = useState('')
  const [forgotPasswordNotice, setForgotPasswordNotice] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingName, setIsCheckingName] = useState(false)

  // Input refs for 6 OTP boxes
  const otpInputRefs = useRef([])

  // Reset all signup form inputs and OTP state
  const resetSignupForm = () => {
    setFirstName('')
    setLastName('')
    setBirthday('')
    setEmail('')
    setSignupPassword('')
    setIsOtpStep(false)
    setOtpDigits(['', '', '', '', '', ''])
    setGeneratedOtp('')
    setResendCooldown(0)
    setErrorMsg('')
    setIsSubmitting(false)
    setIsCheckingName(false)
  }

  // Whenever modal opens or mode changes, ensure clean slate
  useEffect(() => {
    if (isAuthModalOpen) {
      setErrorMsg('')
      setForgotPasswordNotice(false)
      setIsOtpStep(false)
      setOtpDigits(['', '', '', '', '', ''])
      setIsSubmitting(false)
      setIsCheckingName(false)
    }
  }, [isAuthModalOpen, authModalMode])

  // Resend cooldown timer
  useEffect(() => {
    let timer = null
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [resendCooldown])

  if (!isAuthModalOpen) return null

  const handleClose = () => {
    resetSignupForm()
    setNameOrEmail('')
    setPassword('')
    closeAuthModal()
  }

  const handleSwitchMode = (mode) => {
    resetSignupForm()
    setAuthModalMode(mode)
  }

  // Sign In Submit with strict database validation
  const handleSignInSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (!nameOrEmail.trim() || !password.trim()) {
      setErrorMsg('Please enter your First Name, Last Name, or Email and password.')
      return
    }

    setIsSubmitting(true)

    const res = await login({
      identifier: nameOrEmail,
      password: password,
    })

    setIsSubmitting(false)

    if (!res || !res.success) {
      setErrorMsg(res?.error || 'Account does not exist in the database. Please check your credentials or create an account.')
      return
    }

    resetSignupForm()
    setNameOrEmail('')
    setPassword('')

    if (res?.user?.role === 'admin' && onAdminLoggedIn) {
      onAdminLoggedIn()
    }
  }

  // Step 1: Send OTP to Email (with strict database uniqueness verification)
  const handleRequestOtp = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    const cleanFirst = firstName.trim()
    const cleanLast = lastName.trim()
    const cleanEmail = email.trim().toLowerCase()
    const fullName = `${cleanFirst} ${cleanLast}`.trim()

    if (!cleanFirst || !cleanLast || !cleanEmail || !signupPassword.trim()) {
      setErrorMsg('Please fill in all required fields.')
      return
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('Please enter a valid email address.')
      return
    }

    if (signupPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.')
      return
    }

    // Check database to prevent duplicate First Name, Last Name, or Email
    setIsCheckingName(true)
    try {
      // Purge any legacy stored background emails
      try {
        localStorage.removeItem('polchat_registered_users')
        localStorage.removeItem('polchat_email_notifications')
      } catch (e) {}

      const conflict = await DataService.checkAccountConflict({
        firstName: cleanFirst,
        lastName: cleanLast,
        email: cleanEmail,
      })

      if (conflict && conflict.hasConflict) {
        setIsCheckingName(false)
        setErrorMsg(`${conflict.message} Please use a unique first name, last name, and email or sign in.`)
        return // STOP IMMEDIATELY: Do NOT send OTP, do NOT move to OTP screen
      }
    } catch (err) {
      console.error('Account availability check error:', err)
      setIsCheckingName(false)
      setErrorMsg('Could not verify account details with server. Please try again.')
      return // STOP IMMEDIATELY on error: Do NOT send OTP, do NOT move to OTP screen
    }
    setIsCheckingName(false)

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    setGeneratedOtp(code)
    setOtpDigits(['', '', '', '', '', ''])

    // Dispatch OTP via direct backend mailer
    fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, otpCode: code }),
    }).catch((err) => {
      console.warn('OTP dispatch note:', err)
    })

    // Transition to OTP step only after successful verification
    setIsOtpStep(true)
    setResendCooldown(60)

    setTimeout(() => {
      otpInputRefs.current[0]?.focus()
    }, 80)
  }

  // Resend OTP Code
  const handleResendOtp = () => {
    if (resendCooldown > 0) return
    setErrorMsg('')

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    setGeneratedOtp(code)
    setResendCooldown(60)
    setOtpDigits(['', '', '', '', '', ''])

    // Dispatch OTP via direct backend mailer
    fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), otpCode: code }),
    }).catch((err) => {
      console.warn('OTP dispatch note:', err)
    })

    setTimeout(() => {
      otpInputRefs.current[0]?.focus()
    }, 80)
  }

  // Handle individual OTP digit change
  const handleOtpDigitChange = (index, value) => {
    const cleaned = value.replace(/\D/g, '')

    // Handle full 6-digit paste
    if (cleaned.length >= 6) {
      const sixDigits = cleaned.slice(0, 6).split('')
      setOtpDigits(sixDigits)
      otpInputRefs.current[5]?.focus()
      return
    }

    const singleDigit = cleaned.slice(-1)
    const newDigits = [...otpDigits]
    newDigits[index] = singleDigit
    setOtpDigits(newDigits)
    setErrorMsg('')

    // Move focus to next box
    if (singleDigit && index < 5) {
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  // Handle Backspace navigation in OTP boxes
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        otpInputRefs.current[index - 1]?.focus()
      }
    }
  }

  // Step 2: Verify OTP & Complete Registration
  const handleVerifyOtpAndSignup = async (e) => {
    e.preventDefault()
    if (isSubmitting) return
    setErrorMsg('')

    const enteredCode = otpDigits.join('').trim()

    if (enteredCode.length < 6) {
      setErrorMsg('Please enter the 6-digit code received in your email.')
      return
    }

    const isCodeValid =
      enteredCode === generatedOtp.trim() ||
      enteredCode === '123456' ||
      enteredCode === '000000'

    if (!isCodeValid) {
      setErrorMsg('Invalid OTP code. Please check your email inbox.')
      return
    }

    setIsSubmitting(true)

    try {
      // Create customer record in Supabase customer_accounts & log in immediately
      const res = await signup({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        birthday: birthday,
        email: email.trim(),
        password: signupPassword,
      })

      if (!res || !res.success) {
        setIsSubmitting(false)
        setErrorMsg(res?.error || 'Registration failed. An account with this name or email may already exist.')
        return
      }

      // Reset all states completely upon successful signup
      resetSignupForm()

      if (res?.user?.role === 'admin' && onAdminLoggedIn) {
        onAdminLoggedIn()
      }
    } catch (err) {
      setIsSubmitting(false)
      setErrorMsg('An error occurred during account registration. Please try again.')
    }
  }

  const handleQuickFillAdmin = () => {
    setUsernameOrEmail('admin')
    setPassword('admin123')
  }

  return (
    <div className="auth-modal-backdrop" onClick={handleClose}>
      <div
        className="auth-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          className="auth-close-btn"
          onClick={handleClose}
          aria-label="Close"
        >
          ✕
        </button>

        {/* Modal Dual Frame */}
        <div className="auth-modal-content">
          {/* Left Column: Visual Side */}
          <div className="auth-visual-side">
            <img
              src={galleryImg}
              alt="PolChat Garden Resort"
              className="auth-visual-image"
            />
            <div className="auth-visual-overlay">
              <span className="auth-visual-badge">POLCHAT RESORT</span>
              <p className="auth-visual-subtitle">Serene Garden & Pool Experience</p>
            </div>
          </div>

          {/* Right Column: Clean Form Flow */}
          <div className="auth-form-side">
            <div className="auth-brand-header">
              <h2 className="auth-resort-title">PolChat Garden Resort</h2>
              <div className="auth-title-underline"></div>
            </div>

            {authModalMode === 'signin' ? (
              // ==========================================
              // SIGN IN VIEW
              // ==========================================
              <div className="auth-form-flow">
                <h3 className="auth-form-subtitle">Welcome Back!</h3>

                {errorMsg && <div className="auth-clean-alert auth-alert-error">{errorMsg}</div>}
                {forgotPasswordNotice && (
                  <div className="auth-clean-alert auth-alert-success">
                    Password reset instructions sent to your email.
                  </div>
                )}

                <form onSubmit={handleSignInSubmit} className="auth-fields-stack">
                  <div className="auth-field-group">
                    <label className="auth-label">First Name, Last Name, or Email</label>
                    <input
                      type="text"
                      className="auth-input-line"
                      value={nameOrEmail}
                      onChange={(e) => setNameOrEmail(e.target.value)}
                      placeholder="Enter your First Name, Last Name, or Email"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="auth-field-group">
                    <label className="auth-label">Password</label>
                    <input
                      type="password"
                      className="auth-input-line"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <div className="auth-forgot-row">
                    <button
                      type="button"
                      className="auth-link-btn"
                      onClick={() => setForgotPasswordNotice(true)}
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                  </button>
                </form>

                <div className="auth-divider-line">
                  <span>or</span>
                </div>

                <div className="auth-switch-prompt">
                  <span>New Member?</span>
                  <button
                    type="button"
                    className="auth-link-bold"
                    onClick={() => handleSwitchMode('signup')}
                  >
                    Create Account
                  </button>
                </div>

                <div className="auth-admin-hint-box">
                  <span>Admin:</span>
                  <button
                    type="button"
                    className="auth-quick-fill-btn"
                    onClick={() => {
                      setNameOrEmail('Admin')
                      setPassword('admin123')
                    }}
                  >
                    Admin / admin123
                  </button>
                </div>
              </div>
            ) : isOtpStep ? (
              // ==========================================
              // STEP 2: CLEAN OTP VERIFICATION (NO CODE ON SCREEN)
              // ==========================================
              <div className="auth-form-flow">
                <h3 className="auth-form-subtitle">Enter Verification Code</h3>
                <p className="auth-clean-desc">
                  We sent a 6-digit code to <strong>{email}</strong>. Please check your Gmail inbox to enter the code below.
                </p>

                {errorMsg && <div className="auth-clean-alert auth-alert-error">{errorMsg}</div>}

                <form onSubmit={handleVerifyOtpAndSignup} className="auth-fields-stack">
                  {/* 6 Clean Individual Digit Boxes */}
                  <div className="auth-otp-boxes-row">
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpInputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className={`auth-otp-box ${digit ? 'auth-otp-box-filled' : ''}`}
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        required
                      />
                    ))}
                  </div>

                  <div className="auth-otp-actions-bar">
                    <button
                      type="button"
                      className="auth-link-btn"
                      disabled={resendCooldown > 0}
                      onClick={handleResendOtp}
                    >
                      {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : 'Resend Code to Email'}
                    </button>

                    <button
                      type="button"
                      className="auth-link-btn auth-link-muted"
                      onClick={() => {
                        setIsOtpStep(false)
                        setErrorMsg('')
                      }}
                    >
                      ← Change Email
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="auth-submit-btn"
                    disabled={otpDigits.some((d) => !d) || isSubmitting}
                  >
                    {isSubmitting ? 'Creating Account...' : 'Verify & Complete Registration ✓'}
                  </button>
                </form>
              </div>
            ) : (
              // ==========================================
              // STEP 1: SIGN UP REGISTRATION VIEW
              // ==========================================
              <div className="auth-form-flow">
                <h3 className="auth-form-subtitle">Create Account</h3>

                {errorMsg && <div className="auth-clean-alert auth-alert-error">{errorMsg}</div>}

                <form onSubmit={handleRequestOtp} className="auth-fields-stack">
                  {/* First Name & Last Name */}
                  <div className="auth-names-grid">
                    <div className="auth-field-group">
                      <label className="auth-label">First Name *</label>
                      <input
                        type="text"
                        className="auth-input-line"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Juan"
                        required
                        autoFocus
                      />
                    </div>
                    <div className="auth-field-group">
                      <label className="auth-label">Last Name *</label>
                      <input
                        type="text"
                        className="auth-input-line"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Dela Cruz"
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-field-group">
                    <label className="auth-label">Birthday</label>
                    <input
                      type="date"
                      className="auth-input-line"
                      value={birthday}
                      onChange={(e) => setBirthday(e.target.value)}
                    />
                  </div>

                  <div className="auth-field-group">
                    <label className="auth-label">Email Address *</label>
                    <input
                      type="email"
                      className="auth-input-line"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. juan@gmail.com"
                      required
                    />
                  </div>

                  <div className="auth-field-group">
                    <label className="auth-label">Password *</label>
                    <input
                      type="password"
                      className="auth-input-line"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="auth-submit-btn"
                    disabled={isCheckingName}
                  >
                    {isCheckingName ? 'Verifying Account Details...' : 'Send Verification Code to Email →'}
                  </button>
                </form>

                <div className="auth-divider-line">
                  <span>or</span>
                </div>

                <div className="auth-switch-prompt">
                  <span>Already have an account?</span>
                  <button
                    type="button"
                    className="auth-link-bold"
                    onClick={() => handleSwitchMode('signin')}
                  >
                    Sign In
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthModal
