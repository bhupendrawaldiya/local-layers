
import React from "react";

interface ProductImageSectionProps {
  image: string;
  title: string;
}

const ProductImageSection = ({ image, title }: ProductImageSectionProps) => {
  return (
    <div className="md:w-1/2">
      <div className="h-64 md:h-full bg-gray-100">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default ProductImageSection;
