import React from 'react';
import { Link } from 'react-router-dom';
import { toggleFavorite } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const DIFF = { easy: 'badge-green', medium: 'badge-gold', hard: 'badge-red' };

export default function RecipeCard({ recipe, onRefresh }) {
  const { user } = useAuth();
  const isFav = user?.favorites?.some(f => (f._id || f)?.toString() === recipe._id?.toString());

  const handleFav = async e => {
    e.preventDefault();
    if (!user) return;
    try { await toggleFavorite(recipe._id); onRefresh?.(); } catch {}
  };

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <Link to={`/recipe/${recipe._id}`} style={{ display: 'block', textDecoration: 'none', height: '100%' }}>
      <div className="card fade-in" style={s.card}>
        <div style={s.imgWrap}>
          {recipe.imageUrl
            ? <img src={recipe.imageUrl} alt={recipe.name} style={s.img} />
            : <div style={s.imgPh}><span style={{ fontSize: 40, opacity: 0.25 }}>🍽</span></div>}
          {user && <button onClick={handleFav} style={{ ...s.fav, color: isFav ? '#e07b39' : '#9c9484' }}>{isFav ? '♥' : '♡'}</button>}
          {recipe.matchPercent !== undefined && <div style={s.matchBadge}>{recipe.matchPercent}% match</div>}
          <span className={`badge ${DIFF[recipe.difficulty] || 'badge-accent'}`} style={{ position: 'absolute', bottom: 8, left: 10 }}>{recipe.difficulty}</span>
        </div>

        <div style={s.body}>
          <p style={s.cuisine}>{recipe.cuisine} · {recipe.category}</p>
          <h3 style={s.title}>{recipe.name}</h3>
          {recipe.description && <p style={s.desc}>{recipe.description.slice(0, 75)}{recipe.description.length > 75 ? '...' : ''}</p>}

          <div style={s.row}>
            <div className="stars">{'★'.repeat(Math.round(recipe.averageRating || 0))}{'☆'.repeat(5 - Math.round(recipe.averageRating || 0))}</div>
            <span style={{ fontSize: 12, color: '#d4a843' }}>{recipe.averageRating?.toFixed(1) || '—'}</span>
            <span style={{ fontSize: 12, color: '#5a5448' }}>({recipe.totalRatings || 0})</span>
          </div>

          <div style={s.meta}>
            {totalTime > 0 && <span>⏱ {totalTime}m</span>}
            <span>👥 {recipe.servings || 4}</span>
            <span>🧂 {recipe.ingredients?.length || 0} ing.</span>
          </div>

          {recipe.dietaryInfo?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 6 }}>
              {recipe.dietaryInfo.slice(0, 3).map(d => <span key={d} className="badge badge-green" style={{ fontSize: 10 }}>{d}</span>)}
            </div>
          )}

          {recipe.matchedIngredients && (
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <span style={{ fontSize: 12, color: '#4a9960', fontWeight: 500 }}>✓ {recipe.matchedIngredients.length} have</span>
              {recipe.missingIngredients?.length > 0 && <span style={{ fontSize: 12, color: '#c0413e', fontWeight: 500 }}>+ {recipe.missingIngredients.length} need</span>}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

const s = {
  card: { overflow: 'hidden', height: '100%', transition: 'transform 0.2s', cursor: 'pointer' },
  imgWrap: { position: 'relative', height: 175, background: '#1a1814', overflow: 'hidden' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  imgPh: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#1a1814,#2a2722)' },
  fav: { position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.5)', border: 'none', width: 30, height: 30, borderRadius: '50%', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s' },
  matchBadge: { position: 'absolute', top: 8, left: 8, background: 'rgba(74,153,96,0.9)', color: '#fff', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 10 },
  body: { padding: '12px 14px 14px' },
  cuisine: { fontSize: 11, color: '#e07b39', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 500, marginBottom: 3 },
  title: { fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: '#f0ece4', marginBottom: 4, lineHeight: 1.3 },
  desc: { fontSize: 12, color: '#9c9484', marginBottom: 7, lineHeight: 1.5 },
  row: { display: 'flex', alignItems: 'center', gap: 5, marginBottom: 7, fontSize: 13 },
  meta: { display: 'flex', gap: 10, fontSize: 12, color: '#9c9484' }
};
