
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import {
  Home, Heart, MessageSquare, PackageSearch, UserCircle, LogOut, ChevronDown, Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import NotificationList from "./notifications/NotificationList";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("categories");
  
      if (error) {
        console.error("Error fetching categories:", error.message);
        return;
      }
  
      // Extract unique category names
      const uniqueCategories = [
        ...new Set(data.flatMap((listing) => listing.categories ?? [])),
      ];
  
      setCategories(uniqueCategories);
    };
  
    fetchCategories();
  }, []);
  
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Fetch notifications for the current user
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    };

    fetchNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new;
          setNotifications(current => [newNotification, ...current.slice(0, 9)]);
          setUnreadCount(count => count + 1);
          
          // Show a toast for the new notification
          toast({
            title: "New Notification",
            description: newNotification.content,
            duration: 5000,
          });
        }
      )
      .subscribe();

    // Also listen for updates (marking as read)
    const updateChannel = supabase
      .channel('schema-db-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          setNotifications(current => 
            current.map(notif => 
              notif.id === payload.new.id ? payload.new : notif
            )
          );
          
          // Recalculate unread count
          setUnreadCount(current => 
            current - (payload.old.is_read === false && payload.new.is_read === true ? 1 : 0)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(updateChannel);
    };
  }, [user, toast]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const markAllAsRead = async () => {
    if (!user || unreadCount === 0) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking notifications as read:', error);
      return;
    }

    setNotifications(current => 
      current.map(notif => ({ ...notif, is_read: true }))
    );
    setUnreadCount(0);
  };

  const NavLink = ({ to, icon: Icon, label, isMobile = false }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
          isMobile && "w-full"
        )}
        onClick={() => isMobile && setIsOpen(false)}
      >
        <Icon className="h-5 w-5" />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <nav className="fixed w-full bg-white/80 backdrop-blur-md shadow-sm z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img src="/favicon.ico" alt="Logo" className="h-8 w-8 mr-2" />
              <span className="text-xl font-bold text-gray-900">Local Find</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink to="/" icon={Home} label="Home" />

            {/* Products with Dropdown on Hover */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900">
                    <PackageSearch className="h-5 w-5" />
                    <span>Products</span>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-1 p-2 w-[200px]">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/products"
                            className="block w-full px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded-md"
                          >
                            All Products
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      {categories.map((category, index) => (
                        <li key={index}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={`/products/${category}`}
                              className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                            >
                              {category}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {user && (
              <>
                <NavLink to="/wishlist" icon={Heart} label="Wishlist" />
                <NavLink to="/messages" icon={MessageSquare} label="Messages" />
                
                {/* Notifications */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="relative flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-gray-600 hover:bg-gray-100 hover:text-gray-900">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="end">
                    <NotificationList 
                      notifications={notifications} 
                      onMarkAllRead={markAllAsRead}
                    />
                  </PopoverContent>
                </Popover>
                
                <NavLink to="/account" icon={UserCircle} label="Account" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="ml-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Sign Out
                </Button>
              </>
            )}
            {!user && (
              <>
                <Link to="/signin">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
