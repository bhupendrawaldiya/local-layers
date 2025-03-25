import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "./Navbar";
import { ProductFilters } from "./products/ProductFilters";
import { ListingCard as ListingCardType } from "@/types/listings";

const CategoryProducts = () => {
  const { category } = useParams<{ category: string }>();
  const [products, setProducts] = useState<ListingCardType[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ListingCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Filters
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("newest");

  useEffect(() => {
    fetchProductsByCategory();
  }, [category]);

  useEffect(() => {
    applyFilters();
  }, [products, searchTerm, priceRange, selectedLocations, sortBy]);

  const fetchProductsByCategory = async () => {
    if (!category) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .contains("categories", [category]);

      if (error) throw error;

      setProducts(data as ListingCardType[]);
      setFilteredProducts(data as ListingCardType[]);
    } catch (error) {
      console.error("Error fetching category products:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered = filtered.filter(
      (product) => product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    if (selectedLocations.length > 0) {
      filtered = filtered.filter((product) => selectedLocations.includes(product.location));
    }

    if (sortBy === "price-low") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }

    setFilteredProducts(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPriceRange([0, 1000]);
    setSelectedLocations([]);
    setSortBy("newest");
  };

  const allLocations = [...new Set(products.map((product) => product.location))];

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          {category} Products
        </h2>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Filters */}
          <div className="w-full md:w-1/4 bg-white shadow-md rounded-lg p-4">
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

          {/* Products Section */}
          <div className="flex-1">
            {loading ? (
              <p className="text-center text-gray-500 text-lg">Loading products...</p>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="p-4 shadow-lg rounded-xl transition-transform transform hover:scale-105 hover:shadow-xl"
                  >
                    <Link to={`/product/${product.id}`}>
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-48 object-cover rounded-md"
                      />
                      <CardContent className="mt-3">
                        <h3 className="text-lg font-semibold text-gray-900">{product.title}</h3>
                        <p className="text-blue-500 font-bold text-lg">₹{product.price}</p>
                        <p className="text-gray-500 text-sm">{product.location}</p>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 text-lg">
                No products found in this category.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CategoryProducts;
