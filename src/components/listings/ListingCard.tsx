
import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { ListingCard as ListingCardType } from "@/types/listings";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface ListingCardProps {
  listing: ListingCardType;
  index: number;
}

export const ListingCard = ({ listing, index }: ListingCardProps) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkWishlistStatus(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkWishlistStatus(session.user.id);
      } else {
        setIsWishlisted(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkWishlistStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select()
        .eq('user_id', userId)
        .eq('listing_id', listing.id)
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

  const toggleWishlist = async () => {
    if (!user) {
      toast.error("Please sign in to add items to your wishlist");
      return;
    }

    try {
      if (isWishlisted) {
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listing.id);

        if (error) throw error;
        
        setIsWishlisted(false);
        toast.success("Removed from wishlist");
      } else {
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
    <div
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 fade-in opacity-0 translate-y-4 relative hover:scale-up"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleWishlist();
        }}
        className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-sm p-2 rounded-full 
                 shadow-sm hover:shadow-md transition-all duration-200"
      >
        <Heart
          className={`h-5 w-5 transition-colors ${
            isWishlisted ? "fill-red-500 stroke-red-500" : "stroke-gray-600"
          }`}
        />
      </button>
      <Link to={`/product/${listing.id}`} className="block">
        <div className="aspect-w-16 aspect-h-9">
          <img
            src={listing.image}
            alt={listing.title}
            className="object-cover w-full h-48"
          />
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{listing.title}</h3>
              <p className="text-sm text-gray-500">{listing.location}</p>
            </div>
            <p className="text-lg font-semibold text-gray-900">${listing.price}</p>
          </div>
        </div>
      </Link>
    </div>
  );
};
