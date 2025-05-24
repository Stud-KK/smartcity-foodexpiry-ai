// utils/scheduler.js
const cron = require('node-cron');
const { sendExpiryNotifications } = require('./expiryNotifications');

// Initialize the scheduler
const initScheduler = () => {
  console.log('Initializing automatic notification services...');
  
  // Schedule notifications check every 3 hours
  // Cron format: minute hour day-month month day-week
  // '0 */3 * * *' = run at minute 0 of every 3rd hour (00:00, 03:00, 06:00, 09:00, etc.)
  cron.schedule('0 */3 * * *', async () => {
    console.log(`[${new Date().toLocaleTimeString()}] Running 3-hour scheduled expiry notifications check`);
    try {
      // Check for items expiring in the next 3 days
      const notificationsSent = await sendExpiryNotifications(3);
      console.log(`Three-hour notification cycle completed: ${notificationsSent} notifications sent`);
    } catch (error) {
      console.error('Error running 3-hour notifications:', error);
    }
  });
  
  console.log('Three-hour interval expiry notification system initialized');
  
  // Run immediately on startup, don't wait for the next 3-hour mark
  setTimeout(async () => {
    try {
      console.log('Running initial notification check on startup...');
      const notificationsSent = await sendExpiryNotifications(3);
      console.log(`Initial notification check completed: ${notificationsSent} notifications sent`);
    } catch (error) {
      console.error('Error running initial notification check:', error);
    }
  }, 5000); // Wait 5 seconds after server start to run the first check
};

module.exports = { initScheduler };