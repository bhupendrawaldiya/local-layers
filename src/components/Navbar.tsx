
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import {
  Home, Heart, MessageSquare, PackageSearch, UserCircle, LogOut, ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
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

            {/* Products Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              >
                <PackageSearch className="h-5 w-5" />
                <span>Products</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {isDropdownOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-50">
                  {categories.length > 0 ? (
                    categories.map((cat, index) => (
                      <Link
                        key={index}
                        to={`/products/${cat}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        {cat}
                      </Link>
                    ))
                  ) : (
                    <p className="px-4 py-2 text-sm text-gray-500">No Categories</p>
                  )}
                </div>
              )}
            </div>

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
