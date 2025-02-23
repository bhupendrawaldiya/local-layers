
import { useEffect } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

interface ListingCard {
  id: number;
  title: string;
  price: number;
  image: string;
  location: string;
}

const featuredListings: ListingCard[] = [
  {
    id: 1,
    title: "Vintage Leather Chair",
    price: 299,
    image: "https://images.unsplash.com/photo-1519947486511-46149fa0a254?auto=format&fit=crop&q=80",
    location: "Downtown",
  },
  {
    id: 2,
    title: "Handcrafted Coffee Table",
    price: 199,
    image: "https://images.unsplash.com/photo-1532372320978-9a4bf69426c9?auto=format&fit=crop&q=80",
    location: "Westside",
  },
  {
    id: 3,
    title: "Modern Floor Lamp",
    price: 149,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80",
    location: "Eastside",
  },
];

const Index = () => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4">
        <div className="max-w-7xl mx-auto pt-20">
          <div className="text-center space-y-8 fade-in opacity-0 translate-y-4 transition-all duration-700">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
              Discover Local Treasures
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Buy and sell unique items in your neighborhood. Connect with local sellers and find hidden gems.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-xl mx-auto mt-8">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for items near you..."
                  className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:border-gray-300 transition-all"
                />
                <Button className="absolute right-2 top-2">
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="pb-32 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">Featured Listings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map((listing, index) => (
              <div
                key={listing.id}
                className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 fade-in opacity-0 translate-y-4`}
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
    </div>
  );
};

export default Index;
