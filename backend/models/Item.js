const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: false,
    default: 'Uncategorized',
    trim: true
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  unit: {
    type: String,
    enum: ['item', 'g', 'kg', 'pcs', 'box', 'bottle'],
    default: 'item'
  },
  notes: {
    type: String,
    trim: true
  },
  storage_condition: {
    type: String,
    enum: ['fridge', 'room temperature', 'freezer'],
    default: 'fridge'
  },
  item_condition_on_purchase: {
    type: String,
    enum: [
      'fresh', 
      'slightly bruised', 
      'damaged pack', 
      'spoiled', 
      'near expiry', 
      'sealed & intact', 
      'minor defect', 
      'overripe', 
      'leaky pack', 
      'discolored'
    ],
    default: 'fresh'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;