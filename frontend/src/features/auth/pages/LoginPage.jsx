import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import '../styles/auth.scss'

export default function LoginPage() {
  const [email, setEmail] = useState('demo@medirecord.in')
  const [password, setPassword] = useState('demo1234')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const leftRef = useRef(null)
  const rightRef = useRef(null)

  useEffect(() => {
    gsap.fromTo(leftRef.current, { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' })
    gsap.fromTo(rightRef.current, { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.1 })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Left Panel */}
        <div className="auth-card__left" ref={leftRef}>
          <div className="auth-card__left-content">
            <h1>MediRecord — Your Smart EMR</h1>
            <p>Trusted by clinics for seamless patient management</p>
            <div className="auth-features">
              {[
                { text: 'Generate diagnostic reports with auto-filled patient data', badge: 'NEW' },
                { text: 'Register patients via Aadhaar for instant verification' },
                { text: 'Smart reminders for upcoming & overdue patient visits' },
                { text: 'AI-assisted ICD-10 code suggestions on F-Form' },
              ].map((f, i) => (
                <div className="auth-feature" key={i}>
                  <div className="auth-feature__icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>
                  <div>
                    <span>{f.text}</span>
                    {f.badge && <span className="auth-feature__badge">{f.badge}</span>}
                  </div>
                </div>
              ))}
            </div>
            <div className="auth-card__left-doctor">
              <div className="doctor-placeholder">👨‍⚕️</div>
            </div>
          </div>
          <div className="auth-card__left-footer">
            <span>Need help? Call us @1800-123-4567</span>
            <span>T&C apply*</span>
          </div>
        </div>

        {/* Right Panel */}
        <div className="auth-card__right" ref={rightRef}>
          <div className="auth-logo">
            <img src="/logo.png" alt="MediRecord Logo" />
          </div>

          <h2>Sign in</h2>
          <p className="auth-subtitle">Welcome back! Please enter your details.</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="auth-pass-wrap">
                <input type={showPass ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" className="auth-pass-toggle" onClick={() => setShowPass(!showPass)}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="auth-form__row">
              <label className="auth-checkbox">
                <input type="checkbox" /> Remember Me
              </label>
              <a href="#" className="auth-link">Forgot Password</a>
            </div>

            <button className="btn btn--primary auth-submit" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="auth-tos">
            By clicking 'Sign In', you acknowledge the <a href="#" className="auth-link">Terms of Services</a> and <a href="#" className="auth-link">Privacy Policy</a>
          </p>

          <p className="auth-demo">Not an existing user? <a href="#" className="auth-link">Try Demo</a></p>

          <p className="auth-copy">MediRecord © 2024 — Built for modern clinics</p>
        </div>
      </div>
    </div>
  )
}
