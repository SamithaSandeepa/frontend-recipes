"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useRecipes } from "@/contexts/RecipeContext";
import Header from "@/components/Header";
import Loading, { LoadingSkeleton } from "@/components/Loading";
import RecipeCard from "@/components/RecipeCard";
import RecipeModal from "@/components/RecipeModal";
import { Search, Filter, X } from "lucide-react";

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

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get("q") || "";

  const {
    searchResults,
    loadingSearch,
    searchRecipes,
    categories,
    isFavorite,
  } = useRecipes();

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedArea, setSelectedArea] = useState<string>("");

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (query: string) => {
    if (query.trim()) {
      setHasSearched(true);
      await searchRecipes(query.trim());
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchTerm);
  };

  const handleViewDetails = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setModalOpen(true);
  };

  const getFilteredResults = () => {
    let filtered = [...searchResults];

    if (selectedCategory) {
      filtered = filtered.filter(
        (recipe) =>
          recipe.strCategory?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (selectedArea) {
      filtered = filtered.filter(
        (recipe) => recipe.strArea?.toLowerCase() === selectedArea.toLowerCase()
      );
    }

    return filtered;
  };

  const getUniqueAreas = () => {
    const areas = searchResults
      .map((recipe) => recipe.strArea)
      .filter(Boolean)
      .filter((area, index, arr) => arr.indexOf(area) === index);
    return areas.sort();
  };

  const getUniqueCategories = () => {
    const searchCategories = searchResults
      .map((recipe) => recipe.strCategory)
      .filter(Boolean)
      .filter((category, index, arr) => arr.indexOf(category) === index);
    return searchCategories.sort();
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedArea("");
  };

  const filteredResults = getFilteredResults();

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
              Search Recipes
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find your perfect recipe from thousands of delicious options
            </p>
          </motion.div>

          {/* Search Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onSubmit={handleSearch}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <input
                type="text"
                placeholder="Search for recipes by name, ingredient, or cuisine..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-24 py-4 text-lg rounded-full border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all duration-300 shadow-lg"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loadingSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-500 text-white px-8 py-2 rounded-full hover:bg-orange-600 transition-colors duration-300 disabled:opacity-50"
              >
                {loadingSearch ? "Searching..." : "Search"}
              </motion.button>
            </div>
          </motion.form>

          {/* Filters */}
          {hasSearched && searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4 mb-8 p-4 bg-white rounded-xl shadow-lg"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-600" />
                <span className="font-semibold text-gray-700">Filters:</span>
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all duration-300"
              >
                <option value="">All Categories</option>
                {getUniqueCategories().map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all duration-300"
              >
                <option value="">All Cuisines</option>
                {getUniqueAreas().map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>

              {(selectedCategory || selectedArea) && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearFilters}
                  className="flex items-center gap-2 bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </motion.button>
              )}
            </motion.div>
          )}

          {/* Results */}
          {loadingSearch ? (
            <LoadingSkeleton />
          ) : hasSearched ? (
            searchResults.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="text-center py-16"
              >
                <div className="text-gray-300 text-8xl mb-6">🔍</div>
                <h3 className="text-2xl font-bold text-gray-600 mb-4">
                  No recipes found
                </h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  We couldn't find any recipes matching "{searchTerm}". Try
                  different keywords or browse our categories.
                </p>
                <motion.a
                  href="/categories"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-full font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Browse Categories
                </motion.a>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Results Header */}
                <motion.div
                  variants={itemVariants}
                  className="flex items-center justify-between mb-8"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Search Results
                    </h2>
                    <p className="text-gray-600">
                      {filteredResults.length} of {searchResults.length} recipes
                      found for "{searchTerm}"
                      {(selectedCategory || selectedArea) && " (filtered)"}
                    </p>
                  </div>
                </motion.div>

                {filteredResults.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="text-center py-12"
                  >
                    <div className="text-gray-400 text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      No results with current filters
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Try removing some filters to see more results
                    </p>
                    <button
                      onClick={clearFilters}
                      className="text-orange-600 hover:text-orange-700 font-semibold"
                    >
                      Clear All Filters
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  >
                    {filteredResults.map((recipe) => (
                      <motion.div key={recipe.idMeal} variants={itemVariants}>
                        <RecipeCard
                          recipe={recipe}
                          onViewDetails={handleViewDetails}
                          isFavorite={isFavorite(recipe.idMeal)}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            )
          ) : (
            // Initial state - no search performed
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center py-16"
            >
              <div className="text-gray-300 text-8xl mb-6">🍳</div>
              <h3 className="text-2xl font-bold text-gray-600 mb-4">
                Start your culinary adventure
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Enter a recipe name, ingredient, or cuisine type in the search
                box above to discover amazing recipes!
              </p>
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
