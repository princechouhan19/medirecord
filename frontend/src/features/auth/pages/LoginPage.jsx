import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import '../styles/auth.scss'

const HOME = {
  superadmin: '/admin', clinic_owner: '/clinic',
  receptionist: '/reception', lab_handler: '/lab', doctor: '/reception',
}

const ROLE_DEMOS = [
  { role: 'Super Admin',    hint: 'Full platform control' },
  { role: 'Clinic Owner',   hint: 'Manage your clinic & staff' },
  { role: 'Receptionist',   hint: 'Register patients & billing' },
  { role: 'Lab Handler',    hint: 'Manage patient queue & tests' },
]

export default function LoginPage() {
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate   = useNavigate()
  const cardRef    = useRef(null)
  const formRef    = useRef(null)

  useEffect(() => {
    gsap.fromTo(cardRef.current, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' })
    gsap.fromTo('.login-feature', { x: -16, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.1, delay: 0.3, duration: 0.5 })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const u = await login(email, password)
      navigate(HOME[u.role] || '/reception', { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password')
      gsap.fromTo(formRef.current, { x: -6 }, { x: 0, duration: 0.4, ease: 'elastic.out(2,0.5)' })
    } finally { setLoading(false) }
  }

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-bg__circle login-bg__circle--1" />
        <div className="login-bg__circle login-bg__circle--2" />
      </div>

      <div className="login-card" ref={cardRef}>
        {/* Left panel */}
        <div className="login-left">
          <div className="login-left__brand">
            <div className="login-left__logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <div className="login-left__name">Medi<span>Record</span></div>
          </div>

          <div className="login-left__tagline">Smart EMR for Modern Clinics</div>
          <div className="login-left__desc">
            Manage your entire clinic — patients, tests, billing, PNDT register — in one place.
          </div>

          <div className="login-features">
            {[
              { icon: '📡', text: 'Live patient queue with role-based access' },
              { icon: '💳', text: 'Auto-billing with test fee configuration' },
              { icon: '📋', text: 'Digital Form F / PNDT 12-column register' },
              { icon: '🔬', text: 'Lab handler workflow & audit logs' },
            ].map((f, i) => (
              <div key={i} className="login-feature">
                <span className="login-feature__icon">{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>

          <div className="login-roles">
            {ROLE_DEMOS.map(r => (
              <div key={r.role} className="login-role">
                <div className="login-role__name">{r.role}</div>
                <div className="login-role__hint">{r.hint}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="login-right" ref={formRef}>
          <div className="login-right__header">
            <div className="login-right__logo-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="16" height="16" strokeLinecap="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <span>MediRecord</span>
          </div>

          <h2 className="login-right__title">Sign in</h2>
          <p className="login-right__sub">Enter your credentials to continue</p>

          {error && (
            <div className="login-error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-form__group">
              <label>Email address</label>
              <div className="login-form__input-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@clinic.com" required autoComplete="email"
                />
              </div>
            </div>

            <div className="login-form__group">
              <label>Password</label>
              <div className="login-form__input-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Your password" required autoComplete="current-password"
                />
                <button type="button" className="login-form__eye" onClick={() => setShowPass(!showPass)}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button type="submit" className="login-form__submit" disabled={loading}>
              {loading ? (
                <><span className="login-spinner" /> Signing in…</>
              ) : (
                <>Sign in <span>→</span></>
              )}
            </button>
          </form>

          <div className="login-right__footer">
            MediRecord © {new Date().getFullYear()} — Built for Indian Clinics
          </div>
        </div>
      </div>
    </div>
  )
}
