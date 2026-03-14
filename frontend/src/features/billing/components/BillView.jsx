import { useRef } from 'react'

export default function BillView({ bill, onClose }) {
  const ref = useRef(null)

  const buildHtml = () => `<!DOCTYPE html><html><head><title>Bill ${bill.billNo}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,sans-serif;font-size:13px;color:#0f172a;max-width:480px;margin:0 auto;padding:24px}
    .hd{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #0EA5A0;padding-bottom:14px;margin-bottom:18px}
    .hd-left img{height:40px;object-fit:contain;display:block;margin-bottom:4px}
    .clinic-name{font-size:17px;font-weight:800;color:#0EA5A0}
    .clinic-sub{font-size:11px;color:#64748b;margin-top:2px}
    .bill-to{background:#f0f4f8;border-radius:8px;padding:12px;margin-bottom:16px}
    .bill-to label{font-size:9px;text-transform:uppercase;color:#94a3b8;font-weight:700;display:block;margin-bottom:4px}
    .pt-name{font-size:15px;font-weight:800}
    .pt-sub{font-size:11px;color:#475569;margin-top:2px}
    table{width:100%;border-collapse:collapse;margin-bottom:14px}
    th{background:#f8fafc;font-size:10px;text-transform:uppercase;color:#94a3b8;padding:8px 10px;text-align:left;border-bottom:1px solid #e2e8f0}
    td{padding:9px 10px;border-bottom:1px solid #e2e8f0;font-size:13px}
    .amt{text-align:right;font-family:monospace;font-weight:700}
    .summary{margin-left:auto;width:220px;margin-bottom:14px}
    .srow{display:flex;justify-content:space-between;padding:4px 0;font-size:13px}
    .stotal{border-top:2px solid #0EA5A0;padding-top:8px;margin-top:4px;font-size:17px;font-weight:800;color:#0EA5A0}
    .status-row{margin-bottom:12px}
    .badge{display:inline-block;padding:3px 12px;border-radius:100px;font-size:12px;font-weight:700}
    .paid{background:#ecfdf5;color:#065f46}.pending{background:#fffbeb;color:#92400e}
    .bgray{background:#f1f5f9;color:#475569}
    .notes{background:#f8fafc;border-radius:6px;padding:8px 12px;font-size:12px;color:#475569;margin-bottom:12px}
    .footer{text-align:center;font-size:10px;color:#94a3b8;border-top:1px dashed #e2e8f0;padding-top:12px;margin-top:4px}
    @media print{body{padding:12px}@page{margin:1cm}}
  </style></head><body>
  <div class="hd">
    <div class="hd-left">
      ${bill.clinic?.logo ? `<img src="${bill.clinic.logo}" alt="logo">` : ''}
      <div class="clinic-name">${bill.clinic?.name || 'MediRecord Clinic'}</div>
      ${bill.clinic?.address ? `<div class="clinic-sub">📍 ${bill.clinic.address}</div>` : ''}
      ${bill.clinic?.phone  ? `<div class="clinic-sub">📞 ${bill.clinic.phone}</div>` : ''}
    </div>
    <div style="text-align:right">
      <div style="font-size:22px;font-weight:900;color:#0EA5A0">${bill.billNo}</div>
      <div style="font-size:11px;color:#94a3b8">${new Date(bill.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</div>
    </div>
  </div>
  <div class="bill-to">
    <label>Billed To</label>
    <div class="pt-name">${bill.patient?.name}</div>
    <div class="pt-sub">${bill.patient?.age} yrs · ${bill.patient?.gender}${bill.patient?.phone ? ' · ' + bill.patient.phone : ''}</div>
    ${bill.patient?.address ? `<div class="pt-sub">📍 ${bill.patient.address}</div>` : ''}
  </div>
  <table>
    <tr><th>#</th><th>Description</th><th class="amt">Amount</th></tr>
    ${(bill.items||[]).map((item,i)=>`<tr><td>${i+1}</td><td>${item.description}</td><td class="amt">₹${item.amount.toLocaleString('en-IN')}</td></tr>`).join('')}
  </table>
  <div class="summary">
    <div class="srow"><span>Subtotal</span><span>₹${(bill.subtotal||0).toLocaleString('en-IN')}</span></div>
    ${bill.discountAmt>0 ? `<div class="srow" style="color:#f59e0b"><span>Discount</span><span>-₹${bill.discountAmt}</span></div>` : ''}
    <div class="srow stotal"><span>Total</span><span>₹${(bill.total||0).toLocaleString('en-IN')}</span></div>
  </div>
  <div class="status-row">
    <span class="badge ${bill.isPaid?'paid':'pending'}">${bill.isPaid ? '✓ PAID' : '⏳ PENDING'}</span>
    <span class="badge bgray" style="margin-left:6px">${(bill.paymentMode||'').toUpperCase()}</span>
  </div>
  ${bill.notes ? `<div class="notes">📝 ${bill.notes}</div>` : ''}
  <div class="footer">Thank you for choosing us · MediRecord EMR · Printed ${new Date().toLocaleString('en-IN')}</div>
  </body></html>`

  const handlePrint = () => {
    const w = window.open('', '_blank')
    w.document.write(buildHtml())
    w.document.close(); w.focus()
    setTimeout(() => { w.print(); w.close() }, 400)
  }

  const handleDownload = () => {
    const w = window.open('', '_blank', 'width=700,height=700')
    w.document.write(buildHtml())
    w.document.close()
    w.focus()
    setTimeout(() => { w.print() }, 500)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal--wide">
        <div className="modal__header">
          <div>
            <h2>Bill — {bill.billNo}</h2>
            <div style={{fontSize:11,color:'var(--text-3)',marginTop:2}}>
              {new Date(bill.createdAt).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}
            </div>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <button className="btn btn--secondary btn--sm" onClick={handleDownload}>📄 Save PDF</button>
            <button className="btn btn--primary btn--sm" onClick={handlePrint}>🖨 Print</button>
            <button className="modal__close" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="modal__body" ref={ref}>
          <div style={{background:'var(--bg)',borderRadius:10,padding:20,display:'flex',flexDirection:'column',gap:14}}>
            {/* Clinic header */}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',borderBottom:'2px solid var(--teal)',paddingBottom:12}}>
              <div>
                {bill.clinic?.logo && <img src={bill.clinic.logo} alt="" style={{height:32,objectFit:'contain',marginBottom:4}} />}
                <div style={{fontWeight:800,fontSize:16,color:'var(--teal)'}}>{bill.clinic?.name||'MediRecord Clinic'}</div>
                {bill.clinic?.address && <div style={{fontSize:11,color:'var(--text-3)'}}>{bill.clinic.address}</div>}
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontFamily:'var(--font-num)',fontSize:22,fontWeight:900,color:'var(--teal)'}}>{bill.billNo}</div>
                <div style={{fontSize:11,color:'var(--text-3)'}}>{new Date(bill.createdAt).toLocaleDateString('en-IN')}</div>
              </div>
            </div>

            {/* Patient */}
            <div style={{background:'white',borderRadius:8,padding:'10px 14px'}}>
              <div style={{fontSize:9,textTransform:'uppercase',fontWeight:700,color:'var(--text-3)',letterSpacing:'.06em',marginBottom:4}}>Billed To</div>
              <div style={{fontWeight:800,fontSize:15}}>{bill.patient?.name}</div>
              <div style={{fontSize:11,color:'var(--text-2)',marginTop:2}}>
                {bill.patient?.age}y · {bill.patient?.gender}{bill.patient?.phone ? ' · '+bill.patient.phone : ''}
              </div>
            </div>

            {/* Items */}
            <div style={{background:'white',borderRadius:8,overflow:'hidden'}}>
              <table className="data-table" style={{minWidth:'unset'}}>
                <thead><tr><th>#</th><th>Description</th><th style={{textAlign:'right'}}>Amount</th></tr></thead>
                <tbody>
                  {(bill.items||[]).map((item,i) => (
                    <tr key={i}>
                      <td style={{width:32,color:'var(--text-3)',fontSize:12}}>{i+1}</td>
                      <td>{item.description}</td>
                      <td style={{textAlign:'right',fontFamily:'var(--font-num)',fontWeight:700}}>₹{item.amount?.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4}}>
              <div style={{width:220}}>
                <div style={{display:'flex',justifyContent:'space-between',padding:'4px 0',fontSize:13}}>
                  <span style={{color:'var(--text-2)'}}>Subtotal</span>
                  <span>₹{bill.subtotal?.toLocaleString('en-IN')}</span>
                </div>
                {bill.discountAmt > 0 && (
                  <div style={{display:'flex',justifyContent:'space-between',padding:'4px 0',fontSize:13,color:'var(--amber)'}}>
                    <span>Discount</span><span>-₹{bill.discountAmt}</span>
                  </div>
                )}
                <div style={{display:'flex',justifyContent:'space-between',padding:'8px 0 4px',fontSize:17,fontWeight:800,color:'var(--teal)',borderTop:'2px solid var(--teal)',marginTop:4}}>
                  <span>Total</span><span>₹{bill.total?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <span className={`badge badge--${bill.isPaid?'green':'amber'}`} style={{fontSize:13,padding:'4px 14px'}}>
                {bill.isPaid ? '✓ PAID' : '⏳ PENDING'}
              </span>
              <span className="badge badge--gray">{bill.paymentMode?.toUpperCase()}</span>
            </div>

            {bill.notes && (
              <div style={{background:'white',borderRadius:8,padding:'8px 14px',fontSize:12,color:'var(--text-2)'}}>
                📝 {bill.notes}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
