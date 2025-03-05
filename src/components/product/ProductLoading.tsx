
import React from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ProductLoadingProps {
  isLoading: boolean;
  productExists: boolean;
}

const ProductLoading = ({ isLoading, productExists }: ProductLoadingProps) => {
  const navigate = useNavigate();
  
  if (!isLoading && !productExists) {
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

  return null;
};

export default ProductLoading;
