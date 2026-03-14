import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import api from '../../../services/api'

const ACTION_META = {
  patient_registered: { label: 'Registered Patient', icon: '📋', color: 'teal' },
  patient_in_progress:{ label: 'Started Patient',    icon: '🔬', color: 'blue' },
  patient_completed:  { label: 'Completed Patient',  icon: '✅', color: 'green' },
  patient_cancelled:  { label: 'Cancelled Patient',  icon: '✕',  color: 'red' },
}

const ROLE_COLOR = { receptionist:'teal', lab_handler:'blue', clinic_owner:'purple', doctor:'green' }

export default function ClinicActivityPage() {
  const [logs, setLogs]     = useState([])
  const [staff, setStaff]   = useState([])
  const [filter, setFilter] = useState({ userId:'', date:'' })
  const [loading, setLoading] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    gsap.fromTo(ref.current,{y:-16,opacity:0},{y:0,opacity:1,duration:.5})
    api.get('/clinics/my/staff').then(r=>setStaff(r.data.staff||[])).catch(()=>{})
    fetchLogs()
  },[])

  const fetchLogs = async (f=filter) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if(f.userId) params.append('userId',f.userId)
      if(f.date)   params.append('date',f.date)
      params.append('limit','100')
      const r = await api.get(`/patients/activity?${params}`)
      setLogs(r.data.logs||[])
    } catch(e){} finally { setLoading(false) }
  }

  const applyFilter = (updates) => {
    const nf = {...filter,...updates}
    setFilter(nf); fetchLogs(nf)
  }

  // Group by user for summary
  const userSummary = logs.reduce((acc,l)=>{
    const k = l.userName||'Unknown'
    if(!acc[k]) acc[k]={name:k,role:l.userRole,registered:0,completed:0,inProgress:0}
    if(l.action==='patient_registered') acc[k].registered++
    if(l.action==='patient_completed')  acc[k].completed++
    if(l.action==='patient_in_progress') acc[k].inProgress++
    return acc
  },{})

  return (
    <div style={{maxWidth:1200}}>
      <div className="page-header" ref={ref}>
        <div><h1>Activity Log</h1><p>Track what each staff member has done today</p></div>
      </div>

      {/* Staff summary cards */}
      {Object.values(userSummary).length>0&&(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'12px',marginBottom:'24px'}}>
          {Object.values(userSummary).map(u=>(
            <div key={u.name} className="card" style={{padding:'16px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'10px'}}>
                <div style={{width:'32px',height:'32px',borderRadius:'50%',background:'var(--teal-light)',color:'var(--teal-dark)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:'14px'}}>{u.name[0]}</div>
                <div>
                  <div style={{fontSize:'13px',fontWeight:700}}>{u.name}</div>
                  <span className={`badge badge--${ROLE_COLOR[u.role]||'gray'}`}>{u.role?.replace('_',' ')}</span>
                </div>
              </div>
              <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                <div style={{textAlign:'center',flex:1}}>
                  <div style={{fontFamily:'var(--font-num)',fontSize:'20px',fontWeight:800,color:'var(--teal)'}}>{u.registered}</div>
                  <div style={{fontSize:'10px',color:'var(--text-3)'}}>Registered</div>
                </div>
                <div style={{textAlign:'center',flex:1}}>
                  <div style={{fontFamily:'var(--font-num)',fontSize:'20px',fontWeight:800,color:'var(--blue)'}}>{u.inProgress}</div>
                  <div style={{fontSize:'10px',color:'var(--text-3)'}}>Started</div>
                </div>
                <div style={{textAlign:'center',flex:1}}>
                  <div style={{fontFamily:'var(--font-num)',fontSize:'20px',fontWeight:800,color:'var(--green)'}}>{u.completed}</div>
                  <div style={{fontSize:'10px',color:'var(--text-3)'}}>Done</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{display:'flex',gap:'10px',marginBottom:'16px',flexWrap:'wrap'}}>
        <select value={filter.userId} onChange={e=>applyFilter({userId:e.target.value})} style={{padding:'8px 12px',border:'1.5px solid var(--border)',borderRadius:'6px',fontSize:'13px',fontFamily:'inherit',outline:'none'}}>
          <option value="">All Staff</option>
          {staff.map(s=><option key={s._id} value={s._id}>{s.name} ({s.role?.replace('_',' ')})</option>)}
        </select>
        <input type="date" value={filter.date} onChange={e=>applyFilter({date:e.target.value})}
          style={{padding:'8px 12px',border:'1.5px solid var(--border)',borderRadius:'6px',fontSize:'13px',fontFamily:'inherit',outline:'none'}} />
        <button className="btn btn--secondary" onClick={()=>applyFilter({userId:'',date:''})}>Clear</button>
      </div>

      <div className="card" style={{overflow:'hidden'}}>
        {loading?<div style={{padding:'40px',textAlign:'center',color:'var(--text-3)'}}>Loading...</div>:(
          <table className="data-table">
            <thead>
              <tr><th>Time</th><th>Staff</th><th>Role</th><th>Action</th><th>Patient</th><th>Details</th></tr>
            </thead>
            <tbody>
              {logs.map(l=>{
                const m = ACTION_META[l.action]||{label:l.action,icon:'📌',color:'gray'}
                return (
                  <tr key={l._id}>
                    <td className="td-muted td-mono" style={{whiteSpace:'nowrap'}}>
                      {new Date(l.createdAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}
                      <div style={{fontSize:'10px'}}>{new Date(l.createdAt).toLocaleDateString('en-IN')}</div>
                    </td>
                    <td className="td-name">{l.userName}</td>
                    <td><span className={`badge badge--${ROLE_COLOR[l.userRole]||'gray'}`}>{l.userRole?.replace('_',' ')}</span></td>
                    <td><span className={`badge badge--${m.color}`}>{m.icon} {m.label}</span></td>
                    <td>{l.details?.patientName||'—'}</td>
                    <td className="td-muted">{l.details?.testName||''} {l.details?.fee?`₹${l.details.fee}`:''}</td>
                  </tr>
                )
              })}
              {logs.length===0&&<tr><td colSpan={6} className="empty-row">No activity logs found</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
