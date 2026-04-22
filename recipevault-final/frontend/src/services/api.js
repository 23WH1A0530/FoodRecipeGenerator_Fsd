import axios from 'axios';
const api = axios.create({ baseURL: '/api' });

export const getRecipes      = p => api.get('/recipes', { params: p });
export const searchRecipes   = (ingredients, p) => api.get('/recipes/search', { params: { ingredients, ...p } });
export const getSuggestions  = () => api.get('/recipes/suggestions');
export const getTrending     = () => api.get('/recipes/trending');
export const getStats        = () => api.get('/recipes/stats');
export const getRecipe       = id => api.get(`/recipes/${id}`);
export const scaleRecipe     = (id, s) => api.get(`/recipes/${id}/scale`, { params: { servings: s } });
export const createRecipe    = d => api.post('/recipes', d);
export const updateRecipe    = (id, d) => api.put(`/recipes/${id}`, d);
export const deleteRecipe    = id => api.delete(`/recipes/${id}`);
export const reviewRecipe    = (id, d) => api.post(`/recipes/${id}/review`, d);
export const toggleFavorite  = id => api.post(`/recipes/${id}/favorite`);

export const getMe           = () => api.get('/auth/me');
export const updatePrefs     = d => api.put('/auth/preferences', d);
export const getPantry       = () => api.get('/auth/pantry');
export const addPantryItem   = d => api.post('/auth/pantry', d);
export const removePantryItem = id => api.delete(`/auth/pantry/${id}`);
export const getShoppingList  = () => api.get('/auth/shopping-list');
export const addToShoppingList = items => api.post('/auth/shopping-list', items);
export const toggleShopItem   = id => api.patch(`/auth/shopping-list/${id}/toggle`);
export const clearShoppingList = () => api.delete('/auth/shopping-list/clear');

export default api;
