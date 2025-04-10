
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface Message {
  id: string;
  created_at: string;
  sender_id: string;
  content: string;
}

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
  onDeleteMessage?: (messageId: string) => void;
}

const ChatMessage = ({ message, isCurrentUser, onDeleteMessage }: ChatMessageProps) => {
  return (
    <div 
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
    >
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            className={`max-w-[80%] p-3 rounded-lg ${
              isCurrentUser
                ? 'bg-green-500 text-white rounded-br-none'
                : 'bg-gray-200 text-gray-800 rounded-bl-none'
            }`}
          >
            <p>{message.content}</p>
            <p className="text-xs opacity-70 mt-1">
              {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </ContextMenuTrigger>
        {isCurrentUser && onDeleteMessage && (
          <ContextMenuContent className="w-48">
            <ContextMenuItem 
              onClick={() => onDeleteMessage(message.id)}
              className="text-red-500 focus:text-red-500 focus:bg-red-50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete message
            </ContextMenuItem>
          </ContextMenuContent>
        )}
      </ContextMenu>
    </div>
  );
};

export default ChatMessage;
