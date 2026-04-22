import React, { useState, useEffect, useCallback } from 'react';
import { searchRecipes, getSuggestions, getTrending, getStats, deleteRecipe } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import RecipeCard from '../components/RecipeCard.jsx';
import AddRecipeModal from '../components/AddRecipeModal.jsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const [ings, setIngs] = useState([]);
  const [ingInput, setIngInput] = useState('');
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [trending, setTrending] = useState([]);
  const [stats, setStats] = useState(null);
  const [view, setView] = useState('search');
  const [divider, setDivider] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState(null);
  const [fullOpen, setFullOpen] = useState(null);
  const [checked, setChecked] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editRecipe, setEditRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [filterMode, setFilterMode] = useState('any');
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    getTrending().then(r=>setTrending(r.data.data)).catch(()=>{});
    getStats().then(r=>setStats(r.data.data)).catch(()=>{});
    if (user) getSuggestions().then(r=>setSuggestions(r.data.data)).catch(()=>{});
  }, [user]);

  const showToast = msg => { setToastMsg(msg); setTimeout(()=>setToastMsg(''),2500); };

  const addIng = () => { const v=ingInput.trim().toLowerCase(); if(v&&!ings.includes(v))setIngs(p=>[...p,v]); setIngInput(''); };

  const doSearch = async () => {
    if(!ings.length)return;
    setLoading(true); setSearched(true);
    try { const {data}=await searchRecipes(ings.join(','),{mode:filterMode}); setResults(data.data); }
    catch {} setLoading(false);
  };

  const onMouseDown=()=>setDragging(true);
  const onMouseMove=useCallback(e=>{
    if(!dragging)return;
    const c=document.getElementById('split');
    if(!c)return;
    const pct=((e.clientX-c.getBoundingClientRect().left)/c.offsetWidth)*100;
    setDivider(Math.max(28,Math.min(72,pct)));
  },[dragging]);
  const onMouseUp=()=>setDragging(false);
  useEffect(()=>{ if(dragging){window.addEventListener('mousemove',onMouseMove);window.addEventListener('mouseup',onMouseUp);} return()=>{window.removeEventListener('mousemove',onMouseMove);window.removeEventListener('mouseup',onMouseUp);};},[dragging,onMouseMove]);

  const handleDelete = async id => {
    if(!confirm('Delete this recipe permanently?'))return;
    try { await deleteRecipe(id); setResults(p=>p.filter(r=>r._id!==id)); setTrending(p=>p.filter(r=>r._id!==id)); setSelected(null); setFullOpen(null); showToast('Recipe deleted'); } catch {}
  };

  const VIEWS = [
    {id:'search',label:'🔍 Search'},
    {id:'suggestions',label:'✨ For You',show:!!user},
    {id:'trending',label:'🔥 Trending'},
    {id:'analytics',label:'📊 Analytics'},
  ].filter(v=>v.show!==false);

  const currentList = view==='suggestions'?suggestions:trending;

  return (
    <div style={s.root}>
      {/* Sidebar */}
      <aside style={s.aside}>
        <button onClick={()=>{setShowModal(true);setEditRecipe(null);}} style={s.addBtn}>+ Add Recipe</button>

        {user && (
          <div style={s.userCard}>
            <div style={s.ava}>{user.name[0].toUpperCase()}</div>
            <div><p style={{fontSize:13,fontWeight:500,color:'#f0ece4'}}>{user.name}</p><p style={{fontSize:11,color:'#9c9484',textTransform:'capitalize'}}>{user.cookingLevel} chef</p></div>
          </div>
        )}

        <div style={{display:'flex',flexDirection:'column',gap:3,marginBottom:16}}>
          {VIEWS.map(v=>(
            <button key={v.id} onClick={()=>setView(v.id)} style={{...s.viewBtn,...(view===v.id?s.viewBtnActive:{})}}>{v.label}</button>
          ))}
        </div>

        {user?.pantry?.length>0 && (
          <div style={s.pantryCard}>
            <p style={{fontSize:11,color:'#9c9484',marginBottom:7,fontWeight:500}}>🧺 My Pantry</p>
            <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
              {user.pantry.slice(0,7).map(i=><span key={i._id} style={{fontSize:10,padding:'2px 7px',borderRadius:10,background:'rgba(74,153,96,0.12)',color:'#7ecf95',border:'1px solid rgba(74,153,96,0.2)'}}>{i.name}</span>)}
              {user.pantry.length>7&&<span style={{fontSize:10,color:'#9c9484'}}>+{user.pantry.length-7}</span>}
            </div>
          </div>
        )}

        {stats && (
          <div style={s.miniStats}>
            <div style={s.miniStat}><span style={s.miniVal}>{stats.total}</span><span style={s.miniLbl}>Recipes</span></div>
            <div style={s.miniStat}><span style={s.miniVal}>{stats.topRated?.[0]?.averageRating?.toFixed(1)||'—'}</span><span style={s.miniLbl}>Top ★</span></div>
          </div>
        )}
      </aside>

      {/* Split pane */}
      <div id="split" style={{display:'flex',flex:1,overflow:'hidden',cursor:dragging?'col-resize':'default'}}>

        {/* Left pane */}
        <div style={{...s.pane,width:`${divider}%`}}>
          <div style={s.paneHead}>
            {view==='search' && (
              <div style={{width:'100%'}}>
                <h2 style={s.paneTitle}>Ingredient Search</h2>
                <div style={{display:'flex',gap:6,marginBottom:8}}>
                  {['any','all'].map(m=><button key={m} onClick={()=>setFilterMode(m)} style={{padding:'4px 12px',borderRadius:7,border:'1px solid rgba(255,255,255,0.08)',color:filterMode===m?'#e07b39':'#9c9484',background:filterMode===m?'rgba(224,123,57,0.12)':'transparent',fontSize:12}}>Match {m}</button>)}
                </div>
                <div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:8,minHeight:24}}>
                  {ings.map((i,idx)=><span key={idx} style={{display:'flex',alignItems:'center',gap:4,padding:'3px 9px',borderRadius:16,background:'rgba(224,123,57,0.1)',color:'#e07b39',fontSize:12,border:'1px solid rgba(224,123,57,0.2)'}}>{i}<button onClick={()=>setIngs(p=>p.filter((_,j)=>j!==idx))} style={{color:'#e07b39',fontSize:11}}>✕</button></span>)}
                </div>
                <div style={{display:'flex',gap:7,marginBottom:8}}>
                  <input value={ingInput} onChange={e=>setIngInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addIng()} style={s.ingInp} placeholder="Type ingredient & press +" />
                  <button onClick={addIng} style={s.plusBtn}>+</button>
                </div>
                <button onClick={doSearch} disabled={!ings.length||loading} className="btn btn-primary" style={{width:'100%',padding:9,opacity:!ings.length?0.5:1}}>
                  {loading?'Searching...':'Find Recipes'}
                </button>
              </div>
            )}
            {view!=='search'&&<h2 style={s.paneTitle}>{VIEWS.find(v2=>v2.id===view)?.label}</h2>}
          </div>

          <div style={s.listPane}>
            {/* Analytics */}
            {view==='analytics'&&stats&&(
              <div className="fade-in">
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
                  <div style={s.statCard}><span style={s.statNum}>{stats.total}</span><span style={s.statLbl}>Total Recipes</span></div>
                  <div style={s.statCard}><span style={s.statNum}>{stats.topRated?.length||0}</span><span style={s.statLbl}>Top Rated</span></div>
                </div>
                <p style={s.chartTitle}>By Cuisine</p>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={stats.byCuisine?.slice(0,6)} margin={{top:0,right:10,left:-20,bottom:0}}>
                    <XAxis dataKey="_id" tick={{fill:'#9c9484',fontSize:11}}/>
                    <YAxis tick={{fill:'#9c9484',fontSize:11}}/>
                    <Tooltip contentStyle={{background:'#1a1814',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,fontSize:12}}/>
                    <Bar dataKey="count" fill="#e07b39" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
                <p style={s.chartTitle}>By Difficulty</p>
                <ResponsiveContainer width="100%" height={130}>
                  <PieChart>
                    <Pie data={stats.byDifficulty} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={50} label={({_id,count})=>`${_id}:${count}`}>
                      {stats.byDifficulty?.map((_,i)=><Cell key={i} fill={['#4a9960','#d4a843','#c0413e'][i%3]}/>)}
                    </Pie>
                    <Tooltip contentStyle={{background:'#1a1814',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,fontSize:12}}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Search results — 2-column row boxes */}
            {view==='search'&&searched&&(
              <div className="fade-in">
                <p style={s.resultCount}>{results.length} recipe{results.length!==1?'s':''} found</p>
                {results.map(r=>(
                  <div key={r._id} onClick={()=>{setSelected(selected?._id===r._id?null:r);setFullOpen(null);setChecked({});}}
                    style={{...s.resRow,...(selected?._id===r._id?s.resRowActive:{})}}>
                    <div style={s.resLeft}>
                      <span style={s.boxLbl}>Ingredients</span>
                      <div style={{display:'flex',flexWrap:'wrap',gap:3}}>
                        {r.ingredients?.slice(0,5).map((ing,i)=>(
                          <span key={i} style={{fontSize:10,padding:'2px 7px',borderRadius:10,fontWeight:500,...(r.matchedIngredients?.includes(ing.name.toLowerCase())?{background:'rgba(74,153,96,0.15)',color:'#7ecf95',border:'1px solid rgba(74,153,96,0.2)'}:{background:'rgba(192,65,62,0.1)',color:'#e07a7a',border:'1px solid rgba(192,65,62,0.2)'})}}>
                            {ing.name}
                          </span>
                        ))}
                        {r.ingredients?.length>5&&<span style={{fontSize:10,padding:'2px 7px',borderRadius:10,background:'rgba(255,255,255,0.05)',color:'#9c9484'}}>+{r.ingredients.length-5}</span>}
                      </div>
                    </div>
                    <div style={s.resRight}>
                      <span style={s.boxLbl}>Recipe</span>
                      <span style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700,color:'#f0ece4',marginBottom:3,display:'block'}}>{r.name}</span>
                      <div style={{display:'flex',gap:8,alignItems:'center'}}>
                        <span style={{fontSize:11,color:'#4a9960',fontWeight:500}}>{r.matchPercent}% match</span>
                        <span className="stars" style={{fontSize:11}}>{'★'.repeat(Math.round(r.averageRating||0))}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {results.length===0&&<div style={s.empty}><p style={{fontSize:36}}>😕</p><p style={{color:'#9c9484',marginTop:8}}>No recipes found. Try other ingredients.</p></div>}
              </div>
            )}

            {/* Selected recipe expand card */}
            {view==='search'&&selected&&!fullOpen&&(
              <div style={{...s.expandCard,...(selected._id===fullOpen?._id?{borderColor:'#e07b39'}:{})}} className="fade-in">
                <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:'#f0ece4',marginBottom:8}}>{selected.name}</h3>
                <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:10}}>
                  {selected.matchedIngredients?.length>0&&<span className="badge badge-green">✓ {selected.matchedIngredients.length} you have</span>}
                  {selected.missingIngredients?.length>0&&<span className="badge badge-red">+ {selected.missingIngredients.length} needed</span>}
                  <span className="badge badge-accent">{selected.matchPercent}% match</span>
                </div>
                {selected.matchedIngredients?.length>0&&(
                  <div style={{marginBottom:10}}>
                    <p style={s.secLbl}>You have</p>
                    {selected.matchedIngredients.map(m=><div key={m} style={{display:'flex',gap:8,alignItems:'center',marginBottom:3}}><span style={{color:'#4a9960',fontSize:13}}>✓</span><span style={{fontSize:13,color:'#f0ece4',textTransform:'capitalize'}}>{m}</span></div>)}
                  </div>
                )}
                {selected.missingIngredients?.length>0&&(
                  <div style={{marginBottom:10}}>
                    <p style={s.secLbl}>You still need (check off what you have)</p>
                    {selected.missingIngredients.map(m=>(
                      <div key={m} style={{display:'flex',gap:8,alignItems:'center',marginBottom:4}}>
                        <input type="checkbox" checked={!!checked[m]} onChange={()=>setChecked(p=>({...p,[m]:!p[m]}))} style={{accentColor:'#e07b39'}}/>
                        <span style={{fontSize:13,textTransform:'capitalize',color:checked[m]?'#4a9960':'#c0413e'}}>{m}</span>
                      </div>
                    ))}
                  </div>
                )}
                {(selected.missingIngredients?.length===0||selected.missingIngredients?.every(m=>checked[m]))&&(
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:5,marginTop:8}}>
                    <button onClick={()=>setFullOpen(selected)} style={{width:50,height:50,borderRadius:'50%',background:'#e07b39',color:'#fff',fontSize:20,border:'none',cursor:'pointer'}}>▶</button>
                    <p style={{fontSize:12,color:'#9c9484'}}>Open full recipe</p>
                  </div>
                )}
                <div style={{display:'flex',gap:8,marginTop:10}}>
                  <button onClick={()=>{setEditRecipe(selected);setShowModal(true);}} style={s.smallBtn}>✏ Edit</button>
                  <button onClick={()=>handleDelete(selected._id)} style={{...s.smallBtn,color:'#e07a7a',background:'rgba(192,65,62,0.08)'}}>Delete</button>
                </div>
              </div>
            )}

            {/* Full recipe opened */}
            {fullOpen&&(
              <div style={{...s.expandCard,borderColor:'#e07b39'}} className="fade-in">
                <button onClick={()=>setFullOpen(null)} style={{fontSize:12,color:'#9c9484',marginBottom:10}}>← Back</button>
                <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:'#f0ece4',marginBottom:4}}>{fullOpen.name}</h2>
                <p style={{fontSize:13,color:'#9c9484',marginBottom:14}}>{fullOpen.description}</p>
                <p style={{fontSize:11,color:'#e07b39',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:8,fontWeight:500}}>Ingredients</p>
                <table style={{width:'100%',borderCollapse:'collapse',marginBottom:14}}>
                  <thead><tr>{['Item','Qty','Unit'].map(h=><th key={h} style={{fontSize:10,color:'#9c9484',fontWeight:500,padding:'5px 7px',borderBottom:'1px solid rgba(255,255,255,0.06)',textAlign:'left'}}>{h}</th>)}</tr></thead>
                  <tbody>{fullOpen.ingredients?.map((i,idx)=><tr key={idx} style={{background:idx%2===0?'rgba(255,255,255,0.02)':''}}>{[i.name,i.quantity,i.unit].map((v,j)=><td key={j} style={{padding:'6px 7px',fontSize:12,color:'#f0ece4',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>{v}</td>)}</tr>)}</tbody>
                </table>
                {fullOpen.steps?.length>0&&<>
                  <p style={{fontSize:11,color:'#e07b39',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:8,fontWeight:500}}>Steps</p>
                  {fullOpen.steps.map(step=>(
                    <div key={step.stepNumber} style={{display:'flex',gap:10,marginBottom:10,alignItems:'flex-start'}}>
                      <div style={{width:24,height:24,borderRadius:'50%',background:'#e07b39',color:'#fff',fontSize:11,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{step.stepNumber}</div>
                      <div><p style={{fontSize:13,color:'#f0ece4',lineHeight:1.5,marginBottom:3}}>{step.instruction}</p>{step.tip&&<p style={{fontSize:11,color:'#d4a843',fontStyle:'italic'}}>💡 {step.tip}</p>}</div>
                    </div>
                  ))}
                </>}
                <div style={{display:'flex',gap:8,marginTop:10}}>
                  <button onClick={()=>{setEditRecipe(fullOpen);setShowModal(true);}} style={s.smallBtn}>✏ Edit</button>
                  <button onClick={()=>handleDelete(fullOpen._id)} style={{...s.smallBtn,color:'#e07a7a',background:'rgba(192,65,62,0.08)'}}>Delete</button>
                </div>
              </div>
            )}

            {/* Suggestions / Trending list */}
            {(view==='suggestions'||view==='trending')&&(
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {currentList.length===0?(
                  <div style={s.empty}><p style={{fontSize:32}}>🍽</p><p style={{color:'#9c9484',marginTop:8}}>{view==='suggestions'?'Add pantry items to get suggestions!':'No trending recipes yet.'}</p></div>
                ):currentList.map(r=><RecipeCard key={r._id} recipe={r}/>)}
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div onMouseDown={onMouseDown} style={{width:6,background:'rgba(255,255,255,0.04)',cursor:'col-resize',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <div style={{width:3,height:36,borderRadius:2,background:'#e07b39',opacity:0.4}}/>
        </div>

        {/* Right pane — all recipes */}
        <div style={{...s.pane,flex:1}}>
          <div style={s.paneHead}><h2 style={s.paneTitle}>All Recipes</h2></div>
          <div style={{flex:1,overflowY:'auto',padding:'10px 16px'}}>
            {trending.length===0
              ?<div style={s.empty}><p style={{fontSize:36}}>🍲</p><p style={{color:'#9c9484',marginTop:8}}>No recipes yet. Add your first!</p></div>
              :trending.map(r=><div key={r._id} style={{marginBottom:10}}><RecipeCard recipe={r} onRefresh={()=>getTrending().then(res=>setTrending(res.data.data))}/></div>)
            }
          </div>
        </div>
      </div>

      {/* Toast */}
      {toastMsg&&<div style={{position:'fixed',bottom:20,left:'50%',transform:'translateX(-50%)',background:'#1c1814',color:'#f0ece4',padding:'9px 20px',borderRadius:20,fontSize:13,fontWeight:500,border:'1px solid rgba(255,255,255,0.1)',zIndex:999}}>{toastMsg}</div>}

      {showModal&&(
        <AddRecipeModal
          onClose={()=>{setShowModal(false);setEditRecipe(null);}}
          onSaved={()=>{setShowModal(false);setEditRecipe(null);getTrending().then(r=>setTrending(r.data.data));getStats().then(r=>setStats(r.data.data));showToast('Recipe saved!');}}
          editRecipe={editRecipe}
        />
      )}
    </div>
  );
}

const s = {
  root:{display:'flex',height:'calc(100vh - 57px)',overflow:'hidden'},
  aside:{width:210,background:'#111009',borderRight:'1px solid rgba(255,255,255,0.06)',display:'flex',flexDirection:'column',justifyContent:'space-between',flexShrink:0,overflowY:'auto',padding:12},
  addBtn:{width:'100%',padding:'10px',borderRadius:10,background:'#e07b39',color:'#fff',fontSize:14,fontWeight:600,marginBottom:14,border:'none',cursor:'pointer'},
  userCard:{display:'flex',alignItems:'center',gap:8,padding:'8px 0',marginBottom:12,borderBottom:'1px solid rgba(255,255,255,0.06)'},
  ava:{width:32,height:32,borderRadius:'50%',background:'#e07b39',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:13,fontWeight:700,flexShrink:0},
  viewBtn:{padding:'8px 10px',borderRadius:8,textAlign:'left',fontSize:13,color:'#9c9484',transition:'all 0.2s',border:'none',cursor:'pointer',background:'transparent'},
  viewBtnActive:{background:'rgba(224,123,57,0.12)',color:'#e07b39'},
  pantryCard:{background:'rgba(255,255,255,0.03)',borderRadius:9,padding:10,border:'1px solid rgba(255,255,255,0.06)',marginBottom:10},
  miniStats:{borderTop:'1px solid rgba(255,255,255,0.06)',padding:'12px 0',display:'flex',gap:8},
  miniStat:{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2},
  miniVal:{fontSize:20,fontWeight:700,color:'#e07b39'},
  miniLbl:{fontSize:10,color:'#9c9484',textTransform:'uppercase',letterSpacing:'0.05em'},
  pane:{display:'flex',flexDirection:'column',overflow:'hidden',background:'#0f0e0c'},
  paneHead:{padding:'14px 16px 10px',borderBottom:'1px solid rgba(255,255,255,0.06)',flexShrink:0,background:'#111009'},
  paneTitle:{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:'#f0ece4',marginBottom:6},
  listPane:{flex:1,overflowY:'auto',padding:'10px 16px'},
  ingInp:{flex:1,padding:'8px 11px',background:'#222019',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,color:'#f0ece4',fontSize:13},
  plusBtn:{width:36,height:36,borderRadius:8,background:'#e07b39',color:'#fff',fontSize:22,lineHeight:1,border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'},
  resultCount:{fontSize:11,color:'#9c9484',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:10,fontWeight:500},
  resRow:{display:'flex',border:'1px solid rgba(255,255,255,0.07)',borderRadius:10,overflow:'hidden',marginBottom:9,cursor:'pointer',transition:'border-color 0.2s'},
  resRowActive:{borderColor:'#e07b39'},
  resLeft:{flex:1,padding:'9px 11px',background:'rgba(255,255,255,0.02)',borderRight:'1px solid rgba(255,255,255,0.06)'},
  resRight:{flex:1,padding:'9px 11px',display:'flex',flexDirection:'column',gap:3},
  boxLbl:{fontSize:9,color:'#5a5448',textTransform:'uppercase',letterSpacing:'0.07em',display:'block',marginBottom:5,fontWeight:500},
  expandCard:{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,padding:14,marginTop:10},
  secLbl:{fontSize:10,color:'#5a5448',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:6,fontWeight:500},
  smallBtn:{padding:'6px 12px',borderRadius:8,background:'rgba(255,255,255,0.06)',color:'#9c9484',fontSize:12,border:'1px solid rgba(255,255,255,0.08)',cursor:'pointer'},
  empty:{display:'flex',flexDirection:'column',alignItems:'center',gap:8,padding:'40px 20px',textAlign:'center'},
  statCard:{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:10,padding:14,display:'flex',flexDirection:'column',alignItems:'center',gap:4},
  statNum:{fontSize:26,fontWeight:700,color:'#e07b39'},
  statLbl:{fontSize:11,color:'#9c9484',textTransform:'uppercase',letterSpacing:'0.05em'},
  chartTitle:{fontSize:11,color:'#9c9484',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:8,marginTop:14},
};
