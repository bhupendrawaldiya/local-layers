
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import { useChat } from "@/hooks/useChat";

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
  
  if (!isOpen) return null;

  const handleSendMessage = (content: string) => {
    sendMessage(content);
    if (onMessageSent) {
      onMessageSent();
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md flex flex-col h-[600px] max-h-[80vh]">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-lg">
            Chat about: {listingTitle}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
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
