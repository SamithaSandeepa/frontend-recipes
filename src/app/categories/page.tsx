"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRecipes } from "@/contexts/RecipeContext";
import Header from "@/components/Header";
import Loading, { LoadingSkeleton } from "@/components/Loading";
import RecipeCard from "@/components/RecipeCard";
import RecipeModal from "@/components/RecipeModal";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Search, Filter, Grid, List } from "lucide-react";
import Link from "next/link";

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

export default function CategoriesPage() {
  const {
    categories,
    loadingCategories,
    fetchCategories,
    recipesByCategory,
    loadingRecipes,
    fetchRecipesByCategory,
    isFavorite,
  } = useRecipes();

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchRecipesByCategory(selectedCategory);
    }
  }, [selectedCategory]);

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setSearchTerm("");
  };

  const handleViewDetails = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setModalOpen(true);
  };

  const getCurrentRecipes = () => {
    if (!selectedCategory) return [];
    const categoryRecipes = recipesByCategory[selectedCategory] || [];

    if (!searchTerm) return categoryRecipes;

    return categoryRecipes.filter((recipe) =>
      recipe.strMeal.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredCategories = categories.filter((category) =>
    category.strCategory.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
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
            <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
              Recipe Categories
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore delicious recipes organized by cuisine and cooking style
            </p>
          </motion.div>

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
                placeholder={
                  selectedCategory
                    ? `Search in ${selectedCategory}...`
                    : "Search categories..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all duration-300"
              />
            </div>

            {selectedCategory && (
              <div className="flex items-center gap-2">
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
            )}
          </motion.div>

          {!selectedCategory ? (
            // Categories Grid
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.h2
                variants={itemVariants}
                className="text-2xl font-bold text-gray-800 mb-6"
              >
                All Categories ({categories.length})
              </motion.h2>

              {loadingCategories ? (
                <Loading message="Loading categories..." />
              ) : (
                <motion.div
                  variants={containerVariants}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                  {filteredCategories.map((category) => (
                    <motion.div
                      key={category.idCategory}
                      variants={itemVariants}
                    >
                      <motion.div
                        className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group"
                        whileHover={{ y: -8, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          handleCategorySelect(category.strCategory)
                        }
                      >
                        <div className="relative overflow-hidden">
                          <motion.img
                            src={category.strCategoryThumb}
                            alt={category.strCategory}
                            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button className="bg-white text-orange-600 px-4 py-2 rounded-full font-semibold text-sm hover:bg-orange-50 transition-colors">
                              View Recipes
                            </button>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-lg text-gray-800 group-hover:text-orange-600 transition-colors mb-2">
                            {category.strCategory}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {category.strCategoryDescription?.substring(0, 100)}
                            ...
                          </p>
                        </div>
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          ) : (
            // Recipes in Selected Category
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {/* Category Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <button
                    onClick={() => setSelectedCategory("")}
                    className="text-orange-600 hover:text-orange-700 mb-2 font-semibold"
                  >
                    ← Back to Categories
                  </button>
                  <h2 className="text-3xl font-bold text-gray-800">
                    {selectedCategory} Recipes
                  </h2>
                  <p className="text-gray-600">
                    {getCurrentRecipes().length} recipes found
                  </p>
                </div>
              </div>

              {loadingRecipes ? (
                <LoadingSkeleton />
              ) : getCurrentRecipes().length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🍽️</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No recipes found
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm
                      ? `No recipes match "${searchTerm}" in ${selectedCategory}`
                      : `No recipes available in ${selectedCategory} category`}
                  </p>
                </div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                      : "space-y-4"
                  }
                >
                  {getCurrentRecipes().map((recipe) => (
                    <motion.div key={recipe.idMeal} variants={itemVariants}>
                      {viewMode === "grid" ? (
                        <RecipeCard
                          recipe={recipe}
                          onViewDetails={handleViewDetails}
                          isFavorite={isFavorite(recipe.idMeal)}
                        />
                      ) : (
                        // List view
                        <motion.div
                          className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer flex"
                          whileHover={{ x: 8 }}
                          onClick={() => handleViewDetails(recipe)}
                        >
                          <img
                            src={recipe.strMealThumb}
                            alt={recipe.strMeal}
                            className="w-24 h-24 object-cover"
                          />
                          <div className="flex-1 p-4">
                            <h3 className="font-bold text-lg text-gray-800 mb-1">
                              {recipe.strMeal}
                            </h3>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 text-sm">
                                {recipe.strArea && `🌍 ${recipe.strArea}`}
                              </span>
                              <div className="flex items-center text-sm text-gray-500">
                                <span className="text-yellow-400">★</span>
                                <span className="ml-1">4.5</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
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
  );
}
