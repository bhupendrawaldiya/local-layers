
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Heart, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-semibold text-gray-900">
              LocalFinds
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <Heart className="h-4 w-4 mr-2" />
              Wishlist
            </Button>
            {user ? (
              <Link to="/account">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <UserIcon className="h-4 w-4 mr-2" />
                  Account
                </Button>
              </Link>
            ) : (
              <Link to="/signin">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <UserIcon className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
            <Button size="sm">List an Item</Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden h-screen bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Button variant="ghost" size="sm" className="w-full justify-start text-gray-600 hover:text-gray-900">
              <Heart className="h-4 w-4 mr-2" />
              Wishlist
            </Button>
            {user ? (
              <Link to="/account">
                <Button variant="ghost" size="sm" className="w-full justify-start text-gray-600 hover:text-gray-900">
                  <UserIcon className="h-4 w-4 mr-2" />
                  Account
                </Button>
              </Link>
            ) : (
              <Link to="/signin">
                <Button variant="ghost" size="sm" className="w-full justify-start text-gray-600 hover:text-gray-900">
                  <UserIcon className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
            <Button size="sm" className="w-full">List an Item</Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

