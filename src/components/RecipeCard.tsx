"use client";

import { motion } from "framer-motion";
import { Heart, Star, Clock, Users } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRecipes } from "@/contexts/RecipeContext";

interface Recipe {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory?: string;
  strArea?: string;
}

interface RecipeCardProps {
  recipe: Recipe;
  onViewDetails: (recipe: Recipe) => void;
  isFavorite?: boolean;
}

export default function RecipeCard({
  recipe,
  onViewDetails,
  isFavorite = false,
}: RecipeCardProps) {
  const { isAuthenticated } = useAuth();
  const { addToFavorites, removeFromFavorites } = useRecipes();
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToFavorites, setIsAddingToFavorites] = useState(false);

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) return;

    setIsAddingToFavorites(true);
    try {
      if (isFavorite) {
        await removeFromFavorites(recipe.idMeal);
      } else {
        await addToFavorites(recipe);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setIsAddingToFavorites(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer group"
      onClick={() => onViewDetails(recipe)}
    >
      <div className="relative overflow-hidden">
        <motion.img
          src={recipe.strMealThumb}
          alt={recipe.strMeal}
          className="w-full h-48 object-cover"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
        />

        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/20 flex items-center justify-center"
        >
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="bg-white text-orange-600 px-4 py-2 rounded-full font-semibold hover:bg-orange-50 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(recipe);
            }}
          >
            View Details
          </motion.button>
        </motion.div>

        {/* Favorite Button */}
        {isAuthenticated && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
            onClick={handleFavoriteToggle}
            disabled={isAddingToFavorites}
            className={`absolute top-3 right-3 p-2 rounded-full shadow-lg transition-all duration-200 ${
              isFavorite
                ? "bg-red-500 text-white"
                : "bg-white text-gray-400 hover:text-red-500"
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
          </motion.button>
        )}

        {/* Category Badge */}
        {recipe.strCategory && (
          <div className="absolute top-3 left-3">
            <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              {recipe.strCategory}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
          {recipe.strMeal}
        </h3>

        <div className="flex items-center justify-between text-sm text-gray-500">
          {recipe.strArea && (
            <div className="flex items-center">
              <span className="mr-1">🌍</span>
              <span>{recipe.strArea}</span>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="ml-1">4.5</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4" />
              <span className="ml-1">30m</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
