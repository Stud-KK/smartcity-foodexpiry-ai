const User = require('../models/User');
const NotificationPreference = require('../models/NotificationPreference');
const axios = require('axios');
const config = require('../config/config');

// Simplified version without direct Twilio integration
// This will log SMS instead of sending them during development

// Get notification preferences
exports.getNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    // Find existing preferences or create default ones
    let preferences = await NotificationPreference.findOne({ user: userId });
    if (!preferences) {
      // Create default preferences
      preferences = new NotificationPreference({
        user: userId,
        emailNotifications: true,
        smsNotifications: false,
        expiredItemsAlert: true,
        expiringItemsAlert: true,
        lowStockAlert: false,
        dailyDigest: false
      });
      await preferences.save();
    }
    res.status(200).json(preferences);
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update notification preferences
exports.updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      emailNotifications,
      smsNotifications,
      expiredItemsAlert,
      expiringItemsAlert,
      lowStockAlert,
      dailyDigest
    } = req.body;

    // Find existing preferences or create new ones
    let preferences = await NotificationPreference.findOne({ user: userId });
    if (!preferences) {
      preferences = new NotificationPreference({
        user: userId
      });
    }

    // Update fields
    preferences.emailNotifications = emailNotifications !== undefined ? emailNotifications : preferences.emailNotifications;
    preferences.smsNotifications = smsNotifications !== undefined ? smsNotifications : preferences.smsNotifications;
    preferences.expiredItemsAlert = expiredItemsAlert !== undefined ? expiredItemsAlert : preferences.expiredItemsAlert;
    preferences.expiringItemsAlert = expiringItemsAlert !== undefined ? expiringItemsAlert : preferences.expiringItemsAlert;
    preferences.lowStockAlert = lowStockAlert !== undefined ? lowStockAlert : preferences.lowStockAlert;
    preferences.dailyDigest = dailyDigest !== undefined ? dailyDigest : preferences.dailyDigest;

    await preferences.save();
    res.status(200).json({ message: 'Preferences updated successfully', preferences });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all notifications for a user
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's items from the database (assuming you have an Item model)
    const Item = require('../models/Item');
    const items = await Item.find({ user: userId }).sort({ expiryDate: 1 });
    
    const today = new Date();
    const notifications = [];
    
    // Check for expired items
    const expiredItems = items.filter(item => new Date(item.expiryDate) < today);
    if (expiredItems.length > 0) {
      notifications.push({
        id: 'expired',
        title: 'Items Expired',
        message: `You have ${expiredItems.length} expired item${expiredItems.length === 1 ? '' : 's'} in your inventory`,
        type: 'error',
        time: new Date(),
        read: false,
        items: expiredItems
      });
    }
    
    // Check for items expiring in next 3 days
    const expiringItems = items.filter(item => {
      const expDate = new Date(item.expiryDate);
      const diffTime = expDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 3;
    });
    
    if (expiringItems.length > 0) {
      notifications.push({
        id: 'expiring-soon',
        title: 'Items Expiring Soon',
        message: `You have ${expiringItems.length} item${expiringItems.length === 1 ? '' : 's'} expiring in the next 3 days`,
        type: 'warning',
        time: new Date(),
        read: false,
        items: expiringItems
      });
    }
    
    // Check for low stock items
    const preferences = await NotificationPreference.findOne({ user: userId });
    if (preferences && preferences.lowStockAlert) {
      const lowStockItems = items.filter(item => 
        item.quantity && item.lowStockThreshold && item.quantity <= item.lowStockThreshold
      );
      
      if (lowStockItems.length > 0) {
        notifications.push({
          id: 'low-stock',
          title: 'Low Stock Items',
          message: `You have ${lowStockItems.length} item${lowStockItems.length === 1 ? '' : 's'} with low stock`,
          type: 'info',
          time: new Date(),
          read: false,
          items: lowStockItems
        });
      }
    }
    
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    
    // In a real implementation, you would update the notification status in the database
    // Since we're generating notifications on-the-fly, this endpoint just acknowledges receipt
    
    res.status(200).json({ message: 'Notification marked as read', id: notificationId });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // In a real implementation, you would update all notifications for this user as read
    // Since we're generating notifications on-the-fly, this endpoint just acknowledges receipt
    
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Send email notification (simplified for development)
exports.sendEmailNotification = async (userId, subject, message) => {
  try {
    const user = await User.findById(userId);
    const preferences = await NotificationPreference.findOne({ user: userId });
    
    if (!user || !preferences || !preferences.emailNotifications) {
      return { success: false, message: 'Email notifications disabled or user not found' };
    }
    
    // For development, just log the email that would be sent
    console.log(`[EMAIL NOTIFICATION] To: ${user.email}, Subject: ${subject}, Message: ${message}`);
    
    // In production, you would use your email service:
    /*
    await axios.post(config.EMAIL_API_URL, {
      to: user.email,
      subject,
      html: message,
      from: config.EMAIL_FROM
    }, {
      headers: {
        'Authorization': `Bearer ${config.EMAIL_API_KEY}`
      }
    });
    */
    
    return { success: true };
  } catch (error) {
    console.error('Error sending email notification:', error);
    return { success: false, error: error.message };
  }
};

// Send SMS notification (simplified for development)
exports.sendSmsNotification = async (userId, message) => {
  try {
    const user = await User.findById(userId);
    const preferences = await NotificationPreference.findOne({ user: userId });
    
    if (!user || !preferences || !preferences.smsNotifications || !user.phoneNumber) {
      return { success: false, message: 'SMS notifications disabled or phone number not found' };
    }
    
    // For development, just log the SMS that would be sent
    console.log(`[SMS NOTIFICATION] To: ${user.phoneNumber}, Message: ${message}`);
    
    return { success: true };
  } catch (error) {
    console.error('Error sending SMS notification:', error);
    return { success: false, error: error.message };
  }
};

// Test endpoint to send a test notification
exports.sendTestNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.body;
    
    let success = false;
    let message = '';
    
    switch (type) {
      case 'email':
        const emailResult = await exports.sendEmailNotification(
          userId, 
          'Test Notification', 
          '<h1>This is a test email notification</h1><p>Your notification system is working!</p>'
        );
        success = emailResult.success;
        message = success ? 'Test email sent successfully' : emailResult.message;
        break;
        
      case 'sms':
        const smsResult = await exports.sendSmsNotification(
          userId,
          'This is a test SMS notification from FoodWise. Your notification system is working!'
        );
        success = smsResult.success;
        message = success ? 'Test SMS sent successfully' : smsResult.message;
        break;
        
      default:
        return res.status(400).json({ message: 'Invalid notification type' });
    }
    
    res.status(200).json({ success, message });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  console.log("delete")
}