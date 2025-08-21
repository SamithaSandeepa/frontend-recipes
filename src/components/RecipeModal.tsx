"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Clock, Users, Star, ExternalLink, Play } from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRecipes } from "@/contexts/RecipeContext";

interface Recipe {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory?: string;
  strArea?: string;
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

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe | null;
}

export default function RecipeModal({
  isOpen,
  onClose,
  recipe,
}: RecipeModalProps) {
  const { isAuthenticated } = useAuth();
  const {
    selectedRecipe,
    loadingRecipeDetails,
    fetchRecipeDetails,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
  } = useRecipes();

  useEffect(() => {
    if (isOpen && recipe) {
      fetchRecipeDetails(recipe.idMeal);
    }
  }, [isOpen, recipe, fetchRecipeDetails]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated || !recipe) return;

    try {
      if (isFavorite(recipe.idMeal)) {
        await removeFromFavorites(recipe.idMeal);
      } else {
        await addToFavorites(recipe);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  if (!recipe) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            <div className="min-h-screen px-4 py-8 flex items-center justify-center">
              <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="relative">
                  <motion.img
                    src={recipe.strMealThumb}
                    alt={recipe.strMeal}
                    className="w-full h-64 object-cover"
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Close Button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-600 hover:text-gray-800 p-2 rounded-full shadow-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>

                  {/* Favorite Button */}
                  {isAuthenticated && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleFavoriteToggle}
                      className={`absolute top-4 left-4 p-2 rounded-full shadow-lg transition-all duration-200 ${
                        isFavorite(recipe.idMeal)
                          ? "bg-red-500 text-white"
                          : "bg-white/90 backdrop-blur-sm text-gray-600 hover:text-red-500"
                      }`}
                    >
                      <Heart
                        className={`w-6 h-6 ${
                          isFavorite(recipe.idMeal) ? "fill-current" : ""
                        }`}
                      />
                    </motion.button>
                  )}

                  {/* Recipe Title Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {recipe.strMeal}
                    </h2>
                    <div className="flex items-center space-x-4 text-white/90">
                      {recipe.strCategory && (
                        <span className="bg-orange-500 px-3 py-1 rounded-full text-sm font-semibold">
                          {recipe.strCategory}
                        </span>
                      )}
                      {recipe.strArea && (
                        <span className="flex items-center text-sm">
                          🌍 {recipe.strArea}
                        </span>
                      )}
                      <div className="flex items-center text-sm">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        4.5
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                  {loadingRecipeDetails ? (
                    <div className="flex items-center justify-center py-12">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"
                      />
                      <span className="ml-3 text-gray-600">
                        Loading recipe details...
                      </span>
                    </div>
                  ) : selectedRecipe ? (
                    <div className="space-y-6">
                      {/* Recipe Info */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>30-45 mins</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          <span>4 servings</span>
                        </div>
                        {selectedRecipe.tags.length > 0 && (
                          <div className="flex items-center flex-wrap gap-1">
                            {selectedRecipe.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Ingredients */}
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">
                          Ingredients
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {selectedRecipe.ingredients.map(
                            (ingredient, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  duration: 0.3,
                                  delay: index * 0.05,
                                }}
                                className="flex items-center bg-gray-50 rounded-lg p-3"
                              >
                                <span className="font-semibold text-orange-600 min-w-0 flex-1">
                                  {ingredient.name}
                                </span>
                                <span className="text-gray-600 ml-2">
                                  {ingredient.measurement}
                                </span>
                              </motion.div>
                            )
                          )}
                        </div>
                      </div>

                      {/* Instructions */}
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">
                          Instructions
                        </h3>
                        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                          {selectedRecipe.instructions.split("\n").map(
                            (step, index) =>
                              step.trim() && (
                                <motion.p
                                  key={index}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{
                                    duration: 0.3,
                                    delay: index * 0.1,
                                  }}
                                  className="mb-3"
                                >
                                  {step.trim()}
                                </motion.p>
                              )
                          )}
                        </div>
                      </div>

                      {/* External Links */}
                      <div className="flex flex-wrap gap-4 pt-4 border-t">
                        {selectedRecipe.youtubeUrl && (
                          <motion.a
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            href={selectedRecipe.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Watch Video
                          </motion.a>
                        )}
                        {selectedRecipe.sourceUrl && (
                          <motion.a
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            href={selectedRecipe.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center bg-gray-600 text-white px-4 py-2 rounded-full hover:bg-gray-700 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Source
                          </motion.a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-600">
                        Failed to load recipe details.
                      </p>
                      <button
                        onClick={() => fetchRecipeDetails(recipe.idMeal)}
                        className="mt-2 text-orange-600 hover:text-orange-700 font-semibold"
                      >
                        Try Again
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
