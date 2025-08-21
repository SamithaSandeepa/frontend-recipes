"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useRecipes } from "@/contexts/RecipeContext";
import Header from "@/components/Header";
import RecipeCard from "@/components/RecipeCard";
import RecipeModal from "@/components/RecipeModal";
import { LoadingSkeleton } from "@/components/Loading";
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

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get("q") || "";

  const { searchResults, loadingSearch, searchRecipes, isFavorite } =
    useRecipes();

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredResults, setFilteredResults] = useState<Recipe[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedArea, setSelectedArea] = useState<string>("");

  const performSearch = useCallback(
    async (query: string) => {
      if (query.trim()) {
        setHasSearched(true);
        await searchRecipes(query.trim());
      }
    },
    [searchRecipes]
  );

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery, performSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchTerm);
  };

  const handleViewDetails = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setModalOpen(true);
  };

  useEffect(() => {
    let results = searchResults;

    if (selectedCategory) {
      results = results.filter(
        (recipe) => recipe.strCategory === selectedCategory
      );
    }

    if (selectedArea) {
      results = results.filter((recipe) => recipe.strArea === selectedArea);
    }

    setFilteredResults(results);
  }, [searchResults, selectedCategory, selectedArea]);

  const uniqueCategories = [
    ...new Set(
      searchResults.map((recipe) => recipe.strCategory).filter(Boolean)
    ),
  ];

  const uniqueAreas = [
    ...new Set(searchResults.map((recipe) => recipe.strArea).filter(Boolean)),
  ];

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedArea("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Search Recipes
          </motion.h1>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSearch}
            className="max-w-2xl mx-auto"
          >
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for recipes, ingredients, or cuisines..."
                className="w-full px-6 py-4 text-lg border-2 border-orange-200 rounded-full focus:outline-none focus:border-orange-500 bg-white text-gray-900 shadow-lg"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full transition-colors shadow-lg"
              >
                <Search className="w-6 h-6" />
              </button>
            </div>
          </motion.form>
        </div>

        {/* Filters */}
        {hasSearched && searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters
                {(selectedCategory || selectedArea) && (
                  <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    {[selectedCategory, selectedArea].filter(Boolean).length}
                  </span>
                )}
              </button>

              {(selectedCategory || selectedArea) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear filters
                </button>
              )}
            </div>

            {showFilters && (
              <div className="bg-white p-4 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900"
                  >
                    <option value="">All categories</option>
                    {uniqueCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Area
                  </label>
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900"
                  >
                    <option value="">All areas</option>
                    {uniqueAreas.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Loading State */}
        {loadingSearch && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <LoadingSkeleton key={index} />
            ))}
          </div>
        )}

        {/* No Search State */}
        {!hasSearched && !loadingSearch && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center py-16"
          >
            <div className="text-gray-300 text-8xl mb-6">🔍</div>
            <h3 className="text-2xl font-bold text-gray-600 mb-4">
              Start your recipe search
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Enter a recipe name, ingredient, or cuisine type to discover
              delicious recipes from around the world.
            </p>
          </motion.div>
        )}

        {/* No Results State */}
        {hasSearched && !loadingSearch && searchResults.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="text-gray-300 text-8xl mb-6">🔍</div>
            <h3 className="text-2xl font-bold text-gray-600 mb-4">
              No recipes found
            </h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              We couldn&apos;t find any recipes matching &quot;{searchTerm}
              &quot;. Try different keywords or browse our categories.
            </p>
            <motion.a
              href="/categories"
              className="inline-flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Browse Categories
            </motion.a>
          </motion.div>
        )}

        {/* Results */}
        {hasSearched && !loadingSearch && filteredResults.length > 0 && (
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Search Results
                  </h2>
                  <p className="text-gray-600">
                    {filteredResults.length} of {searchResults.length} recipes
                    found for &quot;{searchTerm}&quot;
                    {(selectedCategory || selectedArea) && " (filtered)"}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredResults.map((recipe, index) => (
                <motion.div
                  key={recipe.idMeal}
                  variants={itemVariants}
                  transition={{ delay: index * 0.1 }}
                >
                  <RecipeCard
                    recipe={recipe}
                    onViewDetails={() => handleViewDetails(recipe)}
                    isFavorite={isFavorite(recipe.idMeal)}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {/* Filtered Results Empty State */}
        {hasSearched &&
          !loadingSearch &&
          searchResults.length > 0 &&
          filteredResults.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="text-gray-300 text-8xl mb-6">🎯</div>
              <h3 className="text-2xl font-bold text-gray-600 mb-4">
                No matches found
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Your current filters don&apos;t match any results. Try adjusting
                your filters or clearing them.
              </p>
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
              >
                Clear filters
              </button>
            </motion.div>
          )}
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

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
          <Header />
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <LoadingSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
