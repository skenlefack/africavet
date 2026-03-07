import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { notificationsApi } from '../services/api';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated || !token) return;
    try {
      const response = await notificationsApi.getUnreadCount(token);
      if (response.success) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Fetch unread count error:', error);
    }
  }, [isAuthenticated, token]);

  const fetchNotifications = useCallback(async (page = 1) => {
    if (!isAuthenticated || !token) return;
    try {
      const response = await notificationsApi.getAll(token, { page });
      if (response.success) {
        setNotifications(response.data);
      }
      return response;
    } catch (error) {
      console.error('Fetch notifications error:', error);
    }
  }, [isAuthenticated, token]);

  const markAsRead = useCallback(async (id) => {
    if (!token) return;
    const response = await notificationsApi.markAsRead(id, token);
    if (response.success) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    return response;
  }, [token]);

  const markAllAsRead = useCallback(async () => {
    if (!token) return;
    const response = await notificationsApi.markAllAsRead(token);
    if (response.success) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    }
    return response;
  }, [token]);

  // Poll every 60s when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      intervalRef.current = setInterval(fetchUnreadCount, 60000);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAuthenticated, fetchUnreadCount]);

  const value = {
    notifications,
    unreadCount,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
