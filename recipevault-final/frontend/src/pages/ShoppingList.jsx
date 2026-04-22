import React, { useState, useEffect } from 'react';
import { getShoppingList, toggleShopItem, clearShoppingList } from '../services/api.js';

export default function ShoppingList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getShoppingList().then(r=>setItems(r.data.data)).catch(()=>{}).finally(()=>setLoading(false)); }, []);

  const toggle = async id => {
    try { const {data}=await toggleShopItem(id); setItems(data.data); } catch {}
  };

  const clear = async () => {
    if(!confirm('Clear all items?'))return;
    try { await clearShoppingList(); setItems([]); } catch {}
  };

  const unchecked = items.filter(i=>!i.checked);
  const checked   = items.filter(i=>i.checked);

  if(loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',color:'#9c9484'}}>Loading...</div>;

  return (
    <div style={{maxWidth:680,margin:'0 auto',padding:'28px 24px 60px'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:28}}>
        <div>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:30,fontWeight:700,color:'#f0ece4',marginBottom:4}}>Shopping List</h1>
          <p style={{fontSize:14,color:'#9c9484'}}>{unchecked.length} item{unchecked.length!==1?'s':''} remaining</p>
        </div>
        {checked.length>0&&<button onClick={clear} style={{padding:'7px 14px',borderRadius:8,background:'rgba(192,65,62,0.1)',color:'#e07a7a',border:'1px solid rgba(192,65,62,0.2)',fontSize:13,cursor:'pointer'}}>Clear {checked.length} done</button>}
      </div>

      {items.length===0
        ?<div style={{textAlign:'center',padding:'60px 20px'}}>
          <p style={{fontSize:48,marginBottom:12}}>🛒</p>
          <p style={{color:'#9c9484',marginBottom:8}}>Your shopping list is empty.</p>
          <p style={{color:'#5a5448',fontSize:13}}>Open a recipe and click "Add to Shopping List"</p>
        </div>
        :<>
          {unchecked.map(item=><ShopItem key={item._id} item={item} onToggle={toggle}/>)}
          {checked.length>0&&(
            <>
              <p style={{fontSize:11,color:'#5a5448',textTransform:'uppercase',letterSpacing:'0.06em',marginTop:20,marginBottom:10}}>Done</p>
              {checked.map(item=><ShopItem key={item._id} item={item} onToggle={toggle}/>)}
            </>
          )}
        </>
      }
    </div>
  );
}

function ShopItem({ item, onToggle }) {
  return (
    <div onClick={()=>onToggle(item._id)} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',marginBottom:6,background:item.checked?'rgba(255,255,255,0.01)':'#1a1814',border:'1px solid rgba(255,255,255,0.06)',borderRadius:10,cursor:'pointer',opacity:item.checked?0.5:1,transition:'all 0.2s'}}>
      <div style={{width:20,height:20,borderRadius:6,border:`2px solid ${item.checked?'#4a9960':'rgba(255,255,255,0.15)'}`,background:item.checked?'#4a9960':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
        {item.checked&&<span style={{color:'#fff',fontSize:12}}>✓</span>}
      </div>
      <span style={{flex:1,fontSize:14,color:'#f0ece4',textDecoration:item.checked?'line-through':'none'}}>{item.name}</span>
      {(item.quantity||item.unit)&&<span style={{fontSize:13,color:'#9c9484'}}>{item.quantity} {item.unit}</span>}
    </div>
  );
}
