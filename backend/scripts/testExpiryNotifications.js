// scripts/testExpiryNotifications.js
require('dotenv').config();
const mongoose = require('mongoose');
const { sendExpiryNotifications } = require('../utils/expiryNotifications');

async function runTest() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/foodwise");
    console.log('Connected to MongoDB');
    
    // Parameter is the days threshold (items expiring within X days)
    // You can change this number to test different scenarios
    const daysThreshold = 5; 
    console.log(`Testing notifications for items expiring within ${daysThreshold} days`);
    
    // Send notifications
    const notificationsSent = await sendExpiryNotifications(daysThreshold);
    console.log(`Test complete: ${notificationsSent} notifications sent`);
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    // Close MongoDB connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the test
runTest();