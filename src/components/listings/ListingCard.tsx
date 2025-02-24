
import { Star } from "lucide-react";
import { ListingCard as ListingCardType } from "@/types/listings";

interface ListingCardProps {
  listing: ListingCardType;
  index: number;
}

export const ListingCard = ({ listing, index }: ListingCardProps) => {
  return (
    <div
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 fade-in opacity-0 translate-y-4"
      style={{ animationDelay: `${index * 150}ms` }}
    >
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
            <h3 className="text-lg font-semibold text-gray-900">{listing.title}</h3>
            <p className="text-sm text-gray-500">{listing.location}</p>
          </div>
          <p className="text-lg font-semibold text-gray-900">${listing.price}</p>
        </div>
      </div>
    </div>
  );
};
