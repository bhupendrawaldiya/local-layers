
import { Heart } from "lucide-react";
import { useState } from "react";
import { ListingCard as ListingCardType } from "@/types/listings";

interface ListingCardProps {
  listing: ListingCardType;
  index: number;
}

export const ListingCard = ({ listing, index }: ListingCardProps) => {
  const [isWishlisted, setIsWishlisted] = useState(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      const wishlist = JSON.parse(savedWishlist);
      return wishlist.includes(listing.id);
    }
    return false;
  });

  const toggleWishlist = () => {
    const savedWishlist = localStorage.getItem('wishlist') || '[]';
    const wishlist = JSON.parse(savedWishlist);
    
    if (isWishlisted) {
      const newWishlist = wishlist.filter((id: number) => id !== listing.id);
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    } else {
      wishlist.push(listing.id);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
    
    setIsWishlisted(!isWishlisted);
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
    </div>
  );
};
