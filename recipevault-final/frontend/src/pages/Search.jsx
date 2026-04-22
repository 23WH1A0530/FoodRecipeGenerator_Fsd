import React, { useState } from 'react';
import { searchRecipes, getRecipes } from '../services/api.js';
import RecipeCard from '../components/RecipeCard.jsx';

const CUISINES = ['indian','italian','chinese','mexican','american','mediterranean','japanese','thai','french','other'];
const DIETARY  = ['vegetarian','vegan','gluten-free','dairy-free','keto','halal'];

export default function Search() {
  const [ings, setIngs] = useState([]);
  const [ingInput, setIngInput] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [f, setF] = useState({ cuisine:'', category:'', difficulty:'', dietary:'', mode:'any', sort:'-createdAt', search:'' });

  const upF = (k, v) => setF(p => ({ ...p, [k]: v }));
  const addIng = () => { const v = ingInput.trim().toLowerCase(); if (v && !ings.includes(v)) setIngs(p => [...p, v]); setIngInput(''); };

  const doSearch = async () => {
    setLoading(true); setSearched(true);
    try {
      if (ings.length > 0) {
        const { data } = await searchRecipes(ings.join(','), { mode: f.mode, dietary: f.dietary, cuisine: f.cuisine, difficulty: f.difficulty });
        setRecipes(data.data);
      } else {
        const { data } = await getRecipes({ ...f, search: f.search, limit: 24 });
        setRecipes(data.data);
      }
    } catch {}
    setLoading(false);
  };

  return (
    <div style={{ display:'flex', minHeight:'calc(100vh - 57px)' }}>
      {/* Sidebar */}
      <div style={s.sidebar}>
        <h2 style={s.sTitle}>Search Recipes</h2>

        <div style={s.sec}>
          <label style={s.lbl}>Search by name</label>
          <input value={f.search} onChange={e=>upF('search',e.target.value)} onKeyDown={e=>e.key==='Enter'&&doSearch()} className="inp" placeholder="Recipe name or keyword..." />
        </div>

        <div style={s.sec}>
          <label style={s.lbl}>Ingredients you have</label>
          <div style={{display:'flex',gap:6,marginBottom:8}}>
            <input value={ingInput} onChange={e=>setIngInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addIng()} className="inp" placeholder="Add ingredient..." style={{flex:1}} />
            <button onClick={addIng} className="btn btn-primary" style={{width:36,height:36,padding:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>+</button>
          </div>
          <div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:8}}>
            {ings.map((i,idx)=>(
              <span key={idx} style={{display:'flex',alignItems:'center',gap:4,padding:'3px 9px',borderRadius:16,background:'rgba(224,123,57,0.1)',color:'#e07b39',fontSize:12,border:'1px solid rgba(224,123,57,0.2)'}}>
                {i}<button onClick={()=>setIngs(p=>p.filter((_,j)=>j!==idx))} style={{color:'#e07b39',fontSize:11}}>✕</button>
              </span>
            ))}
          </div>
          <div style={{display:'flex',gap:6}}>
            {['any','all'].map(m=>(
              <button key={m} onClick={()=>upF('mode',m)}
                style={{flex:1,padding:'5px',borderRadius:7,border:'1px solid rgba(255,255,255,0.08)',color:f.mode===m?'#e07b39':'#9c9484',background:f.mode===m?'rgba(224,123,57,0.12)':'transparent',fontSize:12}}>
                Match {m}
              </button>
            ))}
          </div>
        </div>

        {[
          { lbl:'Cuisine', key:'cuisine', opts:[{v:'',l:'All Cuisines'},...CUISINES.map(c=>({v:c,l:c.charAt(0).toUpperCase()+c.slice(1)}))] },
          { lbl:'Difficulty', key:'difficulty', opts:[{v:'',l:'Any'},{v:'easy',l:'Easy'},{v:'medium',l:'Medium'},{v:'hard',l:'Hard'}] },
          { lbl:'Dietary', key:'dietary', opts:[{v:'',l:'All'},...DIETARY.map(d=>({v:d,l:d}))] },
          { lbl:'Sort by', key:'sort', opts:[{v:'-createdAt',l:'Newest'},{v:'-averageRating',l:'Top Rated'},{v:'-viewCount',l:'Most Viewed'},{v:'-favoriteCount',l:'Most Saved'}] },
        ].map(({lbl,key,opts})=>(
          <div key={key} style={s.sec}>
            <label style={s.lbl}>{lbl}</label>
            <select value={f[key]} onChange={e=>upF(key,e.target.value)} className="inp">
              {opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
          </div>
        ))}

        <button onClick={doSearch} className="btn btn-primary" style={{width:'100%',padding:11,fontSize:15,marginTop:4}}>
          {loading ? 'Searching...' : 'Search'}
        </button>
        {(ings.length>0||f.search) && (
          <button onClick={()=>{setIngs([]);setF(p=>({...p,search:''}));setRecipes([]);setSearched(false);}} className="btn btn-ghost" style={{width:'100%',marginTop:8,padding:9}}>
            Clear All
          </button>
        )}
      </div>

      {/* Results */}
      <div style={s.results}>
        {!searched ? (
          <div style={s.hint}>
            <p style={{fontSize:48,marginBottom:12}}>🍳</p>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:22,color:'#f0ece4',marginBottom:8}}>Find your next recipe</h2>
            <p style={{color:'#9c9484'}}>Add ingredients or use the filters to discover recipes</p>
          </div>
        ) : (
          <>
            <p style={{fontSize:13,color:'#9c9484',marginBottom:20}}>{loading?'Searching...':`${recipes.length} recipe${recipes.length!==1?'s':''} found${ings.length>0?' for: '+ings.join(', '):''}`}</p>
            {!loading && recipes.length===0 ? (
              <div style={s.hint}><p style={{fontSize:40}}>😕</p><p style={{color:'#9c9484',marginTop:12}}>No recipes found. Try different ingredients or remove some filters.</p></div>
            ) : (
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:16}}>
                {recipes.map(r=><RecipeCard key={r._id} recipe={r} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const s = {
  sidebar:{width:268,flexShrink:0,background:'#111009',borderRight:'1px solid rgba(255,255,255,0.06)',padding:'24px 18px',overflowY:'auto'},
  sTitle:{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:'#f0ece4',marginBottom:20},
  sec:{marginBottom:16},
  lbl:{display:'block',fontSize:11,color:'#9c9484',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:6,fontWeight:500},
  results:{flex:1,padding:'24px 28px',overflowY:'auto'},
  hint:{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:400,textAlign:'center'}
};
