import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [open, setOpen] = useState(false);

  const links = [
    { to: '/', label: 'Discover' },
    { to: '/search', label: 'Search' },
    ...(user ? [{ to: '/dashboard', label: 'Dashboard' }, { to: '/pantry', label: 'Pantry' }, { to: '/shopping-list', label: 'Shopping' }] : []),
  ];

  return (
    <nav style={s.nav}>
      <Link to="/" style={s.brand}>
        <span style={{ color: '#e07b39', fontSize: 20 }}>⬡</span>
        <span style={s.brandTxt}>RecipeVault<span style={{ color: '#e07b39' }}>Pro</span></span>
      </Link>

      <div style={s.links}>
        {links.map(l => (
          <Link key={l.to} to={l.to} style={{ ...s.link, ...(loc.pathname === l.to ? s.linkActive : {}) }}>{l.label}</Link>
        ))}
      </div>

      <div>
        {user ? (
          <div style={{ position: 'relative' }}>
            <button onClick={() => setOpen(o => !o)} style={s.avatar}>{user.name[0].toUpperCase()}</button>
            {open && (
              <div style={s.drop}>
                <p style={{ padding: '10px 14px 4px', fontSize: 14, fontWeight: 500, color: '#f0ece4' }}>{user.name}</p>
                <p style={{ padding: '0 14px 10px', fontSize: 12, color: '#9c9484' }}>{user.email}</p>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', margin: '4px 0' }} />
                {[
                  { to: '/my-recipes', label: 'My Recipes' },
                  { to: '/favorites', label: 'Favorites' },
                  { to: '/profile', label: 'Profile & Settings' },
                ].map(item => (
                  <Link key={item.to} to={item.to} onClick={() => setOpen(false)}
                    style={s.dropItem}>{item.label}</Link>
                ))}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', margin: '4px 0' }} />
                <button onClick={() => { logout(); nav('/'); setOpen(false); }} style={{ ...s.dropItem, color: '#e07a7a', display: 'block', width: '100%', textAlign: 'left' }}>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/login" className="btn btn-ghost" style={{ padding: '7px 16px', fontSize: 13 }}>Sign In</Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '7px 16px', fontSize: 13 }}>Join Free</Link>
          </div>
        )}
      </div>
    </nav>
  );
}

const s = {
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 28px', background: 'rgba(15,14,12,0.97)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(8px)' },
  brand: { display: 'flex', alignItems: 'center', gap: 8 },
  brandTxt: { fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#f0ece4' },
  links: { display: 'flex', gap: 2 },
  link: { padding: '6px 14px', borderRadius: 8, color: '#9c9484', fontSize: 14, transition: 'all 0.2s' },
  linkActive: { color: '#f0ece4', background: 'rgba(255,255,255,0.06)' },
  avatar: { width: 36, height: 36, borderRadius: '50%', background: '#e07b39', color: '#fff', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  drop: { position: 'absolute', right: 0, top: 44, width: 210, background: '#1a1814', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 6, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 200 },
  dropItem: { display: 'block', padding: '8px 14px', borderRadius: 7, fontSize: 13, color: '#9c9484', cursor: 'pointer', transition: 'all 0.15s' }
};
