import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "./Navbar";

const CategoryProducts = () => {
  const { category } = useParams<{ category: string }>(); // Get category from URL
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .contains("categories", [category]); // Match products by category

      if (error) {
        console.error("Error fetching products:", error.message);
      } else {
        setProducts(data);
      }
      setLoading(false);
    };

    if (category) {
      fetchProducts();
    }
  }, [category]);

  return (
    <>
    <Navbar />
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Products in {category}
      </h2>

      {loading ? (
        <p>Loading...</p>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="p-4 shadow-md">
              <Link to={`/product/${product.id}`}>
                <img src={product.image} alt={product.title} className="w-full h-48 object-cover rounded-md" />
                <CardContent>
                  <h3 className="text-lg font-semibold mt-2">{product.title}</h3>
                  <p className="text-gray-500">₹{product.price}</p>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <p>No products found in this category.</p>
      )}
    </div>
    </>
  );
};

export default CategoryProducts;
