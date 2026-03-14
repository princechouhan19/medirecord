import { useRef } from 'react'

export default function BillView({ bill, onClose }) {
  const ref = useRef(null)

  const buildHtml = () => {
    const hasGst = bill.gstEnabled && bill.taxAmt > 0
    const clinicLogo = bill.clinic?.logoUrl || bill.clinic?.logo || ''
    const gstin = bill.clinic?.gstSettings?.gstin || ''

    return `<!DOCTYPE html><html><head><title>Bill ${bill.billNo}</title>
    <meta charset="UTF-8">
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Segoe UI',Arial,sans-serif;font-size:12.5px;color:#0f172a;max-width:520px;margin:0 auto;padding:28px}
      .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2.5px solid #0EA5A0;padding-bottom:14px;margin-bottom:18px}
      .logo-area{display:flex;flex-direction:column;gap:4px}
      .logo-img{height:36px;object-fit:contain;max-width:140px}
      .clinic-name{font-size:17px;font-weight:800;color:#0EA5A0}
      .clinic-sub{font-size:10.5px;color:#64748b;line-height:1.5}
      .bill-meta{text-align:right}
      .bill-no{font-size:22px;font-weight:900;color:#0EA5A0;letter-spacing:-.5px}
      .bill-date{font-size:11px;color:#94a3b8;margin-top:2px}
      .patient-box{background:#f0f4f8;border-radius:8px;padding:11px 14px;margin-bottom:16px}
      .patient-label{font-size:9px;text-transform:uppercase;color:#94a3b8;font-weight:700;letter-spacing:.07em;display:block;margin-bottom:4px}
      .patient-name{font-size:15px;font-weight:800}
      .patient-sub{font-size:11px;color:#475569;margin-top:2px}
      table{width:100%;border-collapse:collapse;margin-bottom:14px}
      thead tr{background:#f8fafc}
      th{font-size:9.5px;text-transform:uppercase;color:#94a3b8;padding:8px 10px;text-align:left;border-bottom:1px solid #e2e8f0;font-weight:700;letter-spacing:.06em}
      td{padding:9px 10px;border-bottom:1px solid #f1f5f9;font-size:13px}
      .amt{text-align:right;font-weight:700;font-family:monospace}
      .summary{margin:0 0 14px auto;width:240px}
      .srow{display:flex;justify-content:space-between;padding:4px 0;font-size:12.5px}
      .sdiscount{color:#f59e0b}
      .stax{color:#3b82f6;font-size:12px}
      .stotal{font-size:17px;font-weight:900;color:#0EA5A0;border-top:2.5px solid #0EA5A0;padding-top:8px;margin-top:6px}
      .status-row{display:flex;align-items:center;gap:8px;margin-bottom:14px}
      .badge{display:inline-block;padding:3px 12px;border-radius:100px;font-size:12px;font-weight:700}
      .paid{background:#ecfdf5;color:#065f46}.pending{background:#fffbeb;color:#92400e}
      .bgray{background:#f1f5f9;color:#475569}
      .notes{background:#fafafa;border:1px solid #e2e8f0;border-radius:6px;padding:8px 12px;font-size:12px;color:#475569;margin-bottom:14px}
      .sig-area{display:flex;justify-content:flex-end;margin-top:24px}
      .sig-line{border-top:1px solid #0f172a;width:160px;padding-top:5px;font-size:10px;color:#64748b;text-align:center}
      .footer{border-top:1px dashed #e2e8f0;padding-top:12px;margin-top:14px;text-align:center;font-size:10px;color:#94a3b8}
      @media print{body{padding:16px;max-width:100%}@page{margin:.8cm;size:A5}}
    </style></head><body>
    <div class="header">
      <div class="logo-area">
        ${clinicLogo ? `<img src="${clinicLogo}" alt="logo" class="logo-img">` : ''}
        <div class="clinic-name">${bill.clinic?.name || 'MediRecord Clinic'}</div>
        ${bill.clinic?.address ? `<div class="clinic-sub">📍 ${bill.clinic.address}</div>` : ''}
        ${bill.clinic?.phone  ? `<div class="clinic-sub">📞 ${bill.clinic.phone}</div>` : ''}
        ${gstin ? `<div class="clinic-sub">GSTIN: ${gstin}</div>` : ''}
      </div>
      <div class="bill-meta">
        <div class="bill-no">${bill.billNo}</div>
        <div class="bill-date">${new Date(bill.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</div>
      </div>
    </div>

    <div class="patient-box">
      <span class="patient-label">Billed To</span>
      <div class="patient-name">${bill.patient?.name}</div>
      <div class="patient-sub">${bill.patient?.age} yrs · ${bill.patient?.gender}${bill.patient?.phone ? ' · '+bill.patient.phone : ''}</div>
      ${bill.patient?.address ? `<div class="patient-sub">📍 ${bill.patient.address}</div>` : ''}
    </div>

    <table>
      <thead><tr><th>#</th><th>Description</th><th class="amt">Amount</th></tr></thead>
      <tbody>
        ${(bill.items||[]).map((item,i)=>`<tr><td style="color:#94a3b8;width:28px">${i+1}</td><td>${item.description}</td><td class="amt">₹${item.amount?.toLocaleString('en-IN')}</td></tr>`).join('')}
      </tbody>
    </table>

    <div class="summary">
      <div class="srow"><span>Subtotal</span><span>₹${bill.subtotal?.toLocaleString('en-IN')}</span></div>
      ${bill.discountAmt > 0 ? `<div class="srow sdiscount"><span>Discount</span><span>-₹${bill.discountAmt}</span></div>` : ''}
      ${bill.cgstAmt > 0 ? `<div class="srow stax"><span>CGST (${bill.cgstPercent||''}%)</span><span>₹${bill.cgstAmt}</span></div>` : ''}
      ${bill.sgstAmt > 0 ? `<div class="srow stax"><span>SGST (${bill.sgstPercent||''}%)</span><span>₹${bill.sgstAmt}</span></div>` : ''}
      ${bill.igstAmt > 0 ? `<div class="srow stax"><span>IGST (${bill.igstPercent||''}%)</span><span>₹${bill.igstAmt}</span></div>` : ''}
      <div class="srow stotal"><span>Total</span><span>₹${bill.total?.toLocaleString('en-IN')}</span></div>
    </div>

    <div class="status-row">
      <span class="badge ${bill.isPaid?'paid':'pending'}">${bill.isPaid ? '✓ PAID' : '⏳ PENDING'}</span>
      <span class="badge bgray">${(bill.paymentMode||'').toUpperCase()}</span>
    </div>

    ${bill.notes ? `<div class="notes">📝 ${bill.notes}</div>` : ''}

    <div class="sig-area"><div class="sig-line">Authorized Signature</div></div>

    <div class="footer">
      Thank you for choosing us · MediRecord EMR · This is a computer generated bill
    </div>
    </body></html>`
  }

  const handlePrint = () => {
    const w = window.open('', '_blank', 'width=700,height=800')
    w.document.write(buildHtml())
    w.document.close(); w.focus()
    setTimeout(() => { w.print() }, 500)
  }

  const handleSavePdf = () => {
    const w = window.open('', '_blank', 'width=700,height=800')
    w.document.write(buildHtml())
    w.document.close(); w.focus()
    setTimeout(() => { w.print() }, 500)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal--wide">
        <div className="modal__header">
          <div>
            <h2>Bill — {bill.billNo}</h2>
            <div style={{fontSize:11,color:'var(--text-3)',marginTop:2}}>
              {new Date(bill.createdAt).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
            </div>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <button className="btn btn--secondary btn--sm" onClick={handleSavePdf}>📄 Save PDF</button>
            <button className="btn btn--primary btn--sm" onClick={handlePrint}>🖨 Print</button>
            <button className="modal__close" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="modal__body">
          {/* Preview */}
          <div style={{background:'var(--bg)',borderRadius:10,padding:20,display:'flex',flexDirection:'column',gap:12}}>
            {/* Header */}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',borderBottom:'2px solid var(--teal)',paddingBottom:12}}>
              <div>
                {(bill.clinic?.logoUrl || bill.clinic?.logo) && (
                  <img src={bill.clinic.logoUrl || bill.clinic.logo} alt="" style={{height:30,objectFit:'contain',marginBottom:4}} />
                )}
                <div style={{fontWeight:800,fontSize:16,color:'var(--teal)'}}>{bill.clinic?.name||'MediRecord Clinic'}</div>
                {bill.clinic?.address && <div style={{fontSize:11,color:'var(--text-3)'}}>{bill.clinic.address}</div>}
                {bill.clinic?.gstSettings?.gstin && <div style={{fontSize:11,color:'var(--text-3)'}}>GSTIN: {bill.clinic.gstSettings.gstin}</div>}
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontFamily:'var(--font-num)',fontSize:20,fontWeight:900,color:'var(--teal)'}}>{bill.billNo}</div>
                <div style={{fontSize:11,color:'var(--text-3)'}}>{new Date(bill.createdAt).toLocaleDateString('en-IN')}</div>
              </div>
            </div>

            {/* Patient */}
            <div style={{background:'white',borderRadius:8,padding:'10px 14px'}}>
              <div style={{fontSize:9,textTransform:'uppercase',fontWeight:700,color:'var(--text-3)',letterSpacing:'.06em',marginBottom:4}}>Billed To</div>
              <div style={{fontWeight:800,fontSize:15}}>{bill.patient?.name}</div>
              <div style={{fontSize:11,color:'var(--text-2)',marginTop:2}}>{bill.patient?.age}y · {bill.patient?.gender}{bill.patient?.phone?' · '+bill.patient.phone:''}</div>
            </div>

            {/* Items */}
            <div style={{background:'white',borderRadius:8,overflow:'hidden'}}>
              <table className="data-table" style={{minWidth:'unset'}}>
                <thead><tr><th>#</th><th>Description</th><th style={{textAlign:'right'}}>Amount</th></tr></thead>
                <tbody>
                  {(bill.items||[]).map((item,i)=>(
                    <tr key={i}>
                      <td style={{width:28,color:'var(--text-3)',fontSize:12}}>{i+1}</td>
                      <td>{item.description}</td>
                      <td style={{textAlign:'right',fontFamily:'var(--font-num)',fontWeight:700}}>₹{item.amount?.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:3}}>
              <div style={{width:240}}>
                {[
                  bill.subtotal > 0 && ['Subtotal', `₹${bill.subtotal?.toLocaleString('en-IN')}`, 'normal'],
                  bill.discountAmt > 0 && [`Discount`, `-₹${bill.discountAmt}`, 'discount'],
                  bill.cgstAmt > 0 && [`CGST (${bill.cgstPercent}%)`, `₹${bill.cgstAmt}`, 'tax'],
                  bill.sgstAmt > 0 && [`SGST (${bill.sgstPercent}%)`, `₹${bill.sgstAmt}`, 'tax'],
                  bill.igstAmt > 0 && [`IGST (${bill.igstPercent}%)`, `₹${bill.igstAmt}`, 'tax'],
                ].filter(Boolean).map(([l,v,t]) => (
                  <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'3px 0',fontSize:13,color:t==='discount'?'var(--amber)':t==='tax'?'var(--blue)':'var(--text-1)'}}>
                    <span>{l}</span><span style={{fontFamily:'var(--font-num)'}}>{v}</span>
                  </div>
                ))}
                <div style={{display:'flex',justifyContent:'space-between',padding:'8px 0 4px',fontSize:17,fontWeight:800,color:'var(--teal)',borderTop:'2px solid var(--teal)',marginTop:4}}>
                  <span>Total</span><span>₹{bill.total?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div style={{display:'flex',gap:8}}>
              <span className={`badge badge--${bill.isPaid?'green':'amber'}`} style={{fontSize:13,padding:'4px 14px'}}>
                {bill.isPaid?'✓ PAID':'⏳ PENDING'}
              </span>
              <span className="badge badge--gray">{bill.paymentMode?.toUpperCase()}</span>
            </div>
            {bill.notes && <div style={{background:'white',borderRadius:8,padding:'8px 14px',fontSize:12,color:'var(--text-2)'}}>📝 {bill.notes}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
