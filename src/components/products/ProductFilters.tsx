
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

interface ProductFiltersProps {
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  locations: string[];
  selectedLocations: string[];
  setSelectedLocations: (locations: string[]) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  onClearFilters: () => void;
}

export const ProductFilters = ({
  priceRange,
  setPriceRange,
  locations,
  selectedLocations,
  setSelectedLocations,
  sortBy,
  setSortBy,
  onClearFilters
}: ProductFiltersProps) => {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const handleLocationChange = (location: string) => {
    if (selectedLocations.includes(location)) {
      setSelectedLocations(selectedLocations.filter(loc => loc !== location));
    } else {
      setSelectedLocations([...selectedLocations, location]);
    }
  };

  const filtersContent = (
    <div className="space-y-6">
      {/* Price Range Filter */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Price Range</h3>
        <div className="mb-2">
          <Slider 
            defaultValue={[priceRange[0], priceRange[1]]} 
            max={1000} 
            step={10}
            onValueChange={(value) => setPriceRange([value[0], value[1]])}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>

      {/* Sort By Filter */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Sort By</h3>
        <div className="space-y-2">
          {[
            { value: "newest", label: "Newest" },
            { value: "oldest", label: "Oldest" },
            { value: "price-low", label: "Price: Low to High" },
            { value: "price-high", label: "Price: High to Low" }
          ].map((option) => (
            <div key={option.value} className="flex items-center">
              <input
                type="radio"
                id={option.value}
                name="sortBy"
                checked={sortBy === option.value}
                onChange={() => setSortBy(option.value)}
                className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
              />
              <label htmlFor={option.value} className="ml-3 text-sm text-gray-600">
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Location Filter */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Location</h3>
        <div className="space-y-2">
          {locations.map((location) => (
            <div key={location} className="flex items-center">
              <Checkbox
                id={`location-${location}`}
                checked={selectedLocations.includes(location)}
                onCheckedChange={() => handleLocationChange(location)}
              />
              <Label
                htmlFor={`location-${location}`}
                className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {location}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Clear Filters Button */}
      <Button
        variant="outline"
        onClick={onClearFilters}
        className="w-full flex items-center justify-center"
      >
        <X className="w-4 h-4 mr-2" />
        Clear Filters
      </Button>
    </div>
  );

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden md:block bg-white p-6 rounded-lg shadow-sm">
        {filtersContent}
      </div>

      {/* Mobile Filters */}
      <div className="md:hidden">
        <Button
          variant="outline"
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          className="w-full mb-4 flex items-center justify-center"
        >
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          {mobileFiltersOpen ? "Hide Filters" : "Show Filters"}
        </Button>
        
        {mobileFiltersOpen && (
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            {filtersContent}
          </div>
        )}
      </div>
    </>
  );
};
