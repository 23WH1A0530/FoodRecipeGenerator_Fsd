// ── PANTRY ────────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { getPantry, addPantryItem, removePantryItem, getSuggestions } from '../services/api.js';
import RecipeCard from '../components/RecipeCard.jsx';

export default function Pantry() {
  const [pantry, setPantry] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [form, setForm] = useState({ name:'', quantity:'', unit:'', expiresAt:'' });
  const [tab, setTab] = useState('pantry');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getPantry().then(r=>setPantry(r.data.data)).catch(()=>{});
    getSuggestions().then(r=>setSuggestions(r.data.data)).catch(()=>{});
  }, []);

  const handleAdd = async e => {
    e.preventDefault();
    if(!form.name.trim())return;
    setLoading(true);
    try {
      const {data}=await addPantryItem(form);
      setPantry(data.data);
      setForm({name:'',quantity:'',unit:'',expiresAt:''});
      const s=await getSuggestions(); setSuggestions(s.data.data);
    } catch {}
    setLoading(false);
  };

  const handleRemove = async id => {
    try { const {data}=await removePantryItem(id); setPantry(data.data); } catch {}
  };

  const getExpiry = expiresAt => {
    if(!expiresAt)return null;
    const days=Math.ceil((new Date(expiresAt)-new Date())/(1000*60*60*24));
    if(days<0)return{label:'Expired',color:'#e07a7a',bg:'rgba(192,65,62,0.1)'};
    if(days<=3)return{label:`${days}d left`,color:'#d4a843',bg:'rgba(212,168,67,0.1)'};
    return{label:`${days}d left`,color:'#7ecf95',bg:'rgba(74,153,96,0.1)'};
  };

  const filtered=pantry.filter(i=>i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{maxWidth:1100,margin:'0 auto',padding:'28px 24px 60px'}}>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:28,flexWrap:'wrap',gap:16}}>
        <div>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:30,fontWeight:700,color:'#f0ece4',marginBottom:4}}>My Pantry</h1>
          <p style={{fontSize:14,color:'#9c9484'}}>Track what you have, get smart recipe suggestions</p>
        </div>
        <div style={{display:'flex',gap:12}}>
          {[{n:pantry.length,l:'Items'},{n:suggestions.length,l:'Matches'}].map(({n,l})=>(
            <div key={l} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:12,padding:'12px 18px',display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
              <span style={{fontSize:26,fontWeight:700,color:'#e07b39'}}>{n}</span>
              <span style={{fontSize:11,color:'#9c9484',textTransform:'uppercase',letterSpacing:'0.05em'}}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{display:'flex',gap:4,marginBottom:20}}>
        {[{id:'pantry',l:`🧺 Pantry (${pantry.length})`},{id:'suggestions',l:`✨ Suggestions (${suggestions.length})`}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:'9px 18px',borderRadius:9,fontSize:14,color:tab===t.id?'#e07b39':'#9c9484',border:'1px solid rgba(255,255,255,0.06)',background:tab===t.id?'rgba(224,123,57,0.1)':'transparent',cursor:'pointer',transition:'all 0.2s'}}>{t.l}</button>
        ))}
      </div>

      {tab==='pantry'&&(
        <>
          <div style={{background:'#1a1814',border:'1px solid rgba(255,255,255,0.08)',borderRadius:14,padding:20,marginBottom:18}}>
            <h3 style={{fontSize:15,fontWeight:500,color:'#f0ece4',marginBottom:14}}>Add to Pantry</h3>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:10,marginBottom:12}}>
              {[{k:'name',p:'Ingredient name *'},{k:'quantity',p:'Quantity'},{k:'unit',p:'Unit (kg, L, pcs...)'}].map(({k,p})=>(
                <input key={k} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} className="inp" placeholder={p} onKeyDown={e=>k==='name'&&e.key==='Enter'&&handleAdd(e)}/>
              ))}
              <div>
                <label style={{display:'block',fontSize:11,color:'#9c9484',marginBottom:5,textTransform:'uppercase',letterSpacing:'0.05em'}}>Expires on</label>
                <input type="date" value={form.expiresAt} onChange={e=>setForm(f=>({...f,expiresAt:e.target.value}))} className="inp"/>
              </div>
            </div>
            <button onClick={handleAdd} disabled={loading||!form.name.trim()} className="btn btn-primary">{loading?'Adding...':'+ Add to Pantry'}</button>
          </div>

          <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:14}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} className="inp" placeholder="Search pantry..." style={{maxWidth:280}}/>
            <span style={{fontSize:13,color:'#9c9484'}}>{filtered.length} item{filtered.length!==1?'s':''}</span>
          </div>

          {filtered.length===0
            ?<div style={{textAlign:'center',padding:'50px 20px'}}><p style={{fontSize:48,marginBottom:12}}>🧺</p><p style={{color:'#9c9484'}}>Pantry is empty. Add ingredients above!</p></div>
            :<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))',gap:10}}>
              {filtered.map(item=>{
                const exp=getExpiry(item.expiresAt);
                return(
                  <div key={item._id} style={{background:'#1a1814',border:'1px solid rgba(255,255,255,0.07)',borderRadius:12,padding:14}}>
                    <div style={{display:'flex',gap:10,alignItems:'flex-start',marginBottom:exp?8:0}}>
                      <div style={{width:36,height:36,borderRadius:9,background:'rgba(224,123,57,0.12)',color:'#e07b39',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,flexShrink:0}}>{item.name[0].toUpperCase()}</div>
                      <div style={{flex:1}}>
                        <p style={{fontSize:14,fontWeight:500,color:'#f0ece4',marginBottom:2}}>{item.name}</p>
                        <p style={{fontSize:12,color:'#9c9484'}}>{item.quantity} {item.unit}</p>
                      </div>
                      <button onClick={()=>handleRemove(item._id)} style={{color:'#c0413e',fontSize:13,flexShrink:0}}>✕</button>
                    </div>
                    {exp&&<span style={{fontSize:11,fontWeight:500,padding:'3px 9px',borderRadius:8,background:exp.bg,color:exp.color,display:'inline-block'}}>{exp.label}</span>}
                  </div>
                );
              })}
            </div>
          }
        </>
      )}

      {tab==='suggestions'&&(
        suggestions.length===0
          ?<div style={{textAlign:'center',padding:'60px 20px'}}><p style={{fontSize:40,marginBottom:12}}>💡</p><p style={{color:'#9c9484'}}>Add pantry items to get personalized suggestions!</p></div>
          :<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:16}}>
            {suggestions.map(r=><RecipeCard key={r._id} recipe={r}/>)}
          </div>
      )}
    </div>
  );
}
