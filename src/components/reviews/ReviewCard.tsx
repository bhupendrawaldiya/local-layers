
import { Star } from "lucide-react";
import { Review } from "@/types/listings";

interface ReviewCardProps {
  review: Review;
}

const renderStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, index) => (
    <Star
      key={index}
      size={16}
      className={`${
        index < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
      }`}
    />
  ));
};

export const ReviewCard = ({ review }: ReviewCardProps) => {
  return (
    <div
      className="min-w-[300px] bg-white p-6 rounded-lg shadow-sm animate-[slide-in-right_0.5s_ease-out] hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="font-medium text-gray-900">
          {review.authorName}
        </p>
        <div className="flex">
          {renderStars(review.rating)}
        </div>
      </div>
      <p className="text-gray-600 mb-2">{review.comment}</p>
      <p className="text-sm text-gray-400">
        {new Date(review.date).toLocaleDateString()}
      </p>
    </div>
  );
};
