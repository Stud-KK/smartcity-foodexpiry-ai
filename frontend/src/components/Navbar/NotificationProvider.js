import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

// Create context
const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    expiredItemsAlert: true,
    expiringItemsAlert: true,
    lowStockAlert: false,
    dailyDigest: false
  });
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notification preferences when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotificationPreferences();
      fetchNotifications();
    }
  }, [isAuthenticated, user]);

  // Fetch user's notification preferences
  const fetchNotificationPreferences = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/notifications/preferences', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPreferences(response.data);
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(response.data);
      setUnreadCount(response.data.filter(notification => !notification.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update notification preferences
  const updatePreferences = async (newPreferences) => {
    try {
      setLoading(true);
      const response = await axios.put('/api/notifications/preferences', newPreferences, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPreferences(response.data.preferences);
      toast.success('Notification preferences updated');
      return true;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      toast.error('Failed to update notification preferences');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Update local state
      const updatedNotifications = notifications.map(notification => 
        notification._id === notificationId ? { ...notification, read: true } : notification
      );
      
      setNotifications(updatedNotifications);
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Update local state
      const updatedNotifications = notifications.map(notification => ({ ...notification, read: true }));
      setNotifications(updatedNotifications);
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  // Delete a notification
  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`/api/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Update local state
      const updatedNotifications = notifications.filter(notification => notification._id !== notificationId);
      setNotifications(updatedNotifications);
      
      // Update unread count if the deleted notification was unread
      const wasUnread = notifications.find(n => n._id === notificationId && !n.read);
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      await axios.delete('/api/notifications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Update local state
      setNotifications([]);
      setUnreadCount(0);
      toast.success('All notifications cleared');
    } catch (error) {
      console.error('Error clearing notifications:', error);
      toast.error('Failed to clear notifications');
    }
  };

  // Function to test notifications (development only)
  const testNotification = async (type) => {
    try {
      await axios.post('/api/notifications/test', { type }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success(`Test ${type} notification sent`);
      // Refresh notifications list
      fetchNotifications();
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Failed to send test notification');
    }
  };

  const value = {
    preferences,
    notifications,
    unreadCount,
    loading,
    fetchNotificationPreferences,
    fetchNotifications,
    updatePreferences,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    testNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;