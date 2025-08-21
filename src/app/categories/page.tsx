"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRecipes } from "@/contexts/RecipeContext";
import Header from "@/components/Header";
import { LoadingSkeleton } from "@/components/Loading";
import RecipeCard from "@/components/RecipeCard";
import RecipeModal from "@/components/RecipeModal";
import { Search, Grid, List, Filter } from "lucide-react";
import Image from "next/image";

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

interface Category {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription?: string;
}

const CategoryCard = ({
  category,
  onClick,
}: {
  category: Category;
  onClick: (categoryName: string) => void;
}) => (
  <motion.div
    variants={itemVariants}
    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
    onClick={() => onClick(category.strCategory)}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="aspect-w-16 aspect-h-9 rounded-t-xl overflow-hidden">
      <div className="aspect-w-16 aspect-h-9 rounded-t-xl overflow-hidden relative">
        <div className="relative w-full h-48 rounded-t-xl overflow-hidden">
          <Image
            src={category.strCategoryThumb}
            alt={category.strCategory}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw,
           (max-width: 1200px) 50vw,
           25vw"
            priority={false}
          />
        </div>
      </div>
    </div>
    <div className="p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {category.strCategory}
      </h3>
      <p className="text-gray-600 text-sm line-clamp-3">
        {category.strCategoryDescription ||
          "Delicious recipes in this category"}
      </p>
    </div>
  </motion.div>
);

const CategoriesPage = () => {
  const {
    categories,
    recipesByCategory,
    searchResults,
    searchRecipes,
    loadingCategories,
    loadingRecipes,
    loadingSearch,
    fetchRecipesByCategory,
  } = useRecipes();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const handleCategorySelect = async (categoryName: string) => {
    setSelectedCategory(categoryName);
    try {
      await fetchRecipesByCategory(categoryName);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term) {
      searchRecipes(term);
    } else {
      const currentRecipes = selectedCategory
        ? recipesByCategory[selectedCategory] || []
        : [];
      setFilteredRecipes(currentRecipes);
    }
  };

  useEffect(() => {
    if (selectedCategory) {
      const categoryRecipes = recipesByCategory[selectedCategory] || [];
      setFilteredRecipes(categoryRecipes);
    } else if (searchTerm) {
      setFilteredRecipes(searchResults);
    }
  }, [recipesByCategory, selectedCategory, searchResults, searchTerm]);

  if (loadingCategories) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <LoadingSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {!selectedCategory ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
                Recipe Categories
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Explore our diverse collection of recipes organized by
                categories. From appetizers to desserts, find the perfect recipe
                for any occasion.
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {categories.map((category) => (
                <CategoryCard
                  key={category.idCategory}
                  category={category}
                  onClick={handleCategorySelect}
                />
              ))}
            </motion.div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedCategory("")}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors shadow-md"
                >
                  ← Back to Categories
                </button>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCategory} Recipes
                </h2>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search recipes..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900 shadow-sm"
                  />
                </div>

                <div className="flex bg-orange-100 rounded-lg p-1 shadow-sm">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded ${
                      viewMode === "grid"
                        ? "bg-orange-500 text-white shadow"
                        : "text-orange-600 hover:text-orange-700"
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded ${
                      viewMode === "list"
                        ? "bg-orange-500 text-white shadow"
                        : "text-orange-600 hover:text-orange-700"
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {loadingRecipes || loadingSearch ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <LoadingSkeleton key={index} />
                ))}
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className={`grid gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1"
                }`}
              >
                {filteredRecipes.map((recipe) => (
                  <motion.div key={recipe.idMeal} variants={itemVariants}>
                    <RecipeCard
                      recipe={recipe}
                      onViewDetails={() => setSelectedRecipe(recipe)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {filteredRecipes.length === 0 &&
              !loadingRecipes &&
              !loadingSearch && (
                <div className="text-center py-12">
                  <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No recipes found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your search terms or browse other categories.
                  </p>
                </div>
              )}
          </>
        )}
      </div>

      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          isOpen={!!selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </div>
  );
};

export default CategoriesPage;
