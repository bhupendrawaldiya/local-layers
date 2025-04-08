import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';
import { useNotifications } from './useNotifications';

interface Message {
  id: string;
  created_at: string;
  sender_id: string;
  content: string;
}

export function useChat(userId: string, listingId: number, existingChatId?: string) {
  const [chatId, setChatId] = useState<string | null>(existingChatId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { createNotification } = useNotifications();
  const [otherUserId, setOtherUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    
    const initializeChat = async () => {
      if (existingChatId) {
        setChatId(existingChatId);
        
        // Get the other user in this chat
        const { data: chatData, error: chatError } = await supabase
          .from('chats')
          .select('buyer_id, seller_id')
          .eq('id', existingChatId)
          .single();
        
        if (chatData) {
          const otherId = chatData.buyer_id === userId ? chatData.seller_id : chatData.buyer_id;
          setOtherUserId(otherId);
        }
        
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        // Get seller ID for this listing
        const { data: listing, error: listingError } = await supabase
          .from('listings')
          .select('seller_id, title')
          .eq('id', listingId)
          .single();
        
        if (listingError) throw listingError;
        
        if (!listing.seller_id) {
          console.error('No seller_id found for listing:', listingId);
          toast({
            title: "Error",
            description: "Could not find the seller for this listing",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
        
        const sellerId = listing.seller_id;
        setOtherUserId(sellerId);
        
        // Check if a chat already exists
        const { data: existingChat, error: chatError } = await supabase
          .from('chats')
          .select('id')
          .eq('listing_id', listingId)
          .eq('buyer_id', userId)
          .eq('seller_id', sellerId)
          .maybeSingle();
        
        if (chatError) throw chatError;
        
        if (existingChat) {
          setChatId(existingChat.id);
        } else {
          // Create a new chat
          const { data: newChat, error: createError } = await supabase
            .from('chats')
            .insert({
              listing_id: listingId,
              buyer_id: userId,
              seller_id: sellerId
            })
            .select('id')
            .single();
          
          if (createError) throw createError;
          
          setChatId(newChat.id);
          
          // Send notification to seller about new chat
          if (sellerId) {
            createNotification({
              userId: sellerId,
              content: `Someone is interested in your listing: "${listing.title}"`,
              type: 'message',
              relatedId: newChat.id
            });
          }
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
        toast({
          title: "Error",
          description: "Failed to start chat",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeChat();
  }, [userId, listingId, existingChatId, createNotification]);
  
  useEffect(() => {
    if (!chatId) return;
    
    // Load existing messages
    const loadMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error loading messages:', error);
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive"
        });
        return;
      }
      
      setMessages(data);
    };
    
    loadMessages();
    
    // Subscribe to new messages
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          console.log('New message received:', newMessage);
          setMessages(current => [...current, newMessage]);
          
          // If message is from the other user, create a notification
          if (newMessage.sender_id !== userId && otherUserId) {
            createNotification({
              userId,
              content: 'You received a new message',
              type: 'message',
              relatedId: chatId
            });
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, userId, otherUserId, createNotification]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || !chatId || !userId) return;
    
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: userId,
          content: content
        });
      
      if (error) throw error;
      
      // Update the chat's updated_at timestamp
      await supabase
        .from('chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatId);
      
      // Send notification to the other user
      if (otherUserId) {
        createNotification({
          userId: otherUserId,
          content: 'You received a new message',
          type: 'message',
          relatedId: chatId
        });
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const deleteChat = async () => {
    if (!chatId) return;
    
    try {
      // First delete all messages in the chat
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('chat_id', chatId);
      
      if (messagesError) throw messagesError;
      
      // Then delete the chat itself
      const { error: chatError } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId);
      
      if (chatError) throw chatError;
      
      setChatId(null);
      setMessages([]);
      
    } catch (error) {
      console.error('Error deleting chat:', error);
      throw error;
    }
  };

  return {
    chatId,
    messages,
    isLoading,
    sendMessage,
    deleteChat
  };
}
