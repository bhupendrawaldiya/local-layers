
import React from "react";
import { Button } from "@/components/ui/button";
import WishlistButton from "./WishlistButton";
import { ListingCard as ListingCardType } from "@/types/listings";
import type { User } from "@supabase/supabase-js";

interface ProductInfoProps {
  product: ListingCardType;
  isWishlisted: boolean;
  user: User | null;
  onWishlistChange: (isWishlisted: boolean) => void;
  onContactSeller: () => void;
}

const ProductInfo = ({ 
  product, 
  isWishlisted, 
  user, 
  onWishlistChange,
  onContactSeller
}: ProductInfoProps) => {
  return (
    <div className="p-8 md:w-1/2">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h1>
          <p className="text-gray-600 mb-4">{product.location}</p>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-3xl font-bold text-gray-900">${product.price}</p>
          <WishlistButton 
            isWishlisted={isWishlisted}
            user={user}
            productId={product.id}
            onWishlistChange={onWishlistChange}
          />
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Description</h2>
        <p className="text-gray-700">
          This beautiful {product.title.toLowerCase()} is located in {product.location}. 
          Perfect for any home or office space. Contact us for more details or to arrange a viewing.
        </p>
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Location</p>
            <p className="text-gray-700">{product.location}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Listed on</p>
            <p className="text-gray-700">
              {product.created_at ? new Date(product.created_at).toLocaleDateString() : 'Unknown'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <Button 
          className="w-full" 
          size="lg"
          onClick={onContactSeller}
        >
          Contact Seller
        </Button>
      </div>
    </div>
  );
};

export default ProductInfo;
