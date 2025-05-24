import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

// Create a context for notifications that can be used across the app
export const NotificationContext = React.createContext({
  notifications: [],
  unreadCount: 0,
  refreshNotifications: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {}
});

export const useNotifications = () => React.useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
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
      
      // Check for items expiring in next 3 days
      const expiringItems = items.filter(item => {
        const expDate = new Date(item.expiryDate);
        const diffTime = expDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 && diffDays <= 3;
      });
      
      if (expiringItems.length > 0) {
        notificationsList.push({
          id: 'expiring-soon',
          title: 'Items Expiring Soon',
          message: `You have ${expiringItems.length} item${expiringItems.length === 1 ? '' : 's'} expiring in the next 3 days`,
          type: 'warning',
          time: new Date(),
          read: false,
          items: expiringItems
        });
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
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [isLoggedIn, notifications]);

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
    markAllAsRead
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

const Navbar = () => {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  
  // Use the notification context
  const { 
    notifications, 
    unreadCount, 
    refreshNotifications, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // View item details 
  const viewItemDetails = (itemId) => {
    navigate(`/item/${itemId}`);
    setShowNotifications(false);
  };
  
  // Handle notification click
  const handleNotificationClick = (notificationId) => {
    markAsRead(notificationId);
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Format the time for notification
  const formatTime = (time) => {
    const date = new Date(time);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm py-4 border-b dark:border-gray-700">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center text-primary font-bold text-2xl dark:text-white">
          <span className="text-primary-dark">🥗</span> FoodWise
        </Link>

        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          {isLoggedIn && (
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => {
                  refreshNotifications(); // Refresh when opening
                  setShowNotifications(!showNotifications);
                }}
                className="relative p-2 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                title="Notifications"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-20 border dark:border-gray-700">
                  <div className="py-2 px-3 bg-gray-100 dark:bg-gray-700 flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Notifications</h3>
                    <div className="flex items-center">
                      <button 
                        onClick={refreshNotifications}
                        className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mr-3"
                        title="Refresh notifications"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-4 px-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className={`px-4 py-3 border-b dark:border-gray-700 
                            ${notification.read ? 'bg-white dark:bg-gray-800' : 'bg-blue-50 dark:bg-gray-700'}`}
                        >
                          <div 
                            className="flex justify-between items-start cursor-pointer"
                            onClick={() => handleNotificationClick(notification.id)}
                          >
                            <div>
                              <div className="flex items-center">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {notification.title}
                                </p>
                                <span className={`ml-2 inline-flex rounded-full h-2 w-2 
                                  ${notification.type === 'error' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatTime(notification.time)}
                              </p>
                            </div>
                            {!notification.read && (
                              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                          
                          {/* Item list */}
                          <div className="mt-2">
                            {notification.items.slice(0, 3).map(item => (
                              <div 
                                key={item._id} 
                                className="flex justify-between py-1 text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-1"
                                onClick={() => viewItemDetails(item._id)}
                              >
                                <span className="font-medium">{item.name}</span>
                                <span className={`
                                  ${notification.type === 'error' ? 'text-red-500' : 'text-yellow-500'}`}>
                                  {new Date(item.expiryDate).toLocaleDateString()}
                                </span>
                              </div>
                            ))}
                            {notification.items.length > 3 && (
                              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 cursor-pointer hover:underline" 
                                onClick={() => {
                                  navigate('/dashboard');
                                  setShowNotifications(false);
                                }}>
                                View {notification.items.length - 3} more...
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="py-2 px-3 bg-gray-100 dark:bg-gray-700">
                    <Link 
                      to="/dashboard" 
                      className="block text-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      onClick={() => setShowNotifications(false)}
                    >
                      View all items
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="text-xl px-2 py-1 rounded transition-colors dark:text-yellow-300 text-gray-700"
            title="Toggle Theme"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          {isLoggedIn ? (
            <>
              <Link to="/profile" className="px-4 py-2 rounded hover:underline text-gray-700 dark:text-white">Profile</Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-primary text-primary rounded hover:bg-primary hover:text-white transition-colors dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 border border-primary text-primary rounded hover:bg-primary hover:text-white transition-colors dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors dark:bg-white dark:text-black dark:hover:bg-gray-300"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;