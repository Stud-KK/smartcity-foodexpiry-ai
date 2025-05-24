import React, { useState } from 'react';
import axios from 'axios';

const NutritionalInfo = () => {
  const [foodItem, setFoodItem] = useState('');
  const [nutritionData, setNutritionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNutritionData = async () => {
    if (!foodItem.trim()) {
      setError('Please enter a food item');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);

      const appId = '5b133e70'; 
      const appKey = 'b3fd2233f923276d2eff50dd8f3b4524';

      const response = await axios.get('https://api.edamam.com/api/nutrition-data', {
        params: {
          app_id: appId,
          app_key: appKey,
          'nutrition-type': 'cooking',
          ingr: foodItem,
        },
      });

      console.log('API Response:', response.data);

      // Check if we have valid nutrition data
      if (response.data && response.data.ingredients && response.data.ingredients.length > 0) {
        setNutritionData(response.data);
      } else {
        setError('No nutrition data found for this item. Try being more specific (e.g., "1 medium apple" instead of "apple").');
        setNutritionData(null);
      }
    } catch (err) {
      console.error('API Error:', err);
      setError('Failed to fetch nutrition data. Please check your input and try again.');
      setNutritionData(null);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format nutrient values
  const formatNutrient = (value, unit) => {
    if (value === undefined || value === null) return 'N/A';
    return `${Math.round(value * 10) / 10} ${unit}`;
  };

  // Extract available nutrients from the correct path in the API response
  const getNutrientInfo = () => {
    if (!nutritionData || !nutritionData.ingredients || nutritionData.ingredients.length === 0) return [];

    const nutrientInfo = [];
    
    // Try to extract nutrients from the ingredients array
    nutritionData.ingredients.forEach(ingredient => {
      if (ingredient.parsed && ingredient.parsed.length > 0) {
        const nutrients = ingredient.parsed[0].nutrients;
        
        if (nutrients) {
          Object.keys(nutrients).forEach(key => {
            const nutrient = nutrients[key];
            nutrientInfo.push({
              id: key,
              name: nutrient.label || key,
              value: nutrient.quantity,
              unit: nutrient.unit,
              dailyValue: null // API might not provide daily value in this format
            });
          });
        }
      }
    });

    return nutrientInfo;
  };

  // Try to get calories from the correct location in the response
  const getCalories = () => {
    if (!nutritionData || !nutritionData.ingredients || nutritionData.ingredients.length === 0) return null;
    
    // Check if calories are directly available
    if (nutritionData.calories !== undefined) {
      return nutritionData.calories;
    }
    
    // Try to extract calories from ingredients
    const firstIngredient = nutritionData.ingredients[0];
    if (firstIngredient.parsed && firstIngredient.parsed.length > 0) {
      const parsed = firstIngredient.parsed[0];
      if (parsed.nutrients && parsed.nutrients.ENERC_KCAL) {
        return Math.round(parsed.nutrients.ENERC_KCAL.quantity);
      }
    }
    
    return null;
  };

  const nutrientInfo = nutritionData ? getNutrientInfo() : [];
  const calories = getCalories();
  const weight = nutritionData?.totalWeight || 
                (nutritionData?.ingredients?.[0]?.parsed?.[0]?.weight) || null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold mb-8 text-center">Nutrition Analyzer</h1>

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
        <input
          type="text"
          value={foodItem}
          onChange={(e) => setFoodItem(e.target.value)}
          placeholder="Enter a food item (e.g., 1 apple)"
          className="px-4 py-2 border rounded-md w-64"
          onKeyPress={(e) => {
            if (e.key === 'Enter') fetchNutritionData();
          }}
        />
        <button
          onClick={fetchNutritionData}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md"
        >
          Analyze Nutrition
        </button>
      </div>

      {loading && <p className="text-lg">Loading...</p>}
      {error && <p className="text-red-500 text-lg">{error}</p>}

      {nutritionData && (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl">
          <h2 className="text-2xl font-semibold mb-4 text-center">{foodItem}</h2>
          
          {calories !== null && (
            <p className="text-center text-xl font-bold mb-2">
              Calories: {calories} kcal
            </p>
          )}
          
          {weight && <p className="text-center mb-6">Total Weight: {Math.round(weight)}g</p>}

          {nutrientInfo.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border px-4 py-2">Nutrient</th>
                    <th className="border px-4 py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {nutrientInfo.map((nutrient, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border px-4 py-2">{nutrient.name}</td>
                      <td className="border px-4 py-2">{formatNutrient(nutrient.value, nutrient.unit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center">No detailed nutrition data available for this item.</p>
          )}

        </div>
      )}
    </div>
  );
};

export default NutritionalInfo;