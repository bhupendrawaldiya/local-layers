import React, { useState, useEffect } from "react";
import { Review } from "@/types/listings";
import { Skeleton } from "@/components/ui/skeleton";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

interface ProductReviewsProps {
  reviews: Review[] | undefined;
  isLoading?: boolean;
  listingId: number;
  onReviewAdded: () => void;
}

const ProductReviews = ({ reviews, isLoading = false, listingId, onReviewAdded }: ProductReviewsProps) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [user, setUser] = useState<null | { id: string }>(null);

  useEffect(() => {
    // Get current auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="mt-8 bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-green-700">Reviews</h2>
        <div className="space-y-4">
          {[1, 2].map((item) => (
            <div key={item} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-12" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-24 mt-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="mt-8 bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-green-700">Reviews</h2>
        {user && !showReviewForm && (
          <Button onClick={() => setShowReviewForm(true)}>
            Write a Review
          </Button>
        )}
      </div>

      {showReviewForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <ReviewForm
            listingId={listingId}
            onSuccess={() => {
              setShowReviewForm(false);
              onReviewAdded();
            }}
          />
        </div>
      )}
      
      {!reviews || reviews.length === 0 ? (
        <p className="text-gray-500 text-center py-6">
          No reviews yet. Be the first to review this product!
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div 
              key={review.id} 
              className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-100 hover:border-green-100 transition-colors"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="font-medium text-gray-900">{review.authorName}</div>
                <div className="flex items-center bg-green-50 px-2 py-1 rounded-full">
                  <span className="text-green-500 mr-1">★</span>
                  <span className="text-green-700 font-medium">{review.rating}</span>
                </div>
              </div>
              <p className="text-gray-700">{review.comment}</p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(review.date).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
