import { useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

const NotificationsModal = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Chyba při načítání notifikací');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: 1 }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(notif => ({ ...notif, is_read: 1 })));
      toast.success('Všechny notifikace byly označeny jako přečtené');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Chyba při označování notifikací');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Chyba při mazání notifikace');
    }
  };

  const deleteAllNotifications = async () => {
    try {
      await api.delete('/notifications');
      setNotifications([]);
      toast.success('Všechny notifikace byly smazány');
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      toast.error('Chyba při mazání notifikací');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Právě teď';
    } else if (diffInHours < 24) {
      return `Před ${Math.floor(diffInHours)} hodinami`;
    } else {
      return date.toLocaleDateString('cs-CZ');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'event_invitation':
        return '📅';
      case 'invitation_response':
        return '✅';
      default:
        return '🔔';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Notifikace</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Actions */}
        {notifications.length > 0 && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={markAllAsRead}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Označit vše jako přečtené
            </button>
            <button
              onClick={deleteAllNotifications}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
            >
              Smazat vše
            </button>
          </div>
        )}

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="text-gray-500 text-center py-4">Načítání...</p>
          ) : notifications.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Žádné notifikace</p>
          ) : (
            <div className="space-y-2">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-3 border rounded-lg ${
                    notification.is_read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2 flex-1">
                      <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{notification.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(notification.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-blue-500 hover:text-blue-700"
                        >
                          Označit
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Smazat
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsModal;
