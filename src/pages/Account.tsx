
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
      // Try to fetch existing profile data
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Error fetching profile:", error);
        
        if (error.code === '42P01') {
          // Table doesn't exist, create it
          await createProfilesTable();
          // Then continue to set default profile
        } else if (error.code !== 'PGRST116') {
          // PGRST116 is "no rows found" error, we can ignore it for new users
          toast.error("Failed to load profile data");
        }
      }

      // Get email from user auth info
      const email = user?.email || 
        (user?.app_metadata?.provider === 'google' && user?.user_metadata?.email) || '';
      
      // Get name from user metadata if available (especially for Google login)
      const defaultName = user?.user_metadata?.full_name || 
                          user?.user_metadata?.name ||
                          email?.split('@')[0] || '';

      // Set profile with data from database or defaults
      setProfile({
        id: userId,
        email: email,
        fullName: data?.full_name || defaultName,
        location: data?.location || '',
        avatar: data?.avatar_url || '',
        created_at: user?.created_at || new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Failed to load user profile");
    } finally {
      setIsLoading(false);
    }
  };

  const createProfilesTable = async () => {
    try {
      const { error } = await supabase.rpc('create_profiles_if_not_exists');
      if (error) {
        console.error('Error creating profiles table:', error);
      }
    } catch (error) {
      console.error('Error calling RPC function:', error);
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
      // Create profiles table if it doesn't exist
      await createProfilesTable();
      
      // Try to upsert profile data
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profile.fullName,
          location: profile.location,
          avatar_url: profile.avatar,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (error) throw error;
      
      // Also update user metadata for easier access in other places
      await supabase.auth.updateUser({
        data: { 
          full_name: profile.fullName,
          location: profile.location
        }
      });
      
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
      <ProfileProvider 
        initialUser={user}
        initialProfile={profile}
        initialIsSaving={isSaving}
        saveProfileFn={saveProfile}
      >
        <AccountLayout handleSignOut={handleSignOut} />
      </ProfileProvider>
    </div>
  );
};

export default Account;
