import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { UserProfile } from "@/types/user";
import { ListingCard as ListingCardType } from "@/types/listings";
import { ListingCard } from "@/components/listings/ListingCard";

const Account = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    fullName: "",
    bio: "",
    phoneNumber: "",
    location: "",
    preferences: {
      notifications: true,
      newsletter: false,
      darkMode: false,
    },
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

      const listings: ListingCardType[] = wishlistData
        .filter(item => item.listings) // Filter out any null listings
        .map(item => ({
          id: item.listings.id,
          title: item.listings.title,
          price: item.listings.price,
          image: item.listings.image,
          location: item.listings.location,
          created_at: item.listings.created_at
        }));

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="bg-white shadow rounded-lg p-6 md:p-8">
            <h1 className="text-2xl font-semibold mb-6">Profile Information</h1>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input type="email" value={user.email || ""} disabled className="bg-gray-50" />
                <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <Input 
                  type="text" 
                  value={profile.fullName || ""} 
                  onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <Textarea 
                  value={profile.bio || ""} 
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  placeholder="Tell us a bit about yourself"
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <Input 
                    type="tel" 
                    value={profile.phoneNumber || ""} 
                    onChange={(e) => setProfile({...profile, phoneNumber: e.target.value})}
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <Input 
                    type="text" 
                    value={profile.location || ""} 
                    onChange={(e) => setProfile({...profile, location: e.target.value})}
                    placeholder="Enter your location"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Created</label>
                <p className="text-gray-900">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex justify-between items-center pt-4">
                <Button onClick={saveProfile} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                
                <Button variant="destructive" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="wishlist" className="bg-white shadow rounded-lg p-6 md:p-8">
            <h1 className="text-2xl font-semibold mb-6">Your Wishlist</h1>
            
            {wishlistedItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Your wishlist is empty</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {wishlistedItems.map((item, index) => (
                  <ListingCard key={item.id} listing={item} index={index} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="preferences" className="bg-white shadow rounded-lg p-6 md:p-8">
            <h1 className="text-2xl font-semibold mb-6">Preferences</h1>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-900">Email Notifications</h3>
                  <p className="text-sm text-gray-500">Receive emails about new listings and updates</p>
                </div>
                <Switch 
                  checked={profile.preferences?.notifications || false} 
                  onCheckedChange={(checked) => {
                    const currentPrefs = profile.preferences || {};
                    setProfile({
                      ...profile, 
                      preferences: {
                        ...currentPrefs,
                        notifications: checked
                      }
                    });
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-900">Newsletter</h3>
                  <p className="text-sm text-gray-500">Subscribe to our monthly newsletter</p>
                </div>
                <Switch 
                  checked={profile.preferences?.newsletter || false} 
                  onCheckedChange={(checked) => {
                    const currentPrefs = profile.preferences || {};
                    setProfile({
                      ...profile, 
                      preferences: {
                        ...currentPrefs,
                        newsletter: checked
                      }
                    });
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-900">Dark Mode</h3>
                  <p className="text-sm text-gray-500">Switch to dark mode for better viewing at night</p>
                </div>
                <Switch 
                  checked={profile.preferences?.darkMode || false} 
                  onCheckedChange={(checked) => {
                    const currentPrefs = profile.preferences || {};
                    setProfile({
                      ...profile, 
                      preferences: {
                        ...currentPrefs,
                        darkMode: checked
                      }
                    });
                  }}
                />
              </div>
              
              <div className="pt-4">
                <Button onClick={saveProfile} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Preferences"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Account;
