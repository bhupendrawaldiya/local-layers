
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import { useChat } from "@/hooks/useChat";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface UserInfo {
  id: string;
  fullName?: string;
  email?: string;
  location?: string;
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
  
  const { chatId, messages, isLoading, sendMessage } = useChat(userId, listingId, existingChatId);
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [otherUserInfo, setOtherUserInfo] = useState<UserInfo | null>(null);
  
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
        
        // First try to get profile data from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, location, avatar_url')
          .eq('id', otherUser)
          .single();
          
        if (!profileError && profileData) {
          setOtherUserInfo({ 
            id: otherUser,
            fullName: profileData.full_name,
            location: profileData.location
          });
          return;
        }
        
        // Fallback to user metadata from auth
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(otherUser);
        
        if (authError) {
          console.error('Error fetching user:', authError);
          // Fall back to just a user ID with nice formatting
          setOtherUserInfo({ 
            id: otherUser,
            fullName: `User ${otherUser.substring(0, 4)}`
          });
          return;
        }
        
        if (authUser && authUser.user) {
          setOtherUserInfo({
            id: otherUser,
            email: authUser.user.email,
            fullName: authUser.user.user_metadata?.full_name || authUser.user.email?.split('@')[0],
            location: authUser.user.user_metadata?.location
          });
        } else {
          // Fallback if no user data found
          setOtherUserInfo({ 
            id: otherUser,
            fullName: `User ${otherUser.substring(0, 4)}`
          });
        }
        
      } catch (error) {
        console.error('Error fetching chat participants:', error);
        // Fallback to a nicer display of the user ID
        if (otherUserId) {
          setOtherUserInfo({ 
            id: otherUserId,
            fullName: `User ${otherUserId.substring(0, 4)}`
          });
        }
      }
    };
    
    fetchChatParticipants();
  }, [chatId, userId, otherUserId]);
  
  if (!isOpen) return null;

  const handleSendMessage = async (content: string) => {
    await sendMessage(content);
    
    if (onMessageSent) {
      onMessageSent();
    }
  };
  
  // Format the user display name nicely
  const userDisplayName = otherUserInfo?.fullName || 
                          otherUserInfo?.email || 
                          (otherUserId ? `User ${otherUserId.substring(0, 4)}...` : 'Unknown User');
  
  // Format location if available
  const locationDisplay = otherUserInfo?.location ? `(${otherUserInfo.location})` : '';
  
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md flex flex-col h-[600px] max-h-[80vh]">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="font-semibold text-lg">
              Chat about: {listingTitle}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Chatting with: {userDisplayName} {locationDisplay}
            </p>
          </div>
          <div className="flex items-center gap-2">
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
