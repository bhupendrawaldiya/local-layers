
import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductImageSectionProps {
  image: string;
  title: string;
}

const ProductImageSection = ({ image, title }: ProductImageSectionProps) => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate image preloading
  useEffect(() => {
    const img = new Image();
    img.src = image;
    img.onload = () => {
      setIsLoading(false);
    };
    
    // Fallback in case image doesn't load properly
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, [image]);

  return (
    <div className="md:w-1/2">
      <div className="relative h-64 md:h-96 lg:h-[500px] rounded-lg overflow-hidden">
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition-all duration-300 hover:scale-105"
          />
        )}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 hover:opacity-100 transition-opacity">
          <h3 className="text-white font-semibold text-xl">{title}</h3>
        </div>
      </div>
    </div>
  );
};

export default ProductImageSection;
