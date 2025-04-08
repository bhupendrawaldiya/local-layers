
import { supabase } from "@/lib/supabase";

interface CreateNotificationProps {
  userId: string;
  content: string;
  type: 'message' | 'price_drop' | 'wishlist' | 'system';
  relatedId?: string | number;
}

export const useNotifications = () => {
  const createNotification = async ({
    userId,
    content,
    type,
    relatedId
  }: CreateNotificationProps) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          content,
          type,
          related_id: relatedId ? String(relatedId) : null,
          is_read: false
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating notification:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error in createNotification:', error);
      return null;
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      
      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in markAsRead:', error);
      return false;
    }
  };

  const markAllAsRead = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
      
      if (error) {
        console.error('Error marking all notifications as read:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
      return false;
    }
  };

  const getUnreadCount = async (userId: string) => {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);
      
      if (error) {
        console.error('Error getting unread count:', error);
        return 0;
      }
      
      return count || 0;
    } catch (error) {
      console.error('Error in getUnreadCount:', error);
      return 0;
    }
  };

  return {
    createNotification,
    markAsRead,
    markAllAsRead,
    getUnreadCount
  };
};
