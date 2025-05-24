// utils/expiryNotifications.js
require('dotenv').config();
const twilio = require('twilio');
const User = require('../models/User');
const Item = require('../models/Item');

// Initialize Twilio client
const client = twilio(
  process.env.REMOVED_SECRET,
  process.env.REMOVED_SECRET
);

// Format the phone number
const formatPhoneNumber = (phoneNumber) => {
  // Remove any non-numeric characters
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  // Handle different formats
  if (cleaned.length === 10) {
    // 10-digit number, assume India (+91)
    return '+91' + cleaned;
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    // Number starts with country code but no +
    return '+' + cleaned;
  } else if (cleaned.length > 10) {
    // Already has country code, just add +
    return cleaned.startsWith('+') ? cleaned : '+' + cleaned;
  } else {
    // Default fallback for other cases
    console.warn(`Warning: Unusual phone number format: ${phoneNumber}`);
    return cleaned.startsWith('+') ? cleaned : '+' + cleaned;
  }
};

// Function to generate message text based on expiring items
const generateMessageText = (userName, items) => {
  if (items.length === 0) return null;
  
  let message = `Hi ${userName}, FoodWise reminder: You have ${items.length} item(s) expiring soon:\n\n`;
  
  items.forEach((item, index) => {
    const daysLeft = Math.ceil((item.expiryDate - new Date()) / (1000 * 60 * 60 * 24));
    const expiryDateFormatted = item.expiryDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    
    message += `${index + 1}. ${item.name} - ${daysLeft} day(s) left (${expiryDateFormatted})\n`;
  });
  
  message += "\nOpen your FoodWise app to see more details.";
  return message;
};

// Send notifications for items expiring within the specified days
async function sendExpiryNotifications(daysThreshold = 3) {
  try {
    console.log(`Checking for items expiring in the next ${daysThreshold} days...`);
    
    // Calculate the date range for the expiry check
    const today = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(today.getDate() + daysThreshold);
    
    // Find all users with mobile numbers
    const users = await User.find({ mobile: { $exists: true, $ne: '' } });
    console.log(`Found ${users.length} users with mobile numbers`);
    
    let notificationsSent = 0;
    
    // For each user, check their expiring items
    for (const user of users) {
      // Find this user's items that are expiring soon
      const expiringItems = await Item.find({
        user: user._id,
        expiryDate: { 
          $gt: today,
          $lte: thresholdDate 
        }
      }).sort({ expiryDate: 1 });
      
      // If user has expiring items, send notification
      if (expiringItems.length > 0) {
        console.log(`User ${user.name} has ${expiringItems.length} items expiring soon`);
        
        // Generate message text
        const messageText = generateMessageText(user.name, expiringItems);
        
        // Format phone number and send SMS
        const formattedNumber = formatPhoneNumber(user.mobile);
        
        try {
          const message = await client.messages.create({
            body: messageText,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedNumber
          });
          
          console.log(`✅ Notification sent to ${user.name} (${formattedNumber})`);
          console.log(`Message SID: ${message.sid}`);
          notificationsSent++;
        } catch (smsError) {
          console.error(`❌ Failed to send SMS to ${user.name} (${formattedNumber})`);
          console.error(`Error: ${smsError.message}`);
        }
      } else {
        console.log(`User ${user.name} has no items expiring in the next ${daysThreshold} days`);
      }
    }
    
    console.log(`\nNotifications summary:`);
    console.log(`- Total users checked: ${users.length}`);
    console.log(`- Notifications sent: ${notificationsSent}`);
    
    return notificationsSent;
  } catch (error) {
    console.error('Error sending expiry notifications:');
    console.error(error);
    throw error;
  }
}

module.exports = { sendExpiryNotifications };