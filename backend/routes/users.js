const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');
const User = require('../models/User'); // Add this import
const { sendTestNotification } = require('../utils/notificationUtils'); // Add this import

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes
router.get('/profile', authMiddleware, userController.getUserProfile);
router.put('/profile', authMiddleware, upload.single('profileImage'), userController.updateUserProfile);

// Get notification settings
router.get('/notification-settings', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('notificationSettings');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.notificationSettings || {
      emailNotifications: true,
      smsNotifications: false,
      expiryNotifications: true,
      lowStockNotifications: true,
      reminderTime: 3
    });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update notification settings
router.post('/notification-settings', authMiddleware, async (req, res) => {
  try {
    const {
      emailNotifications,
      smsNotifications,
      expiryNotifications,
      lowStockNotifications,
      reminderTime
    } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Create notificationSettings object if it doesn't exist
    if (!user.notificationSettings) {
      user.notificationSettings = {};
    }
    
    // Update notification settings
    user.notificationSettings.emailNotifications = emailNotifications !== undefined ? emailNotifications : user.notificationSettings.emailNotifications;
    user.notificationSettings.smsNotifications = smsNotifications !== undefined ? smsNotifications : user.notificationSettings.smsNotifications;
    user.notificationSettings.expiryNotifications = expiryNotifications !== undefined ? expiryNotifications : user.notificationSettings.expiryNotifications;
    user.notificationSettings.lowStockNotifications = lowStockNotifications !== undefined ? lowStockNotifications : user.notificationSettings.lowStockNotifications;
    user.notificationSettings.reminderTime = reminderTime !== undefined ? reminderTime : user.notificationSettings.reminderTime;
    
    await user.save();
    
    res.json(user.notificationSettings);
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send test notification
router.post('/send-test-notification', authMiddleware, async (req, res) => {
  try {
    const { type } = req.body;
    
    if (!['email', 'sms'].includes(type)) {
      return res.status(400).json({ message: 'Invalid notification type' });
    }
    
    const result = await sendTestNotification(req.user.id, type);
    
    res.json({ 
      message: `Test ${type} notification sent successfully`,
      result 
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ message: error.message || 'Failed to send test notification' });
  }
});




// Direct test route for SMS
router.post('/direct-test-sms', authMiddleware, async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user || !user.mobile) {
        return res.status(400).json({ 
          message: 'No mobile number found for your account'
        });
      }
      
      // Create test message
      const testMessage = `FoodWise Test SMS: This is a direct test message sent at ${new Date().toLocaleTimeString()}`;
      
      // Format number and prepare for sending
      const formattedNumber = formatPhoneNumber(user.mobile);
      console.log(`Test SMS to ${formattedNumber}: ${testMessage}`);
      
      // Send the message
      const twilioClient = twilio(
        process.env.REMOVED_SECRET,
        process.env.REMOVED_SECRET
      );
      
      const message = await twilioClient.messages.create({
        body: testMessage,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedNumber
      });
      
      res.json({ 
        success: true, 
        message: `Test SMS sent successfully to ${user.mobile}`,
        sid: message.sid,
        status: message.status
      });
    } catch (error) {
      console.error('Direct SMS test error:', error);
      res.status(500).json({ 
        success: false, 
        message: `Error sending SMS: ${error.message}`,
        code: error.code || 'unknown'
      });
    }
  });
  

module.exports = router;