import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import api from '../../../services/api'

const ROLES = [
  { val:'receptionist', label:'Receptionist (Staff 1)', desc:'Registers patients, fills F-Form, collects fees' },
  { val:'lab_handler',  label:'Lab Handler (Staff 2)',  desc:'Takes patients, runs tests, marks complete' },
  { val:'doctor',       label:'Doctor',                 desc:'Referenced doctor, can view patient records' },
]

const ROLE_COLOR = { receptionist:'teal', lab_handler:'blue', doctor:'green', clinic_owner:'purple' }
const ROLE_LABEL = { receptionist:'Receptionist', lab_handler:'Lab Handler', doctor:'Doctor', clinic_owner:'Clinic Owner' }

const DEF = { name:'', email:'', password:'', role:'receptionist', phone:'' }

export default function ClinicStaffPage() {
  const [staff, setStaff]       = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]   = useState(DEF)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const ref = useRef(null)

  useEffect(()=>{ gsap.fromTo(ref.current,{y:-16,opacity:0},{y:0,opacity:1,duration:.5}); fetchStaff() },[])

  const fetchStaff = async () => {
    try { const r = await api.get('/clinics/my/staff'); setStaff(r.data.staff||[]) } catch(e){}
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await api.post('/clinics/my/staff',form); setShowModal(false); setForm(DEF); fetchStaff() }
    catch(err){ setError(err.response?.data?.error||'Failed') }
    finally{ setLoading(false) }
  }

  const handleToggle = async (userId) => {
    await api.patch(`/clinics/my/staff/${userId}/toggle`); fetchStaff()
  }

  const f = k => ({ value:form[k], onChange:e=>setForm({...form,[k]:e.target.value}) })

  return (
    <div style={{maxWidth:1000}}>
      <div className="page-header" ref={ref}>
        <div><h1>Staff Management</h1><p>Manage your clinic team — receptionists, lab handlers, and doctors</p></div>
        <button className="btn btn--primary" onClick={()=>setShowModal(true)}>+ Add Staff Member</button>
      </div>

      {/* Role info boxes */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'24px'}}>
        {ROLES.map(r=>{
          const count = staff.filter(s=>s.role===r.val&&s.isActive).length
          return (
            <div key={r.val} className="card" style={{padding:'16px',borderLeft:`3px solid var(--${ROLE_COLOR[r.val]})`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                <div>
                  <div style={{fontSize:'13px',fontWeight:700}}>{r.label.split('(')[0].trim()}</div>
                  <div style={{fontSize:'11px',color:'var(--text-2)',marginTop:'3px'}}>{r.desc}</div>
                </div>
                <span style={{fontFamily:'var(--font-num)',fontSize:'22px',fontWeight:800,color:`var(--${ROLE_COLOR[r.val]})`}}>{count}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'14px'}}>
        {staff.map(s=>(
          <div key={s._id} className="card" style={{padding:'18px',opacity:s.isActive?1:.6}}>
            <div style={{display:'flex',gap:'12px',marginBottom:'12px'}}>
              <div style={{width:'42px',height:'42px',borderRadius:'50%',background:`var(--${ROLE_COLOR[s.role]||'teal'}-light,var(--teal-light))`,color:`var(--${ROLE_COLOR[s.role]||'teal'}-dark,var(--teal-dark))`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:'16px',flexShrink:0}}>
                {s.name[0]}
              </div>
              <div>
                <div style={{fontWeight:700,fontSize:'14px'}}>{s.name}</div>
                <div style={{fontSize:'11px',color:'var(--text-3)'}}>{s.email}</div>
              </div>
            </div>
            <div style={{display:'flex',gap:'6px',flexWrap:'wrap',marginBottom:'10px'}}>
              <span className={`badge badge--${ROLE_COLOR[s.role]||'gray'}`}>{ROLE_LABEL[s.role]||s.role}</span>
              <span className={`badge badge--${s.isActive?'green':'red'}`}>{s.isActive?'Active':'Inactive'}</span>
            </div>
            {s.phone&&<div style={{fontSize:'12px',color:'var(--text-2)',marginBottom:'10px'}}>📞 {s.phone}</div>}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:'10px',borderTop:'1px solid var(--border)'}}>
              <span style={{fontSize:'11px',color:'var(--text-3)'}}>Added {new Date(s.createdAt).toLocaleDateString('en-IN')}</span>
              {s.role!=='clinic_owner'&&(
                <button className={`btn btn--sm btn--${s.isActive?'danger':'secondary'}`} onClick={()=>handleToggle(s._id)}>
                  {s.isActive?'Deactivate':'Activate'}
                </button>
              )}
            </div>
          </div>
        ))}
        {staff.length===0&&(
          <div className="card" style={{gridColumn:'1/-1',padding:'60px',textAlign:'center',color:'var(--text-3)'}}>
            No staff members yet. Add your first team member.
          </div>
        )}
      </div>

      {showModal&&(
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div className="modal">
            <div className="modal__header">
              <h2>Add Staff Member</h2>
              <button className="modal__close" onClick={()=>setShowModal(false)}>✕</button>
            </div>
            {error&&<div className="alert alert--error" style={{margin:'0 24px 8px'}}>{error}</div>}
            <div className="modal__form">
              <div className="form-group"><label>Role *</label>
                <select {...f('role')}>
                  {ROLES.map(r=><option key={r.val} value={r.val}>{r.label}</option>)}
                </select>
              </div>
              <div style={{background:'var(--bg)',borderRadius:'8px',padding:'10px 14px',fontSize:'12px',color:'var(--text-2)'}}>
                {ROLES.find(r=>r.val===form.role)?.desc}
              </div>
              <div className="form-grid-2">
                <div className="form-group"><label>Full Name *</label><input {...f('name')} required /></div>
                <div className="form-group"><label>Phone</label><input {...f('phone')} /></div>
              </div>
              <div className="form-group"><label>Email (Login) *</label><input type="email" {...f('email')} required /></div>
              <div className="form-group"><label>Password *</label><input type="password" {...f('password')} required minLength={6} placeholder="Min 6 characters" /></div>
            </div>
            <div className="modal__footer">
              <button className="btn btn--secondary" onClick={()=>setShowModal(false)}>Cancel</button>
              <button className="btn btn--primary" onClick={handleSubmit} disabled={loading}>{loading?'Adding…':'Add Staff'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
