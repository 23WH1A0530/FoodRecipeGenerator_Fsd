import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecipe, scaleRecipe, reviewRecipe, toggleFavorite, addToShoppingList, deleteRecipe } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function RecipeDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [scaled, setScaled] = useState(null);
  const [servings, setServings] = useState(4);
  const [tab, setTab] = useState('ingredients');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isFav, setIsFav] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState({});
  const [cookMode, setCookMode] = useState(false);
  const [cookStep, setCookStep] = useState(0);
  const [added, setAdded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecipe(id).then(({data}) => {
      setRecipe(data.data); setScaled(data.data); setServings(data.data.servings||4);
      setIsFav(user?.favorites?.some(f=>(f._id||f)?.toString()===id));
    }).catch(()=>nav('/')).finally(()=>setLoading(false));
  }, [id]);

  const handleScale = async s => {
    setServings(s);
    try { const {data}=await scaleRecipe(id,s); setScaled(data.data); } catch {}
  };

  const handleFav = async () => { if(!user)return; try { await toggleFavorite(id); setIsFav(f=>!f); } catch {} };

  const handleReview = async () => {
    if(!user)return; setSubmitting(true);
    try { const {data}=await reviewRecipe(id,{rating,comment}); setRecipe(data.data); setComment(''); } catch {}
    setSubmitting(false);
  };

  const handleAddToList = async () => {
    if(!user||!recipe)return;
    const items=(scaled||recipe).ingredients.map(i=>({name:i.name,quantity:i.quantity,unit:i.unit}));
    try { await addToShoppingList(items); setAdded(true); setTimeout(()=>setAdded(false),3000); } catch {}
  };

  const handleDelete = async () => {
    if(!confirm('Delete this recipe permanently?'))return;
    try { await deleteRecipe(id); nav('/dashboard'); } catch {}
  };

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',color:'#9c9484'}}>Loading...</div>;
  if (!recipe) return null;

  const display = scaled || recipe;
  const totalTime = (recipe.prepTime||0)+(recipe.cookTime||0);
  const isAuthor = user?._id===recipe.author?._id?.toString()||user?._id===recipe.author;

  // Cook Mode
  if (cookMode) {
    const steps = recipe.steps||[];
    const step = steps[cookStep];
    return (
      <div style={{position:'fixed',inset:0,background:'#0f0e0c',zIndex:500,display:'flex',flexDirection:'column'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 24px',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
          <button onClick={()=>setCookMode(false)} style={{padding:'6px 14px',borderRadius:8,border:'1px solid rgba(255,255,255,0.1)',color:'#9c9484',fontSize:13}}>✕ Exit</button>
          <span style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:'#f0ece4'}}>{recipe.name}</span>
          <span style={{fontSize:13,color:'#9c9484'}}>Step {cookStep+1} / {steps.length}</span>
        </div>
        <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px 60px',textAlign:'center'}}>
          <div style={{width:64,height:64,borderRadius:'50%',background:'#e07b39',color:'#fff',fontSize:24,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:24}}>{cookStep+1}</div>
          <p style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:500,color:'#f0ece4',lineHeight:1.5,maxWidth:560,marginBottom:20}}>{step?.instruction}</p>
          {step?.tip&&<div style={{fontSize:15,color:'#d4a843',background:'rgba(212,168,67,0.08)',border:'1px solid rgba(212,168,67,0.2)',borderRadius:10,padding:'12px 20px',maxWidth:480,marginBottom:20}}>💡 {step.tip}</div>}
          {step?.duration>0&&<div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}><span style={{fontSize:36}}>⏱</span><span style={{fontSize:20,fontWeight:700,color:'#e07b39'}}>{step.duration} min</span></div>}
        </div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 40px',borderTop:'1px solid rgba(255,255,255,0.08)'}}>
          <button onClick={()=>setCookStep(i=>Math.max(0,i-1))} disabled={cookStep===0} style={{padding:'10px 24px',borderRadius:10,border:'1px solid rgba(255,255,255,0.1)',color:'#f0ece4',fontSize:14,opacity:cookStep===0?0.3:1}}>← Previous</button>
          <div style={{display:'flex',gap:6}}>{steps.map((_,i)=><div key={i} style={{width:10,height:10,borderRadius:'50%',background:i===cookStep?'#e07b39':i<cookStep?'#4a9960':'rgba(255,255,255,0.2)',transition:'background 0.3s'}}/>)}</div>
          {cookStep<steps.length-1
            ?<button onClick={()=>setCookStep(i=>i+1)} style={{padding:'10px 24px',borderRadius:10,border:'1px solid rgba(255,255,255,0.1)',color:'#f0ece4',fontSize:14}}>Next →</button>
            :<button onClick={()=>setCookMode(false)} style={{padding:'10px 24px',borderRadius:10,background:'#4a9960',color:'#fff',border:'none',fontSize:14,cursor:'pointer'}}>🎉 Done!</button>
          }
        </div>
      </div>
    );
  }

  const TABS = ['ingredients','steps','nutrition','reviews','substitutions'];

  return (
    <div style={{background:'#0f0e0c',minHeight:'calc(100vh - 57px)'}}>
      {/* Hero */}
      <div style={{position:'relative',minHeight:300,background:'#111009',overflow:'hidden'}}>
        {recipe.imageUrl&&<img src={recipe.imageUrl} alt={recipe.name} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:0.2}}/>}
        <div style={{position:'relative',zIndex:1,padding:'24px 32px 32px',maxWidth:860,margin:'0 auto'}}>
          <button onClick={()=>nav(-1)} style={{fontSize:13,color:'#9c9484',background:'rgba(0,0,0,0.4)',border:'1px solid rgba(255,255,255,0.1)',padding:'5px 14px',borderRadius:8,marginBottom:18,cursor:'pointer'}}>← Back</button>
          <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:10}}>
            {[recipe.cuisine,recipe.category].map(b=><span key={b} className="badge badge-accent">{b}</span>)}
            {recipe.difficulty&&<span className={`badge ${recipe.difficulty==='easy'?'badge-green':recipe.difficulty==='hard'?'badge-red':'badge-gold'}`}>{recipe.difficulty}</span>}
            {recipe.dietaryInfo?.map(d=><span key={d} className="badge badge-green">{d}</span>)}
          </div>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:34,fontWeight:700,color:'#f0ece4',lineHeight:1.2,marginBottom:8}}>{recipe.name}</h1>
          {recipe.description&&<p style={{fontSize:15,color:'#9c9484',marginBottom:16,lineHeight:1.6}}>{recipe.description}</p>}
          <div style={{display:'flex',gap:20,flexWrap:'wrap',marginBottom:18}}>
            {[[totalTime,'min total'],[recipe.prepTime,'prep'],[recipe.cookTime,'cook'],[recipe.servings,'servings'],[recipe.averageRating?.toFixed(1)||'—','★ rating'],[recipe.viewCount||0,'views']].filter(([v])=>v).map(([v,l])=>(
              <div key={l} style={{display:'flex',flexDirection:'column',gap:2}}>
                <span style={{fontSize:20,fontWeight:700,color:'#e07b39'}}>{v}</span>
                <span style={{fontSize:11,color:'#9c9484',textTransform:'uppercase',letterSpacing:'0.05em'}}>{l}</span>
              </div>
            ))}
          </div>
          <div style={{display:'flex',gap:10,flexWrap:'wrap',alignItems:'center'}}>
            <button onClick={()=>{setCookMode(true);setCookStep(0);}} className="btn btn-primary" style={{fontSize:14}}>👨‍🍳 Start Cooking</button>
            {user&&<><button onClick={handleFav} style={{padding:'8px 16px',borderRadius:8,border:'1px solid rgba(255,255,255,0.1)',color:isFav?'#e07b39':'#9c9484',background:'rgba(0,0,0,0.3)',fontSize:13,cursor:'pointer'}}>{isFav?'♥ Saved':'♡ Save'}</button>
            <button onClick={handleAddToList} style={{padding:'8px 16px',borderRadius:8,border:'1px solid rgba(255,255,255,0.1)',color:added?'#4a9960':'#9c9484',background:'rgba(0,0,0,0.3)',fontSize:13,cursor:'pointer'}}>{added?'✓ Added to List':'🛒 Add to Shopping List'}</button></>}
            {(isAuthor||user?.role==='admin')&&<button onClick={handleDelete} style={{padding:'8px 16px',borderRadius:8,border:'1px solid rgba(192,65,62,0.3)',color:'#e07a7a',background:'rgba(0,0,0,0.3)',fontSize:13,cursor:'pointer'}}>🗑 Delete</button>}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{maxWidth:860,margin:'0 auto',padding:'24px 24px 60px'}}>
        <div style={{display:'flex',gap:2,marginBottom:24,borderBottom:'1px solid rgba(255,255,255,0.06)',paddingBottom:0}}>
          {TABS.map(t=><button key={t} onClick={()=>setTab(t)} style={{padding:'10px 18px',fontSize:14,color:tab===t?'#e07b39':'#9c9484',borderBottom:`2px solid ${tab===t?'#e07b39':'transparent'}`,transition:'all 0.2s',borderRadius:'8px 8px 0 0',background:'transparent',cursor:'pointer'}}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>)}
        </div>

        {/* INGREDIENTS */}
        {tab==='ingredients'&&(
          <div className="fade-in">
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16,flexWrap:'wrap'}}>
              <span style={{fontSize:13,color:'#9c9484'}}>Scale:</span>
              {[1,2,4,6,8].map(n=><button key={n} onClick={()=>handleScale(n)} style={{padding:'4px 12px',borderRadius:7,border:'1px solid rgba(255,255,255,0.1)',color:servings===n?'#e07b39':'#9c9484',background:servings===n?'rgba(224,123,57,0.12)':'transparent',fontSize:13,cursor:'pointer'}}>{n}x</button>)}
              <input type="number" value={servings} min={1} max={100} onChange={e=>handleScale(Number(e.target.value))} style={{width:60,padding:'4px 8px',background:'#222019',border:'1px solid rgba(255,255,255,0.1)',borderRadius:7,color:'#f0ece4',fontSize:13,textAlign:'center'}}/>
              <span style={{fontSize:13,color:'#9c9484'}}>servings</span>
            </div>
            <table style={{width:'100%',borderCollapse:'collapse',marginBottom:16}}>
              <thead><tr>{['','Ingredient','Amount','Unit','Notes'].map(h=><th key={h} style={{textAlign:'left',fontSize:11,color:'#9c9484',fontWeight:500,padding:'8px 10px',borderBottom:'1px solid rgba(255,255,255,0.06)',textTransform:'uppercase',letterSpacing:'0.05em'}}>{h}</th>)}</tr></thead>
              <tbody>{display.ingredients?.map((ing,i)=>(
                <tr key={i} style={{background:i%2===0?'rgba(255,255,255,0.02)':''}}>
                  <td style={{padding:'10px 10px'}}><input type="checkbox" checked={!!checkedSteps[`i${i}`]} onChange={()=>setCheckedSteps(p=>({...p,[`i${i}`]:!p[`i${i}`]}))} style={{accentColor:'#e07b39'}}/></td>
                  <td style={{padding:'10px 10px',fontSize:14,color:checkedSteps[`i${i}`]?'#5a5448':'#f0ece4',textDecoration:checkedSteps[`i${i}`]?'line-through':'none'}}>{ing.name}{ing.isOptional&&<span style={{fontSize:11,color:'#9c9484',marginLeft:6}}>optional</span>}</td>
                  <td style={{padding:'10px 10px',fontSize:14,color:'#f0ece4'}}>{ing.quantity}</td>
                  <td style={{padding:'10px 10px',fontSize:14,color:'#f0ece4'}}>{ing.unit}</td>
                  <td style={{padding:'10px 10px',fontSize:12,color:'#9c9484'}}>{ing.notes}</td>
                </tr>
              ))}</tbody>
            </table>
            {user&&<button onClick={handleAddToList} style={{padding:'10px 20px',borderRadius:8,background:'rgba(74,153,96,0.1)',color:'#7ecf95',border:'1px solid rgba(74,153,96,0.2)',fontSize:14,fontWeight:500,cursor:'pointer'}}>{added?'✓ Added to Shopping List!':'🛒 Add All to Shopping List'}</button>}
          </div>
        )}

        {/* STEPS */}
        {tab==='steps'&&(
          <div className="fade-in">
            <button onClick={()=>{setCookMode(true);setCookStep(0);}} style={{width:'100%',padding:14,borderRadius:10,background:'rgba(224,123,57,0.1)',border:'1px solid rgba(224,123,57,0.2)',color:'#e07b39',fontSize:14,fontWeight:500,marginBottom:20,cursor:'pointer'}}>
              👨‍🍳 Enter Cook Mode — Step-by-step fullscreen guide
            </button>
            {recipe.steps?.map((step,i)=>(
              <div key={i} style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:10,padding:16,marginBottom:10,opacity:checkedSteps[`s${i}`]?0.5:1,transition:'opacity 0.3s'}}>
                <div style={{display:'flex',gap:14,alignItems:'flex-start'}}>
                  <div style={{width:30,height:30,borderRadius:'50%',background:'#e07b39',color:'#fff',fontSize:13,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{step.stepNumber}</div>
                  <div style={{flex:1}}>
                    <p style={{fontSize:14,color:'#f0ece4',lineHeight:1.6,marginBottom:step.tip||step.duration?6:0}}>{step.instruction}</p>
                    {step.tip&&<p style={{fontSize:12,color:'#d4a843',fontStyle:'italic',marginBottom:4}}>💡 {step.tip}</p>}
                    {step.duration>0&&<p style={{fontSize:12,color:'#9c9484'}}>⏱ {step.duration} minutes</p>}
                  </div>
                  <input type="checkbox" checked={!!checkedSteps[`s${i}`]} onChange={()=>setCheckedSteps(p=>({...p,[`s${i}`]:!p[`s${i}`]}))} style={{accentColor:'#4a9960',flexShrink:0}}/>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* NUTRITION */}
        {tab==='nutrition'&&(
          <div className="fade-in">
            {recipe.nutrition&&Object.values(recipe.nutrition).some(v=>v>0)?(
              <>
                <p style={{fontSize:13,color:'#9c9484',marginBottom:20}}>Per serving ({servings} servings)</p>
                <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:24}}>
                  {[{k:'calories',l:'Calories',u:'kcal',c:'#e07b39'},{k:'protein',l:'Protein',u:'g',c:'#4a90d9'},{k:'carbs',l:'Carbs',u:'g',c:'#d4a843'},{k:'fat',l:'Fat',u:'g',c:'#c0413e'},{k:'fiber',l:'Fiber',u:'g',c:'#4a9960'}].map(({k,l,u,c})=>(
                    <div key={k} style={{flex:1,minWidth:90,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:10,padding:'14px 10px',display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
                      <span style={{fontSize:26,fontWeight:700,color:c}}>{display.nutrition?.[k]||0}</span>
                      <span style={{fontSize:11,color:'#9c9484'}}>{u}</span>
                      <span style={{fontSize:11,color:'#9c9484'}}>{l}</span>
                    </div>
                  ))}
                </div>
                <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:10,padding:16}}>
                  <p style={{fontSize:11,color:'#9c9484',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:10}}>Macro breakdown</p>
                  <div style={{height:12,borderRadius:6,overflow:'hidden',background:'rgba(255,255,255,0.05)',display:'flex',marginBottom:8}}>
                    {['protein','carbs','fat'].map((k,i)=>{
                      const total=(display.nutrition?.protein||0)+(display.nutrition?.carbs||0)+(display.nutrition?.fat||0);
                      const pct=total?Math.round(((display.nutrition?.[k]||0)/total)*100):0;
                      return <div key={k} style={{height:'100%',width:`${pct}%`,background:['#4a90d9','#d4a843','#c0413e'][i],transition:'width 0.5s'}}/>;
                    })}
                  </div>
                  <div style={{display:'flex',gap:14}}>{[['Protein','#4a90d9'],['Carbs','#d4a843'],['Fat','#c0413e']].map(([l,c])=><span key={l} style={{display:'flex',alignItems:'center',gap:5,fontSize:12,color:'#9c9484'}}><span style={{width:8,height:8,borderRadius:'50%',background:c,display:'inline-block'}}/>{l}</span>)}</div>
                </div>
              </>
            ):<div style={{textAlign:'center',padding:'60px 20px'}}><p style={{fontSize:40,marginBottom:12}}>📊</p><p style={{color:'#9c9484'}}>No nutrition data added for this recipe.</p></div>}
          </div>
        )}

        {/* REVIEWS */}
        {tab==='reviews'&&(
          <div className="fade-in">
            {user&&(
              <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:12,padding:20,marginBottom:24}}>
                <h3 style={{fontSize:16,fontWeight:500,color:'#f0ece4',marginBottom:12}}>Leave a Review</h3>
                <div style={{display:'flex',alignItems:'center',marginBottom:12}}>
                  {[1,2,3,4,5].map(i=><button key={i} onClick={()=>setRating(i)} style={{fontSize:28,color:i<=rating?'#d4a843':'#5a5448',background:'none',border:'none',cursor:'pointer',transition:'color 0.15s'}}>★</button>)}
                  <span style={{fontSize:13,color:'#9c9484',marginLeft:8}}>{rating}/5</span>
                </div>
                <textarea value={comment} onChange={e=>setComment(e.target.value)} className="inp" rows={3} placeholder="Share your experience..." style={{marginBottom:10,resize:'vertical'}}/>
                <button onClick={handleReview} disabled={submitting} className="btn btn-primary">{submitting?'Submitting...':'Submit Review'}</button>
              </div>
            )}
            {recipe.reviews?.length>0?recipe.reviews.map((rev,i)=>(
              <div key={i} style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:10,padding:16,marginBottom:10}}>
                <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
                  <div style={{width:36,height:36,borderRadius:'50%',background:'#e07b39',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:14,fontWeight:700,flexShrink:0}}>{(rev.userName||'U')[0].toUpperCase()}</div>
                  <div><p style={{fontSize:14,fontWeight:500,color:'#f0ece4',marginBottom:3}}>{rev.userName||'Anonymous'}</p><div style={{display:'flex',gap:2}}>{[1,2,3,4,5].map(i=><span key={i} style={{color:i<=rev.rating?'#d4a843':'#5a5448',fontSize:13}}>★</span>)}</div></div>
                  <span style={{fontSize:11,color:'#5a5448',marginLeft:'auto'}}>{new Date(rev.createdAt).toLocaleDateString()}</span>
                </div>
                {rev.comment&&<p style={{fontSize:14,color:'#9c9484',lineHeight:1.6}}>{rev.comment}</p>}
              </div>
            )):<div style={{textAlign:'center',padding:'60px 20px'}}><p style={{fontSize:40,marginBottom:12}}>💬</p><p style={{color:'#9c9484'}}>No reviews yet. Be the first!</p></div>}
          </div>
        )}

        {/* SUBSTITUTIONS */}
        {tab==='substitutions'&&(
          <div className="fade-in">
            {recipe.substitutions?.length>0?recipe.substitutions.map((sub,i)=>(
              <div key={i} style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:10,padding:16,marginBottom:10}}>
                <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap',marginBottom:6}}>
                  <span style={{fontSize:14,fontWeight:500,color:'#f0ece4'}}>{sub.original}</span>
                  <span style={{color:'#e07b39',fontSize:18}}>→</span>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{sub.alternatives.map((alt,j)=><span key={j} className="badge badge-accent">{alt}</span>)}</div>
                </div>
                {sub.note&&<p style={{fontSize:12,color:'#9c9484',fontStyle:'italic'}}>{sub.note}</p>}
              </div>
            )):<div style={{textAlign:'center',padding:'60px 20px'}}><p style={{fontSize:40,marginBottom:12}}>🔄</p><p style={{color:'#9c9484'}}>No substitutions listed for this recipe.</p></div>}
          </div>
        )}
      </div>
    </div>
  );
}
