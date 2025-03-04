import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ListingCard as ListingCardType } from "@/types/listings";
import Navbar from "@/components/Navbar";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import ChatModal from "@/components/chat/ChatModal";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ListingCardType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user && id) {
        checkWishlistStatus(session.user.id, parseInt(id));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user && id) {
        checkWishlistStatus(session.user.id, parseInt(id));
      } else {
        setIsWishlisted(false);
      }
    });

    if (id) {
      fetchProductDetails(parseInt(id));
    }

    return () => subscription.unsubscribe();
  }, [id]);

  const fetchProductDetails = async (productId: number) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) {
        console.error('Error fetching product details:', error);
        toast.error('Failed to load product details');
        navigate('/');
        return;
      }

      setProduct(data as ListingCardType);
    } catch (error) {
      console.error('Error processing product data:', error);
      toast.error('Failed to process product data');
    } finally {
      setIsLoading(false);
    }
  };

  const checkWishlistStatus = async (userId: string, productId: number) => {
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select()
        .eq('user_id', userId)
        .eq('listing_id', productId)
        .maybeSingle();

      if (error) {
        console.error('Error checking wishlist status:', error);
        return;
      }

      setIsWishlisted(!!data);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      toast.error("Please sign in to add items to your wishlist");
      return;
    }

    if (!product) return;

    try {
      if (isWishlisted) {
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', product.id);

        if (error) throw error;
        
        setIsWishlisted(false);
        toast.success("Removed from wishlist");
      } else {
        const { error } = await supabase
          .from('wishlists')
          .insert([
            { user_id: user.id, listing_id: product.id }
          ]);

        if (error) throw error;
        
        setIsWishlisted(true);
        toast.success("Added to wishlist");
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      toast.error("Failed to update wishlist");
    }
  };

  const handleContactSeller = () => {
    if (!user) {
      toast.error("Please sign in to contact the seller");
      return;
    }
    setIsChatOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="text-center py-12">
            <p className="text-gray-600">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="text-center py-12">
            <p className="text-gray-600">Product not found</p>
            <Button 
              className="mt-4" 
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2">
              <div className="h-64 md:h-full bg-gray-100">
                <img 
                  src={product.image} 
                  alt={product.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="p-8 md:w-1/2">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h1>
                  <p className="text-gray-600 mb-4">{product.location}</p>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-3xl font-bold text-gray-900">${product.price}</p>
                  <button
                    onClick={toggleWishlist}
                    className="mt-4 flex items-center bg-white border border-gray-300 rounded-full px-4 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <Heart
                      className={`h-5 w-5 mr-2 transition-colors ${
                        isWishlisted ? "fill-red-500 stroke-red-500" : "stroke-gray-600"
                      }`}
                    />
                    {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
                  </button>
                </div>
              </div>
              
              <div className="mt-8">
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-gray-700">
                  This beautiful {product.title.toLowerCase()} is located in {product.location}. 
                  Perfect for any home or office space. Contact us for more details or to arrange a viewing.
                </p>
              </div>
              
              <div className="mt-8">
                <h2 className="text-lg font-semibold mb-2">Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-gray-700">{product.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Listed on</p>
                    <p className="text-gray-700">
                      {product.created_at ? new Date(product.created_at).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleContactSeller}
                >
                  Contact Seller
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {product.reviews && product.reviews.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-4">Reviews</h2>
            <div className="space-y-4">
              {product.reviews.map((review) => (
                <div key={review.id} className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium text-gray-900">{review.authorName}</div>
                    <div className="flex items-center">
                      <span className="text-amber-500 mr-1">★</span>
                      <span>{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                  <p className="text-xs text-gray-500 mt-2">{new Date(review.date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {isChatOpen && user && product && (
        <ChatModal 
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          listingId={product.id}
          listingTitle={product.title}
          userId={user.id}
        />
      )}
    </div>
  );
};

export default ProductDetails;
