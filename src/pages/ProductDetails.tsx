import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ListingCard as ListingCardType } from "@/types/listings";
import Navbar from "@/components/Navbar";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import ChatModal from "@/components/chat/ChatModal";
import ProductLoading from "@/components/product/ProductLoading";
import ProductImageSection from "@/components/product/ProductImageSection";
import ProductInfo from "@/components/product/ProductInfo";
import ProductReviews from "@/components/product/ProductReviews";

const ProductDetails = () => {
  const { id } = useParams();
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
        setProduct(null);
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

  const handleContactSeller = () => {
    if (!user) {
      toast.error("Please sign in to contact the seller");
      return;
    }
    setIsChatOpen(true);
  };

  const handleReviewAdded = () => {
    if (id) {
      fetchProductDetails(parseInt(id));
    }
  };

  const loadingComponent = (
    <ProductLoading 
      isLoading={isLoading} 
      productExists={!!product}
    />
  );
  
  if (isLoading || !product) {
    return loadingComponent;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="md:flex">
            <ProductImageSection 
              image={product.image} 
              title={product.title} 
            />
            <ProductInfo 
              product={product}
              isWishlisted={isWishlisted}
              user={user}
              onWishlistChange={setIsWishlisted}
              onContactSeller={handleContactSeller}
            />
          </div>
        </div>
        
        <ProductReviews 
          reviews={product.reviews} 
          listingId={product.id}
          onReviewAdded={handleReviewAdded}
        />
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
