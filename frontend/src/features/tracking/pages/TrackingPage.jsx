import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import api from '../../../services/api'
import '../styles/tracking.scss'

const defaultForm = { patient: '', purpose: '', nextVisit: '' }

export default function TrackingPage() {
  const [trackings, setTrackings] = useState([])
  const [patients, setPatients] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [visitModal, setVisitModal] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [visitNote, setVisitNote] = useState('')
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const headerRef = useRef(null)

  useEffect(() => {
    gsap.fromTo(headerRef.current, { y: -15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 })
    fetchAll()
  }, [])

  const fetchAll = async () => {
    const [t, p] = await Promise.all([api.get('/tracking'), api.get('/patients')])
    setTrackings(t.data.trackings || [])
    setPatients(p.data.patients || [])
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/tracking', form)
      setShowModal(false); setForm(defaultForm); fetchAll()
    } catch (err) { alert(err.response?.data?.error || 'Failed') }
    finally { setLoading(false) }
  }

  const handleAddVisit = async (id) => {
    await api.post(`/tracking/${id}/visit`, { date: visitDate, notes: visitNote })
    setVisitModal(null); setVisitNote(''); fetchAll()
  }

  const handleComplete = async (id) => {
    if (!confirm('Mark as completed?')) return
    await api.patch(`/tracking/${id}/complete`)
    fetchAll()
  }

  return (
    <div className="tracking-page">
      <div className="page-header" ref={headerRef}>
        <div>
          <h1>Patient Tracking</h1>
          <p>Track regular checkups and follow-up visits</p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowModal(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Tracking
        </button>
      </div>

      <div className="tracking-grid">
        {trackings.map(t => (
          <div key={t._id} className={`tracking-card card ${t.status === 'Overdue' ? 'tracking-card--overdue' : ''}`}>
            <div className="tracking-card__header">
              <div className="patient-row__avatar">{t.patient?.name?.[0] || 'P'}</div>
              <div className="tracking-card__info">
                <span className="td-name">{t.patient?.name}</span>
                <span className="td-muted">{t.purpose}</span>
              </div>
              <span className={`badge badge--${t.status === 'Overdue' ? 'danger' : 'success'}`}>{t.status}</span>
            </div>

            <div className="tracking-card__next">
              Next visit: <strong className={t.status === 'Overdue' ? 'text-danger' : ''}>
                {new Date(t.nextVisit).toLocaleDateString('en-CA')}
              </strong>
            </div>

            {t.visitHistory?.length > 0 && (
              <div className="tracking-card__history">
                <p className="tracking-card__history-label">VISIT HISTORY</p>
                {t.visitHistory.map((v, i) => (
                  <p key={i} className="tracking-card__history-item">
                    {new Date(v.date).toLocaleDateString('en-CA')} — {v.notes || 'Visit logged'}
                  </p>
                ))}
              </div>
            )}

            <div className="tracking-card__actions">
              <button className="btn btn--outline btn--sm" onClick={() => setVisitModal(t)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Add Visit
              </button>
              <button className="btn btn--outline btn--sm" onClick={() => handleComplete(t._id)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Complete
              </button>
            </div>
          </div>
        ))}
        {trackings.length === 0 && (
          <div className="tracking-empty">
            <p>No active trackings. Start tracking patients!</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal__header">
              <h2>Add Patient Tracking</h2>
              <button className="modal__close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate} className="modal__form">
              <div className="form-group">
                <label>Patient *</label>
                <select value={form.patient} onChange={e => setForm({...form, patient: e.target.value})} required>
                  <option value="">Select patient</option>
                  {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Purpose *</label><input value={form.purpose} onChange={e => setForm({...form, purpose: e.target.value})} required placeholder="e.g. Routine prenatal sonography" /></div>
              <div className="form-group"><label>Next Visit Date *</label><input type="date" value={form.nextVisit} onChange={e => setForm({...form, nextVisit: e.target.value})} required /></div>
              <div className="modal__footer">
                <button type="button" className="btn btn--outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn--primary" disabled={loading}>{loading ? 'Saving...' : 'Add Tracking'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {visitModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setVisitModal(null)}>
          <div className="modal">
            <div className="modal__header">
              <h2>Log Visit — {visitModal.patient?.name}</h2>
              <button className="modal__close" onClick={() => setVisitModal(null)}>✕</button>
            </div>
            <div className="modal__form">
              <div className="form-group"><label>Visit Date</label><input type="date" value={visitDate} onChange={e => setVisitDate(e.target.value)} /></div>
              <div className="form-group"><label>Notes</label><textarea value={visitNote} onChange={e => setVisitNote(e.target.value)} placeholder="Visit notes..." rows={3} /></div>
              <div className="modal__footer">
                <button className="btn btn--outline" onClick={() => setVisitModal(null)}>Cancel</button>
                <button className="btn btn--primary" onClick={() => handleAddVisit(visitModal._id)}>Save Visit</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
