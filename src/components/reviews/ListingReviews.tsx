
import { ListingCard } from "@/types/listings";
import { ReviewCard } from "./ReviewCard";

interface ListingReviewsProps {
  listing: ListingCard;
}

export const ListingReviews = ({ listing }: ListingReviewsProps) => {
  if (listing.reviews.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">{listing.title}</h3>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {listing.reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
};
