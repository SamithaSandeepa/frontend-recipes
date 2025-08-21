"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useRecipes } from "@/contexts/RecipeContext";
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import Loading from "@/components/Loading";
import RecipeModal from "@/components/RecipeModal";
import { Heart, Trash2, Grid, List, Search, Calendar } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.4, 0.0, 0.2, 1] as const,
    },
  },
};

interface Recipe {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory?: string;
  strArea?: string;
}

export default function FavoritesPage() {
  const { user } = useAuth();
  const { favorites, loadingFavorites, fetchFavorites, removeFromFavorites } =
    useRecipes();

  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "date" | "category">("date");

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleViewDetails = (favorite: any) => {
    const recipe: Recipe = {
      idMeal: favorite.recipeId,
      strMeal: favorite.recipeName,
      strMealThumb: favorite.recipeImage,
      strCategory: favorite.category,
    };
    setSelectedRecipe(recipe);
    setModalOpen(true);
  };

  const handleRemoveFavorite = async (recipeId: string) => {
    try {
      await removeFromFavorites(recipeId);
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  const getFilteredAndSortedFavorites = () => {
    let filtered = favorites.filter(
      (favorite) =>
        favorite.recipeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        favorite.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (sortBy) {
      case "name":
        return filtered.sort((a, b) =>
          a.recipeName.localeCompare(b.recipeName)
        );
      case "category":
        return filtered.sort((a, b) => a.category.localeCompare(b.category));
      case "date":
      default:
        return filtered.sort(
          (a, b) =>
            new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
        );
    }
  };

  const groupByCategory = () => {
    const grouped: Record<string, any[]> = {};
    getFilteredAndSortedFavorites().forEach((favorite) => {
      if (!grouped[favorite.category]) {
        grouped[favorite.category] = [];
      }
      grouped[favorite.category].push(favorite);
    });
    return grouped;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
        <Header />

        <main className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <div className="flex justify-center mb-4">
                <Heart className="w-16 h-16 text-red-500 fill-current" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-4">
                My Favorite Recipes
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Your personal collection of saved recipes
              </p>
            </motion.div>

            {loadingFavorites ? (
              <Loading message="Loading your favorites..." />
            ) : favorites.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="text-center py-16"
              >
                <div className="text-gray-300 text-8xl mb-6">💔</div>
                <h3 className="text-2xl font-bold text-gray-600 mb-4">
                  No favorites yet
                </h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  Start exploring recipes and click the heart icon to save your
                  favorites here!
                </p>
                <motion.a
                  href="/categories"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-full font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Explore Recipes
                </motion.a>
              </motion.div>
            ) : (
              <>
                {/* Search and Controls */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex flex-col md:flex-row gap-4 mb-8"
                >
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search favorites..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all duration-300"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(
                          e.target.value as "name" | "date" | "category"
                        )
                      }
                      className="px-4 py-3 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all duration-300"
                    >
                      <option value="date">Sort by Date</option>
                      <option value="name">Sort by Name</option>
                      <option value="category">Sort by Category</option>
                    </select>

                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-3 rounded-lg transition-colors ${
                        viewMode === "grid"
                          ? "bg-orange-500 text-white"
                          : "bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-3 rounded-lg transition-colors ${
                        viewMode === "list"
                          ? "bg-orange-500 text-white"
                          : "bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>

                {/* Results Info */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex items-center justify-between mb-6"
                >
                  <p className="text-gray-600">
                    {getFilteredAndSortedFavorites().length} of{" "}
                    {favorites.length} favorites
                    {searchTerm && ` matching "${searchTerm}"`}
                  </p>
                </motion.div>

                {getFilteredAndSortedFavorites().length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="text-center py-12"
                  >
                    <div className="text-gray-400 text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      No matching favorites
                    </h3>
                    <p className="text-gray-500">
                      Try adjusting your search terms
                    </p>
                  </motion.div>
                ) : viewMode === "grid" ? (
                  // Grid View
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  >
                    <AnimatePresence>
                      {getFilteredAndSortedFavorites().map((favorite) => (
                        <motion.div
                          key={favorite.recipeId}
                          variants={itemVariants}
                          layout
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                        >
                          <div className="relative">
                            <motion.img
                              src={favorite.recipeImage}
                              alt={favorite.recipeName}
                              className="w-full h-48 object-cover cursor-pointer"
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.3 }}
                              onClick={() => handleViewDetails(favorite)}
                            />

                            {/* Remove Button */}
                            <motion.button
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() =>
                                handleRemoveFavorite(favorite.recipeId)
                              }
                              className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>

                            {/* Category Badge */}
                            <div className="absolute top-3 left-3">
                              <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                {favorite.category}
                              </span>
                            </div>
                          </div>

                          <div className="p-4">
                            <h3
                              className="font-bold text-lg text-gray-800 mb-2 line-clamp-2 cursor-pointer hover:text-orange-600 transition-colors"
                              onClick={() => handleViewDetails(favorite)}
                            >
                              {favorite.recipeName}
                            </h3>

                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                <span>
                                  {new Date(
                                    favorite.addedAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              <Heart className="w-4 h-4 text-red-500 fill-current" />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  // List View - Grouped by Category
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8"
                  >
                    {Object.entries(groupByCategory()).map(
                      ([category, categoryFavorites]) => (
                        <motion.div key={category} variants={itemVariants}>
                          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm mr-3">
                              {categoryFavorites.length}
                            </span>
                            {category}
                          </h3>
                          <div className="space-y-3">
                            <AnimatePresence>
                              {categoryFavorites.map((favorite) => (
                                <motion.div
                                  key={favorite.recipeId}
                                  layout
                                  exit={{ opacity: 0, x: -100 }}
                                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex cursor-pointer group"
                                  whileHover={{ x: 8 }}
                                  onClick={() => handleViewDetails(favorite)}
                                >
                                  <img
                                    src={favorite.recipeImage}
                                    alt={favorite.recipeName}
                                    className="w-20 h-20 object-cover"
                                  />
                                  <div className="flex-1 p-4 flex items-center justify-between">
                                    <div>
                                      <h4 className="font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                                        {favorite.recipeName}
                                      </h4>
                                      <p className="text-sm text-gray-500">
                                        Added{" "}
                                        {new Date(
                                          favorite.addedAt
                                        ).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveFavorite(favorite.recipeId);
                                      }}
                                      className="text-red-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                                    >
                                      <Trash2 className="w-5 h-5" />
                                    </motion.button>
                                  </div>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      )
                    )}
                  </motion.div>
                )}
              </>
            )}
          </div>
        </main>

        {/* Recipe Modal */}
        <RecipeModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          recipe={selectedRecipe}
        />
      </div>
    </ProtectedRoute>
  );
}
