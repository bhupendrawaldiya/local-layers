
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
          toast.error("Could not find the seller for this listing");
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
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
        toast.error("Failed to start chat");
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeChat();
  }, [userId, listingId, existingChatId]);
  
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
        toast.error("Failed to load messages");
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
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          const deletedMessage = payload.old as Message;
          console.log('Message deleted:', deletedMessage);
          setMessages(current => current.filter(msg => msg.id !== deletedMessage.id));
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, userId, otherUserId]);

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
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!chatId || !userId) return;
    
    try {
      // First check if the message belongs to this user
      const { data: message, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .eq('id', messageId)
        .eq('sender_id', userId)
        .single();
      
      if (fetchError) {
        throw new Error('Message not found or you do not have permission to delete it');
      }
      
      // Delete the message
      const { error: deleteError } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', userId); // Extra security to make sure only the sender can delete
      
      if (deleteError) throw deleteError;
      
      // Update local state
      setMessages(current => current.filter(msg => msg.id !== messageId));
      
      toast.success("Message deleted");
      
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error("Failed to delete message");
    }
  };

  const deleteChat = async () => {
    if (!chatId) return false;
    
    try {
      console.log('Deleting all messages for chat:', chatId);
      // First delete all messages in the chat
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('chat_id', chatId);
      
      if (messagesError) {
        console.error('Error deleting messages:', messagesError);
        throw messagesError;
      }
      
      console.log('Messages deleted, now deleting chat:', chatId);
      // Then delete the chat itself
      const { error: chatError } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId);
      
      if (chatError) {
        console.error('Error deleting chat:', chatError);
        throw chatError;
      }
      
      console.log('Chat deleted successfully');
      setChatId(null);
      setMessages([]);
      
      return true; // Return true to indicate successful deletion
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast.error("Failed to delete chat");
      return false; // Return false to indicate failed deletion
    }
  };

  return {
    chatId,
    messages,
    isLoading,
    sendMessage,
    deleteMessage,
    deleteChat
  };
}
