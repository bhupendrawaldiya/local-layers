
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Bell, Check, MessageCircle, ShoppingBag, Tag, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";

interface Notification {
  id: string;
  content: string;
  type: string;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
}

interface NotificationListProps {
  notifications: Notification[];
  onMarkAllRead: () => void;
  loading?: boolean;
}

const NotificationList = ({ notifications, onMarkAllRead, loading = false }: NotificationListProps) => {
  const navigate = useNavigate();
  const { markAsRead } = useNotifications();
  const [markingRead, setMarkingRead] = useState<string | null>(null);

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.is_read) {
      setMarkingRead(notification.id);
      await markAsRead(notification.id);
      setMarkingRead(null);
    }
    
    // Navigate based on notification type
    if (notification.type === 'message' && notification.related_id) {
      navigate(`/messages?chat=${notification.related_id}`);
    } else if (notification.type === 'price_drop' && notification.related_id) {
      navigate(`/product/${notification.related_id}`);
    } else if (notification.type === 'wishlist' && notification.related_id) {
      navigate(`/product/${notification.related_id}`);
    } else {
      // Default to account page for other notifications
      navigate('/account');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case 'price_drop':
        return <Tag className="h-5 w-5 text-green-500" />;
      case 'wishlist':
        return <ShoppingBag className="h-5 w-5 text-purple-500" />;
      case 'system':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="max-h-[400px] overflow-y-auto">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-medium">Notifications</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onMarkAllRead}
          disabled={!notifications.some(n => !n.is_read)}
        >
          <Check className="h-4 w-4 mr-1" />
          Mark all read
        </Button>
      </div>
      
      {loading ? (
        <div className="py-8 px-4 text-center">
          <div className="w-6 h-6 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-500">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-8 px-4 text-center">
          <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No notifications yet</p>
        </div>
      ) : (
        <ul className="divide-y">
          {notifications.map((notification) => (
            <li 
              key={notification.id}
              className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                !notification.is_read ? 'bg-blue-50' : ''
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!notification.is_read ? 'font-medium' : ''}`}>
                    {notification.content}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(notification.created_at), 'MMM d, h:mm a')}
                  </p>
                </div>
                {markingRead === notification.id && (
                  <div className="w-4 h-4 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationList;
