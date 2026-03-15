import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useAuth } from '../../auth/hooks/useAuth'
import api from '../../../services/api'
import './RegisterPatientPage.scss'

const GENDERS = ['Female', 'Male', 'Other']
const PAY_MODES = ['cash', 'upi', 'card', 'pending']

const DEF = {
  name:'', age:'', ageUnit:'years', gender:'Female', phone:'',
  address:'', husbandName:'', lmp:'', referredBy:'',
  testCategory:'', testCategoryId:'', testName:'', testId:'',
  fee:'', isPaid:false, paymentMode:'cash',
}

export default function RegisterPatientPage() {
  const { user } = useAuth()
  const [form, setForm]         = useState(DEF)
  const [testCats, setTestCats] = useState([])
  const [subTests, setSubTests] = useState([])
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(null)  // last registered patient
  const [error, setError]       = useState('')
  const formRef = useRef(null)
  const receiptRef = useRef(null)

  useEffect(() => {
    gsap.fromTo(formRef.current,{x:-20,opacity:0},{x:0,opacity:1,duration:.5})
    // Load clinic's test categories
    api.get('/clinics/my/tests').then(r => {
      setTestCats(r.data.testCategories || [])
    }).catch(()=>{})
  }, [])

  // When category changes, load sub-tests and auto-set base price
  const handleCategoryChange = (e) => {
    const catId = e.target.value
    const cat   = testCats.find(c => c._id === catId)
    setSubTests(cat?.subTests || [])
    setForm(f => ({
      ...f,
      testCategoryId: catId,
      testCategory:   cat?.name || '',
      testId: '', testName: '',
      fee: cat?.basePrice || '',
    }))
  }

  const handleSubTestChange = (e) => {
    const tid  = e.target.value
    const sub  = subTests.find(s => s._id === tid)
    setForm(f => ({
      ...f,
      testId:   tid,
      testName: sub?.name || '',
      fee:      sub?.price ?? f.fee,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const res = await api.post('/patients', {
        ...form,
        age: Number(form.age),
        fee: Number(form.fee),
      })
      setSuccess(res.data.patient)
      setForm(DEF)
      setSubTests([])
      // animate receipt
      setTimeout(() => {
        if (receiptRef.current) gsap.fromTo(receiptRef.current,{scale:.95,opacity:0},{scale:1,opacity:1,duration:.4})
      }, 50)
    } catch(err) {
      setError(err.response?.data?.error || 'Failed to register patient')
    } finally { setLoading(false) }
  }

  const printReceipt = () => {
    if (!success) return
    const w = window.open('','_blank')
    w.document.write(`<!DOCTYPE html><html><head><title>Receipt #${success.receiptNo}</title>
    <style>
      body{font-family:Arial,sans-serif;font-size:13px;max-width:300px;margin:20px auto;color:#1a1a1a}
      h2{text-align:center;font-size:16px;margin-bottom:4px}
      p.sub{text-align:center;font-size:11px;color:#666;margin-bottom:16px}
      .row{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px dashed #eee}
      .row:last-child{border:none}
      .total{font-size:16px;font-weight:bold;margin-top:12px;text-align:right}
      .token{text-align:center;font-size:36px;font-weight:900;color:#0EA5A0;margin:16px 0}
      .footer{text-align:center;font-size:10px;color:#999;margin-top:20px}
    </style></head><body>
    <h2>${user?.clinic?.name || 'MediRecord Clinic'}</h2>
    <p class="sub">Patient Receipt</p>
    <div class="token">Token #${String(success.tokenNo).padStart(3,'0')}</div>
    <div class="row"><span>Receipt No</span><span>${success.receiptNo}</span></div>
    <div class="row"><span>Patient</span><span>${success.name}</span></div>
    <div class="row"><span>Age/Gender</span><span>${success.age} yrs · ${success.gender}</span></div>
    <div class="row"><span>Test</span><span>${success.testName}</span></div>
    <div class="row"><span>Referred By</span><span>${success.referredBy||'—'}</span></div>
    <div class="row"><span>Payment</span><span>${success.isPaid?'Paid':'Pending'} (${success.paymentMode})</span></div>
    <div class="total">₹${success.fee}</div>
    <div class="footer">Date: ${new Date(success.visitDate).toLocaleDateString('en-IN')} &nbsp;|&nbsp; MediRecord EMR</div>
    </body></html>`)
    w.document.close(); w.focus()
    setTimeout(()=>{w.print();w.close()},400)
  }

  const f = k => ({ value: form[k], onChange: e => setForm({...form,[k]:e.target.value}) })

  return (
    <div className="register-page">
      <div className="page-header">
        <div><h1>Register Patient</h1><p>New patient visit registration & billing</p></div>
      </div>

      <div className="register-layout">
        {/* FORM */}
        <form ref={formRef} onSubmit={handleSubmit} className="card register-form">
          {error && <div className="alert alert--error">{error}</div>}

          <div className="register-section">
            <div className="register-section__title">Patient Details</div>
            <div className="form-grid-2">
              <div className="form-group" style={{gridColumn:'1/-1'}}>
                <label>Patient Name *</label>
                <input {...f('name')} required placeholder="Full name" />
              </div>
              <div className="form-group">
                <label>Age *</label>
                <div style={{display:'flex',gap:'6px'}}>
                  <input type="number" {...f('age')} required min={0} max={150} style={{flex:1}} />
                  <select value={form.ageUnit} onChange={e=>setForm({...form,ageUnit:e.target.value})} style={{width:'90px'}}>
                    <option value="years">Yrs</option>
                    <option value="months">Mo</option>
                    <option value="days">Days</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Gender *</label>
                <select {...f('gender')} required>
                  {GENDERS.map(g=><option key={g}>{g}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input {...f('phone')} required placeholder="10-digit number" maxLength={10} />
              </div>
              <div className="form-group">
                <label>Husband / Father Name</label>
                <input {...f('husbandName')} placeholder="For OBS/Gynae" />
              </div>
              <div className="form-group">
                <label>LMP Date</label>
                <input type="date" {...f('lmp')} />
              </div>
              <div className="form-group" style={{gridColumn:'1/-1'}}>
                <label>Address</label>
                <input {...f('address')} placeholder="Patient address" />
              </div>
            </div>
          </div>

          <div className="register-section">
            <div className="register-section__title">Test & Billing</div>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Test Category *</label>
                <select value={form.testCategoryId} onChange={handleCategoryChange} required>
                  <option value="">Select category</option>
                  {testCats.filter(c=>c.isActive).map(c=>(
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Sub Test *</label>
                <select value={form.testId} onChange={handleSubTestChange} required disabled={!subTests.length && !form.testCategoryId}>
                  <option value="">
                    {subTests.length ? 'Select sub-test' : form.testCategoryId ? 'No sub-tests configured' : 'Select category first'}
                  </option>
                  {subTests.map(s=>(
                    <option key={s._id} value={s._id}>{s.name} — ₹{s.price}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Fee (₹) *</label>
                <input type="number" value={form.fee} onChange={e=>setForm({...form,fee:e.target.value})} required min={0} placeholder="Auto-filled from test" />
              </div>
              <div className="form-group">
                <label>Payment Mode</label>
                <select {...f('paymentMode')}>
                  {PAY_MODES.map(m=><option key={m} value={m}>{m.charAt(0).toUpperCase()+m.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group" style={{gridColumn:'1/-1'}}>
                <label style={{display:'flex',alignItems:'center',gap:'8px',cursor:'pointer',textTransform:'none',fontSize:'13px',fontWeight:600}}>
                  <input type="checkbox" checked={form.isPaid} onChange={e=>setForm({...form,isPaid:e.target.checked})} style={{width:'16px',height:'16px'}}/>
                  Mark as Paid
                </label>
              </div>
            </div>
          </div>

          <div className="register-section">
            <div className="register-section__title">Referral</div>
            <div className="form-group">
              <label>Referred By (Doctor / Source)</label>
              <input {...f('referredBy')} placeholder="Dr. Name or self-referral" />
            </div>
          </div>

          <div className="register-form__footer">
            <button type="button" className="btn btn--secondary" onClick={()=>{setForm(DEF);setSubTests([])}}>Clear</button>
            <button type="submit" className="btn btn--primary btn--lg" disabled={loading}>
              {loading ? 'Registering...' : '+ Register & Generate Token'}
            </button>
          </div>
        </form>

        {/* RECEIPT / SUCCESS */}
        <div className="register-right">
          {success ? (
            <div className="receipt card" ref={receiptRef}>
              <div className="receipt__header">
                <div className="receipt__clinic">{user?.clinic?.name || 'MediRecord Clinic'}</div>
                <div className="receipt__subtitle">Patient Token Receipt</div>
              </div>
              <div className="receipt__token">#{String(success.tokenNo).padStart(3,'0')}</div>
              <div className="receipt__rows">
                {[
                  ['Receipt', success.receiptNo],
                  ['Patient', success.name],
                  ['Age/Gender', `${success.age} yrs · ${success.gender}`],
                  ['Phone', success.phone],
                  ['Test', success.testName],
                  ['Category', success.testCategory],
                  success.referredBy && ['Ref By', success.referredBy],
                  success.husbandName && ['H/O', success.husbandName],
                ].filter(Boolean).map(([l,v])=>(
                  <div key={l} className="receipt__row">
                    <span className="receipt__row-label">{l}</span>
                    <span className="receipt__row-val">{v}</span>
                  </div>
                ))}
              </div>
              <div className="receipt__fee">
                <span>Total</span>
                <span>₹{success.fee}</span>
              </div>
              <div className="receipt__pay">
                <span className={`badge badge--${success.isPaid?'green':'amber'}`}>
                  {success.isPaid?'✓ Paid':'⏳ Pending'}
                </span>
                <span className="badge badge--gray">{success.paymentMode?.toUpperCase()}</span>
              </div>
              <div className="receipt__date">{new Date(success.visitDate).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
              <button className="btn btn--primary" style={{width:'100%',justifyContent:'center',marginTop:'12px'}} onClick={printReceipt}>
                🖨 Print Receipt
              </button>
              <button className="btn btn--secondary" style={{width:'100%',justifyContent:'center',marginTop:'8px'}} onClick={()=>setSuccess(null)}>
                Register Another
              </button>
            </div>
          ) : (
            <div className="register-placeholder card">
              <div className="register-placeholder__icon">🏥</div>
              <div className="register-placeholder__text">Fill the form to register a patient</div>
              <div className="register-placeholder__sub">A token number and receipt will appear here</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
