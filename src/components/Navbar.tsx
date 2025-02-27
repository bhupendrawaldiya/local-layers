
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Heart, ShoppingBag, User, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navLinks = [
    { name: "Wishlist", href: "/wishlist", icon: <Heart className="h-5 w-5" /> },
    { name: "Messages", href: "/messages", icon: <MessageSquare className="h-5 w-5" /> },
    { name: "Cart", href: "#", icon: <ShoppingBag className="h-5 w-5" /> },
  ];

  return (
    <nav className="fixed w-full bg-white shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="font-bold text-xl text-blue-600">LocalFinds</span>
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`px-3 py-2 text-sm font-medium rounded-md flex items-center space-x-1 ${
                  location.pathname === link.href
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}

            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/account"
                  className={`px-3 py-2 text-sm font-medium rounded-md flex items-center space-x-1 ${
                    location.pathname === "/account"
                      ? "text-blue-600"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  <User className="h-5 w-5" />
                  <span>Account</span>
                </Link>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="border-gray-300"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/signin">
                  <Button variant="outline" className="border-gray-300">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded="false"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden" id="mobile-menu">
          <div className="pt-2 pb-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`flex items-center px-4 py-2 text-base font-medium ${
                  location.pathname === link.href
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                onClick={closeMenu}
              >
                {link.icon}
                <span className="ml-3">{link.name}</span>
              </Link>
            ))}

            {user ? (
              <>
                <Link
                  to="/account"
                  className={`flex items-center px-4 py-2 text-base font-medium ${
                    location.pathname === "/account"
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={closeMenu}
                >
                  <User className="h-5 w-5" />
                  <span className="ml-3">Account</span>
                </Link>
                <button
                  className="flex w-full items-center px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    handleSignOut();
                    closeMenu();
                  }}
                >
                  <span className="ml-8">Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="flex items-center px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                  onClick={closeMenu}
                >
                  <span className="ml-8">Sign In</span>
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                  onClick={closeMenu}
                >
                  <span className="ml-8">Sign Up</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
