import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
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

  // Form states
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [birthday, setBirthday] = useState('')
  const [email, setEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [selectedRole, setSelectedRole] = useState('customer') // 'customer' | 'admin'
  const [errorMsg, setErrorMsg] = useState('')
  const [forgotPasswordNotice, setForgotPasswordNotice] = useState(false)

  if (!isAuthModalOpen) return null

  const handleSignInSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    if (!usernameOrEmail.trim() || !password.trim()) {
      setErrorMsg('Please enter your username/email and password.')
      return
    }

    const res = await login({
      identifier: usernameOrEmail,
      password: password,
      roleOverride: selectedRole,
    })

    if (res?.user?.role === 'admin' && onAdminLoggedIn) {
      onAdminLoggedIn()
    }
  }

  const handleSignUpSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    if (!username.trim() || !email.trim() || !signupPassword.trim()) {
      setErrorMsg('Please fill in all required fields.')
      return
    }

    const res = await signup({
      username: username,
      birthday: birthday,
      email: email,
      password: signupPassword,
      role: selectedRole,
    })

    if (res?.user?.role === 'admin' && onAdminLoggedIn) {
      onAdminLoggedIn()
    }
  }

  const handleQuickFillAdmin = () => {
    setUsernameOrEmail('admin')
    setPassword('admin123')
    setSelectedRole('admin')
  }

  return (
    <div className="auth-modal-backdrop" onClick={closeAuthModal}>
      <div
        className="auth-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          className="auth-close-btn"
          onClick={closeAuthModal}
          aria-label="Close"
        >
          ✕
        </button>

        {/* Modal Dual Frame */}
        <div className="auth-modal-content">
          {/* Left Column: Resort Visual */}
          <div className="auth-visual-side">
            <img
              src={galleryImg}
              alt="Polchat Garden Resort"
              className="auth-visual-image"
            />
            <div className="auth-visual-overlay">
              <div className="auth-visual-badge">POLCHAT RESORT</div>
              <p className="auth-visual-subtitle">Serene Garden & Pool Experience</p>
            </div>
          </div>

          {/* Right Column: Form Area */}
          <div className="auth-form-side">
            <div className="auth-brand-header">
              <h2 className="auth-resort-title">Polchat Garden Resort</h2>
              <div className="auth-title-underline"></div>
            </div>

            {authModalMode === 'signin' ? (
              // SIGN IN MODE
              <div className="auth-form-flow">
                <h3 className="auth-form-subtitle">Welcome to POLCHAT!</h3>

                {errorMsg && <div className="auth-msg-alert auth-msg-error">{errorMsg}</div>}
                {forgotPasswordNotice && (
                  <div className="auth-msg-alert auth-msg-success">
                    Password reset instructions sent to your email!
                  </div>
                )}

                <form onSubmit={handleSignInSubmit} className="auth-fields-stack">
                  <div className="auth-field-row">
                    <label className="auth-label">Username or Email</label>
                    <input
                      type="text"
                      className="auth-input-line"
                      value={usernameOrEmail}
                      onChange={(e) => setUsernameOrEmail(e.target.value)}
                      placeholder="Enter your username or email"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="auth-field-row">
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

                  <div className="auth-actions-helper-row">
                    <div className="auth-role-toggles">
                      <button
                        type="button"
                        className={
                          selectedRole === 'customer'
                            ? 'auth-role-btn auth-role-btn-active'
                            : 'auth-role-btn'
                        }
                        onClick={() => setSelectedRole('customer')}
                      >
                        Customer
                      </button>
                      <button
                        type="button"
                        className={
                          selectedRole === 'admin'
                            ? 'auth-role-btn auth-role-btn-active'
                            : 'auth-role-btn'
                        }
                        onClick={() => setSelectedRole('admin')}
                      >
                        Admin
                      </button>
                    </div>

                    <button
                      type="button"
                      className="auth-forgot-btn"
                      onClick={() => setForgotPasswordNotice(true)}
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button type="submit" className="auth-submit-pill-btn">
                    Sign in
                  </button>
                </form>

                <div className="auth-divider-section">
                  <span className="auth-divider-text">or</span>
                </div>

                <div className="auth-switch-prompt">
                  <span className="auth-switch-desc">New Member? </span>
                  <button
                    type="button"
                    className="auth-switch-link"
                    onClick={() => {
                      setErrorMsg('')
                      setAuthModalMode('signup')
                    }}
                  >
                    Create Account
                  </button>
                </div>

                {/* Admin Quick Credentials Info */}
                <div className="auth-admin-hint-bar">
                  <span className="auth-hint-text">Staff / Admin Login:</span>
                  <button
                    type="button"
                    className="auth-quick-fill-btn"
                    onClick={handleQuickFillAdmin}
                  >
                    Fill Admin (admin / admin123)
                  </button>
                </div>
              </div>
            ) : (
              // SIGN UP MODE
              <div className="auth-form-flow">
                <h3 className="auth-form-subtitle">Create an account</h3>

                {errorMsg && <div className="auth-msg-alert auth-msg-error">{errorMsg}</div>}

                <form onSubmit={handleSignUpSubmit} className="auth-fields-stack">
                  <div className="auth-field-row">
                    <label className="auth-label">Username</label>
                    <input
                      type="text"
                      className="auth-input-line"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Choose a username"
                      required
                    />
                  </div>

                  <div className="auth-field-row">
                    <label className="auth-label">Birthday</label>
                    <input
                      type="date"
                      className="auth-input-line"
                      value={birthday}
                      onChange={(e) => setBirthday(e.target.value)}
                    />
                  </div>

                  <div className="auth-field-row">
                    <label className="auth-label">Email</label>
                    <input
                      type="email"
                      className="auth-input-line"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>

                  <div className="auth-field-row">
                    <label className="auth-label">Password</label>
                    <input
                      type="password"
                      className="auth-input-line"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Create a password"
                      required
                    />
                  </div>

                  <div className="auth-role-selection-box">
                    <span className="auth-label">Account Type:</span>
                    <div className="auth-role-toggles">
                      <button
                        type="button"
                        className={
                          selectedRole === 'customer'
                            ? 'auth-role-btn auth-role-btn-active'
                            : 'auth-role-btn'
                        }
                        onClick={() => setSelectedRole('customer')}
                      >
                        Customer
                      </button>
                      <button
                        type="button"
                        className={
                          selectedRole === 'admin'
                            ? 'auth-role-btn auth-role-btn-active'
                            : 'auth-role-btn'
                        }
                        onClick={() => setSelectedRole('admin')}
                      >
                        Admin
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="auth-submit-pill-btn">
                    Create Account
                  </button>
                </form>

                <div className="auth-divider-section">
                  <span className="auth-divider-text">or</span>
                </div>

                <div className="auth-switch-prompt">
                  <span className="auth-switch-desc">Already have an account? </span>
                  <button
                    type="button"
                    className="auth-switch-link"
                    onClick={() => {
                      setErrorMsg('')
                      setAuthModalMode('signin')
                    }}
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
