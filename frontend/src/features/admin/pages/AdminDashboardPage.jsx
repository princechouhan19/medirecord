import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import api from '../../../services/api'

export default function AdminDashboardPage() {
  const [stats,   setStats]   = useState({ totalClinics:0, activeClinics:0, totalPatients:0, totalUsers:0 })
  const [clinics, setClinics] = useState([])
  const [doctors, setDoctors] = useState([])  // referred doctors with patient counts
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current) gsap.fromTo(ref.current, {y:-16,opacity:0}, {y:0,opacity:1,duration:.5})
    Promise.all([
      api.get('/clinics/stats'),
      api.get('/clinics'),
      api.get('/admin/referred-doctors').catch(() => ({ data: { doctors:[] } })),
    ]).then(([s, c, d]) => {
      setStats(s.data || {})
      setClinics((c.data.clinics || []).slice(0, 8))
      setDoctors(d.data.doctors || [])
    }).catch(()=>{})
  }, [])

  const expiringClinics = clinics.filter(c => {
    const d = c.subscription?.endDate
    if (!d) return false
    const days = Math.ceil((new Date(d)-new Date())/86400000)
    return days > 0 && days <= 30
  })

  return (
    <div style={{maxWidth:1300}}>
      <div className="page-header" ref={ref}>
        <div><h1>Admin Dashboard</h1><p>Platform overview — all clinics</p></div>
        <Link to="/admin/clinics" className="btn btn--primary">Manage Clinics →</Link>
      </div>

      {/* Expiry warnings */}
      {expiringClinics.map(c => {
        const days = Math.ceil((new Date(c.subscription.endDate)-new Date())/86400000)
        return (
          <div key={c._id} className={`notif-bar notif-bar--${days<=7?'danger':'warn'}`}>
            <span className="notif-bar__icon">⚠️</span>
            <span className="notif-bar__text"><strong>{c.name}</strong> plan expires in <strong>{days} day{days!==1?'s':''}</strong> ({new Date(c.subscription.endDate).toLocaleDateString('en-IN')})</span>
          </div>
        )
      })}

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:24}}>
        {[
          {label:'Total Clinics',   val:stats.totalClinics,   color:'var(--teal)',   link:'/admin/clinics'},
          {label:'Active Clinics',  val:stats.activeClinics,  color:'var(--green)',  link:'/admin/clinics'},
          {label:'Total Patients',  val:stats.totalPatients,  color:'var(--blue)',   link:'/admin/clinics'},
          {label:'Total Staff/Docs',val:stats.totalUsers,     color:'var(--purple)', link:'/admin/users'},
        ].map(s=>(
          <Link key={s.label} to={s.link} className="card"
            style={{padding:20,textDecoration:'none',borderTop:`3px solid ${s.color}`,transition:'transform .15s'}}>
            <div style={{fontFamily:'var(--font-num)',fontSize:32,fontWeight:900,color:s.color}}>{s.val||0}</div>
            <div style={{fontSize:12,color:'var(--text-2)',fontWeight:600,marginTop:2}}>{s.label}</div>
          </Link>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 380px',gap:20}}>
        {/* Clinics table */}
        <div className="card" style={{overflow:'hidden'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',borderBottom:'1px solid var(--border)'}}>
            <h3 style={{fontSize:14,fontWeight:700}}>Registered Clinics</h3>
            <Link to="/admin/clinics" style={{color:'var(--teal)',fontSize:12,fontWeight:600}}>View all →</Link>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>Clinic</th><th>Owner</th><th>Plan</th><th>Expires</th><th>Status</th></tr></thead>
              <tbody>
                {clinics.map(c=>(
                  <tr key={c._id}>
                    <td>
                      <div className="td-name">{c.name}</div>
                      <div className="td-muted">{c.clinicId||'—'} · {c.city||''}</div>
                    </td>
                    <td>
                      <div style={{fontSize:13,fontWeight:600}}>{c.owner?.name}</div>
                      <div className="td-muted">{c.owner?.email}</div>
                    </td>
                    <td><span className={`badge badge--${c.subscription?.plan==='pro'?'teal':'gray'}`}>{c.subscription?.plan?.toUpperCase()||'FREE'}</span></td>
                    <td className="td-muted">{c.subscription?.endDate?new Date(c.subscription.endDate).toLocaleDateString('en-IN'):'—'}</td>
                    <td><span className={`badge badge--${c.isActive?'green':'red'}`}>{c.isActive?'Active':'Off'}</span></td>
                  </tr>
                ))}
                {clinics.length===0&&<tr><td colSpan={5} className="empty-row">No clinics yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Referred Doctors Commission Tracker */}
        <div className="card" style={{padding:0,overflow:'hidden'}}>
          <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <h3 style={{fontSize:14,fontWeight:700}}>Referral Doctor Tracker</h3>
              <div style={{fontSize:11,color:'var(--text-3)',marginTop:1}}>Patients referred per doctor (commission tracking)</div>
            </div>
          </div>
          {doctors.length > 0 ? (
            <div style={{display:'flex',flexDirection:'column',overflow:'auto',maxHeight:400}}>
              {doctors.map((d,i)=>(
                <div key={d._id||i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',borderBottom:'1px solid var(--border)'}}>
                  <div style={{width:34,height:34,borderRadius:'50%',background:'var(--blue-bg)',color:'var(--blue)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:14,flexShrink:0}}>
                    {(d.name||'D')[0].toUpperCase()}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:13,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.name}</div>
                    <div style={{fontSize:11,color:'var(--text-3)'}}>{d.qualification||d.type||'Doctor'}{d.city?` · ${d.city}`:''}</div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <div style={{fontFamily:'var(--font-num)',fontSize:20,fontWeight:900,color:'var(--teal)'}}>{d.patientCount||0}</div>
                    <div style={{fontSize:10,color:'var(--text-3)',fontWeight:600}}>REFERRALS</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{padding:40,textAlign:'center',color:'var(--text-3)',fontSize:13}}>
              <div style={{fontSize:28,marginBottom:8}}>👨‍⚕️</div>
              No referred doctors tracked yet.<br/>
              <span style={{fontSize:11}}>Doctors are tracked as patients are registered with referral details.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
