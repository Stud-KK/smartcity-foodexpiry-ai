// config/twilio.js
const dotenv = require('dotenv');
const twilio = require('twilio');

dotenv.config();

// Initialize Twilio client
const twilioClient = twilio(
  process.env.REMOVED_SECRET,
  process.env.REMOVED_SECRET
);

module.exports = twilioClient;