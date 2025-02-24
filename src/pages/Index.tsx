
import { useEffect, useState } from "react";
import { Search, Info, MapPin, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

interface Review {
  id: number;
  authorName: string;
  rating: number;
  comment: string;
  date: string;
}

interface ListingCard {
  id: number;
  title: string;
  price: number;
  image: string;
  location: string;
  reviews: Review[];
}

const featuredListings: ListingCard[] = [
  {
    id: 1,
    title: "Vintage Leather Chair",
    price: 299,
    image: "https://images.unsplash.com/photo-1519947486511-46149fa0a254?auto=format&fit=crop&q=80",
    location: "Downtown",
    reviews: [
      {
        id: 1,
        authorName: "John D.",
        rating: 5,
        comment: "Beautiful chair, exactly as described!",
        date: "2024-03-15"
      },
      {
        id: 2,
        authorName: "Sarah M.",
        rating: 4,
        comment: "Great quality, but shipping took longer than expected",
        date: "2024-03-10"
      }
    ]
  },
  {
    id: 2,
    title: "Handcrafted Coffee Table",
    price: 199,
    image: "https://images.unsplash.com/photo-1532372320978-9a4bf69426c9?auto=format&fit=crop&q=80",
    location: "Westside",
    reviews: [
      {
        id: 3,
        authorName: "Mike R.",
        rating: 5,
        comment: "Stunning craftsmanship!",
        date: "2024-03-12"
      }
    ]
  },
  {
    id: 3,
    title: "Modern Floor Lamp",
    price: 149,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80",
    location: "Eastside",
    reviews: []
  },
  {
    id: 4,
    title: "Antique Wooden Desk",
    price: 450,
    image: "https://images.unsplash.com/photo-1518733057094-95b53143d2a7?auto=format&fit=crop&q=80",
    location: "North End",
    reviews: []
  },
  {
    id: 5,
    title: "Mid-Century Dining Set",
    price: 899,
    image: "https://images.unsplash.com/photo-1615529162924-f8605388461d?auto=format&fit=crop&q=80",
    location: "South Side",
    reviews: []
  },
  {
    id: 6,
    title: "Vintage Record Player",
    price: 275,
    image: "https://images.unsplash.com/photo-1542456885-89667376a074?auto=format&fit=crop&q=80",
    location: "Downtown",
    reviews: []
  },
  {
    id: 7,
    title: "Artisan Ceramic Vase",
    price: 89,
    image: "https://images.unsplash.com/photo-1578500351865-d6c3706f46bc?auto=format&fit=crop&q=80",
    location: "Arts District",
    reviews: []
  },
  {
    id: 8,
    title: "Boho Wall Tapestry",
    price: 65,
    image: "https://images.unsplash.com/photo-1617142108319-66c7ab45c711?auto=format&fit=crop&q=80",
    location: "Cultural Center",
    reviews: []
  },
  {
    id: 9,
    title: "Industrial Bar Stools",
    price: 175,
    image: "https://images.unsplash.com/photo-1631891337014-c45549f28587?auto=format&fit=crop&q=80",
    location: "Warehouse District",
    reviews: []
  }
];

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredListings, setFilteredListings] = useState(featuredListings);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
        }
      });
    });

    document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleSearch = () => {
    const filtered = featuredListings.filter((listing) =>
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredListings(filtered);
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (e.target.value === "") {
      setFilteredListings(featuredListings);
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <section className="pt-20 pb-32 px-4">
        <div className="max-w-7xl mx-auto pt-20">
          <div className="text-center space-y-8 fade-in opacity-0 translate-y-4 transition-all duration-700">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
              Discover Local Treasures
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Buy and sell unique items in your neighborhood. Connect with local sellers and find hidden gems.
            </p>
            
            <div className="max-w-xl mx-auto mt-8">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for items near you..."
                  className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:border-gray-300 transition-all"
                  value={searchTerm}
                  onChange={handleSearchInput}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button 
                  className="absolute right-2 top-2"
                  onClick={handleSearch}
                >
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">
            {filteredListings.length === 0 
              ? "No results found" 
              : searchTerm 
                ? `Search Results (${filteredListings.length})` 
                : "Featured Listings"
            }
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing, index) => (
              <div
                key={listing.id}
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
            ))}
          </div>
        </div>
      </section>

      <section className="pb-32 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">Latest Reviews</h2>
          <div className="grid grid-cols-1 gap-8">
            {filteredListings.map((listing) => (
              listing.reviews.length > 0 && (
                <div key={`reviews-${listing.id}`} className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">{listing.title}</h3>
                  <div className="flex gap-4 overflow-x-auto pb-4">
                    {listing.reviews.map((review) => (
                      <div
                        key={review.id}
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
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 fade-in opacity-0 translate-y-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">About LocalFinds</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Connecting local buyers and sellers in a trusted community marketplace
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 fade-in opacity-0 translate-y-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-6">
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Local Focus</h3>
              <p className="text-gray-600">
                Discover unique items from sellers in your neighborhood and support your local community.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Trusted Community</h3>
              <p className="text-gray-600">
                Join a verified network of buyers and sellers committed to safe and reliable transactions.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-6">
                <Info className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Easy to Use</h3>
              <p className="text-gray-600">
                Simple and intuitive platform for buying, selling, and connecting with your community.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
