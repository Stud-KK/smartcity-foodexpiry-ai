const axios = require('axios');

// Make sure the URL is correctly formed with https://
const EDAMAM_API_URL = 'https://api.edamam.com/api/nutrition-details';
const EDAMAM_APP_ID = "8ccede90";
const EDAMAM_APP_KEY = "406c9b61eca4e5ca9f795acb3ec82c5e";

class EdamamService {
    async getNutritionalInfo(ingredients) {
        console.log('Sending to Edamam API:', {
            title: "Ingredient List",
            ingr: ingredients
        });
        
        try {
            // Ensure URL is complete and correct
            const url = `${EDAMAM_API_URL}?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}`;
            console.log('Making request to URL:', url);
            
            const response = await axios.post(
                url,
                {
                    title: "Ingredient List",
                    ingr: ingredients,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );
            
            console.log('Raw Edamam API response:', response.data);
            return response.data;
        } catch (error) {
            if (error.response) {
                console.error("Edamam API error status:", error.response.status);
                console.error("Edamam API error data:", error.response.data);
            } else {
                console.error("Error with Edamam request:", error.message);
            }
            
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error('Failed to fetch nutritional information');
        }
    }
}

module.exports = new EdamamService();