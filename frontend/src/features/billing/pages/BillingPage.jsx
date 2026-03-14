import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useAuth } from '../../auth/hooks/useAuth'
import api from '../../../services/api'
import BillView from '../components/BillView'
import '../styles/billing.scss'

const PAY_MODES = ['cash','upi','card','cheque','pending']
const PAY_ICONS = { cash:'💵', upi:'📱', card:'💳', cheque:'📝', pending:'⏳' }

function NewBillModal({ patients, clinic, onClose, onSave }) {
  const { user } = useAuth()
  const gst      = clinic?.gstSettings || {}
  const [patientId, setPatientId]         = useState('')
  const [items, setItems]                 = useState([{ description:'', amount:'' }])
  const [discountType, setDiscountType]   = useState('flat')
  const [discountValue, setDiscountValue] = useState('')
  const [gstEnabled, setGstEnabled]       = useState(gst.enabled || false)
  const [gstType, setGstType]             = useState(gst.gstType || 'CGST_SGST')
  const [cgstPct, setCgstPct]             = useState(gst.cgstPercent || 9)
  const [sgstPct, setSgstPct]             = useState(gst.sgstPercent || 9)
  const [igstPct, setIgstPct]             = useState(gst.igstPercent || 18)
  const [isPaid, setIsPaid]               = useState(true)
  const [paymentMode, setPaymentMode]     = useState('cash')
  const [notes, setNotes]                 = useState('')
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState('')

  const canDiscount = user?.role === 'clinic_owner' ||
    (clinic?.settings?.discountRoles || []).includes(user?.role)

  const subtotal   = items.reduce((s,i) => s + (parseFloat(i.amount)||0), 0)
  const dv         = parseFloat(discountValue) || 0
  const discAmt    = discountType === 'percent' ? Math.round(subtotal * dv / 100) : Math.min(dv, subtotal)
  const afterDisc  = Math.max(0, subtotal - discAmt)
  const cgstAmt    = gstEnabled && gstType === 'CGST_SGST' ? Math.round(afterDisc * cgstPct / 100) : 0
  const sgstAmt    = gstEnabled && gstType === 'CGST_SGST' ? Math.round(afterDisc * sgstPct / 100) : 0
  const igstAmt    = gstEnabled && gstType === 'IGST'      ? Math.round(afterDisc * igstPct / 100) : 0
  const taxAmt     = cgstAmt + sgstAmt + igstAmt
  const total      = afterDisc + taxAmt

  const addItem = () => setItems(s => [...s, { description:'', amount:'' }])
  const rmItem  = i => setItems(s => s.filter((_,j) => j !== i))
  const updItem = (i,k,v) => setItems(s => s.map((r,j) => j===i ? {...r,[k]:v} : r))

  const handlePatientChange = e => {
    const pid = e.target.value; setPatientId(pid)
    const pt = patients.find(p => p._id === pid)
    if (pt?.testName) setItems([{ description: pt.testName, amount: String(pt.fee||'') }])
  }

  const handleSave = async () => {
    if (!patientId) return setError('Select a patient')
    const validItems = items.filter(i => i.description && i.amount)
    if (!validItems.length) return setError('Add at least one item')
    setLoading(true); setError('')
    try {
      const r = await api.post('/bills', {
        patient: patientId,
        items: validItems.map(i => ({ description:i.description, amount:parseFloat(i.amount)||0 })),
        discountType, discountValue: parseFloat(discountValue)||0,
        gstEnabled, gstType,
        cgstPercent: cgstPct, sgstPercent: sgstPct, igstPercent: igstPct,
        isPaid, paymentMode, notes,
      })
      onSave(r.data.bill)
    } catch(e) { setError(e.response?.data?.error || 'Failed to create bill') }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal--wide">
        <div className="modal__header">
          <h2>Create Bill</h2>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>
        {error && <div className="alert alert--error" style={{margin:'0 20px'}}>{error}</div>}
        <div className="modal__form">
          <div className="form-group">
            <label>Patient *</label>
            <select value={patientId} onChange={handlePatientChange} required>
              <option value="">Select patient</option>
              {patients.map(p => (
                <option key={p._id} value={p._id}>
                  #{String(p.tokenNo||'').padStart(3,'0')} · {p.name} — {p.testName}
                </option>
              ))}
            </select>
          </div>

          <div className="modal__section">Bill Items</div>
          <div className="bill-items">
            {items.map((item,i) => (
              <div key={i} className="bill-item">
                <input value={item.description} onChange={e => updItem(i,'description',e.target.value)}
                  placeholder="Description (e.g. USG Obstetric)" className="bill-item__desc" />
                <div className="bill-item__price">
                  <span>₹</span>
                  <input type="number" value={item.amount}
                    onChange={e => updItem(i,'amount',e.target.value)} placeholder="0" min={0} />
                </div>
                {items.length > 1 && (
                  <button className="btn btn--danger btn--sm btn--icon" onClick={() => rmItem(i)}>✕</button>
                )}
              </div>
            ))}
            <button className="btn btn--secondary btn--sm" onClick={addItem}>+ Add Item</button>
          </div>

          {/* Discount */}
          {canDiscount && (
            <>
              <div className="modal__section">Discount</div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Type</label>
                  <select value={discountType} onChange={e => setDiscountType(e.target.value)}>
                    <option value="flat">Flat Amount (₹)</option>
                    <option value="percent">Percentage (%)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Value</label>
                  <input type="number" value={discountValue}
                    onChange={e => setDiscountValue(e.target.value)}
                    placeholder="0" min={0} max={discountType==='percent'?100:undefined} />
                </div>
              </div>
            </>
          )}

          {/* GST */}
          <div className="modal__section">
            GST
            <label style={{display:'flex',alignItems:'center',gap:8,marginLeft:'auto',cursor:'pointer',textTransform:'none',fontSize:12,fontWeight:500}}>
              <input type="checkbox" checked={gstEnabled} onChange={e => setGstEnabled(e.target.checked)} style={{width:14,height:14,accentColor:'var(--teal)'}}/>
              Apply GST
            </label>
          </div>
          {gstEnabled && (
            <div style={{background:'var(--bg)',borderRadius:8,padding:'12px 14px',display:'flex',flexDirection:'column',gap:12}}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>GST Type</label>
                  <select value={gstType} onChange={e => setGstType(e.target.value)}>
                    <option value="CGST_SGST">CGST + SGST (Intra-state)</option>
                    <option value="IGST">IGST (Inter-state)</option>
                  </select>
                </div>
                {gstType === 'CGST_SGST' ? (
                  <>
                    <div className="form-group">
                      <label>CGST %</label>
                      <input type="number" value={cgstPct} onChange={e=>setCgstPct(Number(e.target.value))} min={0} max={50} />
                    </div>
                    <div className="form-group">
                      <label>SGST %</label>
                      <input type="number" value={sgstPct} onChange={e=>setSgstPct(Number(e.target.value))} min={0} max={50} />
                    </div>
                  </>
                ) : (
                  <div className="form-group">
                    <label>IGST %</label>
                    <input type="number" value={igstPct} onChange={e=>setIgstPct(Number(e.target.value))} min={0} max={100} />
                  </div>
                )}
              </div>
              <div style={{fontSize:11,color:'var(--text-3)'}}>
                💡 Note: Diagnostic services (SAC 9993) are typically exempt from GST in India. Enable only if applicable.
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="bill-summary">
            <div className="bill-summary__row"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
            {discAmt > 0 && (
              <div className="bill-summary__row bill-summary__row--discount">
                <span>Discount {discountType==='percent'?`(${dv}%)`:''}</span>
                <span>- ₹{discAmt.toLocaleString('en-IN')}</span>
              </div>
            )}
            {gstEnabled && cgstAmt > 0 && <div className="bill-summary__row bill-summary__row--tax"><span>CGST ({cgstPct}%)</span><span>₹{cgstAmt}</span></div>}
            {gstEnabled && sgstAmt > 0 && <div className="bill-summary__row bill-summary__row--tax"><span>SGST ({sgstPct}%)</span><span>₹{sgstAmt}</span></div>}
            {gstEnabled && igstAmt > 0 && <div className="bill-summary__row bill-summary__row--tax"><span>IGST ({igstPct}%)</span><span>₹{igstAmt}</span></div>}
            <div className="bill-summary__total"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Payment Mode</label>
              <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)}>
                {PAY_MODES.map(m => <option key={m} value={m}>{PAY_ICONS[m]} {m.charAt(0).toUpperCase()+m.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-group" style={{justifyContent:'flex-end'}}>
              <label style={{display:'flex',alignItems:'center',gap:8,textTransform:'none',fontSize:13,fontWeight:600,cursor:'pointer'}}>
                <input type="checkbox" checked={isPaid} onChange={e => setIsPaid(e.target.checked)} style={{width:16,height:16}}/>
                Mark as Paid
              </label>
            </div>
          </div>
          <div className="form-group">
            <label>Notes (optional)</label>
            <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional notes..." />
          </div>
        </div>
        <div className="modal__footer">
          <button className="btn btn--secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving…' : '💾 Save Bill'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BillingPage() {
  const { user } = useAuth()
  const [bills, setBills]       = useState([])
  const [patients, setPatients] = useState([])
  const [stats, setStats]       = useState({ todayCount:0, todayRevenue:0, totalRevenue:0 })
  const [clinic, setClinic]     = useState(null)
  const [showNew, setShowNew]   = useState(false)
  const [viewBill, setViewBill] = useState(null)
  const [dateFilter, setDate]   = useState(new Date().toISOString().split('T')[0])
  const ref = useRef(null)

  useEffect(() => {
    gsap.fromTo(ref.current, {y:-16,opacity:0}, {y:0,opacity:1,duration:.5})
    loadAll()
    api.get('/clinics/my/clinic').then(r => setClinic(r.data.clinic)).catch(()=>{})
  }, [])

  const loadAll = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const [b, p, s] = await Promise.all([
        api.get(`/bills?date=${today}`),
        api.get('/patients/today'),
        api.get('/bills/stats'),
      ])
      setBills(b.data.bills || [])
      setPatients(p.data.patients || [])
      setStats(s.data || {})
    } catch(e) {}
  }

  const handleDateChange = async e => {
    setDate(e.target.value)
    const r = await api.get(`/bills?date=${e.target.value}`)
    setBills(r.data.bills || [])
  }

  const handleViewBill = async id => {
    try { const r = await api.get(`/bills/${id}`); setViewBill(r.data.bill) } catch(e) {}
  }

  const handleNewBill = async bill => {
    setShowNew(false); await loadAll(); handleViewBill(bill._id)
  }

  return (
    <div style={{maxWidth:1200}}>
      <div className="page-header" ref={ref}>
        <div>
          <h1>Billing</h1>
          <p>Generate GST-ready bills with discounts · {clinic?.gstSettings?.enabled ? `GSTIN: ${clinic.gstSettings.gstin||'Not set'}` : 'GST not enabled'}</p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowNew(true)}>+ Create Bill</button>
      </div>

      <div className="billing-stats">
        {[
          { label:"Today's Bills",   val:stats.todayCount,   pre:'',  c:'var(--blue)' },
          { label:"Today's Revenue", val:stats.todayRevenue, pre:'₹', c:'var(--green)' },
          { label:"Total Revenue",   val:stats.totalRevenue, pre:'₹', c:'var(--teal)' },
        ].map(s => (
          <div key={s.label} className="card" style={{padding:18,borderTop:`3px solid ${s.c}`}}>
            <div style={{fontFamily:'var(--font-num)',fontSize:26,fontWeight:800,color:s.c}}>
              {s.pre}{(s.val||0).toLocaleString('en-IN')}
            </div>
            <div style={{fontSize:12,color:'var(--text-2)',fontWeight:600,marginTop:2}}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
        <label style={{fontSize:12,fontWeight:600,color:'var(--text-2)',textTransform:'uppercase',letterSpacing:'.04em'}}>Date</label>
        <input type="date" value={dateFilter} onChange={handleDateChange}
          style={{padding:'8px 12px',border:'1.5px solid var(--border)',borderRadius:6,fontSize:13,fontFamily:'inherit',outline:'none'}}/>
        <span style={{fontSize:13,color:'var(--text-3)'}}>{bills.length} bills</span>
      </div>

      <div className="card table-scroll">
        <table className="data-table">
          <thead>
            <tr><th>Bill #</th><th>Patient</th><th>Items</th><th>Discount</th><th>Tax</th><th>Total</th><th>Mode</th><th>Status</th><th>By</th><th></th></tr>
          </thead>
          <tbody>
            {bills.map(b => (
              <tr key={b._id}>
                <td className="td-mono">{b.billNo}</td>
                <td>
                  <div className="td-name">{b.patient?.name}</div>
                  <div className="td-muted">{b.patient?.age}y · {b.patient?.gender}</div>
                </td>
                <td style={{maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:12}}>
                  {b.items?.map(i=>i.description).join(', ')}
                </td>
                <td className="td-muted">{b.discountAmt > 0 ? `₹${b.discountAmt}` : '—'}</td>
                <td className="td-muted">{b.taxAmt > 0 ? `₹${b.taxAmt}` : '—'}</td>
                <td><span style={{fontFamily:'var(--font-num)',fontWeight:700,fontSize:15}}>₹{b.total?.toLocaleString('en-IN')}</span></td>
                <td><span className="badge badge--gray">{PAY_ICONS[b.paymentMode]} {b.paymentMode}</span></td>
                <td><span className={`badge badge--${b.isPaid?'green':'amber'}`}>{b.isPaid?'✓ Paid':'Pending'}</span></td>
                <td className="td-muted">{b.createdBy?.name?.split(' ')[0]||'—'}</td>
                <td><button className="btn btn--primary btn--sm" onClick={() => handleViewBill(b._id)}>View</button></td>
              </tr>
            ))}
            {bills.length === 0 && <tr><td colSpan={10} className="empty-row">No bills for this date</td></tr>}
          </tbody>
        </table>
      </div>

      {showNew && <NewBillModal patients={patients} clinic={clinic} onClose={() => setShowNew(false)} onSave={handleNewBill}/>}
      {viewBill && <BillView bill={viewBill} onClose={() => setViewBill(null)}/>}
    </div>
  )
}
