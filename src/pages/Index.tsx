
import { useEffect, useState } from "react";
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
  {
    id: 4,
    title: "Antique Wooden Desk",
    price: 450,
    image: "https://images.unsplash.com/photo-1518733057094-95b53143d2a7?auto=format&fit=crop&q=80",
    location: "North End",
  },
  {
    id: 5,
    title: "Mid-Century Dining Set",
    price: 899,
    image: "https://images.unsplash.com/photo-1615529162924-f8605388461d?auto=format&fit=crop&q=80",
    location: "South Side",
  },
  {
    id: 6,
    title: "Vintage Record Player",
    price: 275,
    image: "https://images.unsplash.com/photo-1542456885-89667376a074?auto=format&fit=crop&q=80",
    location: "Downtown",
  },
  {
    id: 7,
    title: "Artisan Ceramic Vase",
    price: 89,
    image: "https://images.unsplash.com/photo-1578500351865-d6c3706f46bc?auto=format&fit=crop&q=80",
    location: "Arts District",
  },
  {
    id: 8,
    title: "Boho Wall Tapestry",
    price: 65,
    image: "https://images.unsplash.com/photo-1617142108319-66c7ab45c711?auto=format&fit=crop&q=80",
    location: "Cultural Center",
  },
  {
    id: 9,
    title: "Industrial Bar Stools",
    price: 175,
    image: "https://images.unsplash.com/photo-1631891337014-c45549f28587?auto=format&fit=crop&q=80",
    location: "Warehouse District",
  },
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

      {/* Featured Listings */}
      <section className="pb-32 px-4">
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
