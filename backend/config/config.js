// Load environment variables from .env file in non-production environments
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
  }
  
  module.exports = {
    // Server configuration
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    // MongoDB configuration
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/foodwise',
    
    // JWT configuration
    JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
    JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
    
    // Twilio configuration for SMS notifications
    REMOVED_SECRET: process.env.REMOVED_SECRET,
    REMOVED_SECRET: process.env.REMOVED_SECRET,
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
    
    // Email service configuration
    EMAIL_API_URL: process.env.EMAIL_API_URL || 'https://api.emailservice.com/send',
    EMAIL_API_KEY: process.env.EMAIL_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM || 'notifications@foodwise.com',
    
    // Notification settings
    EXPIRY_WARNING_DAYS: 3,
    DEFAULT_LOW_STOCK_THRESHOLD: 2
  };