const Item = require('../models/Item');
const axios = require('axios');

// Get all items for a user
exports.getItems = async (req, res) => {
  try {
    const items = await Item.find({ user: req.user.id });
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a new item
// In controllers/items.js or itemController.js
exports.addItem = async (req, res) => {
  try {
    const {
      name,
      category,
      purchaseDate,
      expiryDate,
      quantity,
      unit,
      notes,
      storage_condition,
      item_condition_on_purchase
    } = req.body;

    // Set default category if not provided
    const finalCategory = category || 'Uncategorized';

    // If expiryDate is not provided, predict using ML model
    let finalExpiryDate = expiryDate;

    if (!expiryDate && name) {
      try {
        // Call Flask ML API for prediction
        const mlResponse = await axios.post('http://localhost:5000/predict', {
          product_name: name,
          storage_condition: storage_condition || 'fridge',
                    item_condition_on_purchase: item_condition_on_purchase || 'fresh'
        });

        const predictedDays = mlResponse.data.predicted_expiry_days;
        
        // Calculate expiry date based on prediction
        const purchaseDateTime = purchaseDate ? new Date(purchaseDate) : new Date();
        purchaseDateTime.setDate(purchaseDateTime.getDate() + predictedDays);
        finalExpiryDate = purchaseDateTime.toISOString().split('T')[0];
      } catch (mlError) {
        console.error('ML prediction error:', mlError);
        // If ML prediction fails, default to 7 days from purchase
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 7);
        finalExpiryDate = defaultDate.toISOString().split('T')[0];
      }
    }

    const newItem = new Item({
      name,
      category: finalCategory, // Use the default or provided category
      purchaseDate: purchaseDate || Date.now(),
      expiryDate: finalExpiryDate,
      quantity,
      unit,
      notes,
      storage_condition: storage_condition || 'fridge',
      item_condition_on_purchase: item_condition_on_purchase || 'fresh',
      user: req.user.id
    });

    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single item
exports.getItem = async (req, res) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, user: req.user.id });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update an item
exports.updateItem = async (req, res) => {
  try {
    const {
      name,
      category,
      purchaseDate,
      expiryDate,
      quantity,
      unit,
      notes,
      storage_condition,
      item_condition_on_purchase
    } = req.body;

    // Check if ML prediction is needed (if name changed and no expiry date provided)
    let finalExpiryDate = expiryDate;
    const existingItem = await Item.findById(req.params.id);
    
    if (name && name !== existingItem.name && !expiryDate) {
      try {
        // Call Flask ML API for prediction
        const mlResponse = await axios.post('http://localhost:5000/predict', {
          product_name: name,
          storage_condition: storage_condition || existingItem.storage_condition,
          item_condition_on_purchase: item_condition_on_purchase || existingItem.item_condition_on_purchase
        });

        const predictedDays = mlResponse.data.predicted_expiry_days;
        
        // Calculate expiry date based on prediction
        const purchaseDateTime = purchaseDate ? new Date(purchaseDate) : 
                               existingItem.purchaseDate ? new Date(existingItem.purchaseDate) : new Date();
        purchaseDateTime.setDate(purchaseDateTime.getDate() + predictedDays);
        finalExpiryDate = purchaseDateTime.toISOString().split('T')[0];
      } catch (mlError) {
        console.error('ML prediction error:', mlError);
        finalExpiryDate = existingItem.expiryDate;
      }
    }

    const item = await Item.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      {
        name,
        category,
        purchaseDate,
        expiryDate: finalExpiryDate,
        quantity,
        unit,
        notes,
        storage_condition: storage_condition || existingItem.storage_condition,
        item_condition_on_purchase: item_condition_on_purchase || existingItem.item_condition_on_purchase
      },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete an item
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json({ message: 'Item removed' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Predict expiry date for an item using ML
exports.predictExpiry = async (req, res) => {
  try {
    const { product_name, storage_condition, item_condition_on_purchase } = req.body;
    
    if (!product_name) {
      return res.status(400).json({ message: 'Product name is required' });
    }

    // Call Flask ML API
    const mlResponse = await axios.post('http://localhost:5000/predict', {
      product_name,
      storage_condition: storage_condition || 'fridge',
      item_condition_on_purchase: item_condition_on_purchase || 'fresh'
    });

    const predictedDays = mlResponse.data.predicted_expiry_days;
    
    // Calculate expiry date
    const today = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(today.getDate() + predictedDays);
    
    res.json({
      predicted_days: predictedDays,
      predicted_expiry_date: expiryDate.toISOString().split('T')[0]
    });
  } catch (error) {
    console.error('Error predicting expiry:', error);
    res.status(500).json({ message: 'Prediction service error' });
  }
};