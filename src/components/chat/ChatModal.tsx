
import { useState, useEffect } from "react";
import { X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import { useChat } from "@/hooks/useChat";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useNotifications } from "@/hooks/useNotifications";

interface UserInfo {
  id: string;
  fullName?: string;
  email?: string;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: number;
  listingTitle: string;
  userId: string;
  onMessageSent?: () => void;
  chatId?: string; // Optional, if opening an existing chat
}

const ChatModal = ({ 
  isOpen, 
  onClose, 
  listingId, 
  listingTitle, 
  userId, 
  onMessageSent, 
  chatId: existingChatId 
}: ChatModalProps) => {
  
  const { chatId, messages, isLoading, sendMessage, deleteChat } = useChat(userId, listingId, existingChatId);
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [otherUserInfo, setOtherUserInfo] = useState<UserInfo | null>(null);
  const { createNotification } = useNotifications();
  
  useEffect(() => {
    const fetchChatParticipants = async () => {
      if (!chatId) return;
      
      try {
        // Get the chat to find the other participant
        const { data, error } = await supabase
          .from('chats')
          .select('buyer_id, seller_id')
          .eq('id', chatId)
          .single();
        
        if (error) throw error;
        
        // Determine who is the other user in this chat
        const otherUser = data.buyer_id === userId ? data.seller_id : data.buyer_id;
        setOtherUserId(otherUser);
        
        // Fetch user profile information
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, fullName, email')
          .eq('id', otherUser)
          .maybeSingle();
        
        if (profileError && profileError.code !== 'PGRST116') {
          // PGRST116 is "No rows returned" which might happen if profiles table doesn't exist yet
          console.error('Error fetching profile:', profileError);
        }
        
        // If we couldn't get profile data, at least show their ID
        if (profileData) {
          setOtherUserInfo(profileData);
        } else {
          // If profiles table doesn't exist, we'll just show the user ID
          setOtherUserInfo({ id: otherUser });
        }
      } catch (error) {
        console.error('Error fetching chat participants:', error);
      }
    };
    
    fetchChatParticipants();
  }, [chatId, userId]);
  
  if (!isOpen) return null;

  const handleSendMessage = async (content: string) => {
    await sendMessage(content);
    
    // Send notification to the other user if we have their ID
    if (otherUserId) {
      const displayName = 
        otherUserInfo?.fullName || 
        otherUserInfo?.email || 
        `User ${userId.substring(0, 8)}...`;
      
      await createNotification({
        userId: otherUserId,
        content: `New message from ${displayName} about "${listingTitle}"`,
        type: 'message',
        relatedId: chatId
      });
    }
    
    if (onMessageSent) {
      onMessageSent();
    }
  };
  
  const handleDeleteChat = async () => {
    if (!chatId) return;
    
    try {
      await deleteChat();
      toast.success("Chat deleted successfully");
      onClose();
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast.error("Failed to delete chat");
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md flex flex-col h-[600px] max-h-[80vh]">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="font-semibold text-lg">
              Chat about: {listingTitle}
            </h2>
            {otherUserInfo && (
              <p className="text-sm text-gray-600 mt-1">
                Chatting with: {otherUserInfo.fullName || otherUserInfo.email || `User ${otherUserId?.substring(0, 8)}...`}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleDeleteChat}
              className="text-red-500 hover:text-red-700"
              title="Delete chat"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              title="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <MessageList 
          messages={messages} 
          currentUserId={userId} 
          isLoading={isLoading}
        />
        
        <ChatInput 
          onSendMessage={handleSendMessage} 
          isDisabled={isLoading || !chatId}
        />
      </div>
    </div>
  );
};

export default ChatModal;
