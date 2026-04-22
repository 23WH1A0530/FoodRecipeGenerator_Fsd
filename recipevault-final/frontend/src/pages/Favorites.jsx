// ── FAVORITES ────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { getMe, updatePrefs } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import RecipeCard from '../components/RecipeCard.jsx';

export function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    getMe().then(({data})=>setFavorites(data.user.favorites||[])).catch(()=>{}).finally(()=>setLoading(false));
  };
  useEffect(()=>{ load(); },[]);

  return (
    <div style={{maxWidth:1100,margin:'0 auto',padding:'28px 24px 60px'}}>
      <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:30,fontWeight:700,color:'#f0ece4',marginBottom:4}}>My Favorites</h1>
      <p style={{fontSize:14,color:'#9c9484',marginBottom:28}}>{favorites.length} saved recipe{favorites.length!==1?'s':''}</p>
      {loading?<p style={{color:'#9c9484'}}>Loading...</p>
        :favorites.length===0
          ?<div style={{textAlign:'center',padding:'60px 20px'}}><p style={{fontSize:48,marginBottom:12}}>♡</p><p style={{color:'#9c9484'}}>No favorites yet. Browse recipes and click the heart icon!</p></div>
          :<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))',gap:16}}>
            {favorites.filter(r=>typeof r==='object'&&r._id).map(r=><RecipeCard key={r._id} recipe={r} onRefresh={load}/>)}
          </div>
      }
    </div>
  );
}

// ── PROFILE ───────────────────────────────────────────────────────────────────
const DIETARY = ['vegetarian','vegan','gluten-free','dairy-free','keto','paleo','halal','jain'];
const LEVELS  = ['beginner','intermediate','advanced'];

export function Profile() {
  const { user, logout, setUser } = useAuth();
  const nav = React.useRef(null);
  const [prefs, setPrefs] = useState({ dietaryPreferences: user?.dietaryPreferences||[], cookingLevel: user?.cookingLevel||'beginner', allergies:(user?.allergies||[]).join(', ') });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  const toggle = d => setPrefs(p=>({ ...p, dietaryPreferences: p.dietaryPreferences.includes(d)?p.dietaryPreferences.filter(x=>x!==d):[...p.dietaryPreferences,d] }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePrefs({ dietaryPreferences:prefs.dietaryPreferences, cookingLevel:prefs.cookingLevel, allergies:prefs.allergies.split(',').map(a=>a.trim()).filter(Boolean) });
      setUser(u=>({...u,...prefs}));
      setSaved(true); setTimeout(()=>setSaved(false),2500);
    } catch {}
    setSaving(false);
  };

  const L = {display:'block',fontSize:11,color:'#9c9484',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:6,fontWeight:500};
  const C = {background:'#1a1814',border:'1px solid rgba(255,255,255,0.08)',borderRadius:14,padding:20,marginBottom:14};

  return (
    <div style={{maxWidth:560,margin:'0 auto',padding:'28px 24px 60px'}}>
      <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:700,color:'#f0ece4',marginBottom:28}}>Profile & Settings</h1>

      <div style={C}>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <div style={{width:56,height:56,borderRadius:'50%',background:'#e07b39',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:22,fontWeight:700}}>{user?.name?.[0]?.toUpperCase()}</div>
          <div><p style={{fontSize:17,fontWeight:600,color:'#f0ece4',marginBottom:3}}>{user?.name}</p><p style={{fontSize:13,color:'#9c9484'}}>{user?.email}</p></div>
        </div>
      </div>

      <div style={C}>
        <label style={L}>Cooking Level</label>
        <div style={{display:'flex',gap:10}}>
          {LEVELS.map(l=>(
            <button key={l} onClick={()=>setPrefs(p=>({...p,cookingLevel:l}))}
              style={{flex:1,padding:10,borderRadius:9,border:'1px solid rgba(255,255,255,0.08)',color:prefs.cookingLevel===l?'#e07b39':'#9c9484',background:prefs.cookingLevel===l?'rgba(224,123,57,0.12)':'transparent',fontSize:13,cursor:'pointer',textTransform:'capitalize'}}>
              {l==='beginner'?'🌱 ':l==='intermediate'?'🔥 ':'⭐ '}{l}
            </button>
          ))}
        </div>
      </div>

      <div style={C}>
        <span style={L}>Dietary Preferences</span>
        <div style={{display:'flex',flexWrap:'wrap',gap:10}}>
          {DIETARY.map(d=>(
            <label key={d} style={{display:'flex',alignItems:'center',gap:6,fontSize:13,color:'#9c9484',cursor:'pointer'}}>
              <input type="checkbox" checked={prefs.dietaryPreferences.includes(d)} onChange={()=>toggle(d)} style={{accentColor:'#e07b39'}}/>
              {d}
            </label>
          ))}
        </div>
      </div>

      <div style={C}>
        <label style={L}>Allergies (comma-separated)</label>
        <input value={prefs.allergies} onChange={e=>setPrefs(p=>({...p,allergies:e.target.value}))} className="inp" placeholder="peanuts, shellfish..."/>
      </div>

      <div style={{display:'flex',gap:12,alignItems:'center'}}>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{padding:'11px 28px',fontSize:15}}>
          {saving?'Saving...':saved?'✓ Saved!':'Save Preferences'}
        </button>
        <button onClick={logout} style={{padding:'11px 20px',borderRadius:8,border:'1px solid rgba(192,65,62,0.3)',color:'#e07a7a',fontSize:14,background:'transparent',cursor:'pointer'}}>Sign Out</button>
      </div>
    </div>
  );
}

export default Favorites;
