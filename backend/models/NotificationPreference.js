const mongoose = require('mongoose');

const NotificationPreferenceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  emailNotifications: {
    type: Boolean,
    default: true
  },
  smsNotifications: {
    type: Boolean,
    default: false
  },
  expiredItemsAlert: {
    type: Boolean,
    default: true
  },
  expiringItemsAlert: {
    type: Boolean,
    default: true
  },
  lowStockAlert: {
    type: Boolean,
    default: false
  },
  dailyDigest: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('NotificationPreference', NotificationPreferenceSchema);