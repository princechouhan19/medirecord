import { printPatientRecordById } from '../components/PatientRecordSheet'
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { useAuth } from '../../auth/hooks/useAuth'
import api from '../../../services/api'

export default function ReceptionDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ total: 0, waiting: 0, in_progress: 0, completed: 0 })
  const [recent, setRecent] = useState([])
  const ref = useRef(null)

  useEffect(() => {
    gsap.fromTo(ref.current, { y: -16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 })
    Promise.all([api.get('/patients/today'), api.get('/patients/stats')])
      .then(([t]) => {
        setStats(t.data.stats || {})
        setRecent((t.data.patients || []).slice(0, 8))
      })
      .catch(() => {})
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
  const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div style={{ maxWidth: 1100 }}>
      <div className="page-header" ref={ref}>
        <div>
          <h1>Good {greeting}, {user?.name?.split(' ')[0]}! 👋</h1>
          <p>{dateStr}</p>
        </div>
        <Link to="/reception/register" className="btn btn--primary btn--lg">+ Register Patient</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: "Today's Patients", val: stats.total, color: 'var(--teal)', link: '/reception/queue' },
          { label: 'Waiting', val: stats.waiting, color: '#D97706', link: '/reception/queue' },
          { label: 'In Progress', val: stats.in_progress, color: 'var(--blue)', link: '/reception/queue' },
          { label: 'Completed', val: stats.completed, color: 'var(--green)', link: '/reception/queue' },
        ].map(s => (
          <Link to={s.link} key={s.label} className="card"
            style={{ padding: 18, textDecoration: 'none', display: 'block', borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontFamily: 'var(--font-num)', fontSize: 30, fontWeight: 800, color: s.color }}>{s.val ?? 0}</div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600, marginTop: 3 }}>{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700 }}>Today's Queue</h3>
          <Link to="/reception/queue" style={{ color: 'var(--teal)', fontSize: 12, fontWeight: 600 }}>View live →</Link>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>#</th><th>Patient</th><th>Test</th><th>Fee</th><th>Status</th><th>Time</th></tr>
          </thead>
          <tbody>
            {recent.map(p => (
              <tr key={p._id}>
                <td className="td-mono">#{String(p.tokenNo).padStart(3, '0')}</td>
                <td>
                  <div className="td-name">{p.name}</div>
                  <div className="td-muted">{p.age}y · {p.gender}</div>
                </td>
                <td>
                  <div style={{ fontSize: 12.5 }}>{p.testName}</div>
                  <div className="td-muted">{p.testCategory}</div>
                </td>
                <td><span style={{ fontFamily: 'var(--font-num)', fontWeight: 700 }}>₹{p.fee}</span></td>
                <td>
                  <span className={`badge badge--${p.status === 'waiting' ? 'amber' : p.status === 'in_progress' ? 'blue' : p.status === 'completed' ? 'green' : 'gray'}`}>
                    {p.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="td-muted">{new Date(p.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                <td>
                  <button className="btn btn--ghost btn--sm" title="Print A4 Record" onClick={() => printPatientRecordById(p._id)}>🖨</button>
                </td>
              </tr>
            ))}
            {recent.length === 0 && (
              <tr><td colSpan={6} className="empty-row">No patients registered today yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
