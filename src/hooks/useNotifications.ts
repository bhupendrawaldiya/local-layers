
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  content: string;
  type: 'message' | 'price_drop' | 'wishlist' | 'system';
  related_id: string | null;
  is_read: boolean;
  created_at: string;
  user_id: string;
}

interface CreateNotificationProps {
  userId: string;
  content: string;
  type: 'message' | 'price_drop' | 'wishlist' | 'system';
  relatedId?: string | number;
}

// Type guard to check if an object is a Notification
const isNotification = (obj: any): obj is Notification => {
  return obj 
    && typeof obj.content === 'string'
    && (obj.type === 'message' || obj.type === 'price_drop' || obj.type === 'wishlist' || obj.type === 'system')
    && typeof obj.is_read === 'boolean';
};

// Cast function to safely convert data to Notifications
const safeNotificationCast = (data: any[]): Notification[] => {
  return data.filter(isNotification);
};

export const useNotifications = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async (userId: string) => {
    try {
      setLoading(true);
      // @ts-ignore - Supabase client doesn't include notifications table in its types
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }
      
      const typedNotifications = safeNotificationCast(data || []);
      setNotifications(typedNotifications);
      const unread = typedNotifications.filter(n => !n.is_read).length || 0;
      setUnreadCount(unread);
      return data;
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createNotification = async ({
    userId,
    content,
    type,
    relatedId
  }: CreateNotificationProps) => {
    try {
      // @ts-ignore - Supabase client doesn't include notifications table in its types
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
      
      // Show a toast notification
      toast({
        title: "New Notification",
        description: content,
        duration: 5000,
      });
      
      return data;
    } catch (error) {
      console.error('Error in createNotification:', error);
      return null;
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // @ts-ignore - Supabase client doesn't include notifications table in its types
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      
      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return true;
    } catch (error) {
      console.error('Error in markAsRead:', error);
      return false;
    }
  };

  const markAllAsRead = async (userId: string) => {
    try {
      // @ts-ignore - Supabase client doesn't include notifications table in its types
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
      
      if (error) {
        console.error('Error marking all notifications as read:', error);
        return false;
      }
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      
      return true;
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
      return false;
    }
  };

  const getUnreadCount = async (userId: string) => {
    try {
      // @ts-ignore - Supabase client doesn't include notifications table in its types
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);
      
      if (error) {
        console.error('Error getting unread count:', error);
        return 0;
      }
      
      setUnreadCount(count || 0);
      return count || 0;
    } catch (error) {
      console.error('Error in getUnreadCount:', error);
      return 0;
    }
  };

  const setupRealtimeNotifications = (userId: string) => {
    // Subscribe to new notifications
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          if (isNotification(newNotification)) {
            setNotifications(current => [newNotification, ...current]);
            setUnreadCount(count => count + 1);
            
            // Show a toast for the new notification
            toast({
              title: "New Notification",
              description: newNotification.content,
              duration: 5000,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const updatedNotification = payload.new as Notification;
          if (isNotification(updatedNotification)) {
            setNotifications(current => 
              current.map(notif => 
                notif.id === updatedNotification.id ? updatedNotification : notif
              )
            );
            
            // Recalculate unread count if needed
            if (payload.old && !payload.old.is_read && updatedNotification.is_read) {
              setUnreadCount(current => Math.max(0, current - 1));
            }
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  };

  return {
    notifications,
    loading,
    unreadCount,
    fetchNotifications,
    createNotification,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    setupRealtimeNotifications
  };
};
