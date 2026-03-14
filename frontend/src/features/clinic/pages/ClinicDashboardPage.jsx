import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { useAuth } from '../../auth/hooks/useAuth'
import api from '../../../services/api'

export default function ClinicDashboardPage() {
  const { user } = useAuth()
  const [queue, setQueue]   = useState({total:0,waiting:0,in_progress:0,completed:0})
  const [pStats, setPStats] = useState({total:0,thisWeek:0,today:0})
  const [recent, setRecent] = useState([])
  const [staff, setStaff]   = useState([])
  const ref = useRef(null)

  useEffect(() => {
    gsap.fromTo(ref.current,{y:-16,opacity:0},{y:0,opacity:1,duration:.5})
    gsap.fromTo('.dash-stat',{y:20,opacity:0},{y:0,opacity:1,stagger:.08,delay:.2,duration:.4})
    Promise.all([
      api.get('/patients/today'),
      api.get('/patients/stats'),
      api.get('/clinics/my/staff'),
    ]).then(([q,ps,st])=>{
      setQueue(q.data.stats||{})
      setRecent((q.data.patients||[]).slice(0,6))
      setPStats(ps.data||{})
      setStaff(st.data.staff||[])
    }).catch(()=>{})
  },[])

  const clinic = user?.clinic
  const ROLE_C = { receptionist:'teal', lab_handler:'blue', doctor:'green', clinic_owner:'purple' }

  return (
    <div style={{maxWidth:1300}}>
      <div className="page-header" ref={ref}>
        <div>
          <div style={{fontSize:'12px',color:'var(--text-3)',marginBottom:'3px',fontWeight:600,textTransform:'uppercase',letterSpacing:'.06em'}}>Clinic Owner Dashboard</div>
          <h1>{clinic?.name || 'My Clinic'}</h1>
          <p>{new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
        </div>
        <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
          {clinic?.subscription?.plan&&<span className="badge badge--teal">{clinic.subscription.plan.toUpperCase()}</span>}
          <Link to="/clinic/queue" className="btn btn--primary">📡 Live Queue</Link>
        </div>
      </div>

      {/* Main stats */}
      {/* Subscription expiry notification */}
      {(() => {
        const sub = user?.clinic?.subscription || {}
        if (!sub.endDate) return null
        const days = Math.ceil((new Date(sub.endDate) - new Date()) / 86400000)
        if (days > 30) return null
        return (
          <div className={`notif-bar notif-bar--${days<=7?'danger':'warn'}`} style={{marginBottom:16}}>
            <span className="notif-bar__icon">⚠️</span>
            <span className="notif-bar__text">
              Subscription expires in <strong>{days} day{days!==1?'s':''}</strong> ({new Date(sub.endDate).toLocaleDateString('en-IN')}).
              Contact your admin to renew.
            </span>
          </div>
        )
      })()}

      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'12px',marginBottom:'24px'}}>
        {[
          {label:'Total Patients', val:pStats.total,        link:'/clinic/patients', color:'var(--teal)'},
          {label:"Today's Queue",  val:queue.total,         link:'/clinic/queue',    color:'var(--blue)'},
          {label:'Waiting Now',    val:queue.waiting,       link:'/clinic/queue',    color:'#D97706'},
          {label:'In Progress',    val:queue.in_progress,   link:'/clinic/queue',    color:'var(--blue)'},
          {label:'Completed Today',val:queue.completed,     link:'/clinic/queue',    color:'var(--green)'},
        ].map(s=>(
          <Link key={s.label} to={s.link} className="card dash-stat" style={{padding:'16px',textDecoration:'none',borderTop:`3px solid ${s.color}`,display:'block',transition:'transform .15s'}}>
            <div style={{fontFamily:'var(--font-num)',fontSize:'28px',fontWeight:900,color:s.color}}>{s.val??0}</div>
            <div style={{fontSize:'12px',color:'var(--text-2)',fontWeight:600,marginTop:'2px'}}>{s.label}</div>
          </Link>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:'20px'}}>
        {/* Today's queue */}
        <div className="card" style={{overflow:'hidden'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 18px',borderBottom:'1px solid var(--border)'}}>
            <h3 style={{fontSize:'14px',fontWeight:700}}>Today's Patients</h3>
            <Link to="/clinic/queue" style={{color:'var(--teal)',fontSize:'12px',fontWeight:600}}>Live view →</Link>
          </div>
          <table className="data-table">
            <thead><tr><th>#</th><th>Patient</th><th>Test</th><th>Fee</th><th>By</th><th>Status</th></tr></thead>
            <tbody>
              {recent.map(p=>(
                <tr key={p._id}>
                  <td className="td-mono">#{String(p.tokenNo).padStart(3,'0')}</td>
                  <td><div className="td-name">{p.name}</div><div className="td-muted">{p.age}y · {p.gender}</div></td>
                  <td><div style={{fontSize:'12.5px'}}>{p.testName}</div><div className="td-muted">{p.testCategory}</div></td>
                  <td><span style={{fontFamily:'var(--font-num)',fontWeight:700}}>₹{p.fee}</span></td>
                  <td className="td-muted">{p.registeredBy?.name?.split(' ')[0]||'—'}</td>
                  <td><span className={`badge badge--${p.status==='waiting'?'amber':p.status==='in_progress'?'blue':p.status==='completed'?'green':'gray'}`}>{p.status.replace('_',' ')}</span></td>
                </tr>
              ))}
              {recent.length===0&&<tr><td colSpan={6} className="empty-row">No patients today yet</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Staff */}
        <div className="card" style={{padding:'18px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px',paddingBottom:'10px',borderBottom:'1px solid var(--border)'}}>
            <h3 style={{fontSize:'14px',fontWeight:700}}>Staff ({staff.length})</h3>
            <Link to="/clinic/staff" style={{color:'var(--teal)',fontSize:'12px',fontWeight:600}}>Manage →</Link>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
            {staff.map(s=>(
              <div key={s._id} style={{display:'flex',alignItems:'center',gap:'10px',padding:'8px',borderRadius:'8px',background:'var(--bg)'}}>
                <div style={{width:'32px',height:'32px',borderRadius:'50%',background:'var(--teal-light)',color:'var(--teal-dark)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:'13px',flexShrink:0}}>{s.name[0]}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'13px',fontWeight:600}}>{s.name}</div>
                  <span className={`badge badge--${ROLE_C[s.role]||'gray'}`} style={{fontSize:'10px'}}>{s.role?.replace('_',' ')}</span>
                </div>
                <span className={`badge badge--${s.isActive?'green':'red'}`}>{s.isActive?'Active':'Off'}</span>
              </div>
            ))}
            {staff.length===0&&<div style={{textAlign:'center',color:'var(--text-3)',padding:'20px',fontSize:'13px'}}>No staff yet. <Link to="/clinic/staff" style={{color:'var(--teal)'}}>Add staff →</Link></div>}
          </div>
        </div>
      </div>
    </div>
  )
}
