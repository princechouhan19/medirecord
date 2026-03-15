import api from '../../../services/api'

// ── HTML builder ────────────────────────────────────────────────────────
export function buildPatientRecordHtml(patient, clinic) {
  const p = patient || {}
  const c = clinic  || {}

  const fmt = d => d ? new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'2-digit',year:'numeric'}) : '—'
  const edd   = fmt(p.edd)
  const lmp   = fmt(p.lmp)
  const weeks = p.weeksOfPregnancy != null
    ? `${p.weeksOfPregnancy} wk${p.daysOfPregnancy ? ` ${p.daysOfPregnancy}d` : ''}`
    : '—'
  const relative = p.relativeName
    ? `${p.relationType || 'H/O'}: ${p.relativeName}`
    : p.husbandName ? `H/O: ${p.husbandName}` : '—'
  const referredBy = p.referredDoctor?.name || p.referredBy || 'Self'

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Patient Record — ${p.name || 'Patient'}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',Arial,sans-serif;font-size:11.5px;color:#0f172a;background:#fff}
  .page{width:210mm;min-height:297mm;padding:12mm;display:flex;flex-direction:column;gap:8px;page-break-after:always}
  .page:last-child{page-break-after:auto}

  /* Clinic header */
  .hd{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2.5px solid #0EA5A0;padding-bottom:10px;margin-bottom:2px}
  .hd-logo{height:36px;object-fit:contain;max-width:130px;display:block;margin-bottom:4px}
  .hd-name{font-size:15px;font-weight:900;color:#0EA5A0}
  .hd-sub{font-size:9.5px;color:#64748b;line-height:1.5}
  .doc-title h1{font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.08em;text-align:right}
  .doc-title p{font-size:9.5px;color:#64748b;text-align:right;margin-top:2px}
  .token-badge{font-size:18px;font-weight:900;color:#0EA5A0;text-align:right;font-family:monospace}

  /* Sections */
  .sec{border:1px solid #e2e8f0;border-radius:5px;overflow:hidden;flex-shrink:0}
  .sec-h{background:#0EA5A0;color:#fff;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;padding:4px 9px}
  .sec-h2{background:#1e293b}
  .sec-body{padding:0}
  .g2{display:grid;grid-template-columns:1fr 1fr}
  .g3{display:grid;grid-template-columns:1fr 1fr 1fr}
  .g4{display:grid;grid-template-columns:repeat(4,1fr)}
  .cell{padding:5px 9px;border-bottom:1px solid #f1f5f9;border-right:1px solid #f1f5f9}
  .cell:last-child{border-right:none}
  .cell label{display:block;font-size:8.5px;font-weight:700;text-transform:uppercase;color:#94a3b8;letter-spacing:.05em;margin-bottom:1px}
  .cell .v{font-weight:700;font-size:11px;line-height:1.3}
  .cell-span{grid-column:1/-1}

  /* PNDT table */
  .pndt{width:100%;border-collapse:collapse;font-size:8.5px}
  .pndt th{background:#0EA5A0;color:#fff;padding:3px 4px;text-align:center;border:1px solid rgba(255,255,255,.3);font-weight:700;font-size:8px;line-height:1.2}
  .pndt td{padding:5px 4px;border:1px solid #e2e8f0;vertical-align:top;line-height:1.4;font-size:8.5px}
  .pndt td strong{display:block;font-size:9px}

  /* Images */
  .img-pair{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px}
  .img-box{border:1px solid #e2e8f0;border-radius:5px;overflow:hidden;min-height:80px;background:#f8fafc;display:flex;flex-direction:column}
  .img-box img{width:100%;object-fit:contain;max-height:110px}
  .img-label{font-size:8px;font-weight:700;text-transform:uppercase;color:#64748b;padding:3px 6px;background:#f1f5f9;text-align:center;border-top:1px solid #e2e8f0}
  .img-empty{flex:1;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:10px;padding:14px;text-align:center}

  .full-wrap{flex:1;display:flex;align-items:center;justify-content:center;padding:8px}
  .full-img{max-width:100%;max-height:220mm;object-fit:contain;border:1px solid #e2e8f0;border-radius:5px}

  .report-lines{flex:1;padding:10px 12px;display:flex;flex-direction:column;gap:16px}
  .rline label{font-size:8.5px;font-weight:700;text-transform:uppercase;color:#94a3b8;letter-spacing:.05em;display:block;margin-bottom:4px}
  .rline div{border-bottom:1px solid #cbd5e1;min-height:22px}

  .sig-row{display:flex;justify-content:flex-end;padding:6px 10px;gap:30px}
  .sig-line{border-top:1px solid #0f172a;width:130px;padding-top:4px;font-size:8.5px;color:#64748b;text-align:center}
  .footer{font-size:8.5px;color:#94a3b8;text-align:center;border-top:1px dashed #e2e8f0;padding-top:5px;margin-top:auto}

  .badge{display:inline-block;padding:1px 6px;border-radius:100px;font-size:8.5px;font-weight:700}
  .b-green{background:#ecfdf5;color:#065f46}
  .b-amber{background:#fffbeb;color:#92400e}
  .b-teal{background:#e6f7f7;color:#0c8f8a}

  @media print{
    body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .page{padding:10mm;width:100%}
    @page{size:A4;margin:0}
  }
</style>
</head>
<body>

<!-- ══════════════════════════════════════════════════════
     PAGE 1 — Patient Details + PNDT Register Row
══════════════════════════════════════════════════════ -->
<div class="page">

  <div class="hd">
    <div>
      ${c.logoUrl || c.logo ? `<img src="${c.logoUrl || c.logo}" class="hd-logo" alt="">` : ''}
      <div class="hd-name">${c.name || 'MediRecord Clinic'}</div>
      ${c.address ? `<div class="hd-sub">📍 ${c.address}</div>` : ''}
      ${c.phone   ? `<div class="hd-sub">📞 ${c.phone}</div>` : ''}
      ${c.pndtRegNo ? `<div class="hd-sub"><b>PNDT Reg. No:</b> ${c.pndtRegNo}</div>` : ''}
    </div>
    <div class="doc-title">
      <div class="token-badge">Token #${String(p.tokenNo || 0).padStart(3,'0')}</div>
      <h1>Patient Record Sheet</h1>
      <p>PNDT Form — Section A</p>
      <p>${fmt(p.visitDate || p.createdAt)}</p>
    </div>
  </div>

  <!-- PNDT 12-column row -->
  <div class="sec">
    <div class="sec-h">PNDT Form F — Register Entry</div>
    <div style="overflow-x:auto;padding:5px">
      <table class="pndt">
        <tr>
          <th style="width:24px">Sr.</th>
          <th>Reg. No.</th>
          <th>Date</th>
          <th>Patient Name / Age / ${p.relationType || 'H/O'}</th>
          <th>Address</th>
          <th>Referred By</th>
          <th>Children (M/F)</th>
          <th>LMP / Weeks</th>
          <th>Non-Invasive Indication</th>
          <th>Invasive Indication</th>
          <th>Declaration Date</th>
          <th>Result / Findings</th>
        </tr>
        <tr>
          <td style="text-align:center">${p.tokenNo || 1}</td>
          <td>${p.pctsId || p.receiptNo || '—'}</td>
          <td style="white-space:nowrap">${fmt(p.visitDate || p.createdAt)}</td>
          <td>
            <strong>${p.name || '—'}</strong><br>
            ${p.age || '—'} yrs<br>
            ${relative}
          </td>
          <td>${[p.address, p.district, p.state].filter(Boolean).join(', ') || '—'}</td>
          <td>${referredBy}</td>
          <td style="text-align:center">
            ♂ ${p.livingChildrenMale || 0}<br>
            ♀ ${p.livingChildrenFemale || 0}
          </td>
          <td style="text-align:center">${lmp}<br><b>${weeks}</b></td>
          <td>${p.testName || '—'}</td>
          <td style="text-align:center">—</td>
          <td style="text-align:center;white-space:nowrap">
            ${p.patientRegDate ? fmt(p.patientRegDate) : fmt(p.visitDate || p.createdAt)}
          </td>
          <td style="min-width:60px"> </td>
        </tr>
      </table>
    </div>
  </div>

  <!-- Patient identity -->
  <div class="sec">
    <div class="sec-h">Patient Information</div>
    <div class="g4">
      <div class="cell"><label>Patient Name</label><div class="v">${p.name || '—'}</div></div>
      <div class="cell"><label>Date of Birth</label><div class="v">${fmt(p.dob)}</div></div>
      <div class="cell"><label>Age</label><div class="v">${p.age || '—'} ${p.ageUnit || 'yrs'}</div></div>
      <div class="cell"><label>Gender</label><div class="v">${p.gender || '—'}</div></div>
      <div class="cell"><label>${p.relationType || 'Husband'}'s Name</label><div class="v">${p.relativeName || p.husbandName || '—'}</div></div>
      <div class="cell"><label>Phone</label><div class="v">${p.phone || '—'}</div></div>
      <div class="cell"><label>Area Type</label><div class="v">${p.areaType || '—'}</div></div>
      <div class="cell"><label>PCTS ID</label><div class="v">${p.pctsId || '—'}</div></div>
      <div class="cell cell-span"><label>Full Address</label><div class="v">${[p.address, p.district, p.state].filter(Boolean).join(', ') || '—'}</div></div>
    </div>
  </div>

  ${(p.lmp || p.weeksOfPregnancy) ? `
  <div class="sec">
    <div class="sec-h">Pregnancy Details</div>
    <div class="g4">
      <div class="cell"><label>LMP</label><div class="v">${lmp}</div></div>
      <div class="cell"><label>Weeks + Days</label><div class="v">${weeks}</div></div>
      <div class="cell"><label>EDD</label><div class="v">${edd}</div></div>
      <div class="cell"><label>Children (M / F)</label><div class="v">♂ ${p.livingChildrenMale || 0} / ♀ ${p.livingChildrenFemale || 0}</div></div>
    </div>
  </div>` : ''}

  <div class="sec">
    <div class="sec-h">Test &amp; Payment</div>
    <div class="g4">
      <div class="cell"><label>Test Category</label><div class="v">${p.testCategory || '—'}</div></div>
      <div class="cell"><label>Test / Procedure</label><div class="v">${p.testName || '—'}</div></div>
      <div class="cell"><label>Fee</label><div class="v">₹${p.fee || 0}</div></div>
      <div class="cell"><label>Payment</label><div class="v">
        <span class="badge ${p.isPaid ? 'b-green' : 'b-amber'}">${p.isPaid ? 'PAID' : 'PENDING'}</span>
        ${p.paymentMode || ''}
      </div></div>
    </div>
  </div>

  ${p.referredDoctor?.name || p.referredBy ? `
  <div class="sec">
    <div class="sec-h">Referred By</div>
    <div class="g4">
      <div class="cell"><label>Name</label><div class="v">${referredBy}</div></div>
      <div class="cell"><label>Type</label><div class="v">${p.referredDoctor?.type || 'Doctor'}</div></div>
      <div class="cell"><label>Qualification</label><div class="v">${p.referredDoctor?.qualification || '—'}</div></div>
      <div class="cell"><label>Reg. No.</label><div class="v">${p.referredDoctor?.regNo || '—'}</div></div>
      <div class="cell"><label>Mobile</label><div class="v">${p.referredDoctor?.phone || '—'}</div></div>
      <div class="cell cell-span" style="grid-column:span 3"><label>Address</label><div class="v">${[p.referredDoctor?.address, p.referredDoctor?.city].filter(Boolean).join(', ') || '—'}</div></div>
    </div>
  </div>` : ''}

  <div class="sig-row">
    <div class="sig-line">Radiologist / Authorised Signatory</div>
    <div class="sig-line">Seal</div>
  </div>
  <div class="footer">MediRecord EMR · Patient Record Sheet · Printed ${new Date().toLocaleString('en-IN')} · ${c.name || ''}</div>
</div>

<!-- ══════════════════════════════════════════════════════
     PAGE 2 — ID Proof (Front + Back) + Referral Slip
══════════════════════════════════════════════════════ -->
<div class="page">
  <div class="hd">
    <div><div class="hd-name">${c.name || 'MediRecord Clinic'}</div></div>
    <div class="doc-title">
      <h1>ID Proof &amp; Referral</h1>
      <p>${p.name || '—'} · Token #${String(p.tokenNo || 0).padStart(3,'0')}</p>
    </div>
  </div>

  <div class="sec">
    <div class="sec-h">Identity Document</div>
    <div class="g2">
      <div class="cell"><label>ID Proof Type</label><div class="v">${p.idProofType || '—'}</div></div>
      <div class="cell"><label>ID Number</label><div class="v">${p.idProofNo || '—'}</div></div>
    </div>
  </div>

  <div class="sec">
    <div class="sec-h">ID Proof Images</div>
    <div class="img-pair">
      <div class="img-box">
        ${p.idProofFront
          ? `<img src="${p.idProofFront}" alt="ID Front">`
          : '<div class="img-empty">Front side not uploaded</div>'
        }
        <div class="img-label">FRONT SIDE</div>
      </div>
      <div class="img-box">
        ${p.idProofBack
          ? `<img src="${p.idProofBack}" alt="ID Back">`
          : '<div class="img-empty">Back side not uploaded</div>'
        }
        <div class="img-label">BACK SIDE</div>
      </div>
    </div>
  </div>

  ${p.referralSlip ? `
  <div class="sec" style="flex:1">
    <div class="sec-h sec-h2">Referral Slip (Scan)</div>
    <div class="full-wrap">
      <img src="${p.referralSlip}" class="full-img" alt="Referral Slip">
    </div>
  </div>` : `
  <div class="sec" style="flex:1">
    <div class="sec-h sec-h2">Referral Slip</div>
    <div style="display:flex;align-items:center;justify-content:center;flex:1;padding:40px;color:#94a3b8;font-size:11px">
      Referral slip not uploaded — attach physical copy here
    </div>
  </div>`}

  <div class="footer">MediRecord EMR · ID Proof Page · ${p.name || 'Patient'} · ${c.name || ''}</div>
</div>

<!-- ══════════════════════════════════════════════════════
     PAGE 3 — Report (full page, back side)
══════════════════════════════════════════════════════ -->
<div class="page">
  <div class="hd">
    <div>
      ${c.logoUrl || c.logo ? `<img src="${c.logoUrl || c.logo}" class="hd-logo" alt="">` : ''}
      <div class="hd-name">${c.name || 'MediRecord Clinic'}</div>
      ${c.pndtRegNo ? `<div class="hd-sub">Reg. No: ${c.pndtRegNo}</div>` : ''}
    </div>
    <div class="doc-title">
      <h1>Report / Findings</h1>
      <p>${p.name || '—'} · ${fmt(p.visitDate || p.createdAt)}</p>
      <p>${p.testName || '—'}</p>
    </div>
  </div>

  ${p.reportUrl ? `
  <div class="full-wrap" style="flex:1">
    <img src="${p.reportUrl}" class="full-img" alt="Report">
  </div>` : `
  <div class="sec" style="flex:1">
    <div class="sec-h">USG Report / Clinical Findings</div>
    <div class="report-lines">
      ${['Findings / Observations', 'Impression / Diagnosis', 'Recommendation / Advice', 'Follow-up Date'].map(l => `
      <div class="rline">
        <label>${l}</label>
        <div></div>
      </div>`).join('')}
      <div style="flex:1"></div>
    </div>
  </div>`}

  <div class="sig-row">
    <div class="sig-line">Performing Doctor / Radiologist</div>
    <div class="sig-line">Registration No. &amp; Seal</div>
  </div>
  <div class="footer">MediRecord EMR · Report Page · ${p.name || 'Patient'} · Generated ${new Date().toLocaleString('en-IN')}</div>
</div>

</body>
</html>`
}

// ── Print from API (fetches full patient + clinic) ─────────────────────
export async function printPatientRecordById(patientId) {
  try {
    const r = await api.get(`/patients/${patientId}/full`)
    const patient = r.data.patient
    const clinic  = patient.clinic || {}
    printPatientRecord(patient, clinic)
  } catch(e) {
    alert('Failed to load patient data: ' + (e.response?.data?.error || e.message))
  }
}

// ── Print from existing data (e.g. from queue where patient is populated) ─
export function printPatientRecord(patient, clinic) {
  const html = buildPatientRecordHtml(patient, clinic)
  const w = window.open('', '_blank', 'width=900,height=750')
  if (!w) { alert('Please allow pop-ups to print'); return }
  w.document.write(html)
  w.document.close()
  w.focus()
  setTimeout(() => w.print(), 700)
}
