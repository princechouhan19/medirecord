import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { useAuth } from '../../auth/hooks/useAuth'
import api from '../../../services/api'

export default function ClinicDashboardPage() {
  const { user } = useAuth()
  const [queue,  setQueue]  = useState({ total:0, waiting:0, in_progress:0, completed:0 })
  const [pStats, setPStats] = useState({ total:0, thisWeek:0, today:0 })
  const [bStats, setBStats] = useState({ todayCount:0, todayRevenue:0, totalRevenue:0 })
  const [recent, setRecent] = useState([])
  const [staff,  setStaff]  = useState([])
  const [branches, setBranches] = useState([])
  const ref = useRef(null)

  useEffect(() => {
    gsap.fromTo(ref.current, {y:-16,opacity:0}, {y:0,opacity:1,duration:.5})
    gsap.fromTo('.dash-stat', {y:20,opacity:0}, {y:0,opacity:1,stagger:.06,delay:.2,duration:.4})

    Promise.all([
      api.get('/patients/today'),
      api.get('/patients/stats'),
      api.get('/clinics/my/staff'),
      api.get('/bills/stats'),
      api.get('/clinics/my/branches').catch(() => ({ data: { branches:[] } })),
    ]).then(([q, ps, st, bs, br]) => {
      setQueue(q.data.stats || {})
      setRecent((q.data.patients || []).slice(0, 6))
      setPStats(ps.data || {})
      setStaff(st.data.staff || [])
      setBStats(bs.data || {})
      setBranches(br.data.branches || [])
    }).catch(() => {})
  }, [])

  const clinic = user?.clinic
  const ROLE_C = { receptionist:'teal', lab_handler:'blue', doctor:'green', clinic_owner:'purple' }
  const sub    = clinic?.subscription || {}
  const daysLeft = sub.endDate ? Math.ceil((new Date(sub.endDate) - new Date()) / 86400000) : null

  const statCards = [
    { label:'Total Patients', val:pStats.total,      link:'/clinic/patients', color:'var(--teal)' },
    { label:"Today's Queue",  val:queue.total,        link:'/clinic/queue',    color:'var(--blue)' },
    { label:'Waiting',        val:queue.waiting,      link:'/clinic/queue',    color:'#D97706' },
    { label:'In Progress',    val:queue.in_progress,  link:'/clinic/queue',    color:'var(--blue)' },
    { label:'Done Today',     val:queue.completed,    link:'/clinic/queue',    color:'var(--green)' },
    { label:"Today's Bills",  val:bStats.todayCount,  link:'/clinic/bills',    color:'var(--purple)' },
    { label:"Today Revenue",  val:`₹${(bStats.todayRevenue||0).toLocaleString('en-IN')}`, link:'/clinic/bills', color:'var(--green)', mono:true },
    { label:'Total Revenue',  val:`₹${(bStats.totalRevenue||0).toLocaleString('en-IN')}`, link:'/clinic/bills', color:'var(--teal)',  mono:true },
  ]

  return (
    <div style={{maxWidth:1400}}>
      {/* Header */}
      <div className="page-header" ref={ref}>
        <div>
          <div style={{fontSize:11,color:'var(--text-3)',marginBottom:2,fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em'}}>
            Clinic Owner Dashboard
          </div>
          <h1 style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
            {clinic?.logoUrl
              ? <img src={clinic.logoUrl} alt="" style={{height:32,objectFit:'contain',borderRadius:6}} />
              : null
            }
            {clinic?.name || 'My Clinic'}
            {branches.length > 0 && (
              <span className="badge badge--purple" style={{fontSize:11}}>{branches.length} branch{branches.length!==1?'es':''}</span>
            )}
          </h1>
          <p>{new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
          {sub.plan && <span className="badge badge--teal">{sub.plan.toUpperCase()}</span>}
          {daysLeft !== null && daysLeft <= 30 && (
            <span className={`badge badge--${daysLeft<=7?'red':'amber'}`}>⚠ {daysLeft}d left</span>
          )}
          <Link to="/clinic/queue" className="btn btn--primary">📡 Live Queue</Link>
        </div>
      </div>

      {/* Subscription expiry notification */}
      {daysLeft !== null && daysLeft <= 30 && (
        <div className={`notif-bar notif-bar--${daysLeft<=7?'danger':'warn'}`} style={{marginBottom:18}}>
          <span className="notif-bar__icon">⚠️</span>
          <span className="notif-bar__text">
            Subscription expires in <strong>{daysLeft} day{daysLeft!==1?'s':''}</strong> ({new Date(sub.endDate).toLocaleDateString('en-IN')}).
            {' '}<Link to="/clinic/settings" className="notif-bar__action">View settings →</Link>
          </span>
        </div>
      )}

      {/* Stats grid — 4 col desktop, 2 col tablet, 2 col mobile */}
      <div className="dash-stats-grid" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:22}}>
        {statCards.map(s => (
          <Link key={s.label} to={s.link} className="card dash-stat"
            style={{padding:16,textDecoration:'none',borderTop:`3px solid ${s.color}`,display:'block',transition:'transform .15s,box-shadow .15s'}}>
            <div style={{fontFamily:'var(--font-num)',fontSize:s.mono?20:28,fontWeight:900,color:s.color,lineHeight:1}}>
              {s.val ?? 0}
            </div>
            <div style={{fontSize:11,color:'var(--text-2)',fontWeight:600,marginTop:4}}>{s.label}</div>
          </Link>
        ))}
      </div>

      {/* Branch comparison (only if has branches) */}
      {branches.length > 0 && (
        <div className="card" style={{padding:16,marginBottom:20}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <h3 style={{fontSize:13,fontWeight:700}}>Branch Overview</h3>
            <Link to="/clinic/branches" style={{color:'var(--teal)',fontSize:12,fontWeight:600}}>Manage →</Link>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:10}}>
            {branches.map(b => (
              <div key={b._id} style={{background:'var(--bg)',borderRadius:8,padding:'10px 12px',borderLeft:'3px solid var(--purple)'}}>
                <div style={{fontWeight:700,fontSize:12,marginBottom:4}}>{b.branchName||b.name}</div>
                <div style={{display:'flex',gap:12}}>
                  <span style={{fontSize:11,color:'var(--text-2)'}}>👥 {b._patientCount||0}</span>
                  <span style={{fontSize:11,color:'var(--green)'}}>₹{(b._revenue||0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main two-column layout */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:18}}>
        {/* Today's queue */}
        <div className="card" style={{overflow:'hidden'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',borderBottom:'1px solid var(--border)'}}>
            <h3 style={{fontSize:13,fontWeight:700}}>Today's Patients</h3>
            <Link to="/clinic/queue" style={{color:'var(--teal)',fontSize:12,fontWeight:600}}>Live →</Link>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr><th>#</th><th>Patient</th><th>Test</th><th>Fee</th><th>By</th><th>Status</th></tr>
              </thead>
              <tbody>
                {recent.map(p => (
                  <tr key={p._id}>
                    <td className="td-mono">#{String(p.tokenNo).padStart(3,'0')}</td>
                    <td>
                      <div className="td-name">{p.name}</div>
                      <div className="td-muted">{p.age}y · {p.gender}</div>
                    </td>
                    <td>
                      <div style={{fontSize:12}}>{p.testName}</div>
                      <div className="td-muted">{p.testCategory}</div>
                    </td>
                    <td><span style={{fontFamily:'var(--font-num)',fontWeight:700}}>₹{p.fee}</span></td>
                    <td className="td-muted">{p.registeredBy?.name?.split(' ')[0]||'—'}</td>
                    <td>
                      <span className={`badge badge--${p.status==='waiting'?'amber':p.status==='in_progress'?'blue':p.status==='completed'?'green':'gray'}`}>
                        {p.status.replace('_',' ')}
                      </span>
                    </td>
                  </tr>
                ))}
                {recent.length===0 && (
                  <tr><td colSpan={6} className="empty-row">No patients today yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Staff panel */}
        <div className="card" style={{padding:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,paddingBottom:10,borderBottom:'1px solid var(--border)'}}>
            <h3 style={{fontSize:13,fontWeight:700}}>Staff ({staff.length})</h3>
            <Link to="/clinic/staff" style={{color:'var(--teal)',fontSize:12,fontWeight:600}}>Manage →</Link>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:7}}>
            {staff.slice(0,8).map(s => (
              <div key={s._id} style={{display:'flex',alignItems:'center',gap:9,padding:'7px 8px',borderRadius:8,background:'var(--bg)'}}>
                {s.profileImage
                  ? <img src={s.profileImage} alt="" style={{width:30,height:30,borderRadius:'50%',objectFit:'cover',flexShrink:0}} />
                  : <div style={{width:30,height:30,borderRadius:'50%',background:`var(--${ROLE_C[s.role]||'gray'}-bg,var(--teal-light))`,color:`var(--${ROLE_C[s.role]||'teal'})`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:12,flexShrink:0}}>
                      {s.name[0]}
                    </div>
                }
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.name}</div>
                  <span className={`badge badge--${ROLE_C[s.role]||'gray'}`} style={{fontSize:9.5}}>
                    {s.role?.replace('_',' ')}
                  </span>
                </div>
                <span className={`badge badge--${s.isActive?'green':'red'}`} style={{fontSize:9.5}}>
                  {s.isActive?'On':'Off'}
                </span>
              </div>
            ))}
            {staff.length === 0 && (
              <div style={{textAlign:'center',color:'var(--text-3)',padding:20,fontSize:13}}>
                No staff yet.{' '}
                <Link to="/clinic/staff" style={{color:'var(--teal)'}}>Add staff →</Link>
              </div>
            )}
          </div>

          {/* Quick links */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginTop:14,paddingTop:12,borderTop:'1px solid var(--border)'}}>
            {[
              { to:'/clinic/tests',    icon:'💰', label:'Test Fees' },
              { to:'/clinic/pndt',     icon:'📋', label:'PNDT' },
              { to:'/clinic/bills',    icon:'💳', label:'Bills' },
              { to:'/clinic/activity', icon:'📊', label:'Audit' },
            ].map(q => (
              <Link key={q.to} to={q.to} style={{display:'flex',alignItems:'center',gap:6,padding:'7px 8px',borderRadius:7,background:'var(--bg)',fontSize:12,fontWeight:600,color:'var(--text-1)',textDecoration:'none',transition:'background .15s'}}
                onMouseEnter={e=>e.currentTarget.style.background='var(--teal-light)'}
                onMouseLeave={e=>e.currentTarget.style.background='var(--bg)'}>
                {q.icon} {q.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
