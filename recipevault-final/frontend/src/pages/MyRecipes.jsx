import React, { useState, useEffect } from 'react';
import { getRecipes, deleteRecipe } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import RecipeCard from '../components/RecipeCard.jsx';
import AddRecipeModal from '../components/AddRecipeModal.jsx';

export default function MyRecipes() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editRecipe, setEditRecipe] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const {data} = await getRecipes({limit:100});
      setRecipes(data.data.filter(r=>r.author?._id===user?._id||r.author===user?._id));
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async id => {
    if(!confirm('Delete this recipe?'))return;
    try { await deleteRecipe(id); setRecipes(p=>p.filter(r=>r._id!==id)); } catch {}
  };

  return (
    <div style={{maxWidth:1100,margin:'0 auto',padding:'28px 24px 60px'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:28}}>
        <div>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:30,fontWeight:700,color:'#f0ece4',marginBottom:4}}>My Recipes</h1>
          <p style={{fontSize:14,color:'#9c9484'}}>{recipes.length} recipe{recipes.length!==1?'s':''} created by you</p>
        </div>
        <button onClick={()=>{setEditRecipe(null);setShowModal(true);}} className="btn btn-primary">+ Add New Recipe</button>
      </div>

      {loading
        ?<p style={{color:'#9c9484'}}>Loading...</p>
        :recipes.length===0
          ?<div style={{textAlign:'center',padding:'60px 20px'}}>
            <p style={{fontSize:48,marginBottom:12}}>📝</p>
            <p style={{color:'#9c9484',marginBottom:20}}>You haven't created any recipes yet.</p>
            <button onClick={()=>setShowModal(true)} className="btn btn-primary">Create Your First Recipe</button>
          </div>
          :<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))',gap:16}}>
            {recipes.map(r=>(
              <div key={r._id}>
                <RecipeCard recipe={r} onRefresh={load}/>
                <div style={{display:'flex',gap:8,marginTop:6}}>
                  <button onClick={()=>{setEditRecipe(r);setShowModal(true);}} style={{flex:1,padding:'7px',borderRadius:8,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',color:'#9c9484',fontSize:13,cursor:'pointer'}}>✏ Edit</button>
                  <button onClick={()=>handleDelete(r._id)} style={{flex:1,padding:'7px',borderRadius:8,background:'rgba(192,65,62,0.07)',border:'1px solid rgba(192,65,62,0.15)',color:'#e07a7a',fontSize:13,cursor:'pointer'}}>Delete</button>
                </div>
              </div>
            ))}
          </div>
      }

      {showModal&&(
        <AddRecipeModal
          onClose={()=>{setShowModal(false);setEditRecipe(null);}}
          onSaved={()=>{setShowModal(false);setEditRecipe(null);load();}}
          editRecipe={editRecipe}
        />
      )}
    </div>
  );
}
