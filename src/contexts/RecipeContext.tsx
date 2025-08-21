"use client";

import React, { createContext, useContext, useState } from "react";
import { recipeAPI, userAPI } from "@/lib/api";
import { toast } from "react-hot-toast";
import { useAuth } from "./AuthContext";

interface Recipe {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory?: string;
  strArea?: string;
  strInstructions?: string;
  strTags?: string;
  strYoutube?: string;
  strSource?: string;
}

interface DetailedRecipe {
  id: string;
  name: string;
  category: string;
  area: string;
  instructions: string;
  image: string;
  tags: string[];
  ingredients: Array<{ name: string; measurement: string }>;
  youtubeUrl?: string;
  sourceUrl?: string;
}

interface FavoriteRecipe {
  recipeId: string;
  recipeName: string;
  recipeImage: string;
  category: string;
  addedAt: Date;
}

interface RecipeContextType {
  // Categories
  categories: any[];
  loadingCategories: boolean;
  fetchCategories: () => Promise<void>;

  // Recipes by category
  recipesByCategory: Record<string, Recipe[]>;
  loadingRecipes: boolean;
  fetchRecipesByCategory: (category: string) => Promise<void>;

  // Search
  searchResults: Recipe[];
  loadingSearch: boolean;
  searchRecipes: (searchTerm: string) => Promise<void>;

  // Recipe details
  selectedRecipe: DetailedRecipe | null;
  loadingRecipeDetails: boolean;
  fetchRecipeDetails: (id: string) => Promise<void>;

  // Random recipe
  randomRecipe: DetailedRecipe | null;
  loadingRandomRecipe: boolean;
  fetchRandomRecipe: () => Promise<void>;

  // Featured recipes
  featuredRecipes: Record<string, Recipe[]>;
  loadingFeatured: boolean;
  fetchFeaturedRecipes: () => Promise<void>;

