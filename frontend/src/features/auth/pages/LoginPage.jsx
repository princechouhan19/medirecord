import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import '../styles/auth.scss'

const HOME = {
  superadmin: '/admin', clinic_owner: '/clinic',
  receptionist: '/reception', lab_handler: '/lab', doctor: '/reception',
}

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { login } = useAuth()
  const navigate   = useNavigate()
  const wrapRef    = useRef(null)
  const formRef    = useRef(null)

  useEffect(() => {
    gsap.fromTo(wrapRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    )
  }, [])

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const u = await login(email, password)
      navigate(HOME[u.role] || '/reception', { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password')
      gsap.fromTo(formRef.current, { x: -8 }, { x: 0, duration: 0.35, ease: 'elastic.out(1.5, 0.4)' })
    } finally { setLoading(false) }
  }

  return (
    <div className="lp">
      {/* Subtle dot-grid background */}
      <div className="lp__bg" aria-hidden />

      <div className="lp__card" ref={wrapRef}>
        {/* ── Left: form ── */}
        <div className="lp__form-side" ref={formRef}>
          <div className="lp__logo">
            <img src="/logo.png" alt="MediRecord" />
          </div>

          <h1 className="lp__title">Login To Your Account!</h1>
          <p className="lp__sub">Enter your credentials to access the dashboard</p>

          {error && (
            <div className="lp__error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="lp__fields">
            <div className="lp__field">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="lp__field lp__field--pass">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button type="button" className="lp__eye" onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                {showPass
                  ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>

            <div className="lp__row">
              <label className="lp__remember">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                <span>Remember Me</span>
              </label>
              <button type="button" className="lp__forgot">Forgot Password?</button>
            </div>

            <button type="submit" className="lp__submit" disabled={loading}>
              {loading
                ? <><span className="lp__spinner" /> Signing in…</>
                : 'Login'
              }
            </button>
          </form>

          <div className="lp__footer">
            MediRecord © {new Date().getFullYear()} · Smart EMR for Indian Clinics
          </div>
        </div>

        {/* ── Right: illustration ── */}
        <div className="lp__illus-side">
          <div className="lp__illus-inner">
            <img src="/loginillustration.png" alt="Doctor illustration" className="lp__illus-img" />
          </div>
        </div>
      </div>
    </div>
  )
}
