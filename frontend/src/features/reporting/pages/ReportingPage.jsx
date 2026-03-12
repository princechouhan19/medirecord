import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import api from '../../../services/api'
import '../styles/reporting.scss'

const TEST_TYPES = ['Sonography','Blood Test','X-Ray','CT Scan','MRI','Other']
const defaultForm = { patient: '', reportType: 'Sonography', diagnosis: '', findings: '' }

export default function ReportingPage() {
  const [reports, setReports] = useState([])
  const [patients, setPatients] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [viewReport, setViewReport] = useState(null)
  const headerRef = useRef(null)

  useEffect(() => {
    gsap.fromTo(headerRef.current, { y: -15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 })
    fetchAll()
  }, [])

  const fetchAll = async () => {
    const [r, p] = await Promise.all([api.get('/reports'), api.get('/patients')])
    setReports(r.data.reports || [])
    setPatients(p.data.patients || [])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/reports', form)
      setShowModal(false)
      setForm(defaultForm)
      fetchAll()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create report')
    } finally { setLoading(false) }
  }

  return (
    <div className="reporting-page">
      <div className="page-header" ref={headerRef}>
        <div>
          <h1>Reports</h1>
          <p>Generate and manage diagnostic reports</p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowModal(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          Create Report
        </button>
      </div>

      <div className="card table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>PATIENT</th><th>REPORT TYPE</th><th>DIAGNOSIS</th><th>DATE</th><th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(r => (
              <tr key={r._id}>
                <td className="td-name">{r.patient?.name}</td>
                <td><span className="badge badge--primary">{r.reportType}</span></td>
                <td>{r.diagnosis}</td>
                <td className="td-muted">{new Date(r.createdAt).toLocaleDateString('en-GB').replace(/\//g, '/')}</td>
                <td>
                  <button className="btn btn--ghost btn--sm" onClick={() => setViewReport(r)}>View</button>
                </td>
              </tr>
            ))}
            {reports.length === 0 && <tr><td colSpan={5} className="empty-row">No reports yet</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal__header">
              <h2>Create Report</h2>
              <button className="modal__close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {error && <div className="auth-error" style={{margin:'16px 24px 0'}}>{error}</div>}
            <form onSubmit={handleSubmit} className="modal__form">
              <div className="form-group">
                <label>Patient *</label>
                <select value={form.patient} onChange={e => setForm({...form, patient: e.target.value})} required>
                  <option value="">Select patient</option>
                  {patients.map(p => <option key={p._id} value={p._id}>{p.name} — {p.testType}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Report Type *</label>
                <select value={form.reportType} onChange={e => setForm({...form, reportType: e.target.value})}>
                  {TEST_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Diagnosis *</label>
                <input value={form.diagnosis} onChange={e => setForm({...form, diagnosis: e.target.value})} required placeholder="e.g. Normal CBC results" />
              </div>
              <div className="form-group">
                <label>Findings</label>
                <textarea value={form.findings} onChange={e => setForm({...form, findings: e.target.value})} placeholder="Detailed clinical findings..." rows={4} />
              </div>
              <div className="modal__footer">
                <button type="button" className="btn btn--outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn--primary" disabled={loading}>{loading ? 'Saving...' : 'Create Report'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewReport && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setViewReport(null)}>
          <div className="modal report-view">
            <div className="modal__header">
              <h2>Report — {viewReport.patient?.name}</h2>
              <button className="modal__close" onClick={() => setViewReport(null)}>✕</button>
            </div>
            <div className="report-view__body">
              <div className="report-view__row"><label>Type</label><span className="badge badge--primary">{viewReport.reportType}</span></div>
              <div className="report-view__row"><label>Diagnosis</label><span>{viewReport.diagnosis}</span></div>
              {viewReport.findings && <div className="report-view__row"><label>Findings</label><span>{viewReport.findings}</span></div>}
              <div className="report-view__row"><label>Date</label><span>{new Date(viewReport.createdAt).toLocaleDateString('en-IN')}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
