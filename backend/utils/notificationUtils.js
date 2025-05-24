// utils/notificationUtils.js
const twilio = require('twilio');
const User = require('../models/User');
const Item = require('../models/Item');

// Initialize Twilio client with environment variables
const twilioClient = twilio(
  process.env.REMOVED_SECRET,
  process.env.REMOVED_SECRET
);

// Function to check for expiring items and send notifications
// Function to check for expiring items and send notifications
const checkExpiringItems = async () => {
    try {
      const currentDate = new Date();
      
      // Get all users with mobile numbers (like the reference code)
      // Instead of filtering by notification settings initially
      const users = await User.find({
        'mobile': { $exists: true, $ne: '' }
      });
      
      console.log(`Checking expiring items for ${users.length} users`);
      
      for (const user of users) {
        // Only proceed with notification if the user hasn't explicitly disabled it
        // This is a looser check than your original code
        if (user.notificationSettings?.expiryNotifications !== false) {
          // Calculate the expiry threshold date based on user's reminder preference
          const reminderDays = user.notificationSettings?.reminderTime || 3;
          const thresholdDate = new Date();
          thresholdDate.setDate(currentDate.getDate() + parseInt(reminderDays));
          
          // Find items belonging to this user that will expire within the threshold period
          const expiringItems = await Item.find({
            userId: user._id,
            expiryDate: {
              $gte: currentDate,
              $lte: thresholdDate
            }
          });
          
          if (expiringItems.length > 0) {
            console.log(`Found ${expiringItems.length} expiring items for user ${user.name}`);
            
            // Prepare message content
            const itemNames = expiringItems.map(item => item.name).join(", ");
            const message = `FoodWise Alert: The following items will expire within ${reminderDays} days: ${itemNames}`;
            
            // Send SMS if user has a mobile number
            // You could still check user.notificationSettings?.smsNotifications here if needed
            if (user.mobile) {
              await sendSMS(user.mobile, message);
            }
            
            // Send email if implemented and user has an email address
            if (user.email) {
              // Implement email sending functionality
              console.log(`Would send email to ${user.email} about expiring items`);
            }
          }
        }
      }
      
      console.log('Completed checking for expiring items');
    } catch (error) {
      console.error('Error checking for expiring items:', error);
    }
  };

// Function to send SMS via Twilio
// Function to send SMS via Twilio
const sendSMS = async (phoneNumber, message) => {
    try {
      // Use the formatPhoneNumber function from the reference code
      let formattedNumber = formatPhoneNumber(phoneNumber);
      
      console.log(`Attempting to send SMS to ${formattedNumber} using Twilio...`);
      console.log(`Twilio SID: ${process.env.REMOVED_SECRET?.substring(0, 5)}...`);
      console.log(`Twilio From Number: ${process.env.TWILIO_PHONE_NUMBER}`);
      
      const messageResponse = await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedNumber
      });
      
      console.log(`SMS sent to ${formattedNumber}, SID: ${messageResponse.sid}`);
      return true;
    } catch (error) {
      console.error('Error sending SMS:', error.message);
      if (error.code) {
        console.error(`Twilio Error Code: ${error.code}`);
      }
      if (error.moreInfo) {
        console.error(`More Info: ${error.moreInfo}`);
      }
      return false;
    }
  };
  // Add the formatPhoneNumber function from the reference code
  const formatPhoneNumber = (phoneNumber) => {
    // Remove any non-numeric characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Ensure it has country code (assuming India +91 if not present)
    if (cleaned.length === 10) {
      return '+91' + cleaned;
    } else if (cleaned.startsWith('91') && cleaned.length === 12) {
      return '+' + cleaned;
    } else if (cleaned.startsWith('+91')) {
      return cleaned;
    }
    
    // Return with + if missing
    return cleaned.startsWith('+') ? cleaned : '+' + cleaned;
  };

// Function to send a test notification to the user
const sendTestNotification = async (userId, type) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    let message = '';
    let success = false;
    
    if (type === 'sms') {
      if (!user.mobile) {
        throw new Error('Mobile number not found. Please add your mobile number in your profile.');
      }
      
      if (!user.notificationSettings?.smsNotifications) {
        throw new Error('SMS notifications are not enabled in your settings.');
      }
      
      message = `This is a test SMS notification from FoodWise. If you received this, your SMS notifications are working properly!`;
      success = await sendSMS(user.mobile, message);
      
      if (!success) {
        throw new Error('Failed to send SMS notification. Please check your mobile number.');
      }
    } else if (type === 'email') {
      if (!user.email) {
        throw new Error('Email not found');
      }
      
      if (!user.notificationSettings?.emailNotifications) {
        throw new Error('Email notifications are not enabled in your settings.');
      }
      
      // Implement email sending functionality here
      // For now, we'll just simulate successful email sending
      success = true;
      message = 'Test email would be sent here';
    } else {
      throw new Error(`Invalid notification type: ${type}`);
    }
    
    return { success, message };
  } catch (error) {
    console.error('Error sending test notification:', error);
    throw error;
  }
};

// Schedule function to run daily
const scheduleExpiryChecks = () => {
  // This runs once on server start, but in a real implementation,
  // you would use a scheduling library like node-cron
  setTimeout(() => {
    checkExpiringItems();
    // Reschedule for the next day
    scheduleExpiryChecks();
  }, 24 * 60 * 60 * 1000); // 24 hours
  
  // Also run immediately on server start
  checkExpiringItems();
};

module.exports = {
  checkExpiringItems,
  sendSMS,
  sendTestNotification,
  scheduleExpiryChecks,
  formatPhoneNumber
};