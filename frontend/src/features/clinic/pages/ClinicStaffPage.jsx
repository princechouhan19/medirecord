import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import api from '../../../services/api'

const ROLES = [
  { val:'receptionist', label:'Receptionist', desc:'Registers patients, fills F-Form, collects fees' },
  { val:'lab_handler',  label:'Lab Handler',  desc:'Takes patients, runs tests, marks complete' },
  { val:'doctor',       label:'Doctor',        desc:'Referenced doctor, can view patient records' },
]
const ROLE_COLOR = { receptionist:'teal', lab_handler:'blue', doctor:'green', clinic_owner:'purple' }
const ROLE_LABEL = { receptionist:'Receptionist', lab_handler:'Lab Handler', doctor:'Doctor', clinic_owner:'Clinic Owner' }
const DEF = { name:'', email:'', password:'', role:'receptionist', phone:'' }

function StaffDetailModal({ staff, logs, onClose, onToggle }) {
  if (!staff) return null
  const rc = ROLE_COLOR[staff.role] || 'gray'

  // Calculate activity summary from logs
  const myLogs = logs.filter(l => l.userName === staff.name)
  const registered = myLogs.filter(l => l.action === 'patient_registered').length
  const completed  = myLogs.filter(l => l.action === 'patient_completed').length
  const inProgress = myLogs.filter(l => l.action === 'patient_in_progress').length

  // Last 7 days bar chart data
  const days = Array.from({length:7}, (_,i) => {
    const d = new Date(); d.setDate(d.getDate()-i); return d.toLocaleDateString('en-CA')
  }).reverse()

  const dayData = days.map(day => ({
    label: new Date(day).toLocaleDateString('en-IN',{weekday:'short'}),
    count: myLogs.filter(l => new Date(l.createdAt).toLocaleDateString('en-CA') === day).length,
  }))
  const maxCount = Math.max(...dayData.map(d=>d.count), 1)

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal--wide">
        <div className="modal__header">
          <h2>Staff Details</h2>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>
        <div className="modal__body">
          {/* Header */}
          <div style={{display:'flex',gap:16,alignItems:'center',padding:'0 0 16px',borderBottom:'1px solid var(--border)'}}>
            {staff.profileImage
              ? <img src={staff.profileImage} alt="" style={{width:56,height:56,borderRadius:'50%',objectFit:'cover',flexShrink:0}} />
              : <div style={{width:56,height:56,borderRadius:'50%',background:`var(--${rc}-bg,var(--teal-light))`,color:`var(--${rc},var(--teal))`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:22,flexShrink:0}}>
                  {staff.name[0]}
                </div>
            }
            <div style={{flex:1}}>
              <div style={{fontWeight:800,fontSize:17}}>{staff.name}</div>
              <div style={{fontSize:12,color:'var(--text-3)',marginTop:1}}>{staff.email}</div>
              <div style={{display:'flex',gap:6,marginTop:6}}>
                <span className={`badge badge--${rc}`}>{ROLE_LABEL[staff.role]||staff.role}</span>
                <span className={`badge badge--${staff.isActive?'green':'red'}`}>{staff.isActive?'Active':'Inactive'}</span>
              </div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:11,color:'var(--text-3)'}}>Added</div>
              <div style={{fontSize:12,fontWeight:600}}>{new Date(staff.createdAt).toLocaleDateString('en-IN')}</div>
              {staff.lastLogin && <>
                <div style={{fontSize:11,color:'var(--text-3)',marginTop:4}}>Last login</div>
                <div style={{fontSize:12,fontWeight:600}}>{new Date(staff.lastLogin).toLocaleDateString('en-IN')}</div>
              </>}
            </div>
          </div>

          {/* Summary stats */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
            {[
              {label:'Registered',   val:registered, color:'var(--teal)'},
              {label:'In Progress',  val:inProgress, color:'var(--blue)'},
              {label:'Completed',    val:completed,  color:'var(--green)'},
            ].map(s=>(
              <div key={s.label} style={{background:'var(--bg)',borderRadius:8,padding:'12px 14px',textAlign:'center',borderTop:`3px solid ${s.color}`}}>
                <div style={{fontFamily:'var(--font-num)',fontSize:26,fontWeight:800,color:s.color}}>{s.val}</div>
                <div style={{fontSize:11,color:'var(--text-2)',fontWeight:600,marginTop:2}}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* 7-day activity bar chart */}
          <div>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:10}}>
              Activity — Last 7 Days
            </div>
            <div style={{display:'flex',alignItems:'flex-end',gap:6,height:80}}>
              {dayData.map((d,i) => (
                <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                  <div style={{fontSize:10,color:'var(--text-3)',fontFamily:'var(--font-num)'}}>{d.count||''}</div>
                  <div style={{
                    width:'100%', background: d.count>0?'var(--teal)':'var(--border)',
                    borderRadius:'4px 4px 0 0',
                    height: d.count===0?4:`${Math.max(8, (d.count/maxCount)*60)}px`,
                    transition:'height .3s ease',
                  }}/>
                  <div style={{fontSize:9,color:'var(--text-3)',fontWeight:600}}>{d.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent actions */}
          {myLogs.length > 0 && (
            <div>
              <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:8}}>Recent Activity</div>
              <div style={{display:'flex',flexDirection:'column',gap:6,maxHeight:160,overflowY:'auto'}}>
                {myLogs.slice(0,8).map((l,i) => (
                  <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'6px 10px',background:'var(--bg)',borderRadius:6,fontSize:12}}>
                    <span style={{fontFamily:'var(--font-num)',color:'var(--text-3)',fontSize:11,flexShrink:0}}>
                      {new Date(l.createdAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}
                    </span>
                    <span className={`badge badge--${l.action.includes('complete')?'green':l.action.includes('progress')?'blue':'teal'}`} style={{fontSize:10}}>
                      {l.action.replace('patient_','').replace('_',' ')}
                    </span>
                    <span style={{flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.details?.patientName||'—'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {myLogs.length === 0 && (
            <div style={{textAlign:'center',color:'var(--text-3)',padding:'20px 0',fontSize:13}}>No activity logged yet for this staff member.</div>
          )}
        </div>
        <div className="modal__footer">
          <button className="btn btn--secondary" onClick={onClose}>Close</button>
          {staff.role !== 'clinic_owner' && (
            <button className={`btn btn--${staff.isActive?'danger':'primary'}`} onClick={() => { onToggle(staff._id); onClose(); }}>
              {staff.isActive ? 'Deactivate Account' : 'Activate Account'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ClinicStaffPage() {
  const [staff, setStaff]       = useState([])
  const [logs, setLogs]         = useState([])
  const [showModal, setShowModal] = useState(false)
  const [detailStaff, setDetailStaff] = useState(null)
  const [form, setForm]         = useState(DEF)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const ref = useRef(null)

  useEffect(() => {
    gsap.fromTo(ref.current, {y:-16,opacity:0}, {y:0,opacity:1,duration:.5})
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      const [s, l] = await Promise.all([api.get('/clinics/my/staff'), api.get('/patients/activity?limit=200')])
      setStaff(s.data.staff||[])
      setLogs(l.data.logs||[])
    } catch(e) {}
  }

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      await api.post('/clinics/my/staff', form)
      setShowModal(false); setForm(DEF); fetchAll()
    } catch(err) { setError(err.response?.data?.error||'Failed') }
    finally { setLoading(false) }
  }

  const handleToggle = async userId => {
    await api.patch(`/clinics/my/staff/${userId}/toggle`); fetchAll()
  }

  const f = k => ({ value: form[k], onChange: e => setForm({...form,[k]:e.target.value}) })

  return (
    <div style={{maxWidth:1100}}>
      <div className="page-header" ref={ref}>
        <div><h1>Staff Management</h1><p>Manage team members · Click any card to view details and activity</p></div>
        <button className="btn btn--primary" onClick={() => setShowModal(true)}>+ Add Staff</button>
      </div>

      {/* Role overview */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:24}}>
        {ROLES.map(r => {
          const count = staff.filter(s => s.role===r.val && s.isActive).length
          return (
            <div key={r.val} className="card" style={{padding:16,borderLeft:`3px solid var(--${ROLE_COLOR[r.val]})`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                <div>
                  <div style={{fontWeight:700,fontSize:13}}>{r.label}</div>
                  <div style={{fontSize:11,color:'var(--text-2)',marginTop:2,lineHeight:1.4}}>{r.desc}</div>
                </div>
                <span style={{fontFamily:'var(--font-num)',fontSize:22,fontWeight:800,color:`var(--${ROLE_COLOR[r.val]})`}}>{count}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Staff cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:14}}>
        {staff.map(s => {
          const rc = ROLE_COLOR[s.role] || 'gray'
          const myActions = logs.filter(l => l.userName === s.name).length
          return (
            <div key={s._id} className="card" style={{padding:18,cursor:'pointer',opacity:s.isActive?1:.65,transition:'all var(--ease)'}}
              onClick={() => setDetailStaff(s)}
              onMouseEnter={e => { e.currentTarget.style.boxShadow='var(--shadow)'; e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.borderColor='var(--teal)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow=''; e.currentTarget.style.transform=''; e.currentTarget.style.borderColor='' }}>
              <div style={{display:'flex',gap:12,marginBottom:12}}>
                {s.profileImage
                  ? <img src={s.profileImage} alt="" style={{width:42,height:42,borderRadius:'50%',objectFit:'cover',flexShrink:0}} />
                  : <div style={{width:42,height:42,borderRadius:'50%',background:`var(--${rc}-bg,var(--teal-light))`,color:`var(--${rc},var(--teal))`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:17,flexShrink:0}}>
                      {s.name[0]}
                    </div>
                }
                <div>
                  <div style={{fontWeight:700,fontSize:14}}>{s.name}</div>
                  <div style={{fontSize:11,color:'var(--text-3)'}}>{s.email}</div>
                </div>
              </div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:10}}>
                <span className={`badge badge--${rc}`}>{ROLE_LABEL[s.role]||s.role}</span>
                <span className={`badge badge--${s.isActive?'green':'red'}`}>{s.isActive?'Active':'Inactive'}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',paddingTop:10,borderTop:'1px solid var(--border)',fontSize:11,color:'var(--text-3)'}}>
                <span>📊 {myActions} actions logged</span>
                <span>{new Date(s.createdAt).toLocaleDateString('en-IN')}</span>
              </div>
            </div>
          )
        })}
        {staff.length === 0 && (
          <div className="card" style={{gridColumn:'1/-1',padding:60,textAlign:'center',color:'var(--text-3)'}}>
            No staff members yet. Add your first team member.
          </div>
        )}
      </div>

      {/* Staff Detail Modal */}
      <StaffDetailModal staff={detailStaff} logs={logs} onClose={() => setDetailStaff(null)} onToggle={handleToggle} />

      {/* Add Staff Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal__header">
              <h2>Add Staff Member</h2>
              <button className="modal__close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {error && <div className="alert alert--error" style={{margin:'0 20px'}}>{error}</div>}
            <div className="modal__form">
              <div className="form-group">
                <label>Role *</label>
                <select {...f('role')}>
                  {ROLES.map(r => <option key={r.val} value={r.val}>{r.label}</option>)}
                </select>
              </div>
              <div style={{background:'var(--bg)',borderRadius:8,padding:'8px 12px',fontSize:12,color:'var(--text-2)'}}>
                {ROLES.find(r => r.val === form.role)?.desc}
              </div>
              <div className="form-grid-2">
                <div className="form-group"><label>Full Name *</label><input {...f('name')} required /></div>
                <div className="form-group"><label>Phone</label><input {...f('phone')} /></div>
              </div>
              <div className="form-group"><label>Email (Login) *</label><input type="email" {...f('email')} required /></div>
              <div className="form-group"><label>Password *</label><input type="password" {...f('password')} required minLength={6} placeholder="Min 6 characters" /></div>
            </div>
            <div className="modal__footer">
              <button className="btn btn--secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn--primary" onClick={handleSubmit} disabled={loading}>{loading?'Adding…':'Add Staff'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
