import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import api from '../../../services/api'
import './PndtRegisterPage.scss'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function PndtRegisterPage() {
  const [patients, setPatients] = useState([])
  const [month, setMonth] = useState(new Date().getMonth()+1)
  const [year, setYear]   = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    gsap.fromTo(ref.current,{y:-16,opacity:0},{y:0,opacity:1,duration:.5})
  },[])

  useEffect(() => { fetchData() }, [month, year])

  const fetchData = async () => {
    setLoading(true)
    try {
      const r = await api.get(`/patients/pndt?month=${month}&year=${year}`)
      setPatients(r.data.patients||[])
    } catch(e){} finally { setLoading(false) }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="pndt-page">
      <div className="page-header" ref={ref}>
        <div>
          <h1>PNDT Register</h1>
          <p>12-Column Form F Register — {MONTHS[month-1]} {year}</p>
        </div>
        <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
          <select value={month} onChange={e=>setMonth(Number(e.target.value))} className="pndt-select">
            {MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
          </select>
          <select value={year} onChange={e=>setYear(Number(e.target.value))} className="pndt-select">
            {[2023,2024,2025,2026,2027].map(y=><option key={y}>{y}</option>)}
          </select>
          <button className="btn btn--primary" onClick={handlePrint}>🖨 Print Register</button>
        </div>
      </div>

      {loading ? (
        <div style={{textAlign:'center',padding:'60px',color:'var(--text-3)'}}>Loading register...</div>
      ) : (
        <div className="card pndt-wrapper" id="pndt-printable">
          <div className="pndt-title">
            <div className="pndt-title__main">FORM F — PNDT Monthly Register</div>
            <div className="pndt-title__sub">Diagnostic Test / Procedure by Ultrasound Clinic · {MONTHS[month-1]} {year}</div>
            <div className="pndt-title__count">Total Patients: {patients.length}</div>
          </div>

          <div className="pndt-scroll">
            <table className="pndt-table">
              <thead>
                <tr>
                  <th rowSpan={2} className="pndt-th--sm">Sr.<br/>No.</th>
                  <th rowSpan={2}>Registration<br/>No.</th>
                  <th rowSpan={2}>Date</th>
                  <th rowSpan={2}>Patient Name<br/>Age / Husband / Father</th>
                  <th rowSpan={2}>Full Address<br/>of Patient</th>
                  <th rowSpan={2}>Referred By<br/>(Doctor / Self)</th>
                  <th rowSpan={2}>No. of<br/>Living Children<br/>(M/F)</th>
                  <th rowSpan={2}>LMP / Weeks<br/>of Pregnancy</th>
                  <th colSpan={2}>Indication</th>
                  <th rowSpan={2}>Date on Which<br/>Declaration<br/>Obtained</th>
                  <th rowSpan={2}>Result / Findings<br/>of USG</th>
                </tr>
                <tr>
                  <th>Non-Invasive</th>
                  <th>Invasive</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p, idx) => (
                  <tr key={p._id} className={idx%2===0?'pndt-row--even':''}>
                    <td className="pndt-td--center pndt-td--num">{idx+1}</td>
                    <td className="pndt-td--mono">{p.receiptNo||`REG-${String(idx+1).padStart(4,'0')}`}</td>
                    <td className="pndt-td--nowrap">{new Date(p.visitDate).toLocaleDateString('en-IN')}</td>
                    <td>
                      <strong>{p.name}</strong>
                      <div style={{fontSize:'11px',color:'var(--text-2)'}}>{p.age} yrs{p.husbandName?` · H/O: ${p.husbandName}`:''}</div>
                    </td>
                    <td style={{fontSize:'12px'}}>{p.address||'—'}</td>
                    <td style={{fontSize:'12px'}}>{p.referredBy||'Self'}</td>
                    <td className="pndt-td--center">—</td>
                    <td className="pndt-td--center">{p.lmp?new Date(p.lmp).toLocaleDateString('en-IN'):'—'}</td>
                    <td className="pndt-td--center">
                      <span className="pndt-tick">✓</span>
                    </td>
                    <td className="pndt-td--center">—</td>
                    <td className="pndt-td--center">{new Date(p.visitDate).toLocaleDateString('en-IN')}</td>
                    <td style={{fontSize:'12px',color:'var(--green)'}}>
                      {p.notes||p.testName||'Normal'}
                    </td>
                  </tr>
                ))}
                {/* Empty rows to fill minimum 20 rows */}
                {Array.from({length:Math.max(0,20-patients.length)}).map((_,i)=>(
                  <tr key={`empty-${i}`} className={(patients.length+i)%2===0?'pndt-row--even':''}>
                    <td className="pndt-td--center pndt-td--num">{patients.length+i+1}</td>
                    {Array(11).fill(null).map((_,j)=><td key={j}>&nbsp;</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pndt-footer">
            <div className="pndt-footer__sig">
              <div className="pndt-footer__sig-line" />
              <div>Radiologist / Sonologist Signature</div>
            </div>
            <div className="pndt-footer__sig">
              <div className="pndt-footer__sig-line" />
              <div>Seal</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
