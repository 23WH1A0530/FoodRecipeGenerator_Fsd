import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Search from './pages/Search.jsx';
import Dashboard from './pages/Dashboard.jsx';
import RecipeDetail from './pages/RecipeDetail.jsx';
import Pantry from './pages/Pantry.jsx';
import ShoppingList from './pages/ShoppingList.jsx';
import AuthPage from './pages/AuthPage.jsx';
import MyRecipes from './pages/MyRecipes.jsx';
import { Favorites, Profile } from './pages/Favorites.jsx';

function Guard({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'70vh', color:'#9c9484', fontSize:15 }}>Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"              element={<Home />} />
        <Route path="/search"        element={<Search />} />
        <Route path="/recipe/:id"    element={<RecipeDetail />} />
        <Route path="/login"         element={<AuthPage mode="login" />} />
        <Route path="/register"      element={<AuthPage mode="register" />} />
        <Route path="/dashboard"     element={<Guard><Dashboard /></Guard>} />
        <Route path="/pantry"        element={<Guard><Pantry /></Guard>} />
        <Route path="/shopping-list" element={<Guard><ShoppingList /></Guard>} />
        <Route path="/my-recipes"    element={<Guard><MyRecipes /></Guard>} />
        <Route path="/favorites"     element={<Guard><Favorites /></Guard>} />
        <Route path="/profile"       element={<Guard><Profile /></Guard>} />
        <Route path="*"              element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
