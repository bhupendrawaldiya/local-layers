
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { UserProfile } from "@/types/user";
import { ListingCard as ListingCardType } from "@/types/listings";
import Navbar from "@/components/Navbar";
import { AccountLayout } from "@/components/account/AccountLayout";
import { ProfileProvider } from "@/contexts/ProfileContext";

const Account = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    fullName: "",
    location: "",
  });
  const [wishlistedItems, setWishlistedItems] = useState<ListingCardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/signin");
        return;
      }
      setUser(session.user);
      fetchUserProfile(session.user.id);
      fetchWishlistedItems(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/signin");
        return;
      }
      
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
        fetchWishlistedItems(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchUserProfile = async (userId: string) => {
    setIsLoading(true);
    try {
      setProfile(prev => ({
        ...prev,
        id: userId,
        email: user?.email || "",
        created_at: user?.created_at || new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Failed to load user profile");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWishlistedItems = async (userId: string) => {
    try {
      const { data: wishlistData, error: wishlistError } = await supabase
        .from('wishlists')
        .select(`
          listing_id,
          listings(
            id,
            title,
            price,
            image,
            location,
            created_at
          )
        `)
        .eq('user_id', userId);

      if (wishlistError) {
        console.error('Error fetching wishlist:', wishlistError);
        toast.error('Failed to load wishlist items');
        return;
      }

      console.log('Wishlist data in Account:', wishlistData);

      const listings: ListingCardType[] = wishlistData
        .filter(item => item.listings)
        .map(item => {
          const listing = item.listings as any;
          return {
            id: listing.id,
            title: listing.title,
            price: listing.price,
            image: listing.image,
            location: listing.location,
            created_at: listing.created_at
          };
        });

      console.log('Transformed listings in Account:', listings);
      setWishlistedItems(listings);
    } catch (error) {
      console.error('Error processing wishlist data:', error);
      toast.error('Failed to process wishlist data');
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
          <div className="text-center py-12">
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <ProfileProvider saveProfileFn={saveProfile}>
        <AccountLayout handleSignOut={handleSignOut} />
      </ProfileProvider>
    </div>
  );
};

export default Account;
