import { printPatientRecordById } from '../../reception/components/PatientRecordSheet'
import { useState, useEffect, useRef, useCallback } from 'react'
import { gsap } from 'gsap'
import { useAuth } from '../../auth/hooks/useAuth'
import api from '../../../services/api'
import './LiveQueuePage.scss'

const S = {
  waiting:     { label: 'Waiting',     cls: 'amber',  icon: '⏳' },
  in_progress: { label: 'In Progress', cls: 'blue',   icon: '🔬' },
  completed:   { label: 'Completed',   cls: 'green',  icon: '✅' },
  cancelled:   { label: 'Cancelled',   cls: 'gray',   icon: '✕' },
}
const PAY = { cash:'💵', upi:'📱', card:'💳', pending:'⌛' }

function QCard({ p, onStatus, canStart, canComplete }) {
  const m = S[p.status] || S.waiting
  return (
    <div className={`qcard qcard--${p.status}`}>
      <div className="qcard__header">
        <span className="qcard__token">#{String(p.tokenNo).padStart(3,'0')}</span>
        <span className={`badge badge--${m.cls}`}>{m.icon} {m.label}</span>
      </div>
      <div className="qcard__name">{p.name}</div>
      <div className="qcard__meta">{p.age} yrs · {p.gender} · {p.phone}</div>
      <div className="qcard__test">
        <span className="qcard__cat">{p.testCategory}</span>
        <span className="qcard__tname">→ {p.testName}</span>
      </div>
      {(p.referredDoctor?.name || p.referredBy) && (
        <div className="qcard__ref">👨‍⚕️ Ref: {p.referredDoctor?.name || p.referredBy}</div>
      )}
      {p.relativeName && (
        <div className="qcard__ref">{p.relationType||'H/O'}: {p.relativeName}</div>
      )}
      {!p.relativeName && p.husbandName && (
        <div className="qcard__ref">H/O: {p.husbandName}</div>
      )}
      {p.fformRequired && (
        <div className="qcard__fform">📋 F-Form Required</div>
      )}
      {p.weeksOfPregnancy > 0 && (
        <div className="qcard__ref">🤱 {p.weeksOfPregnancy}w {p.daysOfPregnancy||0}d pregnant</div>
      )}
      <div className="qcard__fee">
        <strong>₹{p.fee}</strong>
        <span className={`badge badge--${p.isPaid ? 'green' : 'amber'}`}>{PAY[p.paymentMode]} {p.isPaid ? 'Paid' : 'Pending'}</span>
      </div>
      {p.assignedTo && <div className="qcard__handler">Lab: {p.assignedTo.name}</div>}
      <div className="qcard__actions">
        {p.status === 'waiting' && canStart && (
          <button className="btn btn--primary btn--sm" onClick={() => onStatus(p._id,'in_progress')}>▶ Start</button>
        )}
        {p.status === 'in_progress' && canComplete && (
          <button className="btn btn--primary btn--sm" onClick={() => onStatus(p._id,'completed')}>✓ Complete</button>
        )}
        {p.status === 'waiting' && (
          <button className="btn btn--ghost btn--sm" onClick={() => onStatus(p._id,'cancelled')}>Cancel</button>
        )}
        {p.completedAt && (
          <span className="qcard__time">{new Date(p.completedAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</span>
        )}
        <button className="btn btn--ghost btn--sm" title="Print A4 Record" style={{marginLeft:'auto'}}
          onClick={() => printPatientRecordById(p._id)}>🖨</button>
      </div>
    </div>
  )
}

export default function LiveQueuePage() {
  const { role } = useAuth()
  const [patients, setPatients] = useState([])
  const [stats, setStats]   = useState({total:0,waiting:0,in_progress:0,completed:0})
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const headerRef = useRef(null)

  const fetch = useCallback(async () => {
    try {
      const r = await api.get('/patients/today')
      setPatients(r.data.patients || [])
      setStats(r.data.stats || {})
    } catch(e){} finally { setLoading(false) }
  }, [])

  useEffect(() => {
    gsap.fromTo(headerRef.current,{y:-16,opacity:0},{y:0,opacity:1,duration:.5})
    fetch()
    const t = setInterval(fetch, 15000)
    return () => clearInterval(t)
  }, [fetch])

  const handleStatus = async (id, status) => {
    try { await api.patch(`/patients/${id}/status`,{status}); fetch() }
    catch(e){ alert(e.response?.data?.error||'Failed') }
  }

  const canStart    = ['lab_handler','clinic_owner'].includes(role)
  const canComplete = ['lab_handler','clinic_owner'].includes(role)
  const filtered    = filter === 'all' ? patients : patients.filter(p => p.status === filter)

  return (
    <div className="queue-page">
      <div className="page-header" ref={headerRef}>
        <div>
          <h1>Live Queue <span className="live-badge"><span className="live-dot"/>LIVE</span></h1>
          <p>Today's patients · Auto-refreshes every 15 seconds</p>
        </div>
        <button className="btn btn--secondary" onClick={fetch}>⟳ Refresh</button>
      </div>

      <div className="queue-stats-row">
        {[
          {key:'all',        label:'Total Today', val:stats.total,       c:'teal'},
          {key:'waiting',    label:'Waiting',     val:stats.waiting,     c:'amber'},
          {key:'in_progress',label:'In Progress', val:stats.in_progress, c:'blue'},
          {key:'completed',  label:'Completed',   val:stats.completed,   c:'green'},
        ].map(s=>(
          <button key={s.key} className={`qstat qstat--${s.c}${filter===s.key?' qstat--on':''}`} onClick={()=>setFilter(s.key)}>
            <span className="qstat__val">{s.val??0}</span>
            <span className="qstat__label">{s.label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="queue-empty">Loading queue...</div>
      ) : filtered.length === 0 ? (
        <div className="queue-empty">
          <div style={{fontSize:'3rem',marginBottom:'12px'}}>🏥</div>
          <div>{filter==='all'?'No patients registered today yet.':`No ${filter.replace('_',' ')} patients.`}</div>
        </div>
      ) : (
        <div className="queue-grid">
          {filtered.map(p=>(
            <QCard key={p._id} p={p} onStatus={handleStatus} canStart={canStart} canComplete={canComplete}/>
          ))}
        </div>
      )}
    </div>
  )
}
