
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { ListingCard as ListingCardType } from "@/types/listings";
import { ListingCard } from "@/components/listings/ListingCard";
import { ProductFilters } from "@/components/products/ProductFilters";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Products = () => {
  const [products, setProducts] = useState<ListingCardType[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ListingCardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("newest");

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, searchTerm, priceRange, selectedLocations, sortBy]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      setProducts(data as ListingCardType[]);
      setFilteredProducts(data as ListingCardType[]);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];
    
    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply price range filter
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );
    
    // Apply location filter
    if (selectedLocations.length > 0) {
      filtered = filtered.filter(product => 
        selectedLocations.includes(product.location)
      );
    }
    
    // Apply sorting
    if (sortBy === "price-low") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "newest") {
      filtered.sort((a, b) => 
        new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime()
      );
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => 
        new Date(a.created_at || "").getTime() - new Date(b.created_at || "").getTime()
      );
    }
    
    setFilteredProducts(filtered);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPriceRange([0, 1000]);
    setSelectedLocations([]);
    setSortBy("newest");
  };

  const allLocations = [...new Set(products.map(product => product.location))];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Browse Products</h1>
        
        {/* Search bar */}
        <div className="relative flex mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters sidebar */}
          <div className="w-full md:w-1/4">
            <ProductFilters
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              locations={allLocations}
              selectedLocations={selectedLocations}
              setSelectedLocations={setSelectedLocations}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onClearFilters={clearFilters}
            />
          </div>
          
          {/* Product grid */}
          <div className="w-full md:w-3/4">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <p className="text-gray-600 mb-4">No products found matching your criteria</p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-500 mb-4">{filteredProducts.length} products found</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredProducts.map((product, index) => (
                    <ListingCard key={product.id} listing={product} index={index} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
