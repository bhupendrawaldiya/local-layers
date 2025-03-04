
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ListingCard as ListingCardType } from "@/types/listings";

export interface ListingCardProps {
  listing: ListingCardType;
  index: number;
}

export const ListingCard = ({ listing, index }: ListingCardProps) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get current user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkWishlistStatus(session.user.id, listing.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkWishlistStatus(session.user.id, listing.id);
      } else {
        setIsWishlisted(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [listing.id]);

  const checkWishlistStatus = async (userId: string, listingId: number) => {
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select()
        .eq('user_id', userId)
        .eq('listing_id', listingId)
        .maybeSingle();

      if (error) {
        console.error('Error checking wishlist status:', error);
        return;
      }

      setIsWishlisted(!!data);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error("Please sign in to add items to your wishlist");
      return;
    }

    try {
      if (isWishlisted) {
        // Remove from wishlist
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listing.id);

        if (error) throw error;
        
        setIsWishlisted(false);
        toast.success("Removed from wishlist");
      } else {
        // Add to wishlist
        const { error } = await supabase
          .from('wishlists')
          .insert([
            { user_id: user.id, listing_id: listing.id }
          ]);

        if (error) throw error;
        
        setIsWishlisted(true);
        toast.success("Added to wishlist");
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      toast.error("Failed to update wishlist");
    }
  };

  return (
    <Link
      to={`/product/${listing.id}`}
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative group"
    >
      <div className="relative">
        {/* Image */}
        <div className="aspect-video bg-gray-200">
          <img
            src={listing.image || "/placeholder.svg"}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Wishlist button */}
        <button 
          className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full z-10 transition-all hover:bg-white"
          onClick={toggleWishlist}
        >
          <Heart
            className={`h-5 w-5 transition-colors ${
              isWishlisted ? "fill-red-500 stroke-red-500" : "stroke-gray-600"
            }`}
          />
        </button>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-gray-900 line-clamp-1">
            {listing.title}
          </h3>
        </div>
        <p className="mt-1 text-sm text-gray-500">{listing.location}</p>
        <div className="mt-3 flex justify-between items-center">
          <p className="text-lg font-semibold text-gray-900">${listing.price.toLocaleString()}</p>
          <p className="text-xs text-gray-500">
            {listing.created_at
              ? new Date(listing.created_at).toLocaleDateString()
              : ""}
          </p>
        </div>
      </div>
    </Link>
  );
};
