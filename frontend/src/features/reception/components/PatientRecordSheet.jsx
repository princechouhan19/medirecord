import api from '../../../services/api'

export function buildPatientRecordHtml(patient, clinic) {
  const p = patient || {}
  const c = clinic  || {}

  const fmt = d => d ? new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'2-digit',year:'numeric'}) : '—'
  const lmp    = p.lmp ? fmt(p.lmp) : '—'
  const weeks  = p.weeksOfPregnancy != null ? `${p.weeksOfPregnancy}w${p.daysOfPregnancy ? ` ${p.daysOfPregnancy}d` : ''}` : '—'
  const relative = p.relativeName ? `${p.relationType||'H/O'}: ${p.relativeName}` : p.husbandName ? `H/O: ${p.husbandName}` : '—'
  const referredBy = p.referredDoctor?.name || p.referredBy || 'Self'
  const address    = [p.address, p.district, p.state].filter(Boolean).join(', ') || '—'
  const clinicName = c.name || 'MediRecord Clinic'
  const token      = String(p.tokenNo || 0).padStart(3,'0')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Patient Record — ${p.name||'Patient'}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',Arial,sans-serif;font-size:10px;color:#0f172a;background:#fff}
  .page{width:210mm;min-height:297mm;padding:8mm 9mm;display:flex;flex-direction:column;gap:6px;page-break-after:always}
  .page:last-child{page-break-after:auto}

  /* ── Compact clinic header ── */
  .hd{display:flex;align-items:center;gap:10px;padding-bottom:6px;border-bottom:2px solid #0EA5A0;margin-bottom:4px}
  .hd-logo{height:28px;object-fit:contain;max-width:100px;flex-shrink:0}
  .hd-info{flex:1;min-width:0}
  .hd-name{font-size:12px;font-weight:900;color:#0EA5A0;line-height:1.1}
  .hd-sub{font-size:8px;color:#64748b;line-height:1.4;margin-top:1px}
  .hd-right{text-align:right;flex-shrink:0}
  .hd-token{font-size:16px;font-weight:900;color:#0EA5A0;font-family:monospace;line-height:1}
  .hd-title{font-size:8.5px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;margin-top:1px}
  .hd-date{font-size:8px;color:#64748b}

  /* ── Section ── */
  .sec{border:1px solid #e2e8f0;border-radius:4px;overflow:hidden;flex-shrink:0}
  .sec-h{background:#0EA5A0;color:#fff;font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:.07em;padding:3px 8px}
  .sec-h-dark{background:#1e293b}

  /* ── PNDT table ── */
  .pndt{width:100%;border-collapse:collapse}
  .pndt th{background:#0EA5A0;color:#fff;padding:2px 3px;text-align:center;border:1px solid rgba(255,255,255,.25);font-weight:700;font-size:7px;line-height:1.2}
  .pndt td{padding:3px 3px;border:1px solid #e2e8f0;vertical-align:top;line-height:1.3;font-size:7.5px}
  .pndt td strong{display:block;font-size:8px;font-weight:700}

  /* ── Data grid ── */
  .dg{display:grid;gap:0}
  .dg-2{grid-template-columns:1fr 1fr}
  .dg-3{grid-template-columns:1fr 1fr 1fr}
  .dg-4{grid-template-columns:repeat(4,1fr)}
  .dg-span{grid-column:1/-1}
  .cell{padding:4px 8px;border-bottom:1px solid #f1f5f9;border-right:1px solid #f1f5f9}
  .cell:last-child{border-right:none}
  .cell label{display:block;font-size:7.5px;font-weight:700;text-transform:uppercase;color:#94a3b8;letter-spacing:.04em;margin-bottom:1px}
  .cell .v{font-weight:700;font-size:9.5px;line-height:1.2}

  /* ── ID images ── */
  .img-pair{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:6px}
  .img-box{border:1px solid #e2e8f0;border-radius:4px;overflow:hidden;background:#f8fafc;display:flex;flex-direction:column;min-height:70px}
  .img-box img{width:100%;object-fit:contain;max-height:95px}
  .img-label{font-size:7px;font-weight:700;text-transform:uppercase;color:#64748b;padding:2px 5px;background:#f1f5f9;text-align:center;border-top:1px solid #e2e8f0}
  .img-empty{flex:1;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:9px;padding:10px;text-align:center}

  /* ── Referral slip — fills 90% of section ── */
  .slip-wrap{flex:1;display:flex;align-items:stretch;justify-content:center;padding:4px;min-height:100px}
  .slip-img{width:100%;height:100%;object-fit:contain;object-position:top;border:1px solid #e2e8f0;border-radius:4px;min-height:90px}
  .slip-empty{display:flex;align-items:center;justify-content:center;flex:1;color:#94a3b8;font-size:9px;padding:20px;text-align:center;font-style:italic}

  /* ── Report page ── */
  .report-wrap{flex:1;display:flex;align-items:center;justify-content:center;padding:6px}
  .report-img{max-width:100%;max-height:230mm;object-fit:contain;border:1px solid #e2e8f0;border-radius:4px}
  .report-lines{flex:1;padding:8px 10px;display:flex;flex-direction:column;gap:14px}
  .rline label{font-size:7.5px;font-weight:700;text-transform:uppercase;color:#94a3b8;display:block;margin-bottom:3px}
  .rline div{border-bottom:1px solid #cbd5e1;min-height:20px}

  .sig-row{display:flex;justify-content:flex-end;padding:5px 10px;gap:24px}
  .sig-line{border-top:1px solid #0f172a;min-width:120px;padding-top:3px;font-size:7.5px;color:#64748b;text-align:center}
  .footer{font-size:7.5px;color:#94a3b8;text-align:center;border-top:1px dashed #e2e8f0;padding-top:4px;margin-top:auto}
  .badge{display:inline-block;padding:1px 5px;border-radius:100px;font-size:7.5px;font-weight:700}
  .b-green{background:#ecfdf5;color:#065f46}
  .b-amber{background:#fffbeb;color:#92400e}

  @media print{
    body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .page{padding:7mm 8mm;width:100%}
    @page{size:A4;margin:0}
  }
</style>
</head>
<body>

<!-- ═══════════════════════════════════════════════════════════
     PAGE 1 — PNDT Register + ID Proof + Referral Slip
═══════════════════════════════════════════════════════════ -->
<div class="page">

  <!-- Compact header: logo | clinic info | token+title -->
  <div class="hd">
    ${c.logoUrl || c.logo ? `<img src="${c.logoUrl||c.logo}" class="hd-logo" alt="">` : ''}
    <div class="hd-info">
      <div class="hd-name">${clinicName}</div>
      <div class="hd-sub">
        ${[c.address, c.phone ? '📞 '+c.phone : '', c.pndtRegNo ? 'PNDT Reg: '+c.pndtRegNo : ''].filter(Boolean).join('  ·  ')}
      </div>
    </div>
    <div class="hd-right">
      <div class="hd-token">Token #${token}</div>
      <div class="hd-title">Patient Record Sheet</div>
      <div class="hd-date">PNDT Form F — Section A &nbsp;|&nbsp; ${fmt(p.visitDate||p.createdAt)}</div>
    </div>
  </div>

  <!-- PNDT 12-column register entry -->
  <div class="sec">
    <div class="sec-h">PNDT Form F — Register Entry (12-Column)</div>
    <div style="overflow-x:auto;padding:3px">
      <table class="pndt">
        <thead>
          <tr>
            <th style="width:20px">Sr.</th>
            <th style="width:52px">Reg. No.</th>
            <th style="width:46px">Date</th>
            <th style="width:90px">Patient Name / Age / Relative</th>
            <th>Address</th>
            <th style="width:70px">Referred By</th>
            <th style="width:38px">Children M/F</th>
            <th style="width:55px">LMP / Weeks</th>
            <th style="width:80px">Non-Invasive Indication</th>
            <th style="width:45px">Invasive</th>
            <th style="width:46px">Declaration Date</th>
            <th style="width:60px">Result / Findings</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align:center">${p.tokenNo||1}</td>
            <td>${p.pctsId||p.receiptNo||'—'}</td>
            <td style="white-space:nowrap">${fmt(p.visitDate||p.createdAt)}</td>
            <td>
              <strong>${p.name||'—'}</strong>
              ${p.age||'—'} yrs · ${relative}
            </td>
            <td style="font-size:7px">${address}</td>
            <td style="font-size:7px">${referredBy}</td>
            <td style="text-align:center">♂${p.livingChildrenMale||0}<br>♀${p.livingChildrenFemale||0}</td>
            <td style="text-align:center">${lmp}<br><strong>${weeks}</strong></td>
            <td style="font-size:7px">${p.testName||'—'}</td>
            <td style="text-align:center">—</td>
            <td style="text-align:center;font-size:7px">${p.patientRegDate?fmt(p.patientRegDate):fmt(p.visitDate||p.createdAt)}</td>
            <td style="min-width:55px">&nbsp;</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Identity Document -->
  <div class="sec">
    <div class="sec-h">Identity Document</div>
    <div class="dg dg-4">
      <div class="cell"><label>ID Proof Type</label><div class="v">${p.idProofType||'—'}</div></div>
      <div class="cell"><label>ID Number</label><div class="v">${p.idProofNo||'—'}</div></div>
      <div class="cell"><label>Patient Name</label><div class="v">${p.name||'—'}</div></div>
      <div class="cell"><label>DOB / Age</label><div class="v">${p.dob?fmt(p.dob):''} ${p.age?'· '+p.age+' yrs':''}</div></div>
    </div>
  </div>

  <!-- ID Proof Images -->
  <div class="sec">
    <div class="sec-h">ID Proof Images</div>
    <div class="img-pair">
      <div class="img-box">
        ${p.idProofFront ? `<img src="${p.idProofFront}" alt="ID Front">` : '<div class="img-empty">Front side not uploaded</div>'}
        <div class="img-label">Front Side</div>
      </div>
      <div class="img-box">
        ${p.idProofBack ? `<img src="${p.idProofBack}" alt="ID Back">` : '<div class="img-empty">Back side not uploaded</div>'}
        <div class="img-label">Back Side</div>
      </div>
    </div>
  </div>

  <!-- Referral Slip -->
  <div class="sec" style="flex:1;display:flex;flex-direction:column">
    <div class="sec-h sec-h-dark">Referral Slip (Scan)</div>
    ${p.referralSlip
      ? `<div class="slip-wrap" style="flex:1"><img src="${p.referralSlip}" class="slip-img" alt="Referral Slip"></div>`
      : `<div class="slip-empty" style="flex:1">Referral slip not uploaded — attach physical copy here</div>`
    }
  </div>

  <div class="sig-row">
    <div class="sig-line">Radiologist / Authorised Signatory</div>
    <div class="sig-line">Seal</div>
  </div>
  <div class="footer">MediRecord EMR · Patient Record Sheet · ${p.name||''} · Token #${token} · Printed ${new Date().toLocaleString('en-IN')} · ${clinicName}</div>
</div>

<!-- ═══════════════════════════════════════════════════════════
     PAGE 2 — Report (full page)
═══════════════════════════════════════════════════════════ -->
<div class="page">
  <div class="hd">
    ${c.logoUrl||c.logo ? `<img src="${c.logoUrl||c.logo}" class="hd-logo" alt="">` : ''}
    <div class="hd-info">
      <div class="hd-name">${clinicName}</div>
      ${c.pndtRegNo ? `<div class="hd-sub">PNDT Reg. No: ${c.pndtRegNo}</div>` : ''}
    </div>
    <div class="hd-right">
      <div class="hd-title">Report / Findings</div>
      <div class="hd-date">${p.name||'—'} · Token #${token} · ${fmt(p.visitDate||p.createdAt)}</div>
      <div class="hd-date" style="color:#0EA5A0;font-weight:700">${p.testName||''}</div>
    </div>
  </div>

  ${p.reportUrl ? `
  <div class="report-wrap" style="flex:1">
    <img src="${p.reportUrl}" class="report-img" alt="Report">
  </div>` : `
  <div class="sec" style="flex:1">
    <div class="sec-h">USG Report / Clinical Findings</div>
    <div class="report-lines">
      ${['Findings / Observations','Impression / Diagnosis','Recommendation / Advice','Follow-up Date'].map(l=>`
      <div class="rline"><label>${l}</label><div></div></div>`).join('')}
      <div style="flex:1"></div>
    </div>
  </div>`}

  <div class="sig-row">
    <div class="sig-line">Performing Doctor / Radiologist</div>
    <div class="sig-line">Registration No. &amp; Seal</div>
  </div>
  <div class="footer">MediRecord EMR · Report Page · ${p.name||'Patient'} · Generated ${new Date().toLocaleString('en-IN')}</div>
</div>

</body>
</html>`
}

export async function printPatientRecordById(patientId) {
  try {
    const r = await api.get(`/patients/${patientId}/full`)
    printPatientRecord(r.data.patient, r.data.patient.clinic || {})
  } catch(e) {
    alert('Failed to load patient data: ' + (e.response?.data?.error || e.message))
  }
}

export function printPatientRecord(patient, clinic) {
  const html = buildPatientRecordHtml(patient, clinic)
  const w = window.open('', '_blank', 'width=900,height=750')
  if (!w) { alert('Please allow pop-ups to print'); return }
  w.document.write(html)
  w.document.close()
  w.focus()
  setTimeout(() => w.print(), 700)
}
