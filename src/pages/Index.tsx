
import { useEffect, useState } from "react";
import { Hero } from "@/components/home/Hero";
import { ListingCard as ListingCardComponent } from "@/components/listings/ListingCard";
import { ListingReviews } from "@/components/reviews/ListingReviews";
import { AboutSection } from "@/components/home/AboutSection";
import Navbar from "@/components/Navbar";
import { ListingCard } from "@/types/listings";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

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
  const [showWishlist, setShowWishlist] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [wishlistedIds, setWishlistedIds] = useState<number[]>([]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchWishlistedItems(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchWishlistedItems(session.user.id);
      } else {
        setWishlistedIds([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchWishlistedItems = async (userId: string) => {
    const { data, error } = await supabase
      .from('wishlists')
      .select('listing_id')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching wishlist:', error);
      return;
    }

    setWishlistedIds(data.map(item => item.listing_id));
  };

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
    let filtered = featuredListings;
    
    if (searchTerm) {
      filtered = featuredListings.filter((listing) =>
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (showWishlist) {
      filtered = filtered.filter(listing => wishlistedIds.includes(listing.id));
    }

    setFilteredListings(filtered);
  };

  useEffect(() => {
    handleSearch();
  }, [showWishlist, wishlistedIds]);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (e.target.value === "") {
      setFilteredListings(showWishlist ? [] : featuredListings);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <Hero 
        searchTerm={searchTerm}
        onSearchChange={handleSearchInput}
        onSearch={handleSearch}
      />

      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
              {filteredListings.length === 0 
                ? "No results found" 
                : searchTerm 
                  ? `Search Results (${filteredListings.length})` 
                  : showWishlist
                    ? "Your Wishlist"
                    : "Featured Listings"
              }
            </h2>
            <Button
              onClick={() => setShowWishlist(!showWishlist)}
              variant="outline"
              className="text-sm"
            >
              {showWishlist ? "Show All Listings" : "View Wishlist"}
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredListings.map((listing, index) => (
              <ListingCardComponent
                key={listing.id}
                listing={listing}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {!user && (
        <>
          <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
              <ListingReviews />
            </div>
          </section>

          <AboutSection />
        </>
      )}
    </div>
  );
};

export default Index;

