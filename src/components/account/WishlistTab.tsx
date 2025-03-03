
import React, { useEffect, useState } from "react";
import { ListingCard } from "@/components/listings/ListingCard";
import { useProfile } from "@/contexts/ProfileContext";
import { supabase } from "@/lib/supabase";
import { ListingCard as ListingCardType } from "@/types/listings";
import { Loader2 } from "lucide-react";

export const WishlistTab = () => {
  const { wishlistedItems, setWishlistedItems } = useProfile();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistedItems = async () => {
      setIsLoading(true);
      try {
        // First get the current user
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setIsLoading(false);
          return;
        }

        // Get wishlisted items for the current user
        const { data: wishlistData, error: wishlistError } = await supabase
          .from('wishlists')
          .select('listing_id')
          .eq('user_id', session.user.id);

        if (wishlistError) {
          console.error('Error fetching wishlist:', wishlistError);
          setIsLoading(false);
          return;
        }

        if (wishlistData.length === 0) {
          setWishlistedItems([]);
          setIsLoading(false);
          return;
        }

        // Extract listing IDs
        const listingIds = wishlistData.map(item => item.listing_id);

        // Fetch the actual listings
        const { data: listingsData, error: listingsError } = await supabase
          .from('listings')
          .select('*')
          .in('id', listingIds);

        if (listingsError) {
          console.error('Error fetching listings:', listingsError);
          setIsLoading(false);
          return;
        }

        setWishlistedItems(listingsData as ListingCardType[]);
      } catch (error) {
        console.error('Error in fetching wishlisted items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlistedItems();
  }, [setWishlistedItems]);

  return (
    <div className="bg-white shadow rounded-lg p-6 md:p-8">
      <h1 className="text-2xl font-semibold mb-6">Your Wishlist</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : wishlistedItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Your wishlist is empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {wishlistedItems.map((item, index) => (
            <ListingCard key={item.id} listing={item} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};
