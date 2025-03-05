
import React from "react";
import { Review } from "@/types/listings";

interface ProductReviewsProps {
  reviews: Review[] | undefined;
}

const ProductReviews = ({ reviews }: ProductReviewsProps) => {
  if (!reviews || reviews.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold mb-4">Reviews</h2>
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium text-gray-900">{review.authorName}</div>
              <div className="flex items-center">
                <span className="text-amber-500 mr-1">★</span>
                <span>{review.rating}</span>
              </div>
            </div>
            <p className="text-gray-700">{review.comment}</p>
            <p className="text-xs text-gray-500 mt-2">{new Date(review.date).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductReviews;
