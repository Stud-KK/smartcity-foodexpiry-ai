const axios = require('axios');

exports.getNutrition = async (req, res) => {
  const { ingredients } = req.body;

  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ error: 'Invalid ingredients format. Please provide an array of ingredients.' });
  }

  try {
    const EDAMAM_APP_ID = process.env.EDAMAM_APP_ID;
    const EDAMAM_APP_KEY = process.env.EDAMAM_APP_KEY;
    const EDAMAM_API_URL = 'https://api.edamam.com/api/nutrition-data';

    const payload = {
      title: "Recipe",
      ingr: ingredients
    };

    const response = await axios.post(
      `${EDAMAM_API_URL}?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error in getNutrition controller:', error.response?.data || error.message);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};