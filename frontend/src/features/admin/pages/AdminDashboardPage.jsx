import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import api from '../../../services/api'

export default function AdminDashboardPage() {
  const [stats, setStats]   = useState({totalClinics:0,activeClinics:0,totalPatients:0,totalUsers:0})
  const [clinics, setClinics] = useState([])
  const ref = useRef(null)

  useEffect(() => {
    gsap.fromTo(ref.current,{y:-20,opacity:0},{y:0,opacity:1,duration:.6})
    gsap.fromTo('.admin-stat-card',{y:30,opacity:0},{y:0,opacity:1,stagger:.1,delay:.2,duration:.4})
    Promise.all([api.get('/clinics/stats'), api.get('/clinics')]).then(([s,c])=>{
      setStats(s.data)
      setClinics(c.data.clinics?.slice(0,8)||[])
    }).catch(()=>{})
  },[])

  return (
    <div style={{maxWidth:1300}}>
      <div className="page-header" ref={ref}>
        <div>
          <div style={{fontSize:'11px',color:'var(--text-3)',fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:'3px'}}>Super Admin</div>
          <h1>Platform Overview</h1>
          <p>MediRecord — Multi-clinic EMR management</p>
        </div>
        <Link to="/admin/clinics" className="btn btn--primary btn--lg">+ Register Clinic</Link>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'14px',marginBottom:'28px'}}>
        {[
          {label:'Total Clinics',  val:stats.totalClinics,  icon:'🏥', color:'var(--teal)'},
          {label:'Active Clinics', val:stats.activeClinics, icon:'✅', color:'var(--green)'},
          {label:'Total Patients', val:stats.totalPatients, icon:'👥', color:'var(--blue)'},
          {label:'Total Users',    val:stats.totalUsers,    icon:'👤', color:'var(--purple)'},
        ].map(s=>(
          <div key={s.label} className="card admin-stat-card" style={{padding:'20px',textAlign:'center',borderTop:`3px solid ${s.color}`}}>
            <div style={{fontSize:'28px',marginBottom:'6px'}}>{s.icon}</div>
            <div style={{fontFamily:'var(--font-num)',fontSize:'32px',fontWeight:900,color:s.color}}>{s.val}</div>
            <div style={{fontSize:'12px',color:'var(--text-2)',fontWeight:600,marginTop:'3px'}}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{overflow:'hidden'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 20px',borderBottom:'1px solid var(--border)'}}>
          <h3 style={{fontSize:'14px',fontWeight:700}}>Registered Clinics</h3>
          <Link to="/admin/clinics" style={{color:'var(--teal)',fontSize:'12px',fontWeight:600}}>Manage all →</Link>
        </div>
        <table className="data-table">
          <thead><tr><th>Clinic ID</th><th>Clinic Name</th><th>Owner</th><th>Plan</th><th>Patients</th><th>Staff</th><th>Subscription</th><th>Status</th></tr></thead>
          <tbody>
            {clinics.map(c=>(
              <tr key={c._id}>
                <td className="td-mono">{c.clinicId||'—'}</td>
                <td><div className="td-name">{c.name}</div><div className="td-muted">{c.city}{c.city&&c.state?', ':''}{c.state}</div></td>
                <td><div style={{fontSize:'13px'}}>{c.owner?.name}</div><div className="td-muted">{c.owner?.email}</div></td>
                <td><span className={`badge badge--${c.subscription?.plan==='pro'?'teal':'gray'}`}>{c.subscription?.plan?.toUpperCase()||'FREE'}</span></td>
                <td className="td-mono">{c._patientCount||0}</td>
                <td className="td-mono">{c._staffCount||0}</td>
                <td className="td-muted">
                  {c.subscription?.endDate?new Date(c.subscription.endDate).toLocaleDateString('en-IN'):'—'}
                </td>
                <td><span className={`badge badge--${c.isActive?'green':'red'}`}>{c.isActive?'Active':'Suspended'}</span></td>
              </tr>
            ))}
            {clinics.length===0&&<tr><td colSpan={8} className="empty-row">No clinics registered yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
