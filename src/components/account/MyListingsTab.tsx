
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ListingCard as ListingCardType } from "@/types/listings";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Eye, EyeOff, Trash2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CreateListingForm } from "../listings/CreateListingForm";

export const MyListingsTab = () => {
  const [myListings, setMyListings] = useState<(ListingCardType & { is_visible: boolean })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedListings, setSelectedListings] = useState<number[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const fetchMyListings = async () => {
    setIsLoading(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      const userId = sessionData.session?.user.id;
      if (!userId) {
        toast.error("You must be logged in to view your listings");
        return;
      }

      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('seller_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setMyListings(data || []);
    } catch (error) {
      console.error("Error fetching my listings:", error);
      toast.error("Failed to load your listings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, []);

  const toggleListingVisibility = async (listingId: number, isVisible: boolean) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ is_visible: isVisible })
        .eq('id', listingId);

      if (error) throw error;
      
      setMyListings(prev => 
        prev.map(listing => 
          listing.id === listingId 
            ? { ...listing, is_visible: isVisible }
            : listing
        )
      );
      
      toast.success(`Listing ${isVisible ? 'published' : 'unpublished'} successfully`);
    } catch (error) {
      console.error("Error updating listing visibility:", error);
      toast.error("Failed to update listing visibility");
    }
  };

  const deleteListing = async (listingId: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this listing? This action cannot be undone.");
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId);

      if (error) throw error;
      
      setMyListings(prev => prev.filter(listing => listing.id !== listingId));
      toast.success("Listing deleted successfully");
    } catch (error) {
      console.error("Error deleting listing:", error);
      toast.error("Failed to delete listing");
    }
  };

  const handleSelectListing = (listingId: number) => {
    setSelectedListings(prev => {
      if (prev.includes(listingId)) {
        return prev.filter(id => id !== listingId);
      } else {
        return [...prev, listingId];
      }
    });
  };

  const bulkUpdateVisibility = async (isVisible: boolean) => {
    if (selectedListings.length === 0) {
      toast.error("Please select at least one listing");
      return;
    }

    try {
      for (const listingId of selectedListings) {
        await supabase
          .from('listings')
          .update({ is_visible: isVisible })
          .eq('id', listingId);
      }
      
      setMyListings(prev => 
        prev.map(listing => 
          selectedListings.includes(listing.id) 
            ? { ...listing, is_visible: isVisible }
            : listing
        )
      );
      
      toast.success(`${selectedListings.length} listings ${isVisible ? 'published' : 'unpublished'} successfully`);
      setSelectedListings([]);
    } catch (error) {
      console.error("Error updating listings visibility:", error);
      toast.error("Failed to update listings visibility");
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
    fetchMyListings();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">My Listings</h2>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Listing
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <CreateListingForm onSuccess={handleCreateSuccess} />
          </DialogContent>
        </Dialog>
      </div>
      
      {selectedListings.length > 0 && (
        <div className="bg-gray-50 p-3 rounded-lg flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => bulkUpdateVisibility(true)}
          >
            <Eye className="mr-2 h-4 w-4" />
            Publish Selected
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => bulkUpdateVisibility(false)}
          >
            <EyeOff className="mr-2 h-4 w-4" />
            Unpublish Selected
          </Button>
          <div className="ml-auto text-sm text-gray-500">
            {selectedListings.length} selected
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading your listings...</p>
        </div>
      ) : myListings.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">You haven't created any listings yet</p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Listing
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myListings.map(listing => (
              <div key={listing.id} className="bg-white border rounded-lg overflow-hidden shadow-sm relative">
                <div className="absolute top-2 left-2 z-10">
                  <Checkbox 
                    checked={selectedListings.includes(listing.id)}
                    onCheckedChange={() => handleSelectListing(listing.id)}
                    className="h-5 w-5 border-2"
                  />
                </div>
                <div className="relative aspect-video bg-gray-200">
                  <img
                    src={listing.image || "/placeholder.svg"}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute top-0 right-0 px-2 py-1 text-xs font-medium ${listing.is_visible ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                    {listing.is_visible ? 'Published' : 'Hidden'}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900 line-clamp-1">{listing.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{listing.location}</p>
                  <p className="mt-2 text-lg font-semibold text-gray-900">${listing.price.toLocaleString()}</p>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-700 mr-2">Visible:</span>
                      <Switch 
                        checked={listing.is_visible}
                        onCheckedChange={(checked) => toggleListingVisibility(listing.id, checked)}
                      />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => deleteListing(listing.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
