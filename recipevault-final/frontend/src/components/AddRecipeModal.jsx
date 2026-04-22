import React, { useState, useEffect } from 'react';
import { createRecipe, updateRecipe } from '../services/api.js';

const CUISINES = ['indian','italian','chinese','mexican','american','mediterranean','japanese','thai','french','other'];
const CATEGORIES = ['breakfast','lunch','dinner','snack','dessert','drinks','appetizer'];
const DIETARY = ['vegetarian','vegan','gluten-free','dairy-free','keto','halal','jain'];

const emptyIng  = () => ({ id: Math.random(), name:'', quantity:'', unit:'', notes:'', isOptional:false });
const emptyStep = () => ({ id: Math.random(), instruction:'', duration:'', tip:'' });

export default function AddRecipeModal({ onClose, onSaved, editRecipe }) {
  const [tab, setTab] = useState('basic');
  const [form, setForm] = useState({ name:'', description:'', cuisine:'indian', category:'dinner', difficulty:'medium', prepTime:'', cookTime:'', servings:4, tags:'', dietaryInfo:[], imageUrl:'' });
  const [ings, setIngs]   = useState([emptyIng()]);
  const [steps, setSteps] = useState([emptyStep()]);
  const [nutrition, setNutrition] = useState({ calories:'', protein:'', carbs:'', fat:'', fiber:'' });
  const [subs, setSubs]   = useState([]);
  const [ingsSaved, setIngsSaved]   = useState(false);
  const [stepsSaved, setStepsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  useEffect(() => {
    if (!editRecipe) return;
    setForm({ name:editRecipe.name||'', description:editRecipe.description||'', cuisine:editRecipe.cuisine||'indian', category:editRecipe.category||'dinner', difficulty:editRecipe.difficulty||'medium', prepTime:editRecipe.prepTime||'', cookTime:editRecipe.cookTime||'', servings:editRecipe.servings||4, tags:(editRecipe.tags||[]).join(', '), dietaryInfo:editRecipe.dietaryInfo||[], imageUrl:editRecipe.imageUrl||'' });
    setIngs(editRecipe.ingredients?.length ? editRecipe.ingredients.map(i=>({...i,id:Math.random()})) : [emptyIng()]);
    setSteps(editRecipe.steps?.length ? editRecipe.steps.map(s=>({...s,id:Math.random()})) : [emptyStep()]);
    setNutrition(editRecipe.nutrition || { calories:'', protein:'', carbs:'', fat:'', fiber:'' });
    setSubs(editRecipe.substitutions || []);
    setIngsSaved(true); setStepsSaved(true);
  }, [editRecipe]);

  const upForm = (k,v) => setForm(f=>({...f,[k]:v}));
  const toggleDiet = d => setForm(f=>({ ...f, dietaryInfo: f.dietaryInfo.includes(d) ? f.dietaryInfo.filter(x=>x!==d) : [...f.dietaryInfo,d] }));
  const upIng  = (id,k,v) => setIngs(p=>p.map(i=>i.id===id?{...i,[k]:v}:i));
  const upStep = (id,k,v) => setSteps(p=>p.map(s=>s.id===id?{...s,[k]:v}:s));
  const moveStep = (id,dir) => setSteps(p=>{ const i=p.findIndex(s=>s.id===id); if((dir<0&&i===0)||(dir>0&&i===p.length-1))return p; const c=[...p]; [c[i],c[i+dir]]=[c[i+dir],c[i]]; return c; });

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Recipe name is required'); setTab('basic'); return; }
    const validIngs = ings.filter(i=>i.name.trim());
    if (!validIngs.length) { setError('At least one ingredient required'); setTab('ingredients'); return; }
    setSaving(true); setError('');
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map(t=>t.trim()).filter(Boolean),
        prepTime: Number(form.prepTime)||0,
        cookTime: Number(form.cookTime)||0,
        servings: Number(form.servings)||4,
        ingredients: validIngs.map(({name,quantity,unit,notes,isOptional})=>({name,quantity,unit,notes,isOptional})),
        steps: steps.filter(s=>s.instruction.trim()).map((s,i)=>({ stepNumber:i+1, instruction:s.instruction, duration:Number(s.duration)||0, tip:s.tip })),
        nutrition: Object.fromEntries(Object.entries(nutrition).map(([k,v])=>[k,Number(v)||0])),
        substitutions: subs
      };
      if (editRecipe) await updateRecipe(editRecipe._id, payload);
      else await createRecipe(payload);
      onSaved();
    } catch (e) { setError(e.response?.data?.message || 'Failed to save. Try again.'); }
    setSaving(false);
  };

  const TABS = ['basic','ingredients','steps','nutrition'];

  return (
    <div style={s.overlay} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={s.modal}>
        {/* Header */}
        <div style={s.head}>
          <div>
            <h2 style={s.title}>{editRecipe ? 'Edit Recipe' : 'Add New Recipe'}</h2>
            <p style={s.sub}>Fill in the details across all tabs</p>
          </div>
          <button onClick={onClose} style={s.closeBtn}>✕</button>
        </div>

        {/* Tabs */}
        <div style={s.tabs}>
          {TABS.map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{...s.tabBtn,...(tab===t?s.tabActive:{})}}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>

        <div style={s.body}>
          {/* ── BASIC ── */}
          {tab==='basic' && (
            <div className="fade-in">
              <div style={s.g2}>
                <label style={s.fld}>
                  <span style={s.lbl}>Recipe Name *</span>
                  <input value={form.name} onChange={e=>upForm('name',e.target.value)} className="inp" placeholder="e.g. Butter Chicken" />
                </label>
                <label style={s.fld}>
                  <span style={s.lbl}>Image URL (optional)</span>
                  <input value={form.imageUrl} onChange={e=>upForm('imageUrl',e.target.value)} className="inp" placeholder="https://..." />
                </label>
              </div>
              <label style={s.fld}>
                <span style={s.lbl}>Description</span>
                <textarea value={form.description} onChange={e=>upForm('description',e.target.value)} className="inp" rows={2} placeholder="Brief description..." style={{resize:'vertical'}} />
              </label>
              <div style={s.g3}>
                <label style={s.fld}><span style={s.lbl}>Cuisine</span>
                  <select value={form.cuisine} onChange={e=>upForm('cuisine',e.target.value)} className="inp">
                    {CUISINES.map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                  </select>
                </label>
                <label style={s.fld}><span style={s.lbl}>Category</span>
                  <select value={form.category} onChange={e=>upForm('category',e.target.value)} className="inp">
                    {CATEGORIES.map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                  </select>
                </label>
                <label style={s.fld}><span style={s.lbl}>Difficulty</span>
                  <select value={form.difficulty} onChange={e=>upForm('difficulty',e.target.value)} className="inp">
                    <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                  </select>
                </label>
              </div>
              <div style={s.g3}>
                <label style={s.fld}><span style={s.lbl}>Prep Time (min)</span>
                  <input type="number" value={form.prepTime} onChange={e=>upForm('prepTime',e.target.value)} className="inp" placeholder="15" />
                </label>
                <label style={s.fld}><span style={s.lbl}>Cook Time (min)</span>
                  <input type="number" value={form.cookTime} onChange={e=>upForm('cookTime',e.target.value)} className="inp" placeholder="30" />
                </label>
                <label style={s.fld}><span style={s.lbl}>Servings</span>
                  <input type="number" value={form.servings} onChange={e=>upForm('servings',e.target.value)} className="inp" placeholder="4" />
                </label>
              </div>
              <label style={s.fld}>
                <span style={s.lbl}>Tags (comma separated)</span>
                <input value={form.tags} onChange={e=>upForm('tags',e.target.value)} className="inp" placeholder="quick, spicy, comfort-food" />
              </label>
              <div style={s.fld}>
                <span style={s.lbl}>Dietary Info</span>
                <div style={{display:'flex',flexWrap:'wrap',gap:10,marginTop:6}}>
                  {DIETARY.map(d=>(
                    <label key={d} style={{display:'flex',alignItems:'center',gap:6,fontSize:13,color:'#9c9484',cursor:'pointer'}}>
                      <input type="checkbox" checked={form.dietaryInfo.includes(d)} onChange={()=>toggleDiet(d)} style={{accentColor:'#e07b39'}} />
                      {d}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── INGREDIENTS ── */}
          {tab==='ingredients' && (
            <div className="fade-in">
              <div style={s.secHead}>
                <h3 style={s.secTitle}>Ingredient List</h3>
                {!ingsSaved && <button onClick={()=>setIngs(p=>[...p,emptyIng()])} className="btn btn-primary" style={{padding:'6px 14px',fontSize:13}}>+ Add Row</button>}
              </div>
              <div style={{overflowX:'auto'}}>
                <table style={s.tbl}>
                  <thead><tr>
                    {['Ingredient','Qty','Unit','Notes','Optional',...(ingsSaved?[]:[''])].map(h=><th key={h} style={s.th}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {ings.map(ing=>(
                      <tr key={ing.id}>
                        <td style={s.td}>{ingsSaved?<span style={s.sv}>{ing.name}</span>:<input value={ing.name} onChange={e=>upIng(ing.id,'name',e.target.value)} style={s.ti} placeholder="Tomato" />}</td>
                        <td style={s.td}>{ingsSaved?<span style={s.sv}>{ing.quantity}</span>:<input value={ing.quantity} onChange={e=>upIng(ing.id,'quantity',e.target.value)} style={s.ti} placeholder="2" />}</td>
                        <td style={s.td}>{ingsSaved?<span style={s.sv}>{ing.unit}</span>:<input value={ing.unit} onChange={e=>upIng(ing.id,'unit',e.target.value)} style={s.ti} placeholder="cups" />}</td>
                        <td style={s.td}>{ingsSaved?<span style={s.sv}>{ing.notes}</span>:<input value={ing.notes} onChange={e=>upIng(ing.id,'notes',e.target.value)} style={s.ti} placeholder="chopped" />}</td>
                        <td style={{...s.td,textAlign:'center'}}><input type="checkbox" checked={ing.isOptional} onChange={e=>upIng(ing.id,'isOptional',e.target.checked)} disabled={ingsSaved} style={{accentColor:'#e07b39'}} /></td>
                        {!ingsSaved && <td style={s.td}><button onClick={()=>setIngs(p=>p.filter(i=>i.id!==ing.id))} style={{color:'#c0413e',fontSize:13}}>✕</button></td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={s.actRow}>
                {ingsSaved
                  ? <><span style={s.savedBadge}>✓ Ingredients saved</span><button onClick={()=>setIngsSaved(false)} style={s.editBtn}>✏ Edit</button><button onClick={()=>setIngs(p=>[...p,emptyIng()])} style={s.editBtn}>+ Row</button></>
                  : <><button onClick={()=>setIngsSaved(true)} className="btn btn-green">✓ Save Ingredients</button><button onClick={()=>setIngs([emptyIng()])} className="btn btn-red" style={{marginLeft:8}}>✕ Discard</button></>
                }
              </div>

              {/* Substitutions */}
              <div style={{marginTop:20}}>
                <div style={s.secHead}>
                  <h3 style={s.secTitle}>Ingredient Substitutions</h3>
                  <button onClick={()=>setSubs(p=>[...p,{original:'',alternatives:[''],note:''}])} className="btn btn-primary" style={{padding:'6px 14px',fontSize:13}}>+ Add</button>
                </div>
                {subs.map((sub,i)=>(
                  <div key={i} style={{display:'flex',gap:8,marginBottom:8,alignItems:'center'}}>
                    <input value={sub.original} onChange={e=>setSubs(p=>p.map((x,j)=>j===i?{...x,original:e.target.value}:x))} className="inp" placeholder="Original ingredient" style={{flex:1}} />
                    <span style={{color:'#9c9484'}}>→</span>
                    <input value={sub.alternatives.join(',')} onChange={e=>setSubs(p=>p.map((x,j)=>j===i?{...x,alternatives:e.target.value.split(',')}:x))} className="inp" placeholder="Alt 1, Alt 2" style={{flex:2}} />
                    <button onClick={()=>setSubs(p=>p.filter((_,j)=>j!==i))} style={{color:'#c0413e',fontSize:13}}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── STEPS ── */}
          {tab==='steps' && (
            <div className="fade-in">
              <div style={s.secHead}>
                <h3 style={s.secTitle}>Cooking Instructions</h3>
                {!stepsSaved && <button onClick={()=>setSteps(p=>[...p,emptyStep()])} className="btn btn-primary" style={{padding:'6px 14px',fontSize:13}}>+ Add Step</button>}
              </div>
              {steps.map((step,idx)=>(
                <div key={step.id} style={s.stepCard}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                    <div style={s.stepNum}>{idx+1}</div>
                    {!stepsSaved && (
                      <div style={{display:'flex',gap:4,marginLeft:'auto'}}>
                        <button onClick={()=>moveStep(step.id,-1)} style={s.moveBtn}>↑</button>
                        <button onClick={()=>moveStep(step.id,1)} style={s.moveBtn}>↓</button>
                        <button onClick={()=>setSteps(p=>p.filter(s=>s.id!==step.id))} style={{...s.moveBtn,color:'#c0413e'}}>✕</button>
                      </div>
                    )}
                  </div>
                  <textarea value={step.instruction} onChange={e=>upStep(step.id,'instruction',e.target.value)} disabled={stepsSaved}
                    className="inp" rows={2} placeholder={`Step ${idx+1} instruction...`} style={{resize:'vertical',marginBottom:8}} />
                  <div style={s.g2}>
                    <label style={s.fld}><span style={s.lbl}>Duration (min)</span>
                      <input type="number" value={step.duration} onChange={e=>upStep(step.id,'duration',e.target.value)} disabled={stepsSaved} className="inp" placeholder="5" />
                    </label>
                    <label style={s.fld}><span style={s.lbl}>Pro Tip</span>
                      <input value={step.tip} onChange={e=>upStep(step.id,'tip',e.target.value)} disabled={stepsSaved} className="inp" placeholder="Optional tip for this step" />
                    </label>
                  </div>
                </div>
              ))}
              <div style={s.actRow}>
                {stepsSaved
                  ? <><span style={s.savedBadge}>✓ Steps saved</span><button onClick={()=>setStepsSaved(false)} style={s.editBtn}>✏ Edit</button><button onClick={()=>setSteps(p=>[...p,emptyStep()])} style={s.editBtn}>+ Step</button></>
                  : <><button onClick={()=>setStepsSaved(true)} className="btn btn-green">✓ Save Steps</button><button onClick={()=>setSteps([emptyStep()])} className="btn btn-red" style={{marginLeft:8}}>✕ Discard</button></>
                }
              </div>
            </div>
          )}

          {/* ── NUTRITION ── */}
          {tab==='nutrition' && (
            <div className="fade-in">
              <p style={{fontSize:13,color:'#9c9484',marginBottom:16}}>Optional: Add per-serving nutritional info.</p>
              <div style={s.g3}>
                {Object.keys(nutrition).map(k=>(
                  <label key={k} style={s.fld}>
                    <span style={s.lbl}>{k.charAt(0).toUpperCase()+k.slice(1)} {k==='calories'?'(kcal)':'(g)'}</span>
                    <input type="number" value={nutrition[k]} onChange={e=>setNutrition(n=>({...n,[k]:e.target.value}))} className="inp" placeholder="0" />
                  </label>
                ))}
              </div>
              {Object.values(nutrition).some(v=>v) && (
                <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:10,padding:16,marginTop:16}}>
                  <p style={{fontSize:11,color:'#9c9484',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:12}}>Preview per serving</p>
                  <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
                    {Object.entries(nutrition).map(([k,v])=>(
                      <div key={k} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
                        <span style={{fontSize:22,fontWeight:700,color:'#e07b39'}}>{v||0}</span>
                        <span style={{fontSize:11,color:'#9c9484'}}>{k==='calories'?'kcal':k+' g'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {error && <p style={{color:'#e07a7a',fontSize:13,marginTop:12,padding:'10px 14px',background:'rgba(192,65,62,0.08)',borderRadius:8,border:'1px solid rgba(192,65,62,0.2)'}}>{error}</p>}
        </div>

        {/* Footer */}
        <div style={s.foot}>
          <div style={{display:'flex',gap:5}}>
            {TABS.map((t,i)=><div key={t} style={{width:8,height:8,borderRadius:'50%',background:i<=TABS.indexOf(tab)?'#e07b39':'rgba(255,255,255,0.15)'}} />)}
          </div>
          <div style={{display:'flex',gap:10}}>
            <button onClick={onClose} className="btn btn-ghost">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn btn-primary">
              {saving ? 'Saving...' : editRecipe ? 'Update Recipe' : 'Save Recipe'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  overlay:{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:16},
  modal:{background:'#1a1814',border:'1px solid rgba(255,255,255,0.08)',borderRadius:20,width:'100%',maxWidth:740,maxHeight:'92vh',display:'flex',flexDirection:'column',overflow:'hidden'},
  head:{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 24px',borderBottom:'1px solid rgba(255,255,255,0.07)'},
  title:{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:'#f0ece4'},
  sub:{fontSize:13,color:'#9c9484',marginTop:2},
  closeBtn:{width:32,height:32,borderRadius:'50%',background:'rgba(255,255,255,0.06)',color:'#9c9484',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center'},
  tabs:{display:'flex',gap:2,padding:'12px 24px',borderBottom:'1px solid rgba(255,255,255,0.07)'},
  tabBtn:{padding:'7px 18px',borderRadius:8,fontSize:13,color:'#9c9484',transition:'all 0.2s'},
  tabActive:{background:'rgba(224,123,57,0.15)',color:'#e07b39',fontWeight:500},
  body:{padding:'20px 24px',overflowY:'auto',flex:1},
  g2:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12},
  g3:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:12},
  fld:{display:'flex',flexDirection:'column',gap:5,marginBottom:12},
  lbl:{fontSize:11,color:'#9c9484',textTransform:'uppercase',letterSpacing:'0.06em',fontWeight:500},
  secHead:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12},
  secTitle:{fontSize:15,fontWeight:500,color:'#f0ece4'},
  tbl:{width:'100%',borderCollapse:'collapse',marginBottom:10,minWidth:480},
  th:{textAlign:'left',fontSize:11,color:'#9c9484',fontWeight:500,padding:'6px 8px',borderBottom:'1px solid rgba(255,255,255,0.07)',textTransform:'uppercase',letterSpacing:'0.05em'},
  td:{padding:'4px 3px'},
  ti:{width:'100%',padding:'6px 8px',background:'#222019',border:'1px solid rgba(255,255,255,0.08)',borderRadius:6,color:'#f0ece4',fontSize:13},
  sv:{fontSize:13,color:'#f0ece4',padding:'4px 8px',display:'block'},
  actRow:{display:'flex',alignItems:'center',gap:8,marginTop:10},
  savedBadge:{fontSize:13,color:'#4a9960',fontWeight:500},
  editBtn:{padding:'6px 14px',borderRadius:8,background:'rgba(255,255,255,0.06)',color:'#9c9484',fontSize:13,border:'1px solid rgba(255,255,255,0.08)'},
  stepCard:{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:10,padding:14,marginBottom:10},
  stepNum:{width:28,height:28,borderRadius:'50%',background:'#e07b39',color:'#fff',fontSize:12,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0},
  moveBtn:{width:26,height:26,borderRadius:6,background:'rgba(255,255,255,0.06)',color:'#9c9484',fontSize:13,display:'flex',alignItems:'center',justifyContent:'center'},
  foot:{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 24px',borderTop:'1px solid rgba(255,255,255,0.07)'}
};
