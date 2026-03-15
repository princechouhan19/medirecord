import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import api from '../../../services/api'
import './TestFeesPage.scss'

const DEFAULT_CATS = [
  { name:'Sonography', subTests:[{name:'Obstetric USG',price:600},{name:'ANC',price:500},{name:'TVS',price:800},{name:'ABD USG',price:500},{name:'KUB USG',price:600},{name:'Follicular',price:700}] },
  { name:'X-Ray',      subTests:[{name:'Chest PA',price:300},{name:'Lumbar Spine',price:400},{name:'Knee AP/Lat',price:350}] },
  { name:'Blood Test', subTests:[{name:'CBC',price:200},{name:'Blood Sugar (F/PP)',price:150},{name:'Thyroid Profile',price:600}] },
  { name:'CT Scan',    subTests:[{name:'CT Brain Plain',price:2500},{name:'CT Chest',price:3000},{name:'CT Abdomen',price:3500}] },
  { name:'MRI',        subTests:[{name:'MRI Brain',price:5000},{name:'MRI Spine',price:6000}] },
]

export default function TestFeesPage() {
  const [cats, setCats]         = useState([])
  const [showCatModal, setShowCatModal] = useState(false)
  const [editCat, setEditCat]   = useState(null) // { name, basePrice, subTests[] }
  const [newCatName, setNewCatName]   = useState('')
  const [newCatBase, setNewCatBase]   = useState('')
  const [subInputs, setSubInputs]     = useState([{name:'',price:''}])
  const [loading, setLoading]   = useState(false)
  const [msg, setMsg]           = useState('')
  const ref = useRef(null)

  useEffect(() => {
    gsap.fromTo(ref.current,{y:-16,opacity:0},{y:0,opacity:1,duration:.5})
    fetchCats()
  },[])

  const fetchCats = async () => {
    try { const r = await api.get('/clinics/my/tests'); setCats(r.data.testCategories||[]) } catch(e){}
  }

  const openNew = () => {
    setEditCat(null); setNewCatName(''); setNewCatBase(''); setSubInputs([{name:'',price:''}])
    setShowCatModal(true)
  }

  const openEdit = (cat) => {
    setEditCat(cat); setNewCatName(cat.name); setNewCatBase(String(cat.basePrice||''))
    setSubInputs(cat.subTests.length ? cat.subTests.map(s=>({name:s.name,price:String(s.price),fformRequired:s.fformRequired||false})) : [{name:'',price:'',fformRequired:false}])
    setShowCatModal(true)
  }

  const addSubRow  = () => setSubInputs(s=>[...s,{name:'',price:'',fformRequired:false}])
  const rmSubRow   = i => setSubInputs(s=>s.filter((_,j)=>j!==i))
  const updateSub  = (i,k,v) => setSubInputs(s=>s.map((r,j)=>j===i?{...r,[k]:v}:r))

  const handleSave = async () => {
    if (!newCatName.trim()) return setMsg('Category name is required')
    setLoading(true); setMsg('')
    try {
      const payload = {
        name: newCatName.trim(),
        basePrice: Number(newCatBase)||0,
        subTests: subInputs.filter(s=>s.name.trim()).map(s=>({name:s.name.trim(),price:Number(s.price)||0,fformRequired:s.fformRequired||false})),
        isActive: true,
      }
      await api.post('/clinics/my/tests', payload)
      setShowCatModal(false); fetchCats(); setMsg('Saved!')
      setTimeout(()=>setMsg(''),2000)
    } catch(e){ setMsg(e.response?.data?.error||'Failed') }
    finally { setLoading(false) }
  }

  const handleDelete = async (catId) => {
    if (!confirm('Remove this category?')) return
    await api.delete(`/clinics/my/tests/${catId}`)
    fetchCats()
  }

  const seedDefaults = async () => {
    if (!confirm('Add default test categories? This will add common tests.')) return
    setLoading(true)
    for (const c of DEFAULT_CATS) {
      try { await api.post('/clinics/my/tests', { name:c.name, basePrice:0, subTests:c.subTests, isActive:true }) } catch(e){}
    }
    setLoading(false); fetchCats()
  }

  return (
    <div className="tests-page">
      <div className="page-header" ref={ref}>
        <div><h1>Test & Fee Manager</h1><p>Configure test categories, sub-tests and prices</p></div>
        <div style={{display:'flex',gap:'10px'}}>
          {cats.length===0&&<button className="btn btn--secondary" onClick={seedDefaults} disabled={loading}>⚡ Load Defaults</button>}
          <button className="btn btn--primary" onClick={openNew}>+ Add Category</button>
        </div>
      </div>

      {msg && <div className="alert alert--success" style={{marginBottom:'16px'}}>{msg}</div>}

      {cats.length===0 ? (
        <div className="card tests-empty">
          <div style={{fontSize:'3rem',marginBottom:'12px'}}>💉</div>
          <h3>No test categories yet</h3>
          <p>Click "Load Defaults" to add common categories, or create your own.</p>
          <button className="btn btn--primary" style={{marginTop:'16px'}} onClick={seedDefaults}>⚡ Load Default Categories</button>
        </div>
      ) : (
        <div className="tests-grid">
          {cats.map(cat=>(
            <div key={cat._id} className={`card test-cat ${!cat.isActive?'test-cat--inactive':''}`}>
              <div className="test-cat__header">
                <div>
                  <div className="test-cat__name">{cat.name}</div>
                  {cat.basePrice>0&&<div className="test-cat__base">Base: ₹{cat.basePrice}</div>}
                </div>
                <div style={{display:'flex',gap:'6px'}}>
                  <button className="btn btn--secondary btn--sm" onClick={()=>openEdit(cat)}>Edit</button>
                  <button className="btn btn--danger btn--sm" onClick={()=>handleDelete(cat._id)}>✕</button>
                </div>
              </div>
              <div className="test-cat__subtests">
                {cat.subTests.map((s,i)=>(
                  <div key={i} className="sub-test">
                    <span>{s.name}</span>
                    <span className="sub-test__price">₹{s.price}</span>{s.fformRequired && <span className="badge badge--teal" style={{fontSize:9,marginLeft:4}}>📋 F-Form</span>}
                  </div>
                ))}
                {cat.subTests.length===0&&<div className="sub-test td-muted">No sub-tests configured</div>}
              </div>
              <div style={{fontSize:'11px',color:'var(--text-3)',marginTop:'8px'}}>{cat.subTests.length} sub-tests</div>
            </div>
          ))}
        </div>
      )}

      {showCatModal&&(
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowCatModal(false)}>
          <div className="modal modal--wide">
            <div className="modal__header">
              <h2>{editCat?`Edit: ${editCat.name}`:'Add Test Category'}</h2>
              <button className="modal__close" onClick={()=>setShowCatModal(false)}>✕</button>
            </div>
            <div className="modal__form">
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Category Name *</label>
                  <input value={newCatName} onChange={e=>setNewCatName(e.target.value)} placeholder="e.g. Sonography, X-Ray" />
                </div>
                <div className="form-group">
                  <label>Base Price (₹)</label>
                  <input type="number" value={newCatBase} onChange={e=>setNewCatBase(e.target.value)} placeholder="0" min={0} />
                </div>
              </div>

              <div className="modal__section">Sub-Tests</div>
              <div className="subtests-editor">
                {subInputs.map((s,i)=>(
                  <div key={i} className="subtests-editor__row">
                    <input value={s.name} onChange={e=>updateSub(i,'name',e.target.value)} placeholder={`Sub-test name (e.g. ${['ANC','TVS','ABD','Obstetric'][i%4]||'Test'})`} style={{flex:2}} />
                    <div style={{position:'relative',flex:1}}>
                      <span style={{position:'absolute',left:'10px',top:'50%',transform:'translateY(-50%)',color:'var(--text-3)',fontSize:'13px'}}>₹</span>
                      <input type="number" value={s.price} onChange={e=>updateSub(i,'price',e.target.value)} placeholder="Price" style={{paddingLeft:'24px',width:'100%'}} min={0} />
                    </div>
                    <label title="F-Form required for this test" style={{display:'flex',alignItems:'center',gap:4,cursor:'pointer',flexShrink:0,fontSize:11,fontWeight:600,color:s.fformRequired?'var(--teal-dark)':'var(--text-3)'}}>
                      <input type="checkbox" checked={s.fformRequired||false} onChange={e=>updateSub(i,'fformRequired',e.target.checked)} style={{width:13,height:13,accentColor:'var(--teal)'}} />
                      📋
                    </label>
                    <button type="button" className="btn btn--danger btn--sm" onClick={()=>rmSubRow(i)} style={{flexShrink:0}}>✕</button>
                  </div>
                ))}
                <button type="button" className="btn btn--secondary btn--sm" onClick={addSubRow} style={{alignSelf:'flex-start',marginTop:'4px'}}>+ Add Row</button>
              </div>
              {msg&&<div className="alert alert--error">{msg}</div>}
            </div>
            <div className="modal__footer">
              <button className="btn btn--secondary" onClick={()=>setShowCatModal(false)}>Cancel</button>
              <button className="btn btn--primary" onClick={handleSave} disabled={loading}>{loading?'Saving…':'Save Category'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
