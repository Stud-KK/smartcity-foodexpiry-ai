import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MealSuggestion = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mealSuggestions, setMealSuggestions] = useState([]);
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false);
  const [mealPreference, setMealPreference] = useState('any');
  const [mealComplexity, setMealComplexity] = useState('easy');
  const [preparationTime, setPreparationTime] = useState('30');

  // Fetch items on component mount
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3002/api/items', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setItems(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching items:', error.response?.data?.message || error.message);
      setError('Failed to load your food inventory.');
      setLoading(false);
    }
  };

  // Calculate how many days left until expiry
  const daysUntilExpiry = (expiryDate) => {
    const now = new Date();
    const exp = new Date(expiryDate);
    const diffTime = exp - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Filter and organize items by category and expiry status
  const organizeItemsByCategory = () => {
    const today = new Date();
    const validItems = items.filter(item => new Date(item.expiryDate) >= today);
    
    // Group items by category
    const categories = {};
    validItems.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = [];
      }
      categories[item.category].push(item);
    });
    
    // Sort items within categories by expiry date (soonest first)
    Object.keys(categories).forEach(category => {
      categories[category].sort((a, b) => 
        new Date(a.expiryDate) - new Date(b.expiryDate)
      );
    });
    
    return categories;
  };

  // Get items that are expiring soon (within 5 days)
  const getExpiringSoonItems = () => {
    return items.filter(item => {
      const days = daysUntilExpiry(item.expiryDate);
      return days > 0 && days <= 5;
    });
  };

  // Generate meal suggestions based on inventory
  const generateSuggestions = async () => {
    setGeneratingSuggestions(true);
    
    try {
      const categories = organizeItemsByCategory();
      const expiringSoon = getExpiringSoonItems();
      
      // For simplicity, we're generating suggestions locally
      // In a real application, this could be an API call to a recommendation service
      
      const suggestions = [];
      
      // First, prioritize recipes that use expiring items
      if (expiringSoon.length > 0) {
        // Get ingredient names
        const expiringSoonNames = expiringSoon.map(item => item.name.toLowerCase());
        
        // Simple rule-based suggestion system
        // In a real app, this would be more sophisticated
        if (expiringSoonNames.some(name => name.includes('chicken'))) {
          suggestions.push({
            name: 'Quick Chicken Stir Fry',
            ingredients: ['chicken', 'bell peppers', 'onions', 'soy sauce', 'garlic'],
            time: '25 minutes',
            complexity: 'easy',
            priority: 'high',
            category: 'Meat & Seafood',
            expiringSoon: expiringSoonNames.filter(name => name.includes('chicken')),
            image: '../../public/Quick Chicken Stir Fry.jpg'
          });
        }
        
        if (expiringSoonNames.some(name => name.includes('bread') || name.includes('toast'))) {
          suggestions.push({
            name: 'Avocado Toast with Eggs',
            ingredients: ['bread', 'avocado', 'eggs', 'salt', 'pepper', 'lemon juice'],
            time: '15 minutes',
            complexity: 'easy',
            priority: 'high',
            category: 'Bakery',
            expiringSoon: expiringSoonNames.filter(name => name.includes('bread') || name.includes('toast')),
            image: '../../public/Avocado Toast with Eggs.jpg'
          });
        }
        
        if (expiringSoonNames.some(name => 
          name.includes('tomato') || name.includes('onion') || name.includes('cucumber'))) {
          suggestions.push({
            name: 'Fresh Garden Salad',
            ingredients: ['tomatoes', 'cucumber', 'lettuce', 'onion', 'olive oil', 'vinegar'],
            time: '10 minutes',
            complexity: 'easy',
            priority: 'high',
            category: 'Fruits & Vegetables',
            expiringSoon: expiringSoonNames.filter(name => 
              name.includes('tomato') || name.includes('onion') || name.includes('cucumber')),
            image: '../../public/Fresh Garden Salad.jpg'
          });
        }
        
        if (expiringSoonNames.some(name => name.includes('pasta') || name.includes('spaghetti'))) {
          suggestions.push({
            name: 'Simple Aglio e Olio Pasta',
            ingredients: ['pasta', 'garlic', 'olive oil', 'red pepper flakes', 'parsley'],
            time: '20 minutes',
            complexity: 'easy',
            priority: 'high',
            category: 'Pantry',
            expiringSoon: expiringSoonNames.filter(name => name.includes('pasta') || name.includes('spaghetti')),
            image: '../../public/Simple Aglio e Olio Pasta.jpg'
          });
        }
      }
      
      // Add category-based suggestions
      if (categories['Dairy & Eggs'] && categories['Dairy & Eggs'].length > 0) {
        if (mealPreference === 'vegetarian' || mealPreference === 'any') {
          suggestions.push({
            name: 'Cheese Omelette',
            ingredients: ['eggs', 'cheese', 'salt', 'pepper', 'butter'],
            time: '15 minutes',
            complexity: 'easy',
            category: 'Dairy & Eggs',
            image: '../../public/Cheese Omelette.jpg'
          });
        }
      }
      
      if (categories['Fruits & Vegetables'] && categories['Fruits & Vegetables'].length > 0) {
        if (mealPreference === 'vegan' || mealPreference === 'vegetarian' || mealPreference === 'any') {
          suggestions.push({
            name: 'Roasted Vegetable Medley',
            ingredients: ['assorted vegetables', 'olive oil', 'salt', 'herbs'],
            time: '35 minutes',
            complexity: 'easy',
            category: 'Fruits & Vegetables',
            image: '../../public/Roasted Vegetable Medley.jpg'
          });
        }
      }
      
      if (categories['Meat & Seafood'] && categories['Meat & Seafood'].length > 0) {
        if (mealPreference === 'any') {
          suggestions.push({
            name: 'Garlic Butter Shrimp',
            ingredients: ['shrimp', 'butter', 'garlic', 'lemon', 'parsley'],
            time: '20 minutes',
            complexity: 'medium',
            category: 'Meat & Seafood',
            image: '../../public/Garlic Butter Shrimp.jpg'
          });
        }
      }
      
      // Filter by complexity and time
      const filteredSuggestions = suggestions.filter(recipe => {
        const recipeComplexity = recipe.complexity || 'medium';
        const recipeTime = parseInt(recipe.time) || 30;
        
        // Complexity filter
        if (mealComplexity === 'easy' && recipeComplexity !== 'easy') {
          return false;
        }
        if (mealComplexity === 'medium' && recipeComplexity === 'hard') {
          return false;
        }
        
        // Time filter
        if (parseInt(preparationTime) < recipeTime) {
          return false;
        }
        
        return true;
      });
      
      // Sort by priority (expiring ingredients first)
      filteredSuggestions.sort((a, b) => {
        if (a.priority === 'high' && b.priority !== 'high') return -1;
        if (a.priority !== 'high' && b.priority === 'high') return 1;
        return 0;
      });
      
      setMealSuggestions(filteredSuggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      setError('Failed to generate meal suggestions.');
    } finally {
      setGeneratingSuggestions(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Meal Suggestions</h1>
            <p className="text-gray-600">Get meal ideas based on your food inventory</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-4 py-2 rounded-lg flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
        </div>

        {/* Loading and Error states */}
        {loading && (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mb-2"></div>
            <p className="text-gray-600">Loading your food inventory...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Preferences Section */}
            <div className="bg-white rounded-lg shadow mb-6 p-6">
              <h2 className="text-xl font-semibold mb-4">Meal Preferences</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Dietary Preference</label>
                  <select
                    className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={mealPreference}
                    onChange={(e) => setMealPreference(e.target.value)}
                  >
                    <option value="any">Any</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Complexity</label>
                  <select
                    className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={mealComplexity}
                    onChange={(e) => setMealComplexity(e.target.value)}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="any">Any</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Preparation Time (max minutes)</label>
                  <select
                    className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={preparationTime}
                    onChange={(e) => setPreparationTime(e.target.value)}
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                    <option value="90">90 minutes</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={generateSuggestions}
                  disabled={generatingSuggestions}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-lg flex items-center"
                >
                  {generatingSuggestions ? (
                    <>
                      <div className="mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                      Generate Meal Suggestions
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Expiring Soon Items Section */}
            {getExpiringSoonItems().length > 0 && (
              <div className="bg-white rounded-lg shadow mb-6 p-6">
                <div className="flex items-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <h2 className="text-xl font-semibold">Items Expiring Soon</h2>
                </div>
                <p className="text-gray-600 mb-4">These items should be used first to avoid food waste:</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {getExpiringSoonItems().map((item) => (
                    <div key={item._id} className="border rounded-lg p-3 bg-yellow-50">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{item.name}</h3>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                          {daysUntilExpiry(item.expiryDate)} day{daysUntilExpiry(item.expiryDate) !== 1 ? 's' : ''} left
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{item.category}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meal Suggestions Section */}
            {mealSuggestions.length > 0 && (
              <div className="bg-white rounded-lg shadow mb-6">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold">Suggested Meals</h2>
                  <p className="text-gray-600">Based on your current inventory</p>
                </div>
                
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mealSuggestions.map((meal, index) => (
                      <div key={index} className="border rounded-lg overflow-hidden">
                        {/* Image Section - Now using the meal.image property */}
                        <div className="bg-gray-100 h-40 overflow-hidden">
                          {meal.image ? (
                            <img 
                              src={meal.image} 
                              alt={meal.name} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/images/recipes/placeholder.jpg';
                              }}
                            />
                          ) : (
                            <div className="h-full flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg">{meal.name}</h3>
                            {meal.priority === 'high' && (
                              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Use soon!</span>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">
                            <span className="font-medium">Time:</span> {meal.time}
                          </p>
                          
                          <div className="mb-3">
                            <h4 className="text-sm font-medium mb-1">Ingredients:</h4>
                            <ul className="text-sm text-gray-600 pl-5 list-disc">
                              {meal.ingredients.map((ingredient, idx) => (
                                <li key={idx} className={meal.expiringSoon && meal.expiringSoon.includes(ingredient.toLowerCase()) ? 'text-yellow-600 font-medium' : ''}>
                                  {ingredient}
                                  {meal.expiringSoon && meal.expiringSoon.includes(ingredient.toLowerCase()) && ' (expiring soon)'}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="mt-4 flex justify-between items-center">
                            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                              {meal.complexity || 'Medium'} complexity
                            </span>
                            <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                              View Recipe →
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* No Suggestions Yet Message */}
            {mealSuggestions.length === 0 && !generatingSuggestions && (
              <div className="text-center py-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No meal suggestions yet</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  Click the "Generate Meal Suggestions" button to get personalized meal ideas based on your inventory.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MealSuggestion;