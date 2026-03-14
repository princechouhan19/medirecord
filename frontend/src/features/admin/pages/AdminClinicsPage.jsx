import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import api from '../../../services/api'

const PLANS = ['free','pro']
const DURATIONS = [{v:1,l:'1 Month'},{v:6,l:'6 Months'},{v:12,l:'1 Year'}]
const SPECS = ['General Medicine','Sonography / Radiology','Pathology','Cardiology','Orthopedics','Pediatrics','Gynecology & Obstetrics','IVF / Fertility','Multispeciality','Other']
const DEF = { name:'',address:'',city:'',state:'',phone:'',email:'',licenseNumber:'',pndtRegNo:'',specialization:'',plan:'free',durationMonths:1,ownerName:'',ownerEmail:'',ownerPassword:'',ownerPhone:'',clinicId:'' }

export default function AdminClinicsPage() {
  const [clinics, setClinics]   = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]   = useState(DEF)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [search, setSearch]   = useState('')
  const ref = useRef(null)

  useEffect(()=>{ gsap.fromTo(ref.current,{y:-16,opacity:0},{y:0,opacity:1,duration:.5}); fetchClinics() },[])

  const fetchClinics = async () => {
    try { const r = await api.get('/clinics'); setClinics(r.data.clinics||[]) } catch(e){}
  }

  // Auto-generate clinic ID suggestion
  const autoId = (name) => {
    if (!name) return ''
    const words = name.trim().split(/\s+/)
    const prefix = words.map(w=>w[0]?.toUpperCase()||'').join('').slice(0,4)
    return `${prefix}-${String(Math.floor(Math.random()*900)+100)}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      await api.post('/clinics', form)
      setShowModal(false); setForm(DEF); fetchClinics()
    } catch(err) { setError(err.response?.data?.error||'Failed') }
    finally { setLoading(false) }
  }

  const handleToggle = async (id) => {
    if (!confirm('Toggle clinic status? This will affect all staff.')) return
    await api.patch(`/clinics/${id}/toggle`); fetchClinics()
  }

  const filtered = clinics.filter(c=>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.owner?.name?.toLowerCase().includes(search.toLowerCase()) ||
    (c.clinicId||'').toLowerCase().includes(search.toLowerCase())
  )

  const f = k => ({ value:form[k], onChange:e=>setForm({...form,[k]:e.target.value}) })

  return (
    <div style={{maxWidth:1300}}>
      <div className="page-header" ref={ref}>
        <div><h1>Clinics</h1><p>Manage registered clinic accounts</p></div>
        <button className="btn btn--primary" onClick={()=>setShowModal(true)}>+ Register Clinic</button>
      </div>

      <div className="search-bar" style={{marginBottom:'16px'}}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input placeholder="Search by clinic name, owner, or clinic ID..." value={search} onChange={e=>setSearch(e.target.value)} />
      </div>

      <div className="card" style={{overflow:'hidden'}}>
        <table className="data-table">
          <thead><tr><th>Clinic ID</th><th>Clinic</th><th>Owner</th><th>Specialization</th><th>Plan</th><th>Expires</th><th>Patients</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {filtered.map(c=>(
              <tr key={c._id}>
                <td><span className="td-mono">{c.clinicId||<span className="td-muted">Not assigned</span>}</span></td>
                <td>
                  <div className="td-name">{c.name}</div>
                  <div className="td-muted">{c.city}{c.city&&c.state?', ':''}{c.state}</div>
                </td>
                <td>
                  <div style={{fontSize:'13px',fontWeight:600}}>{c.owner?.name}</div>
                  <div className="td-muted">{c.owner?.email}</div>
                </td>
                <td className="td-muted">{c.specialization||'—'}</td>
                <td><span className={`badge badge--${c.subscription?.plan==='pro'?'teal':'gray'}`}>{c.subscription?.plan?.toUpperCase()}</span></td>
                <td className="td-muted">{c.subscription?.endDate?new Date(c.subscription.endDate).toLocaleDateString('en-IN'):'—'}</td>
                <td className="td-mono">{c._patientCount||0}</td>
                <td><span className={`badge badge--${c.isActive?'green':'red'}`}>{c.isActive?'Active':'Suspended'}</span></td>
                <td>
                  <button className={`btn btn--sm btn--${c.isActive?'danger':'secondary'}`} onClick={()=>handleToggle(c._id)}>
                    {c.isActive?'Suspend':'Activate'}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length===0&&<tr><td colSpan={9} className="empty-row">No clinics found</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal&&(
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div className="modal modal--xl">
            <div className="modal__header">
              <h2>Register New Clinic</h2>
              <button className="modal__close" onClick={()=>setShowModal(false)}>✕</button>
            </div>
            {error&&<div className="alert alert--error" style={{margin:'0 24px 0'}}>{error}</div>}
            <form onSubmit={handleSubmit} className="modal__form">
              <div className="modal__section">Clinic Identity</div>
              <div className="form-grid-3">
                <div className="form-group" style={{gridColumn:'1/-1'}}>
                  <label>Clinic Name *</label>
                  <input {...f('name')} required placeholder="e.g. Life Care Hospital" onChange={e=>{setForm({...form,name:e.target.value,clinicId:autoId(e.target.value)})}} />
                </div>
                <div className="form-group">
                  <label>Clinic ID (assigned by you) *</label>
                  <input {...f('clinicId')} required placeholder="e.g. LCH-001" />
                </div>
                <div className="form-group">
                  <label>License Number</label>
                  <input {...f('licenseNumber')} placeholder="Medical license #" />
                </div>
                <div className="form-group">
                  <label>PNDT Reg. No.</label>
                  <input {...f('pndtRegNo')} placeholder="PNDT registration" />
                </div>
                <div className="form-group" style={{gridColumn:'1/-1'}}>
                  <label>Specialization</label>
                  <select {...f('specialization')}><option value="">Select…</option>{SPECS.map(s=><option key={s}>{s}</option>)}</select>
                </div>
                <div className="form-group"><label>Phone</label><input {...f('phone')} /></div>
                <div className="form-group"><label>Email</label><input type="email" {...f('email')} /></div>
                <div className="form-group"><label>City</label><input {...f('city')} /></div>
                <div className="form-group" style={{gridColumn:'1/-1'}}><label>Full Address</label><input {...f('address')} /></div>
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

              <div className="modal__section">Clinic Owner Login Account</div>
              <div className="form-grid-2">
                <div className="form-group"><label>Owner Name *</label><input {...f('ownerName')} required /></div>
                <div className="form-group"><label>Owner Email *</label><input type="email" {...f('ownerEmail')} required /></div>
                <div className="form-group"><label>Password *</label><input type="password" {...f('ownerPassword')} required minLength={6} /></div>
                <div className="form-group"><label>Owner Phone</label><input {...f('ownerPhone')} /></div>
              </div>
            </form>
            <div className="modal__footer">
              <button className="btn btn--secondary" onClick={()=>setShowModal(false)}>Cancel</button>
              <button className="btn btn--primary" onClick={handleSubmit} disabled={loading}>{loading?'Creating…':'Create Clinic + Owner Account'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
