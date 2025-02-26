
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ListingCard } from "@/components/listings/ListingCard";
import Navbar from "@/components/Navbar";
import type { ListingCard as ListingCardType } from "@/types/listings";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";

const Wishlist = () => {
  const [wishlistedItems, setWishlistedItems] = useState<ListingCardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchWishlistedItems(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchWishlistedItems(session.user.id);
      } else {
        setWishlistedItems([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchWishlistedItems = async (userId: string) => {
    setIsLoading(true);
    try {
      const { data: wishlistData, error: wishlistError } = await supabase
        .from('wishlists')
        .select(`
          listing_id,
          listings:listings (
            id,
            title,
            price,
            image,
            location,
            created_at
          )
        `)
        .eq('user_id', userId);

      if (wishlistError) {
        console.error('Error fetching wishlist:', wishlistError);
        toast.error('Failed to load wishlist items');
        return;
      }

      const listings = wishlistData.map(item => item.listings);
      setWishlistedItems(listings);
    } catch (error) {
      console.error('Error processing wishlist data:', error);
      toast.error('Failed to process wishlist data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <h1 className="text-2xl font-semibold mb-8">Your Wishlist</h1>
        
        {!user && (
          <div className="text-center py-12">
            <p className="text-gray-600">Please sign in to view your wishlist</p>
          </div>
        )}
        
        {user && isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading your wishlist...</p>
          </div>
        )}
        
        {user && !isLoading && wishlistedItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">Your wishlist is empty</p>
          </div>
        )}
        
        {user && !isLoading && wishlistedItems.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {wishlistedItems.map((item, index) => (
              <ListingCard key={item.id} listing={item} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
