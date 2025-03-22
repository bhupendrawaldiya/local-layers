
import React from "react";
import { Heart } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

interface WishlistButtonProps {
  isWishlisted: boolean;
  user: User | null;
  productId: number;
  onWishlistChange: (isWishlisted: boolean) => void;
}

const WishlistButton = ({ isWishlisted, user, productId, onWishlistChange }: WishlistButtonProps) => {
  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    
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
          .eq('listing_id', productId);

        if (error) throw error;
        
        onWishlistChange(false);
        toast.success("Removed from wishlist");
      } else {
        const { error } = await supabase
          .from('wishlists')
          .insert([
            { user_id: user.id, listing_id: productId }
          ]);

        if (error) throw error;
        
        onWishlistChange(true);
        toast.success("Added to wishlist");
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      toast.error("Failed to update wishlist");
    }
  };

  return (
    <button
      onClick={toggleWishlist}
      className="mt-4 flex items-center bg-white border border-gray-300 rounded-full px-4 py-2 hover:bg-gray-50 transition-colors cl-black"
    >
      <Heart
        className={`h-5 w-5 mr-2 transition-colors ${
          isWishlisted ? "fill-red-500 stroke-red-500" : "stroke-gray-600"
        }`}
      />
      {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
    </button>
  );
};

export default WishlistButton;
