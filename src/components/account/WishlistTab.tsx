
import React from "react";
import { ListingCard } from "@/components/listings/ListingCard";
import { useProfile } from "@/contexts/ProfileContext";

export const WishlistTab = () => {
  const { wishlistedItems } = useProfile();

  return (
    <div className="bg-white shadow rounded-lg p-6 md:p-8">
      <h1 className="text-2xl font-semibold mb-6">Your Wishlist</h1>
      
      {wishlistedItems.length === 0 ? (
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