  // Favorites
  favorites: FavoriteRecipe[];
  loadingFavorites: boolean;
  fetchFavorites: () => Promise<void>;
  addToFavorites: (recipe: Recipe) => Promise<void>;
  removeFromFavorites: (recipeId: string) => Promise<void>;
  isFavorite: (recipeId: string) => boolean;
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export const useRecipes = () => {
  const context = useContext(RecipeContext);
  if (context === undefined) {
    throw new Error("useRecipes must be used within a RecipeProvider");
  }
  return context;
};

export const RecipeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, updateUser } = useAuth();

  // State
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [recipesByCategory, setRecipesByCategory] = useState<
    Record<string, Recipe[]>
  >({});
  const [loadingRecipes, setLoadingRecipes] = useState(false);

  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const [selectedRecipe, setSelectedRecipe] = useState<DetailedRecipe | null>(
    null
  );
  const [loadingRecipeDetails, setLoadingRecipeDetails] = useState(false);

  const [randomRecipe, setRandomRecipe] = useState<DetailedRecipe | null>(null);
  const [loadingRandomRecipe, setLoadingRandomRecipe] = useState(false);

  const [featuredRecipes, setFeaturedRecipes] = useState<
    Record<string, Recipe[]>
  >({});
  const [loadingFeatured, setLoadingFeatured] = useState(false);

  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  // Categories
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await recipeAPI.getCategories();
      setCategories(response.data.categories);
    } catch (error: any) {
      toast.error("Failed to fetch categories");
      console.error("Categories fetch error:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Recipes by category
  const fetchRecipesByCategory = async (category: string) => {
    try {
      setLoadingRecipes(true);
      const response = await recipeAPI.getRecipesByCategory(category);
      setRecipesByCategory((prev) => ({
        ...prev,
        [category]: response.data.recipes,
      }));
    } catch (error: any) {
      toast.error(`Failed to fetch ${category} recipes`);
      console.error("Recipes by category fetch error:", error);
    } finally {
      setLoadingRecipes(false);
    }
  };

  // Search recipes
  const searchRecipes = async (searchTerm: string) => {
    try {
      setLoadingSearch(true);
      const response = await recipeAPI.searchRecipes(searchTerm);
      setSearchResults(response.data.recipes || []);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setSearchResults([]);
        toast.error("No recipes found for your search");
      } else {
        toast.error("Search failed");
        console.error("Search error:", error);
      }
    } finally {
      setLoadingSearch(false);
    }
  };

  // Recipe details
  const fetchRecipeDetails = async (id: string) => {
    try {
      setLoadingRecipeDetails(true);
      const response = await recipeAPI.getRecipeDetails(id);
      setSelectedRecipe(response.data.recipe);
    } catch (error: any) {
      toast.error("Failed to fetch recipe details");
      console.error("Recipe details fetch error:", error);
    } finally {
      setLoadingRecipeDetails(false);
    }
  };

  // Random recipe
  const fetchRandomRecipe = async () => {
    try {
      setLoadingRandomRecipe(true);
      const response = await recipeAPI.getRandomRecipe();
      setRandomRecipe(response.data.recipe);
    } catch (error: any) {
      toast.error("Failed to fetch random recipe");
      console.error("Random recipe fetch error:", error);
    } finally {
      setLoadingRandomRecipe(false);
    }
  };

  // Featured recipes
  const fetchFeaturedRecipes = async () => {
    try {
      setLoadingFeatured(true);
      const response = await recipeAPI.getFeaturedRecipes();
      setFeaturedRecipes(response.data.featured);
    } catch (error: any) {
      toast.error("Failed to fetch featured recipes");
      console.error("Featured recipes fetch error:", error);
    } finally {
      setLoadingFeatured(false);
    }
  };

  // Favorites
  const fetchFavorites = async () => {
    if (!user) return;

    try {
      setLoadingFavorites(true);
      const response = await userAPI.getFavorites();
      setFavorites(response.data.favorites);
    } catch (error: any) {
      console.error("Favorites fetch error:", error);
    } finally {
      setLoadingFavorites(false);
    }
  };

  const addToFavorites = async (recipe: Recipe) => {
    if (!user) {
      toast.error("Please login to add favorites");
      return;
    }

    try {
      const favoriteData = {
        recipeId: recipe.idMeal,
        recipeName: recipe.strMeal,
        recipeImage: recipe.strMealThumb,
        category: recipe.strCategory || "Unknown",
      };

      await userAPI.addToFavorites(favoriteData);

      const newFavorite: FavoriteRecipe = {
        ...favoriteData,
        addedAt: new Date(),
      };

      setFavorites((prev) => [newFavorite, ...prev]);

      // Update user context
      if (user) {
        updateUser({
          favoriteRecipes: [newFavorite, ...user.favoriteRecipes],
        });
      }

      toast.success("Added to favorites!");
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to add to favorites";
      toast.error(message);
    }
  };

  const removeFromFavorites = async (recipeId: string) => {
    if (!user) return;

    try {
      await userAPI.removeFromFavorites(recipeId);

      setFavorites((prev) => prev.filter((fav) => fav.recipeId !== recipeId));

      // Update user context
      if (user) {
        updateUser({
          favoriteRecipes: user.favoriteRecipes.filter(
            (fav) => fav.recipeId !== recipeId
          ),
        });
      }

      toast.success("Removed from favorites");
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to remove from favorites";
      toast.error(message);
    }
  };

  const isFavorite = (recipeId: string): boolean => {
    return favorites.some((fav) => fav.recipeId === recipeId);
  };

  const value = {
    categories,
    loadingCategories,
    fetchCategories,
    recipesByCategory,
    loadingRecipes,
    fetchRecipesByCategory,
    searchResults,
    loadingSearch,
    searchRecipes,
    selectedRecipe,
    loadingRecipeDetails,
    fetchRecipeDetails,
    randomRecipe,
    loadingRandomRecipe,
    fetchRandomRecipe,
    featuredRecipes,
    loadingFeatured,
    fetchFeaturedRecipes,
    favorites,
    loadingFavorites,
    fetchFavorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
  };

  return (
    <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>
  );
};
