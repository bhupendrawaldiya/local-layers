import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ListingCard } from "@/components/listings/ListingCard";
import Navbar from "@/components/Navbar";
import type { ListingCard as ListingCardType } from "@/types/listings";
import type { User } from "@supabase/supabase-js";

const Wishlist = () => {
  const [wishlistedItems, setWishlistedItems] = useState<ListingCardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchWishlistedItems(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchWishlistedItems(session.user.id);
      } else {
        setWishlistedItems([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchWishlistedItems = async (userId: string) => {
    setIsLoading(true);
    const { data: wishlistData, error: wishlistError } = await supabase
      .from('wishlists')
      .select('listing_id')
      .eq('user_id', userId);

    if (wishlistError) {
      console.error('Error fetching wishlist:', wishlistError);
      setIsLoading(false);
      return;
    }

    const listingIds = wishlistData.map(item => item.listing_id);
    
    // For now, filter the featured listings based on wishlisted IDs
    // In a real app, you would fetch this from a listings table in Supabase
    const listings = featuredListings.filter(listing => 
      listingIds.includes(listing.id)
    );
    
    setWishlistedItems(listings);
    setIsLoading(false);
  };

  // Importing the featured listings from Index.tsx for demo purposes
  const featuredListings: ListingCardType[] = [
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <h1 className="text-2xl font-semibold mb-8">Your Wishlist</h1>
        
        {!user && (
          <div className="text-center py-12">
            <p className="text-gray-600">Please sign in to view your wishlist</p>
          </div>
        )}
        
        {user && isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading your wishlist...</p>
          </div>
        )}
        
        {user && !isLoading && wishlistedItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">Your wishlist is empty</p>
          </div>
        )}
        
        {user && !isLoading && wishlistedItems.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {wishlistedItems.map((item, index) => (
              <ListingCard key={item.id} listing={item} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
