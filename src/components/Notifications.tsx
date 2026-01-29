import { useEffect, useState } from 'react';
import { Trash2, Check, Circle, Wifi, WifiOff } from 'lucide-react';
import type { Notification } from '../types/dto';
import { notificationsApi, sseClient } from '../services/api';
import { mockNotificationsData } from '../services/mockData';

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [sseConnected, setSseConnected] = useState(false);

  useEffect(() => {
    loadNotifications();
    
    // TODO: Replace with actual SSE endpoint when backend is ready
    // connectSSE();

    return () => {
      sseClient.disconnect();
    };
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API call when backend is ready
      // const response = await notificationsApi.getAll({ page: 1, limit: 50 });
      // setNotifications(response.data);

      // Using mock data for now
      await new Promise(resolve => setTimeout(resolve, 500));
      setNotifications(mockNotificationsData.data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectSSE = () => {
    // TODO: Replace with actual SSE endpoint when backend is ready
    // sseClient.connect(
    //   '/seller/notifications/stream',
    //   (event: MessageEvent) => {
    //     const notification = JSON.parse(event.data) as Notification;
    //     setNotifications(prev => [notification, ...prev]);
    //   },
    //   (error: Event) => {
    //     console.error('SSE connection error:', error);
    //     setSseConnected(false);
    //   }
    // );
    // setSseConnected(true);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      // TODO: Replace with actual API call when backend is ready
      // await notificationsApi.markAsRead({ notificationId });

      setNotifications(notifications.map(n =>
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;

    try {
      // TODO: Replace with actual API call when backend is ready
      // await notificationsApi.delete(notificationId);

      setNotifications(notifications.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
      alert('Failed to delete notification');
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '!';
      default:
        return 'i';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'error':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'warning':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-neutral-900 mb-2">Notifications</h1>
          <p className="text-neutral-600">
            Stay updated with your store activities
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>

        {/* SSE Connection Indicator */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-neutral-200">
          {sseConnected ? (
            <>
              <Wifi size={16} className="text-green-600" />
              <span className="text-sm text-neutral-600">Real-time updates active</span>
            </>
          ) : (
            <>
              <WifiOff size={16} className="text-neutral-400" />
              <span className="text-sm text-neutral-600">Real-time updates inactive</span>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-neutral-500">Loading notifications...</div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center bg-white rounded-xl border border-neutral-200">
          <Circle className="text-neutral-400 mb-4" size={48} />
          <p className="text-neutral-900 mb-1">No notifications</p>
          <p className="text-neutral-600 text-sm">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-xl border p-6 transition-all ${
                notification.isRead
                  ? 'border-neutral-200'
                  : 'border-neutral-300 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border ${
                    getNotificationColor(notification.type)
                  }`}
                >
                  <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <h3 className="font-medium text-neutral-900">{notification.title}</h3>
                    {!notification.isRead && (
                      <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    )}
                  </div>
                  <p className="text-sm text-neutral-600 mb-2">{notification.message}</p>
                  <p className="text-xs text-neutral-500">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Mark as read"
                    >
                      <Check size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
