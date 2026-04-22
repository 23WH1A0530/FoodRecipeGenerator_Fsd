import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTrending, searchRecipes } from '../services/api.js';
import RecipeCard from '../components/RecipeCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const FEATURES = [
  { icon:'🔍', title:'Ingredient Search', desc:'Type what you have, discover what to cook. Match any or all ingredients.' },
  { icon:'🧺', title:'Smart Pantry', desc:'Track pantry items with expiry dates. Get recipe suggestions automatically.' },
  { icon:'👨‍🍳', title:'Cook Mode', desc:'Step-by-step guided cooking, fullscreen with timers and pro tips.' },
  { icon:'📊', title:'Nutrition Tracker', desc:'Calories, protein, carbs and fat per recipe with visual macro breakdown.' },
  { icon:'🔄', title:'Recipe Scaling', desc:'Scale any recipe from 1 to 100 servings. All quantities auto-adjust.' },
  { icon:'🛒', title:'Shopping List', desc:'Add all recipe ingredients to your shopping list in one tap.' },
  { icon:'⭐', title:'Ratings & Reviews', desc:'Star ratings and comments from the community to find the best recipes.' },
  { icon:'↔', title:'Substitutions', desc:'Can\'t find an ingredient? See smart substitutions for every recipe.' },
];

const TECH = [
  { name:'React 18', desc:'Frontend UI' },
  { name:'Node.js + Express', desc:'REST API Backend' },
  { name:'MongoDB Atlas', desc:'Cloud Database' },
  { name:'Mongoose ODM', desc:'Schema & Queries' },
  { name:'JWT Auth', desc:'Secure Sessions' },
  { name:'Recharts', desc:'Data Visualization' },
];

export default function Home() {
  const { user } = useAuth();
  const [trending, setTrending] = useState([]);
  const [ingInput, setIngInput] = useState('');
  const [quickResults, setQuickResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => { getTrending().then(r => setTrending(r.data.data)).catch(() => {}); }, []);

  const quickSearch = async () => {
    if (!ingInput.trim()) return;
    setSearching(true);
    try { const { data } = await searchRecipes(ingInput); setQuickResults(data.data.slice(0, 4)); }
    catch {}
    setSearching(false);
  };

  return (
    <div style={{ background: '#0f0e0c', minHeight: 'calc(100vh - 57px)' }}>
      {/* Hero */}
      <section style={s.hero}>
        <div style={s.heroBg} />
        <div style={s.heroInner}>
          <div style={s.tag}>BTech Third Year Mini Project — Full Stack MERN Application</div>
          <h1 style={s.heroTitle}>Cook smarter with<br /><span style={{ color: '#e07b39' }}>RecipeVault Pro</span></h1>
          <p style={s.heroDesc}>Ingredient-based recipe discovery, pantry management, nutritional analysis, personalized suggestions and guided cooking — all in one app.</p>

          <div style={s.searchRow}>
            <input value={ingInput} onChange={e => setIngInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && quickSearch()}
              style={s.searchInp} placeholder="Type an ingredient (e.g. tomato, onion, chicken)..." />
            <button onClick={quickSearch} className="btn btn-primary" style={{ padding: '12px 24px', fontSize: 15 }}>
              {searching ? '...' : 'Find Recipes'}
            </button>
          </div>

          {quickResults.length > 0 && (
            <div style={s.quickResults}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginBottom: 12 }}>
                {quickResults.map(r => <RecipeCard key={r._id} recipe={r} />)}
              </div>
              <Link to="/search" style={{ color: '#e07b39', fontSize: 14 }}>See all results →</Link>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: quickResults.length ? 0 : 12 }}>
            {user
              ? <Link to="/dashboard" className="btn btn-primary" style={{ fontSize: 15 }}>Go to Dashboard →</Link>
              : <>
                  <Link to="/register" className="btn btn-primary" style={{ fontSize: 15 }}>Get Started Free</Link>
                  <Link to="/login" className="btn btn-ghost" style={{ fontSize: 15 }}>Sign In</Link>
                </>
            }
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={s.section}>
        <h2 style={s.sTitle}>Everything a home cook needs</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
          {FEATURES.map(f => (
            <div key={f.title} className="card" style={{ padding: '20px 18px' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#f0ece4', marginBottom: 6 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: '#9c9484', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trending */}
      {trending.length > 0 && (
        <section style={s.section}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
            <h2 style={s.sTitle}>🔥 Trending Recipes</h2>
            <Link to="/search" style={{ color: '#e07b39', fontSize: 14 }}>See all →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {trending.slice(0, 4).map(r => <RecipeCard key={r._id} recipe={r} />)}
          </div>
        </section>
      )}

      {/* Tech Stack */}
      <section style={s.section}>
        <h2 style={s.sTitle}>Tech Stack</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
          {TECH.map(t => (
            <div key={t.name} className="card" style={{ padding: '16px 14px' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#f0ece4', marginBottom: 4 }}>{t.name}</p>
              <p style={{ fontSize: 12, color: '#9c9484' }}>{t.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const s = {
  hero: { position: 'relative', padding: '64px 32px 80px', maxWidth: 900, margin: '0 auto' },
  heroBg: { position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 30%, rgba(224,123,57,0.07) 0%, transparent 60%)', pointerEvents: 'none' },
  heroInner: { position: 'relative', zIndex: 1 },
  tag: { display: 'inline-block', padding: '4px 14px', borderRadius: 20, background: 'rgba(224,123,57,0.1)', color: '#e07b39', fontSize: 12, fontWeight: 500, border: '1px solid rgba(224,123,57,0.2)', marginBottom: 20 },
  heroTitle: { fontFamily: "'Playfair Display',serif", fontSize: 46, fontWeight: 700, color: '#f0ece4', lineHeight: 1.15, marginBottom: 16 },
  heroDesc: { fontSize: 16, color: '#9c9484', lineHeight: 1.7, maxWidth: 580, marginBottom: 28 },
  searchRow: { display: 'flex', gap: 10, marginBottom: 20, maxWidth: 600 },
  searchInp: { flex: 1, padding: '12px 18px', background: '#1a1814', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#f0ece4', fontSize: 15 },
  quickResults: { marginBottom: 20 },
  section: { padding: '0 32px 60px', maxWidth: 1100, margin: '0 auto' },
  sTitle: { fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: '#f0ece4', marginBottom: 24 },
};
