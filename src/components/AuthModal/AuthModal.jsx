import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { DataService } from '../../services/dataService'
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

  // ========================================================
  // SIGN IN STATE
  // ========================================================

  const [nameOrEmail, setNameOrEmail] = useState('')
  const [password, setPassword] = useState('')

  // ========================================================
  // SIGN UP STATE
  // ========================================================

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [birthday, setBirthday] = useState('')
  const [email, setEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // ========================================================
  // OTP STATE
  // ========================================================

  const [isOtpStep, setIsOtpStep] = useState(false)

  const [otpDigits, setOtpDigits] = useState([
    '',
    '',
    '',
    '',
    '',
    '',
  ])

  const [generatedOtp, setGeneratedOtp] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  const otpInputRefs = useRef([])

  // ========================================================
  // UI / FEEDBACK STATE
  // ========================================================

  const [errorMsg, setErrorMsg] = useState('')
  const [forgotPasswordNotice, setForgotPasswordNotice] =
    useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingName, setIsCheckingName] = useState(false)

  // ========================================================
  // HELPERS
  // ========================================================

  const resetOtpFields = () => {
    setOtpDigits([
      '',
      '',
      '',
      '',
      '',
      '',
    ])

    setGeneratedOtp('')
    setResendCooldown(0)
  }

  const resetSignupForm = () => {
    setFirstName('')
    setLastName('')
    setBirthday('')
    setEmail('')
    setSignupPassword('')
    setConfirmPassword('')

    setIsOtpStep(false)
    resetOtpFields()

    setErrorMsg('')
    setIsSubmitting(false)
    setIsCheckingName(false)
  }

  const handleClose = () => {
    resetSignupForm()

    setNameOrEmail('')
    setPassword('')
    setForgotPasswordNotice(false)

    closeAuthModal()
  }

  const handleSwitchMode = (mode) => {
    resetSignupForm()

    setNameOrEmail('')
    setPassword('')
    setForgotPasswordNotice(false)

    setAuthModalMode(mode)
  }

  // ========================================================
  // RESET MODAL WHEN OPENED
  // ========================================================

  useEffect(() => {
    if (!isAuthModalOpen) return

    setErrorMsg('')
    setForgotPasswordNotice(false)
    setIsOtpStep(false)

    setOtpDigits([
      '',
      '',
      '',
      '',
      '',
      '',
    ])

    setGeneratedOtp('')
    setResendCooldown(0)
    setIsSubmitting(false)
    setIsCheckingName(false)
    setConfirmPassword('')
  }, [isAuthModalOpen, authModalMode])

  // ========================================================
  // OTP RESEND TIMER
  // ========================================================

  useEffect(() => {
    if (resendCooldown <= 0) return undefined

    const timer = setInterval(() => {
      setResendCooldown((current) =>
        Math.max(0, current - 1)
      )
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [resendCooldown])

  // ========================================================
  // SIGN IN
  // ========================================================

  const handleSignInSubmit = async (e) => {
    e.preventDefault()

    if (isSubmitting) return

    setErrorMsg('')
    setForgotPasswordNotice(false)

    if (!nameOrEmail.trim() || !password.trim()) {
      setErrorMsg(
        'Please enter your First Name, Last Name, or Email and password.'
      )
      return
    }

    setIsSubmitting(true)

    try {
      const result = await login({
        identifier: nameOrEmail.trim(),
        password,
      })

      if (!result?.success) {
        setErrorMsg(
          result?.error ||
            'Unable to sign in. Please check your credentials.'
        )
        return
      }

      setNameOrEmail('')
      setPassword('')

      if (
        result?.user?.role === 'admin' &&
        onAdminLoggedIn
      ) {
        onAdminLoggedIn()
      }
    } catch (error) {
      console.error('Sign in error:', error)

      setErrorMsg(
        'Unable to sign in. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // ========================================================
  // ZEROBOUNCE STATUS MESSAGE
  // ========================================================

  const getEmailValidationError = (validationResult) => {
    const status = String(
      validationResult?.status || ''
    )
      .trim()
      .toLowerCase()

    const didYouMean = String(
      validationResult?.didYouMean || ''
    ).trim()

    const suggestion = didYouMean
      ? ` Did you mean ${didYouMean}?`
      : ''

    if (status === 'invalid') {
      return (
        'This email address could not be verified as a real, active inbox.' +
        suggestion
      )
    }

    if (status === 'catch-all') {
      return (
        'We could not verify that this specific email inbox exists. ' +
        'Please use another active email address.'
      )
    }

    if (status === 'unknown') {
      return (
        'We could not verify this email address right now. ' +
        'Please use another active email address or try again later.'
      )
    }

    if (
      status === 'spamtrap' ||
      status === 'abuse' ||
      status === 'do_not_mail'
    ) {
      return (
        'This email address is not eligible for account registration. ' +
        'Please use another active email address.'
      )
    }

    return (
      'This email address could not be verified as an active inbox. ' +
      'Please use another email address.'
    )
  }

  // ========================================================
  // SIGN UP STEP 1
  // VALIDATE EMAIL -> CHECK DUPLICATE -> SEND OTP
  // ========================================================

  const handleRequestOtp = async (e) => {
    e.preventDefault()

    if (isCheckingName || isSubmitting) return

    setErrorMsg('')

    const cleanFirst = firstName.trim()
    const cleanLast = lastName.trim()

    const cleanEmail = email
      .trim()
      .toLowerCase()

    if (
      !cleanFirst ||
      !cleanLast ||
      !cleanEmail ||
      !signupPassword.trim() ||
      !confirmPassword.trim()
    ) {
      setErrorMsg(
        'Please fill in all required fields.'
      )
      return
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/

    if (!emailPattern.test(cleanEmail)) {
      setErrorMsg(
        'Please enter a valid email address, for example: name@gmail.com'
      )
      return
    }

    if (signupPassword.length < 6) {
      setErrorMsg(
        'Password must be at least 6 characters.'
      )
      return
    }

    if (signupPassword !== confirmPassword) {
      setErrorMsg(
        'Passwords do not match. Please re-enter your password.'
      )
      return
    }

    setIsCheckingName(true)

    try {
      // ====================================================
      // 1. SERVER-SIDE ZEROBOUNCE VALIDATION
      // ====================================================

      const validationResponse = await fetch(
        '/api/validate-email',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: cleanEmail,
          }),
        }
      )

      const validationResult =
        await validationResponse
          .json()
          .catch(() => ({}))

      if (!validationResponse.ok) {
        setErrorMsg(
          validationResult?.error ||
            'Email verification is currently unavailable. Please try again.'
        )
        return
      }

      if (validationResult?.success === false) {
        setErrorMsg(
          validationResult?.error ||
            'Email verification could not be completed.'
        )
        return
      }

      // IMPORTANT:
      // ONLY ZeroBounce status "valid" may continue.
      if (validationResult?.valid !== true) {
        setErrorMsg(
          getEmailValidationError(
            validationResult
          )
        )
        return
      }

      // ====================================================
      // 2. DUPLICATE EMAIL CHECK
      // ====================================================

      const conflict =
        await DataService.checkAccountConflict({
          firstName: cleanFirst,
          lastName: cleanLast,
          email: cleanEmail,
        })

      if (conflict?.hasConflict) {
        setErrorMsg(
          'This email address is already in use. Please sign in or use a different email.'
        )
        return
      }

      // ====================================================
      // 3. GENERATE OTP
      // ====================================================

      const otpCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString()

      // ====================================================
      // 4. SEND OTP
      // ====================================================

      const otpResponse = await fetch(
        '/api/send-otp',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: cleanEmail,
            otpCode,
          }),
        }
      )

      const otpResult = await otpResponse
        .json()
        .catch(() => ({}))

      // Do NOT move to OTP screen if sending failed.
      if (
        !otpResponse.ok ||
        otpResult?.success === false
      ) {
        setErrorMsg(
          otpResult?.error ||
            'We could not send a verification code to this email address. Please verify the email and try again.'
        )
        return
      }

      // ====================================================
      // 5. OTP DELIVERY SUCCEEDED
      // ====================================================

      setEmail(cleanEmail)
      setGeneratedOtp(otpCode)

      setOtpDigits([
        '',
        '',
        '',
        '',
        '',
        '',
      ])

      setIsOtpStep(true)
      setResendCooldown(60)

      setTimeout(() => {
        otpInputRefs.current[0]?.focus()
      }, 80)
    } catch (error) {
      console.error(
        'Signup email verification error:',
        error
      )

      setErrorMsg(
        'Email verification could not be completed. Please try again.'
      )
    } finally {
      setIsCheckingName(false)
    }
  }

  // ========================================================
  // RESEND OTP
  // ========================================================

  const handleResendOtp = async () => {
    if (
      resendCooldown > 0 ||
      isSubmitting
    ) {
      return
    }

    setErrorMsg('')
    setIsSubmitting(true)

    const cleanEmail = email
      .trim()
      .toLowerCase()

    try {
      // Revalidate before issuing another code.
      const validationResponse = await fetch(
        '/api/validate-email',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: cleanEmail,
          }),
        }
      )

      const validationResult =
        await validationResponse
          .json()
          .catch(() => ({}))

      if (
        !validationResponse.ok ||
        validationResult?.success === false ||
        validationResult?.valid !== true
      ) {
        setErrorMsg(
          'This email address could not be verified. Please return and enter another active email address.'
        )
        return
      }

      const otpCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString()

      const otpResponse = await fetch(
        '/api/send-otp',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: cleanEmail,
            otpCode,
          }),
        }
      )

      const otpResult = await otpResponse
        .json()
        .catch(() => ({}))

      if (
        !otpResponse.ok ||
        otpResult?.success === false
      ) {
        setErrorMsg(
          otpResult?.error ||
            'The verification code could not be resent. Please try again.'
        )
        return
      }

      setGeneratedOtp(otpCode)

      setOtpDigits([
        '',
        '',
        '',
        '',
        '',
        '',
      ])

      setResendCooldown(60)

      setTimeout(() => {
        otpInputRefs.current[0]?.focus()
      }, 80)
    } catch (error) {
      console.error(
        'OTP resend error:',
        error
      )

      setErrorMsg(
        'The verification code could not be resent. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // ========================================================
  // OTP INPUT
  // ========================================================

  const handleOtpDigitChange = (
    index,
    value
  ) => {
    const cleanValue = String(
      value || ''
    ).replace(/\D/g, '')

    // Allow pasting a complete six-digit OTP.
    if (cleanValue.length >= 6) {
      const pastedDigits = cleanValue
        .slice(0, 6)
        .split('')

      setOtpDigits(pastedDigits)
      setErrorMsg('')

      setTimeout(() => {
        otpInputRefs.current[5]?.focus()
      }, 20)

      return
    }

    const digit = cleanValue.slice(-1)

    setOtpDigits((currentDigits) => {
      const updatedDigits = [
        ...currentDigits,
      ]

      updatedDigits[index] = digit

      return updatedDigits
    })

    setErrorMsg('')

    if (digit && index < 5) {
      setTimeout(() => {
        otpInputRefs.current[
          index + 1
        ]?.focus()
      }, 20)
    }
  }

  const handleOtpKeyDown = (
    index,
    event
  ) => {
    if (
      event.key === 'Backspace' &&
      !otpDigits[index] &&
      index > 0
    ) {
      otpInputRefs.current[
        index - 1
      ]?.focus()
    }
  }

  // ========================================================
  // SIGN UP STEP 2
  // VERIFY OTP + CREATE ACCOUNT
  // ========================================================

  const handleVerifyOtpAndSignup = async (
    e
  ) => {
    e.preventDefault()

    if (isSubmitting) return

    setErrorMsg('')

    const enteredCode = otpDigits
      .join('')
      .trim()

    if (enteredCode.length !== 6) {
      setErrorMsg(
        'Please enter the complete 6-digit code received in your email.'
      )
      return
    }

    if (!generatedOtp) {
      setErrorMsg(
        'Your verification code is no longer available. Please request a new code.'
      )
      return
    }

    // IMPORTANT:
    // No 123456 bypass.
    // No 000000 bypass.
    // Only the generated OTP may pass.
    const isCodeValid =
      enteredCode === generatedOtp.trim()

    if (!isCodeValid) {
      setErrorMsg(
        'Invalid OTP code. Please check your email inbox and enter the code that was sent.'
      )
      return
    }

    setIsSubmitting(true)

    try {
      const result = await signup({
        firstName:
          firstName.trim(),
        lastName:
          lastName.trim(),
        birthday,
        email: email
          .trim()
          .toLowerCase(),
        password:
          signupPassword,
      })

      if (!result?.success) {
        setErrorMsg(
          result?.error ||
            'Registration failed. This email may already be registered.'
        )
        return
      }

      resetSignupForm()

      if (
        result?.user?.role === 'admin' &&
        onAdminLoggedIn
      ) {
        onAdminLoggedIn()
      }
    } catch (error) {
      console.error(
        'Account registration error:',
        error
      )

      setErrorMsg(
        'An error occurred during account registration. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // ========================================================
  // DO NOT RENDER WHEN CLOSED
  // ========================================================

  if (!isAuthModalOpen) return null

  // ========================================================
  // JSX
  // ========================================================

  return (
    <div
      className="auth-modal-backdrop"
      onClick={handleClose}
    >
      <div
        className="auth-modal-dialog"
        onClick={(e) =>
          e.stopPropagation()
        }
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

        <div className="auth-modal-content">
          {/* LEFT VISUAL */}
          <div className="auth-visual-side">
            <img
              src={galleryImg}
              alt="PolChat Garden Resort"
              className="auth-visual-image"
            />

            <div className="auth-visual-overlay">
              <span className="auth-visual-badge">
                POLCHAT RESORT
              </span>

              <p className="auth-visual-subtitle">
                Serene Garden & Pool Experience
              </p>
            </div>
          </div>

          {/* RIGHT FORM */}
          <div className="auth-form-side">
            <div className="auth-brand-header">
              <h2 className="auth-resort-title">
                PolChat Garden Resort
              </h2>

              <div className="auth-title-underline" />
            </div>

            {/* =================================================
                SIGN IN
                ================================================= */}

            {authModalMode === 'signin' ? (
              <div className="auth-form-flow">
                <h3 className="auth-form-subtitle">
                  Welcome Back!
                </h3>

                {errorMsg && (
                  <div className="auth-clean-alert auth-alert-error">
                    {errorMsg}
                  </div>
                )}

                {forgotPasswordNotice && (
                  <div className="auth-clean-alert auth-alert-success">
                    Password reset instructions
                    have been requested.
                  </div>
                )}

                <form
                  onSubmit={
                    handleSignInSubmit
                  }
                  className="auth-fields-stack"
                >
                  <div className="auth-field-group">
                    <label className="auth-label">
                      First Name, Last Name,
                      or Email
                    </label>

                    <input
                      type="text"
                      className="auth-input-line"
                      value={nameOrEmail}
                      onChange={(e) =>
                        setNameOrEmail(
                          e.target.value
                        )
                      }
                      placeholder="Enter your First Name, Last Name, or Email"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="auth-field-group">
                    <label className="auth-label">
                      Password
                    </label>

                    <input
                      type="password"
                      className="auth-input-line"
                      value={password}
                      onChange={(e) =>
                        setPassword(
                          e.target.value
                        )
                      }
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <div className="auth-forgot-row">
                    <button
                      type="button"
                      className="auth-link-btn"
                      onClick={() =>
                        setForgotPasswordNotice(
                          true
                        )
                      }
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="auth-submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? 'Signing In...'
                      : 'Sign In'}
                  </button>
                </form>

                <div className="auth-divider-line">
                  <span>or</span>
                </div>

                <div className="auth-switch-prompt">
                  <span>
                    New Member?
                  </span>

                  <button
                    type="button"
                    className="auth-link-bold"
                    onClick={() =>
                      handleSwitchMode(
                        'signup'
                      )
                    }
                  >
                    Create Account
                  </button>
                </div>
              </div>
            ) : isOtpStep ? (
              /* =================================================
                 OTP
                 ================================================= */

              <div className="auth-form-flow">
                <h3 className="auth-form-subtitle">
                  Enter Verification Code
                </h3>

                <p className="auth-clean-desc">
                  We sent a 6-digit code to{' '}
                  <strong>{email}</strong>.
                  Please check your email inbox
                  and enter the code below.
                </p>

                {errorMsg && (
                  <div className="auth-clean-alert auth-alert-error">
                    {errorMsg}
                  </div>
                )}

                <form
                  onSubmit={
                    handleVerifyOtpAndSignup
                  }
                  className="auth-fields-stack"
                >
                  <div className="auth-otp-boxes-row">
                    {otpDigits.map(
                      (digit, index) => (
                        <input
                          key={index}
                          ref={(element) => {
                            otpInputRefs.current[
                              index
                            ] = element
                          }}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          autoComplete="one-time-code"
                          className={`auth-otp-box ${
                            digit
                              ? 'auth-otp-box-filled'
                              : ''
                          }`}
                          value={digit}
                          onChange={(e) =>
                            handleOtpDigitChange(
                              index,
                              e.target.value
                            )
                          }
                          onKeyDown={(e) =>
                            handleOtpKeyDown(
                              index,
                              e
                            )
                          }
                          required
                        />
                      )
                    )}
                  </div>

                  <div className="auth-otp-actions-bar">
                    <button
                      type="button"
                      className="auth-link-btn"
                      disabled={
                        resendCooldown > 0 ||
                        isSubmitting
                      }
                      onClick={
                        handleResendOtp
                      }
                    >
                      {resendCooldown > 0
                        ? `Resend Code in ${resendCooldown}s`
                        : 'Resend Code'}
                    </button>

                    <button
                      type="button"
                      className="auth-link-btn auth-link-muted"
                      onClick={() => {
                        setIsOtpStep(false)
                        resetOtpFields()
                        setErrorMsg('')

                        setTimeout(() => {
                          // Returning to signup
                          // form automatically.
                        }, 20)
                      }}
                    >
                      ← Change Email
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="auth-submit-btn"
                    disabled={
                      otpDigits.some(
                        (digit) => !digit
                      ) ||
                      isSubmitting
                    }
                  >
                    {isSubmitting
                      ? 'Creating Account...'
                      : 'Verify & Complete Registration ✓'}
                  </button>
                </form>
              </div>
            ) : (
              /* =================================================
                 CREATE ACCOUNT
                 ================================================= */

              <div className="auth-form-flow">
                <h3 className="auth-form-subtitle">
                  Create Account
                </h3>

                {errorMsg && (
                  <div className="auth-clean-alert auth-alert-error">
                    {errorMsg}
                  </div>
                )}

                <form
                  onSubmit={
                    handleRequestOtp
                  }
                  className="auth-fields-stack"
                >
                  <div className="auth-names-grid">
                    <div className="auth-field-group">
                      <label className="auth-label">
                        First Name *
                      </label>

                      <input
                        type="text"
                        className="auth-input-line"
                        value={firstName}
                        onChange={(e) =>
                          setFirstName(
                            e.target.value
                          )
                        }
                        placeholder="Juan"
                        required
                        autoFocus
                      />
                    </div>

                    <div className="auth-field-group">
                      <label className="auth-label">
                        Last Name *
                      </label>

                      <input
                        type="text"
                        className="auth-input-line"
                        value={lastName}
                        onChange={(e) =>
                          setLastName(
                            e.target.value
                          )
                        }
                        placeholder="Dela Cruz"
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-field-group">
                    <label className="auth-label">
                      Birthday
                    </label>

                    <input
                      type="date"
                      className="auth-input-line"
                      value={birthday}
                      max={new Date()
                        .toISOString()
                        .split('T')[0]}
                      onChange={(e) =>
                        setBirthday(
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="auth-field-group">
                    <label className="auth-label">
                      Email Address *
                    </label>

                    <input
                      type="email"
                      className="auth-input-line"
                      value={email}
                      onChange={(e) => {
                        setEmail(
                          e.target.value
                        )

                        if (errorMsg) {
                          setErrorMsg('')
                        }
                      }}
                      placeholder="e.g. juan@gmail.com"
                      required
                    />
                  </div>

                  <div className="auth-field-group">
                    <label className="auth-label">
                      Password *
                    </label>

                    <input
                      type="password"
                      className="auth-input-line"
                      value={signupPassword}
                      onChange={(e) =>
                        setSignupPassword(
                          e.target.value
                        )
                      }
                      placeholder="At least 6 characters"
                      required
                    />
                  </div>

                  <div className="auth-field-group">
                    <label className="auth-label">
                      Confirm Password *
                    </label>

                    <input
                      type="password"
                      className="auth-input-line"
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(
                          e.target.value
                        )
                      }
                      placeholder="Re-enter your password"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="auth-submit-btn"
                    disabled={
                      isCheckingName ||
                      isSubmitting
                    }
                  >
                    {isCheckingName
                      ? 'Verifying Email...'
                      : 'Send Verification Code to Email →'}
                  </button>
                </form>

                <div className="auth-divider-line">
                  <span>or</span>
                </div>

                <div className="auth-switch-prompt">
                  <span>
                    Already have an account?
                  </span>

                  <button
                    type="button"
                    className="auth-link-bold"
                    onClick={() =>
                      handleSwitchMode(
                        'signin'
                      )
                    }
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