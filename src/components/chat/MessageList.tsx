
import { useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";

interface Message {
  id: string;
  created_at: string;
  sender_id: string;
  content: string;
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  isLoading: boolean;
  onDeleteMessage?: (messageId: string) => void;
}

const MessageList = ({ messages, currentUserId, isLoading, onDeleteMessage }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-500">Loading conversation...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-500">Start the conversation by sending a message</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message}
          isCurrentUser={message.sender_id === currentUserId}
          onDeleteMessage={onDeleteMessage}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
