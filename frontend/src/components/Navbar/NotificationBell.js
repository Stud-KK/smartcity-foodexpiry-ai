// components/Navbar/NotificationBell.js
import React, { useState, useRef, useEffect } from 'react';
import { BellIcon } from 'lucide-react';
import { useNotifications } from './NotificationProvider';
import { format } from 'date-fns';

const NotificationItem = ({ notification, onRead, onDelete }) => {
  const { _id, title, message, type, createdAt, read } = notification;
  
  const getIconForType = (type) => {
    switch (type) {
      case 'expired':
        return <span className="text-red-500">🔴</span>;
      case 'expiring':
        return <span className="text-yellow-500">🟡</span>;
      case 'lowStock':
        return <span className="text-blue-500">🔵</span>;
      case 'digest':
        return <span className="text-green-500">📊</span>;
      default:
        return <span className="text-gray-500">📢</span>;
    }
  };

  return (
    <div className={`p-3 border-b last:border-b-0 dark:border-gray-700 ${read ? 'opacity-75' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-2">
          <div className="mt-1">{getIconForType(type)}</div>
          <div>
            <h4 className="font-medium text-sm">{title}</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">{message}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {format(new Date(createdAt), 'MMM d, h:mm a')}
            </p>
          </div>
        </div>
        <div className="flex space-x-1">
          {!read && (
            <button 
              onClick={() => onRead(_id)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Mark read
            </button>
          )}
          <button 
            onClick={() => onDelete(_id)}
            className="text-xs text-red-600 dark:text-red-400 hover:underline ml-2"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const NotificationBell = () => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    clearAllNotifications
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="relative p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        aria-label="Notifications"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 rounded-full text-xs text-white w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 shadow-lg rounded-md overflow-hidden z-50 border dark:border-gray-700">
          <div className="p-3 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Notifications</h3>
              <div className="flex space-x-2">
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button 
                    onClick={clearAllNotifications}
                    className="text-xs text-red-600 dark:text-red-400 hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <NotificationItem 
                  key={notification._id}
                  notification={notification}
                  onRead={markAsRead}
                  onDelete={deleteNotification}
                />
              ))
            ) : (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No notifications
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;