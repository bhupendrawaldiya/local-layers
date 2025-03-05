
import React, { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductImageSectionProps {
  image: string;
  title: string;
}

const ProductImageSection = ({ image, title }: ProductImageSectionProps) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="md:w-1/2">
      <div className="relative h-64 md:h-96 lg:h-[500px] rounded-lg overflow-hidden">
        {isLoading && (
          <Skeleton className="absolute inset-0 w-full h-full" />
        )}
        <img 
          src={image} 
          alt={title} 
          className={`w-full h-full object-cover transition-all duration-300 hover:scale-105 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        />
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 hover:opacity-100 transition-opacity">
          <h3 className="text-white font-semibold text-xl">{title}</h3>
        </div>
      </div>
    </div>
  );
};

export default ProductImageSection;
