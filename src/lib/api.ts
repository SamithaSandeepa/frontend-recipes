import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData: { name: string; email: string; password: string }) =>
    api.post("/auth/register", userData),

  login: (credentials: { email: string; password: string }) =>
    api.post("/auth/login", credentials),

  getProfile: () => api.get("/auth/me"),

  updateProfile: (data: { name: string }) => api.put("/auth/profile", data),

  logout: () => api.post("/auth/logout"),
};

// Recipe API
export const recipeAPI = {
  getCategories: () => api.get("/recipes/categories"),

  getRecipesByCategory: (category: string) =>
    api.get(`/recipes/by-category/${encodeURIComponent(category)}`),

  searchRecipes: (searchTerm: string) =>
    api.get(`/recipes/search?search=${encodeURIComponent(searchTerm)}`),

  getRecipeDetails: (id: string) =>
    api.get(`/recipes/details/${encodeURIComponent(id)}`),

  getRandomRecipe: () => api.get("/recipes/random"),

  getFeaturedRecipes: () => api.get("/recipes/featured"),
};

// User API
export const userAPI = {
  getFavorites: () => api.get("/users/favorites"),

  addToFavorites: (recipe: {
    recipeId: string;
    recipeName: string;
    recipeImage: string;
    category: string;
  }) => api.post("/users/favorites", recipe),

  removeFromFavorites: (recipeId: string) =>
    api.delete(`/users/favorites/${encodeURIComponent(recipeId)}`),

  checkFavoriteStatus: (recipeId: string) =>
    api.get(`/users/favorites/check/${encodeURIComponent(recipeId)}`),

  getFavoritesByCategory: () => api.get("/users/favorites/by-category"),

  clearAllFavorites: () => api.delete("/users/favorites"),

  getUserStats: () => api.get("/users/stats"),
};

export default api;
