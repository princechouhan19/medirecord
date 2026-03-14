import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { useAuth } from '../../auth/hooks/useAuth'
import api from '../../../services/api'

export default function LabDashboard() {
  const { user } = useAuth()
  const [stats, setStats]   = useState({total:0,waiting:0,in_progress:0,completed:0})
  const [myWork, setMyWork] = useState([])
  const ref = useRef(null)

  useEffect(() => {
    gsap.fromTo(ref.current,{y:-16,opacity:0},{y:0,opacity:1,duration:.5})
    api.get('/patients/today').then(r=>{
      const pts = r.data.patients||[]
      setStats(r.data.stats||{})
      // Show assigned to me or in_progress
      setMyWork(pts.filter(p=>p.status==='in_progress'||p.status==='waiting').slice(0,10))
    }).catch(()=>{})
  },[])

  return (
    <div style={{maxWidth:1100}}>
      <div className="page-header" ref={ref}>
        <div>
          <h1>Lab Dashboard</h1>
          <p>Hello {user?.name?.split(' ')[0]} — manage your patient queue</p>
        </div>
        <Link to="/lab/queue" className="btn btn--primary">View Full Queue</Link>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'14px',marginBottom:'24px'}}>
        {[
          {label:'Total Today',  val:stats.total,       c:'var(--teal)'},
          {label:'Waiting',      val:stats.waiting,     c:'#D97706'},
          {label:'In Progress',  val:stats.in_progress, c:'var(--blue)'},
          {label:'Completed',    val:stats.completed,   c:'var(--green)'},
        ].map(s=>(
          <div key={s.label} className="card" style={{padding:'18px',borderTop:`3px solid ${s.c}`}}>
            <div style={{fontFamily:'var(--font-num)',fontSize:'30px',fontWeight:800,color:s.c}}>{s.val??0}</div>
            <div style={{fontSize:'12px',color:'var(--text-2)',fontWeight:600,marginTop:'3px'}}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{overflow:'hidden'}}>
        <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h3 style={{fontSize:'14px',fontWeight:700}}>Pending Patients</h3>
          <Link to="/lab/queue" style={{color:'var(--teal)',fontSize:'12px',fontWeight:600}}>Go to queue →</Link>
        </div>
        <table className="data-table">
          <thead><tr><th>#</th><th>Patient</th><th>Test</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {myWork.map(p=>(
              <tr key={p._id}>
                <td className="td-mono">#{String(p.tokenNo).padStart(3,'0')}</td>
                <td><div className="td-name">{p.name}</div><div className="td-muted">{p.age}y · {p.gender}</div></td>
                <td><div style={{fontSize:'13px'}}>{p.testName}</div><div className="td-muted">{p.testCategory}</div></td>
                <td><span className={`badge badge--${p.status==='waiting'?'amber':'blue'}`}>{p.status.replace('_',' ')}</span></td>
                <td>
                  {p.status==='waiting'&&(
                    <button className="btn btn--primary btn--sm" onClick={async()=>{
                      await api.patch(`/patients/${p._id}/status`,{status:'in_progress'})
                      api.get('/patients/today').then(r=>{setStats(r.data.stats);setMyWork(r.data.patients.filter(x=>x.status==='in_progress'||x.status==='waiting').slice(0,10))})
                    }}>Start</button>
                  )}
                  {p.status==='in_progress'&&(
                    <button className="btn btn--primary btn--sm" onClick={async()=>{
                      await api.patch(`/patients/${p._id}/status`,{status:'completed'})
                      api.get('/patients/today').then(r=>{setStats(r.data.stats);setMyWork(r.data.patients.filter(x=>x.status==='in_progress'||x.status==='waiting').slice(0,10))})
                    }}>Complete ✓</button>
                  )}
                </td>
              </tr>
            ))}
            {myWork.length===0&&<tr><td colSpan={5} className="empty-row">All done for today! 🎉</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
