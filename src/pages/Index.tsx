
import { useEffect, useState, useRef } from "react";
import { Hero } from "@/components/home/Hero";
import { ListingCard as ListingCardComponent } from "@/components/listings/ListingCard";
import { ListingReviews } from "@/components/reviews/ListingReviews";
import { AboutSection } from "@/components/home/AboutSection";
import Navbar from "@/components/Navbar";
import { ListingCard } from "@/types/listings";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { CreateListingForm } from "@/components/listings/CreateListingForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredListings, setFilteredListings] = useState<ListingCard[]>([]);
  const [allListings, setAllListings] = useState<ListingCard[]>([]);
  const [showWishlist, setShowWishlist] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [wishlistedIds, setWishlistedIds] = useState<number[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const channelRef = useRef<any>(null);

  // Fetch all listings from Supabase
  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setAllListings(data as ListingCard[]);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
    
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

    // Set up real-time subscription for listings
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'listings'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          fetchListings(); // Refresh listings when changes occur
        }
      )
      .subscribe();
    
    channelRef.current = channel;

    return () => {
      subscription.unsubscribe();
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
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

  useEffect(() => {
    handleSearch();
  }, [showWishlist, wishlistedIds, allListings]);

  const handleSearch = () => {
    let filtered = allListings;
    
    if (searchTerm) {
      filtered = allListings.filter((listing) =>
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (showWishlist) {
      filtered = filtered.filter(listing => wishlistedIds.includes(listing.id));
    }

    setFilteredListings(filtered);
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (e.target.value === "") {
      setFilteredListings(showWishlist ? allListings.filter(listing => wishlistedIds.includes(listing.id)) : allListings);
    } else {
      handleSearch();
    }
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    fetchListings();
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
                ? isLoading ? "Loading listings..." : "No results found" 
                : searchTerm 
                  ? `Search Results (${filteredListings.length})` 
                  : showWishlist
                    ? "Your Wishlist"
                    : "Featured Listings"
              }
            </h2>
            <div className="flex gap-2">
              {user && (
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-1">
                      <PlusCircle className="h-4 w-4" />
                      <span>Create Listing</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <CreateListingForm onSuccess={handleCreateSuccess} />
                  </DialogContent>
                </Dialog>
              )}
              <Button
                onClick={() => setShowWishlist(!showWishlist)}
                variant="outline"
                className="text-sm"
              >
                {showWishlist ? "Show All Listings" : "View Wishlist"}
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {isLoading ? (
              // Loading skeleton placeholders
              Array(8).fill(0).map((_, index) => (
                <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm p-4 h-[300px]">
                  <div className="animate-pulse">
                    <div className="bg-gray-200 h-48 w-full rounded"></div>
                    <div className="mt-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              filteredListings.map((listing, index) => (
                <ListingCardComponent
                  key={listing.id}
                  listing={listing}
                  index={index}
                />
              ))
            )}
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
