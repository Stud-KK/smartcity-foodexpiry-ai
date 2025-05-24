const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all items
router.get('/', itemController.getItems);

// Add new item
router.post('/', itemController.addItem);

// Get single item
router.get('/:id', itemController.getItem);

// Update item
router.put('/:id', itemController.updateItem);

// Delete item
router.delete('/:id', itemController.deleteItem);

// Predict expiry date using ML
router.post('/predict-expiry', itemController.predictExpiry);

module.exports = router;