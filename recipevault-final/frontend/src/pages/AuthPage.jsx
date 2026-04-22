import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthPage({ mode = 'login' }) {
  const { login, register } = useAuth();
  const nav = useNavigate();
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [form, setForm] = useState({ name:'', email:'', password:'', cookingLevel:'beginner' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const up = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      if (isLogin) await login(form.email, form.password);
      else await register(form);
      nav('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || (isLogin ? 'Invalid email or password' : 'Registration failed. Try again.'));
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 57px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="card" style={{ padding: '36px 32px', width: '100%', maxWidth: 440 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 28 }}>
          <span style={{ color: '#e07b39', fontSize: 20 }}>⬡</span>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: '#f0ece4' }}>
            RecipeVault<span style={{ color: '#e07b39' }}>Pro</span>
          </span>
        </div>

        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: '#f0ece4', textAlign: 'center', marginBottom: 6 }}>
          {isLogin ? 'Welcome back' : 'Create account'}
        </h1>
        <p style={{ fontSize: 14, color: '#9c9484', textAlign: 'center', marginBottom: 28 }}>
          {isLogin ? 'Sign in to access your kitchen' : 'Join thousands of home cooks'}
        </p>

        <form onSubmit={submit}>
          {!isLogin && (
            <div style={{ marginBottom: 14 }}>
              <label style={s.lbl}>Full Name</label>
              <input value={form.name} onChange={e => up('name', e.target.value)} className="inp" placeholder="Your name" required />
            </div>
          )}
          <div style={{ marginBottom: 14 }}>
            <label style={s.lbl}>Email</label>
            <input type="email" value={form.email} onChange={e => up('email', e.target.value)} className="inp" placeholder="you@example.com" required />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={s.lbl}>Password</label>
            <input type="password" value={form.password} onChange={e => up('password', e.target.value)} className="inp" placeholder={isLogin ? '••••••' : 'At least 6 characters'} required />
          </div>
          {!isLogin && (
            <div style={{ marginBottom: 14 }}>
              <label style={s.lbl}>Cooking Level</label>
              <select value={form.cookingLevel} onChange={e => up('cookingLevel', e.target.value)} className="inp">
                <option value="beginner">Beginner — Just starting out</option>
                <option value="intermediate">Intermediate — Know my way around</option>
                <option value="advanced">Advanced — Love complex recipes</option>
              </select>
            </div>
          )}

          {error && (
            <p style={{ color: '#e07a7a', fontSize: 13, padding: '10px 14px', background: 'rgba(192,65,62,0.08)', borderRadius: 8, border: '1px solid rgba(192,65,62,0.2)', marginBottom: 14 }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: 12, fontSize: 15 }}>
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#9c9484' }}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setIsLogin(l => !l); setError(''); }} style={{ color: '#e07b39', fontSize: 14 }}>
            {isLogin ? 'Sign up free' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}

const s = { lbl: { display: 'block', fontSize: 11, color: '#9c9484', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, fontWeight: 500 } };
