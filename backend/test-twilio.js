require('dotenv').config();
const twilio = require('twilio');
const mongoose = require('mongoose');
const User = require('./models/User'); // Adjust path if needed

// Initialize Twilio client
const client = twilio(
  process.env.REMOVED_SECRET,
  process.env.REMOVED_SECRET
);

// Format the number function
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

async function sendTestMessage() {
  try {
    console.log('Twilio Environment Variables:');
    console.log(`REMOVED_SECRET: ${process.env.REMOVED_SECRET ? '✓ Set' : '✗ Missing'}`);
    console.log(`REMOVED_SECRET: ${process.env.REMOVED_SECRET ? '✓ Set' : '✗ Missing'}`);
    console.log(`TWILIO_PHONE_NUMBER: ${process.env.TWILIO_PHONE_NUMBER ? '✓ Set' : '✗ Missing'}`);
    
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Find a user with a mobile number
    const user = await User.findOne({ 
      mobile: { $exists: true, $ne: '' } 
    });
    
    if (!user || !user.mobile) {
      console.error('❌ No user found with a mobile number in the database');
      process.exit(1);
    }
    
    console.log(`Found user: ${user.name} with mobile: ${user.mobile}`);
    
    // Format the number
    const formattedNumber = formatPhoneNumber(user.mobile);
    console.log(`\nSending test message to ${formattedNumber}...`);
    
    const message = await client.messages.create({
      body: `This is a test message from your FoodWise app for ${user.name}.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedNumber
    });
    
    console.log('✅ Success! Message details:');
    console.log(`SID: ${message.sid}`);
    console.log(`Status: ${message.status}`);
    console.log(`Date Sent: ${message.dateCreated}`);
    console.log(`Body: ${message.body}`);
  } catch (error) {
    console.error('❌ Error sending SMS:');
    console.error(`Message: ${error.message}`);
    if (error.code) {
      console.error(`Error Code: ${error.code}`);
    }
    
    // Common Twilio error troubleshooting
    if (error.code === 20404) {
      console.error('Your Twilio phone number may not be configured for SMS.');
    } else if (error.code === 21608) {
      console.error('The number you\'re sending to may not be a valid mobile number.');
    } else if (error.code === 21211) {
      console.error('Invalid phone number format. Make sure it includes the country code.');
    } else if (error.code === 20003) {
      console.error('Authentication error. Check your Twilio credentials.');
    }
    
    console.error('\nPlease check your Twilio dashboard for more information.');
  } finally {
    // Close the MongoDB connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the test
sendTestMessage();