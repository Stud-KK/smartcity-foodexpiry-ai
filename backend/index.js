const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { initScheduler } = require('./utils/scheduler');

// Load environment variables
dotenv.config();

// Import routes
const userRoutes = require('./routes/users');
const itemRoutes = require('./routes/items');
const edamamRoutes = require('./routes/edamamRoutes');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/foodwise")
  .then(() => {
    console.log('MongoDB Connected');
    // Initialize the notification scheduler after DB connection
    initScheduler();
  })
  .catch(err => console.error('MongoDB Connection Error:', err));

// Use Routes
app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/edamam', edamamRoutes);

// Create edamamController.js if it doesn't exist
// This route can be accessed at /api/edamam/get-nutrition
if (!edamamRoutes) {
  const router = express.Router();
  const axios = require('axios');
  
  // Simple controller function
  const getNutrition = async (req, res) => {
    const { ingredients } = req.body;
    
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: 'Invalid ingredients format. Please provide an array of ingredients.' });
    }
  
    try {
      const EDAMAM_APP_ID = process.env.EDAMAM_APP_ID;
      const EDAMAM_APP_KEY = process.env.EDAMAM_APP_KEY;
      const EDAMAM_API_URL = 'https://api.edamam.com/api/nutrition-data';
      
      // Format ingredients into the expected format
      const ingr = ingredients;
      
      // Call Edamam API
      const response = await axios.get(EDAMAM_API_URL, {
        params: {
          app_id: EDAMAM_APP_ID,
          app_key: EDAMAM_APP_KEY,
          ingr: ingr
        }
      });
      
      res.json(response.data);
    } catch (error) {
      console.error('Error in getNutrition controller:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  };

  router.post('/get-nutrition', getNutrition);
  
  app.use('/api/edamam', router);
}

// Simple route for testing
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Server configuration
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});