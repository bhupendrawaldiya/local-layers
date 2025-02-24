
import { Review } from "@/types/listings";

const platformReviews: Review[] = [
  {
    id: 1,
    authorName: "Sarah M.",
    rating: 5,
    comment: "LocalFinds has transformed how I discover unique items in my community. The platform is so easy to use!",
    date: "2024-03-15"
  },
  {
    id: 2,
    authorName: "John D.",
    rating: 5,
    comment: "I love being able to connect with local sellers. The community here is amazing!",
    date: "2024-03-10"
  },
  {
    id: 3,
    authorName: "Emily R.",
    rating: 5,
    comment: "Found so many incredible vintage pieces through LocalFinds. It's become my go-to marketplace!",
    date: "2024-03-08"
  },
  {
    id: 4,
    authorName: "Michael P.",
    rating: 5,
    comment: "Great platform for both buyers and sellers. The user experience is fantastic!",
    date: "2024-03-05"
  }
];

export const ListingReviews = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-900 text-center mb-8">What Our Users Say</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 animate-slide-in-right">
        {platformReviews.map((review) => (
          <div
            key={review.id}
            className="flex-none w-80 bg-white p-6 rounded-lg shadow-md"
          >
            <div className="flex items-center mb-4">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{review.authorName}</h4>
                <div className="flex items-center">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <svg
                      key={i}
                      className="w-4 h-4 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-gray-600">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
