import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ChatModal from "@/components/chat/ChatModal";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Chat {
  id: string;
  created_at: string;
  listing_id: number;
  listing: {
    title: string;
    image: string;
  };
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
}

const Messages = () => {
  const navigate = useNavigate();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to view your messages");
        navigate("/signin");
        return;
      }
      setUser(session.user);
      fetchChats(session.user.id);

      const channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'chats'
          },
          (payload) => {
            console.log('Chat change detected:', payload);
            fetchChats(session.user.id);
          }
        )
        .subscribe();

      const messagesChannel = supabase
        .channel('messages-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages'
          },
          (payload) => {
            console.log('New message detected:', payload);
            fetchChats(session.user.id);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
        supabase.removeChannel(messagesChannel);
      };
    };

    checkAuth();
  }, [navigate, refreshTrigger]);

  const fetchChats = async (userId: string) => {
    setIsLoading(true);
    try {
      console.log('Fetching chats for user:', userId);
      const { data, error } = await supabase
        .from('chats')
        .select(`
          *,
          listing:listings(id, title, image)
        `)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

      if (error) throw error;

      console.log('Chats data:', data);

      const chatsWithLastMessage = await Promise.all(data.map(async (chat) => {
        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select('content, created_at, sender_id')
          .eq('chat_id', chat.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (messagesError) throw messagesError;

        return {
          ...chat,
          last_message: messages && messages.length > 0 ? messages[0] : undefined
        };
      }));

      console.log('Chats with last message:', chatsWithLastMessage);
      setChats(chatsWithLastMessage);
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast.error('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      console.log('Deleting chat:', chatId);
      
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('chat_id', chatId);
      
      if (messagesError) {
        console.error('Error deleting messages:', messagesError);
        throw messagesError;
      }
      
      console.log('Messages deleted successfully, now deleting chat');
      
      const { error: chatError } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId);
      
      if (chatError) {
        console.error('Error deleting chat:', chatError);
        throw chatError;
      }
      
      console.log('Chat deleted successfully');
      
      setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
      
      toast.success("Chat deleted successfully");
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast.error("Failed to delete chat");
    }
  };

  const handleChatUpdate = () => {
    if (user) {
      fetchChats(user.id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Messages</h1>

        {isLoading ? (
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <p className="text-gray-500">Loading conversations...</p>
          </div>
        ) : chats.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">No conversations yet</h2>
            <p className="text-gray-500 mb-6">
              Start browsing listings and contact sellers to begin a conversation
            </p>
            <Button onClick={() => navigate("/")} className="bg-green-600 hover:bg-green-700">Browse Listings</Button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {chats.map((chat) => (
              <div 
                key={chat.id}
                className="p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-16 h-16 rounded-md bg-gray-200 overflow-hidden cursor-pointer"
                    onClick={() => handleChatSelect(chat)}
                  >
                    {chat.listing && chat.listing.image ? (
                      <img 
                        src={chat.listing.image} 
                        alt={chat.listing?.title || 'Product'}
                        className="w-full h-full object-cover" 
                        onError={(e) => (e.currentTarget.src = '/placeholder.svg')}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                  </div>
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => handleChatSelect(chat)}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-gray-900">
                        {chat.listing?.title || 'Unknown Product'}
                      </h3>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-gray-400 hover:text-red-500"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Chat</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this chat? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteChat(chat.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    {chat.last_message ? (
                      <>
                        <p className="text-sm line-clamp-1 mt-1 text-gray-600">
                          {chat.last_message.content}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          {new Date(chat.last_message.created_at).toLocaleString()}
                        </p>
                      </>
                    ) : (
                      <p className="text-gray-500 text-sm italic mt-1">No messages yet</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedChat && user && (
        <ChatModal 
          isOpen={!!selectedChat}
          onClose={() => {
            setSelectedChat(null);
            handleChatUpdate();
          }}
          listingId={selectedChat.listing_id}
          listingTitle={selectedChat.listing?.title || 'Unknown Product'}
          userId={user.id}
          onMessageSent={handleChatUpdate}
          chatId={selectedChat.id}
        />
      )}
    </div>
  );
};

export default Messages;
