"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useRecipes } from "@/contexts/RecipeContext";
import Link from "next/link";
import {
  ChefHat,
  Search,
  Heart,
  Star,
  ArrowRight,
  Sparkles,
  Clock,
  Users,
} from "lucide-react";
import Header from "@/components/Header";
import ClientOnly from "@/components/ClientOnly";
import RecipeCard from "@/components/RecipeCard";
import RecipeModal from "@/components/RecipeModal";
import Loading, { LoadingSkeleton } from "@/components/Loading";

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

export default function HomePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    featuredRecipes,
    loadingFeatured,
    fetchFeaturedRecipes,
    categories,
    loadingCategories,
    fetchCategories,
    randomRecipe,
    fetchRandomRecipe,
    loadingRandomRecipe,
    isFavorite,
  } = useRecipes();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchFeaturedRecipes();
    fetchCategories();
    fetchRandomRecipe();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`;
    }
  };

  const handleViewDetails = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setModalOpen(true);
  };

  const getFeaturedRecipesList = () => {
    const allFeatured: Recipe[] = [];
    Object.values(featuredRecipes).forEach((recipes) => {
      allFeatured.push(...recipes.slice(0, 2)); // 2 from each category
    });
    return allFeatured.slice(0, 8); // Max 8 recipes
  };

  if (authLoading) {
    return <Loading fullScreen message="Preparing your kitchen..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <Header />

      <main>
        {/* Hero Section */}
        <motion.section
          className="relative py-20 px-4 overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-red-400/10" />
          <div className="relative max-w-7xl mx-auto text-center">
            <motion.div
              variants={itemVariants}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                <ChefHat className="w-16 h-16 text-orange-500" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-2 -right-2"
                >
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                </motion.div>
              </div>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-6"
            >
              Recipe Explorer
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
            >
              Discover amazing recipes from around the world. Save your
              favorites and create your personal cookbook.
            </motion.p>

            {/* Search Bar */}
            <motion.form
              variants={itemVariants}
              onSubmit={handleSearch}
              className="max-w-md mx-auto mb-8"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for recipes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all duration-300 shadow-lg"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors duration-300"
                >
                  Search
                </motion.button>
              </div>
            </motion.form>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/categories"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Browse Categories
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </motion.div>

              <ClientOnly>
                {isAuthenticated && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="/favorites"
                      className="inline-flex items-center px-8 py-4 border-2 border-orange-500 text-orange-500 rounded-full font-semibold hover:bg-orange-500 hover:text-white transition-all duration-300"
                    >
                      <Heart className="mr-2 w-5 h-5" />
                      My Favorites
                    </Link>
                  </motion.div>
                )}
              </ClientOnly>
            </motion.div>
          </div>
        </motion.section>

        {/* Featured Recipes */}
        <motion.section
          className="py-16 px-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="max-w-7xl mx-auto">
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Featured Recipes
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Handpicked delicious recipes that our community loves
              </p>
            </motion.div>

            {loadingFeatured ? (
              <LoadingSkeleton />
            ) : (
              <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {getFeaturedRecipesList().map((recipe) => (
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
          </div>
        </motion.section>

        {/* Featured Categories */}
        <motion.section
          className="py-16 px-4 bg-white/50"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="max-w-7xl mx-auto">
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Popular Categories
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Explore our most popular recipe categories and find your next
                favorite dish
              </p>
            </motion.div>

            {loadingCategories ? (
              <div className="flex justify-center">
                <Loading message="Loading categories..." />
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6"
              >
                {categories.slice(0, 5).map((category) => (
                  <motion.div key={category.idCategory} variants={itemVariants}>
                    <Link
                      href={`/categories/${category.strCategory.toLowerCase()}`}
                    >
                      <motion.div
                        className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group"
                        whileHover={{ y: -8, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="relative overflow-hidden">
                          <motion.img
                            src={category.strCategoryThumb}
                            alt={category.strCategory}
                            className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                            {category.strCategory}
                          </h3>
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}

            <motion.div variants={itemVariants} className="text-center mt-8">
              <Link
                href="/categories"
                className="inline-flex items-center text-orange-600 hover:text-orange-700 font-semibold"
              >
                View All Categories
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* Random Recipe of the Day */}
        {randomRecipe && (
          <motion.section
            className="py-16 px-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="max-w-4xl mx-auto">
              <motion.div variants={itemVariants} className="text-center mb-8">
                <h2 className="text-4xl font-bold text-gray-800 mb-4">
                  Recipe of the Day
                </h2>
                <p className="text-gray-600">
                  Try something new with our daily recipe recommendation
                </p>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-white rounded-2xl shadow-xl overflow-hidden"
              >
                <div className="md:flex">
                  <div className="md:w-1/2">
                    <img
                      src={randomRecipe.image}
                      alt={randomRecipe.name}
                      className="w-full h-64 md:h-full object-cover"
                    />
                  </div>
                  <div className="md:w-1/2 p-8">
                    <div className="flex items-center mb-4">
                      <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {randomRecipe.category}
                      </span>
                      <span className="ml-4 text-gray-600">
                        🌍 {randomRecipe.area}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-800 mb-4">
                      {randomRecipe.name}
                    </h3>

                    <p className="text-gray-600 mb-6 line-clamp-3">
                      {randomRecipe.instructions.substring(0, 200)}...
                    </p>

                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>30-45 mins</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span>4 servings</span>
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                          <span>4.8</span>
                        </div>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        handleViewDetails({
                          idMeal: randomRecipe.id,
                          strMeal: randomRecipe.name,
                          strMealThumb: randomRecipe.image,
                          strCategory: randomRecipe.category,
                          strArea: randomRecipe.area,
                        })
                      }
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-full font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300"
                    >
                      View Full Recipe
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center items-center mb-4">
            <ChefHat className="w-8 h-8 text-orange-500 mr-2" />
            <h3 className="text-2xl font-bold">Recipe Explorer</h3>
          </div>
          <p className="text-gray-400 mb-4">
            Discover, save, and enjoy amazing recipes from around the world
          </p>
          <p className="text-gray-500 text-sm">
            © 2025 Recipe Explorer. Built with ❤️ by Samitha Perera
          </p>
        </div>
      </footer>

      {/* Recipe Modal */}
      <RecipeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        recipe={selectedRecipe}
      />
    </div>
  );
}
