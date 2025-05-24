
const express = require('express');
const router = express.Router();
const edamamController = require('../controllers/edamamController');

// Route for fetching nutritional data
router.post('/get-nutrition', edamamController.getNutrition);

module.exports = router;