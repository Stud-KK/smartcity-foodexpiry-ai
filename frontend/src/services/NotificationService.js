// src/services/NotificationService.js
import axios from 'axios';

class NotificationService {
  constructor() {
    this.apiUrl = 'http://localhost:3002/api';
    this.token = localStorage.getItem('token');
  }

  // Update token if it changes
  updateToken() {
    this.token = localStorage.getItem('token');
  }

  // Send SMS notification
  async sendSmsNotification(phoneNumber, message) {
    this.updateToken();
    try {
      const response = await axios.post(
        `${this.apiUrl}/notifications/sms`,
        { phoneNumber, message },
        {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending SMS notification:', error);
      throw error;
    }
  }

  // Get user notification preferences
  async getUserNotificationPreferences() {
    this.updateToken();
    try {
      const response = await axios.get(
        `${this.apiUrl}/users/notification-preferences`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      throw error;
    }
  }

  // Update user notification preferences
  async updateUserNotificationPreferences(preferences) {
    this.updateToken();
    try {
      const response = await axios.put(
        `${this.apiUrl}/users/notification-preferences`,
        preferences,
        {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  // Test SMS delivery to user's mobile number
  async testSmsDelivery(phoneNumber) {
    this.updateToken();
    try {
      const response = await axios.post(
        `${this.apiUrl}/notifications/test-sms`,
        { phoneNumber },
        {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error testing SMS delivery:', error);
      throw error;
    }
  }
}

export default new NotificationService()