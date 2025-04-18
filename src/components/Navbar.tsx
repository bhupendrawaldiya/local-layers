
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import {
  Home, Heart, MessageSquare, PackageSearch, UserCircle, LogOut
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

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("categories");
  
      if (error) {
        console.error("Error fetching categories:", error.message);
        return;
      }
  
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const NavLink = ({ to, icon: Icon, label, isMobile = false }) => {
    const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
    
    const handleClick = () => {
      isMobile && setIsOpen(false);
    };
    
    return (
      <Link
        to={to}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md transition-colors relative",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
          isMobile && "w-full"
        )}
        onClick={handleClick}
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

          <div className="hidden md:flex items-center space-x-1">
            <NavLink to="/" icon={Home} label="Home" />

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
