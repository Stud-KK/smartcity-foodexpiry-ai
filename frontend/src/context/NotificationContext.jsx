import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

// Create a context for notifications that can be used across the app
export const NotificationContext = React.createContext({
  notifications: [],
  unreadCount: 0,
  refreshNotifications: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  notificationSettings: {},
  updateNotificationSettings: () => {}
});

export const useNotifications = () => React.useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    expiryNotifications: true,
    lowStockNotifications: true,
    reminderTime: 3
  });
  const { isLoggedIn } = useAuth();
  
  // Function to fetch notifications from API
  const refreshNotifications = useCallback(async () => {
    if (!isLoggedIn) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3002/api/items', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const today = new Date();
      const items = res.data;
      
      // Process items to create notifications
      const notificationsList = [];
      
      // Check for expired items
      const expiredItems = items.filter(item => new Date(item.expiryDate) < today);
      if (expiredItems.length > 0) {
        notificationsList.push({
          id: 'expired',
          title: 'Items Expired',
          message: `You have ${expiredItems.length} expired item${expiredItems.length === 1 ? '' : 's'} in your inventory`,
          type: 'error',
          time: new Date(),
          read: false,
          items: expiredItems
        });
      }
      
      // Check for items expiring in next X days (based on user settings)
      const reminderDays = notificationSettings.reminderTime || 3;
      const expiringItems = items.filter(item => {
        const expDate = new Date(item.expiryDate);
        const diffTime = expDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 && diffDays <= reminderDays;
      });
      
      if (expiringItems.length > 0) {
        notificationsList.push({
          id: 'expiring-soon',
          title: 'Items Expiring Soon',
          message: `You have ${expiringItems.length} item${expiringItems.length === 1 ? '' : 's'} expiring in the next ${reminderDays} days`,
          type: 'warning',
          time: new Date(),
          read: false,
          items: expiringItems
        });
      }
      
      // Check for low stock items (quantity < 3)
      if (notificationSettings.lowStockNotifications) {
        const lowStockItems = items.filter(item => item.quantity && item.quantity < 3);
        if (lowStockItems.length > 0) {
          notificationsList.push({
            id: 'low-stock',
            title: 'Low Stock Alert',
            message: `You have ${lowStockItems.length} item${lowStockItems.length === 1 ? '' : 's'} with low stock`,
            type: 'info',
            time: new Date(),
            read: false,
            items: lowStockItems
          });
        }
      }
      
      // Compare with previous notifications to maintain read status
      const updatedNotifications = notificationsList.map(newNotif => {
        const existingNotif = notifications.find(n => n.id === newNotif.id);
        if (existingNotif) {
          return {
            ...newNotif,
            read: existingNotif.read
          };
        }
        return newNotif;
      });
      
      setNotifications(updatedNotifications);
      setUnreadCount(updatedNotifications.filter(n => !n.read).length);
      
      // Send notifications via SMS/email if enabled
      if (updatedNotifications.some(n => !n.read) && 
         (notificationSettings.emailNotifications || notificationSettings.smsNotifications)) {
        sendExternalNotifications(updatedNotifications.filter(n => !n.read));
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [isLoggedIn, notifications, notificationSettings]);

  // Function to send notifications via SMS/email
  const sendExternalNotifications = async (unreadNotifications) => {
    if (!isLoggedIn || unreadNotifications.length === 0) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:3002/api/users/send-notifications',
        {
          notifications: unreadNotifications,
          channels: {
            email: notificationSettings.emailNotifications,
            sms: notificationSettings.smsNotifications
          }
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
    } catch (error) {
      console.error('Error sending external notifications:', error);
    }
  };

  // Mark a notification as read
  const markAsRead = useCallback((id) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  }, []);

  // Fetch notification settings on mount
  useEffect(() => {
    const fetchNotificationSettings = async () => {
      if (!isLoggedIn) return;
      
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3002/api/users/notification-settings', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data) {
          setNotificationSettings({
            emailNotifications: response.data.emailNotifications ?? true,
            smsNotifications: response.data.smsNotifications ?? false,
            expiryNotifications: response.data.expiryNotifications ?? true,
            lowStockNotifications: response.data.lowStockNotifications ?? true,
            reminderTime: response.data.reminderTime ?? 3
          });
        }
      } catch (error) {
        console.error('Error fetching notification settings:', error);
      }
    };
    
    fetchNotificationSettings();
  }, [isLoggedIn]);

  // Update notification settings
  const updateNotificationSettings = useCallback(async (settings) => {
    if (!isLoggedIn) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:3002/api/users/notification-settings',
        settings,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setNotificationSettings(settings);
      return true;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      return false;
    }
  }, [isLoggedIn]);

  // Fetch notifications on component mount and every minute
  useEffect(() => {
    refreshNotifications();
    const interval = setInterval(refreshNotifications, 60000); // Every minute
    
    return () => clearInterval(interval);
  }, [refreshNotifications, isLoggedIn]);
  
  const value = {
    notifications,
    unreadCount,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    notificationSettings,
    updateNotificationSettings
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};