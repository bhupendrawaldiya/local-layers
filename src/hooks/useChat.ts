
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
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

  useEffect(() => {
    if (!userId) return;
    
    const initializeChat = async () => {
      if (existingChatId) {
        setChatId(existingChatId);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        // Get seller ID for this listing
        const { data: sellerId, error: sellerError } = await supabase
          .rpc('get_seller_id_for_listing', { listing_id: listingId });
        
        if (sellerError) throw sellerError;
        
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
        toast.error('Failed to start chat');
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
        toast.error('Failed to load messages');
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
          setMessages(current => [...current, payload.new as Message]);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

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
      toast.error('Failed to send message');
    }
  };

  return {
    chatId,
    messages,
    isLoading,
    sendMessage
  };
}
