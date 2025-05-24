// src/services/NutritionService.js
import axios from 'axios';

class NutritionService {
  static async getNutritionalInfo(ingredients) {
    try {
      const response = await axios.post('/api/edamam/get-nutrition', { 
        ingredients: Array.isArray(ingredients) ? ingredients : [ingredients] 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching nutritional data:', error);
      throw new Error('Failed to fetch nutritional data');
    }
  }
}

export default NutritionService;