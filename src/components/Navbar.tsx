
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Home, Heart, MessageSquare, PackageSearch, UserCircle, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

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

  const NavLink = ({
    to,
    icon: Icon,
    label,
    isMobile = false,
  }: {
    to: string;
    icon: React.ElementType;
    label: string;
    isMobile?: boolean;
  }) => {
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
    <nav className="fixed w-full bg-white/80 backdrop-blur-md shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img src="/favicon.ico" alt="Logo" className="h-8 w-8 mr-2" />
              <span className="text-xl font-bold text-gray-900">Local Find</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink to="/" icon={Home} label="Home" />
            <NavLink to="/products" icon={PackageSearch} label="Products" />
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

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isOpen ? "hidden" : "block"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isOpen ? "block" : "hidden"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? "block" : "hidden"} md:hidden bg-white shadow-md`}>
        <div className="pt-2 pb-3 space-y-1 px-4">
          <NavLink to="/" icon={Home} label="Home" isMobile />
          <NavLink to="/products" icon={PackageSearch} label="Products" isMobile />
          {user && (
            <>
              <NavLink to="/wishlist" icon={Heart} label="Wishlist" isMobile />
              <NavLink to="/messages" icon={MessageSquare} label="Messages" isMobile />
              <NavLink to="/account" icon={UserCircle} label="Account" isMobile />
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-3 py-2 w-full text-left rounded-md transition-colors text-red-500 hover:bg-red-50"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </>
          )}
          {!user && (
            <div className="flex flex-col space-y-2 pt-2">
              <Link to="/signin" className="w-full">
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup" className="w-full">
                <Button className="w-full">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
