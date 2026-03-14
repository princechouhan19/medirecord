import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import api from '../../../services/api'
import './AdminClinicsPage.scss'

const PLANS = ['free','pro']
const DURATIONS = [{v:1,l:'1 Month'},{v:6,l:'6 Months'},{v:12,l:'1 Year'}]
const SPECS = ['General Medicine','Sonography / Radiology','Pathology','Cardiology','Orthopedics','Pediatrics','Gynecology & Obstetrics','IVF / Fertility','Multispeciality','Other']
const DEF = { name:'',address:'',city:'',state:'',phone:'',email:'',licenseNumber:'',pndtRegNo:'',specialization:'',plan:'free',durationMonths:1,ownerName:'',ownerEmail:'',ownerPassword:'',ownerPhone:'',clinicId:'' }

function ClinicDetailModal({ clinic, onClose, onToggle }) {
  if (!clinic) return null
  const sub = clinic.subscription || {}
  const daysLeft = sub.endDate ? Math.ceil((new Date(sub.endDate) - new Date()) / 86400000) : null

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal--wide">
        <div className="modal__header">
          <div>
            <h2>{clinic.name}</h2>
            <span className="td-mono" style={{fontSize:11}}>{clinic.clinicId}</span>
          </div>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>
        <div className="modal__body">
          {/* Status + badges */}
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:4}}>
            <span className={`badge badge--${clinic.isActive?'green':'red'}`}>{clinic.isActive?'Active':'Suspended'}</span>
            <span className={`badge badge--${sub.plan==='pro'?'teal':'gray'}`}>{sub.plan?.toUpperCase()||'FREE'}</span>
            {daysLeft !== null && daysLeft <= 30 && (
              <span className={`badge badge--${daysLeft<=7?'red':'amber'}`}>⚠ {daysLeft}d left</span>
            )}
          </div>

          {/* Info grid */}
          <div className="clinic-detail-grid">
            {[
              ['Owner', clinic.owner?.name],
              ['Owner Email', clinic.owner?.email],
              ['Specialization', clinic.specialization||'—'],
              ['Phone', clinic.phone||'—'],
              ['Email', clinic.email||'—'],
              ['License No.', clinic.licenseNumber||'—'],
              ['PNDT Reg.', clinic.pndtRegNo||'—'],
              ['City / State', [clinic.city,clinic.state].filter(Boolean).join(', ')||'—'],
              ['Plan Starts', sub.startDate?new Date(sub.startDate).toLocaleDateString('en-IN'):'—'],
              ['Plan Expires', sub.endDate?new Date(sub.endDate).toLocaleDateString('en-IN'):'—'],
              ['Total Patients', clinic._patientCount||0],
              ['Total Staff', clinic._staffCount||0],
            ].map(([l,v])=>(
              <div key={l} className="clinic-detail-row">
                <span className="clinic-detail-row__label">{l}</span>
                <span className="clinic-detail-row__val">{v}</span>
              </div>
            ))}
          </div>

          {clinic.address && (
            <div style={{background:'var(--bg)',borderRadius:8,padding:'10px 12px',fontSize:13,color:'var(--text-2)'}}>
              📍 {clinic.address}
            </div>
          )}
        </div>
        <div className="modal__footer">
          <button className="btn btn--secondary" onClick={onClose}>Close</button>
          <button
            className={`btn btn--${clinic.isActive?'danger':'primary'}`}
            onClick={() => { onToggle(clinic._id); onClose(); }}>
            {clinic.isActive ? '🔴 Suspend Clinic' : '🟢 Activate Clinic'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminClinicsPage() {
  const [clinics, setClinics]       = useState([])
  const [showModal, setShowModal]   = useState(false)
  const [detailClinic, setDetailClinic] = useState(null)
  const [form, setForm]     = useState(DEF)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [search, setSearch] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    gsap.fromTo(ref.current,{y:-16,opacity:0},{y:0,opacity:1,duration:.5})
    fetchClinics()
  },[])

  const fetchClinics = async () => {
    try { const r = await api.get('/clinics'); setClinics(r.data.clinics||[]) } catch(e){}
  }

  const autoId = name => {
    if (!name) return ''
    const prefix = name.trim().split(/\s+/).map(w=>w[0]?.toUpperCase()||'').join('').slice(0,4)
    return `${prefix}-${String(Math.floor(Math.random()*900)+100)}`
  }

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await api.post('/clinics',form); setShowModal(false); setForm(DEF); fetchClinics() }
    catch(err){ setError(err.response?.data?.error||'Failed to create clinic') }
    finally { setLoading(false) }
  }

  const handleToggle = async id => {
    if (!confirm('Toggle clinic status? This will affect all staff.')) return
    await api.patch(`/clinics/${id}/toggle`); fetchClinics()
  }

  const filtered = clinics.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.owner?.name?.toLowerCase().includes(search.toLowerCase()) ||
    (c.clinicId||'').toLowerCase().includes(search.toLowerCase())
  )

  const f = k => ({ value:form[k], onChange:e=>setForm({...form,[k]:e.target.value}) })

  // Expiry notifications
  const expiringSoon = clinics.filter(c => {
    const d = c.subscription?.endDate
    if (!d) return false
    const days = Math.ceil((new Date(d)-new Date())/86400000)
    return days > 0 && days <= 30
  })

  return (
    <div style={{maxWidth:1300}}>
      <div className="page-header" ref={ref}>
        <div><h1>Clinics</h1><p>Manage registered clinic accounts</p></div>
        <button className="btn btn--primary" onClick={()=>setShowModal(true)}>+ Register Clinic</button>
      </div>

      {/* Expiry warnings */}
      {expiringSoon.map(c => {
        const days = Math.ceil((new Date(c.subscription.endDate)-new Date())/86400000)
        return (
          <div key={c._id} className={`notif-bar notif-bar--${days<=7?'danger':'warn'}`}>
            <span className="notif-bar__icon">⚠️</span>
            <span className="notif-bar__text"><strong>{c.name}</strong> subscription expires in <strong>{days} day{days!==1?'s':''}</strong> ({new Date(c.subscription.endDate).toLocaleDateString('en-IN')})</span>
          </div>
        )
      })}

      <div className="search-bar" style={{marginBottom:16}}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input placeholder="Search by clinic name, owner, or clinic ID..." value={search} onChange={e=>setSearch(e.target.value)} />
      </div>

      {/* Mobile: cards */}
      <div className="clinic-cards">
        {filtered.map(c => {
          const daysLeft = c.subscription?.endDate ? Math.ceil((new Date(c.subscription.endDate)-new Date())/86400000) : null
          return (
            <div key={c._id} className="clinic-card card" onClick={()=>setDetailClinic(c)}>
              <div className="clinic-card__header">
                <div className="clinic-card__avatar">{c.name[0]}</div>
                <div className="clinic-card__info">
                  <div className="clinic-card__name">{c.name}</div>
                  <div className="td-muted">{c.clinicId||'No ID'} · {c.owner?.name}</div>
                </div>
                <span className={`badge badge--${c.isActive?'green':'red'}`}>{c.isActive?'Active':'Off'}</span>
              </div>
              <div className="clinic-card__meta">
                <span className={`badge badge--${c.subscription?.plan==='pro'?'teal':'gray'}`}>{c.subscription?.plan?.toUpperCase()}</span>
                {daysLeft!==null && daysLeft<=30 && <span className={`badge badge--${daysLeft<=7?'red':'amber'}`}>⚠ {daysLeft}d</span>}
                <span className="td-muted">{c._patientCount||0} patients</span>
                <span className="td-muted">{c.specialization||'—'}</span>
              </div>
            </div>
          )
        })}
        {filtered.length===0&&<div className="card" style={{padding:40,textAlign:'center',color:'var(--text-3)'}}>No clinics found</div>}
      </div>

      {/* Clinic Detail Modal */}
      <ClinicDetailModal clinic={detailClinic} onClose={()=>setDetailClinic(null)} onToggle={handleToggle} />

      {/* Register Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div className="modal modal--xl">
            <div className="modal__header">
              <h2>Register New Clinic</h2>
              <button className="modal__close" onClick={()=>setShowModal(false)}>✕</button>
            </div>
            {error&&<div className="alert alert--error" style={{margin:'0 20px'}}>{error}</div>}
            <form onSubmit={handleSubmit} className="modal__form">
              <div className="modal__section">Clinic Identity</div>
              <div className="form-grid-2">
                <div className="form-group" style={{gridColumn:'1/-1'}}>
                  <label>Clinic Name *</label>
                  <input {...f('name')} required placeholder="e.g. Life Care Hospital"
                    onChange={e=>setForm({...form,name:e.target.value,clinicId:autoId(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label>Clinic ID *</label>
                  <input {...f('clinicId')} required placeholder="e.g. LCH-001" />
                </div>
                <div className="form-group">
                  <label>Specialization</label>
                  <select {...f('specialization')}><option value="">Select…</option>{SPECS.map(s=><option key={s}>{s}</option>)}</select>
                </div>
                <div className="form-group">
                  <label>License Number</label>
                  <input {...f('licenseNumber')} placeholder="Medical license #" />
                </div>
                <div className="form-group">
                  <label>PNDT Reg. No.</label>
                  <input {...f('pndtRegNo')} />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input {...f('phone')} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" {...f('email')} />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input {...f('city')} />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input {...f('state')} />
                </div>
                <div className="form-group" style={{gridColumn:'1/-1'}}>
                  <label>Full Address</label>
                  <input {...f('address')} />
                </div>
              </div>

              <div className="modal__section">Subscription</div>
              <div className="form-grid-2">
                <div className="form-group"><label>Plan</label>
                  <select {...f('plan')}>{PLANS.map(p=><option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}</select>
                </div>
                <div className="form-group"><label>Duration</label>
                  <select value={form.durationMonths} onChange={e=>setForm({...form,durationMonths:Number(e.target.value)})}>
                    {DURATIONS.map(d=><option key={d.v} value={d.v}>{d.l}</option>)}
                  </select>
                </div>
              </div>

              <div className="modal__section">Clinic Owner Account</div>
              <div className="form-grid-2">
                <div className="form-group"><label>Owner Name *</label><input {...f('ownerName')} required /></div>
                <div className="form-group"><label>Owner Email *</label><input type="email" {...f('ownerEmail')} required /></div>
                <div className="form-group"><label>Password *</label><input type="password" {...f('ownerPassword')} required minLength={6} /></div>
                <div className="form-group"><label>Owner Phone</label><input {...f('ownerPhone')} /></div>
              </div>
            </form>
            <div className="modal__footer">
              <button className="btn btn--secondary" onClick={()=>setShowModal(false)}>Cancel</button>
              <button className="btn btn--primary" onClick={handleSubmit} disabled={loading}>{loading?'Creating…':'Create Clinic + Owner'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
