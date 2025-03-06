import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";

interface ProductFiltersProps {
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  locations: string[];
  selectedLocations: string[];
  setSelectedLocations: (locations: string[]) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  onClearFilters: () => void;
  categories?: string[];
  selectedCategories?: string[];
  setSelectedCategories?: (categories: string[]) => void;
  condition?: string;
  setCondition?: (condition: string) => void;
  tags?: string[];
  setTags?: (tags: string[]) => void;
}

export const ProductFilters = ({
  priceRange,
  setPriceRange,
  locations,
  selectedLocations,
  setSelectedLocations,
  sortBy,
  setSortBy,
  onClearFilters,
  categories,
  selectedCategories,
  setSelectedCategories,
  condition,
  setCondition,
  tags,
  setTags,
}: ProductFiltersProps) => {
  const handleLocationChange = (location: string) => {
    if (selectedLocations.includes(location)) {
      setSelectedLocations(selectedLocations.filter((l) => l !== location));
    } else {
      setSelectedLocations([...selectedLocations, location]);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>

      {/* Price Range */}
      <div className="mb-4">
        <h4 className="text-md font-semibold text-gray-700 mb-2">Price Range</h4>
        <div className="flex items-center gap-2">
          <label htmlFor="price-min">Min:</label>
          <input
            type="number"
            id="price-min"
            value={priceRange[0]}
            onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
            className="w-20 border rounded-md px-2 py-1 text-sm"
          />
          <label htmlFor="price-max">Max:</label>
          <input
            type="number"
            id="price-max"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
            className="w-20 border rounded-md px-2 py-1 text-sm"
          />
        </div>
        <Slider
          defaultValue={priceRange}
          max={1000}
          step={10}
          onValueChange={(value) => setPriceRange(value as [number, number])}
        />
      </div>

      {/* Location */}
      {locations && locations.length > 0 && (
        <div className="mb-4">
          <h4 className="text-md font-semibold text-gray-700 mb-2">Location</h4>
          <div className="space-y-1">
            {locations.map((location) => (
              <div key={location} className="flex items-center">
                <Checkbox
                  id={`location-${location}`}
                  checked={selectedLocations.includes(location)}
                  onCheckedChange={() => handleLocationChange(location)}
                />
                <label
                  htmlFor={`location-${location}`}
                  className="ml-2 text-sm font-medium text-gray-900"
                >
                  {location}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sort By */}
      <div className="mb-4">
        <h4 className="text-md font-semibold text-gray-700 mb-2">Sort By</h4>
        <RadioGroup defaultValue={sortBy} onValueChange={setSortBy} className="flex flex-col gap-2">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="newest" id="newest" />
            <label htmlFor="newest" className="text-sm font-medium text-gray-900">
              Newest
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="oldest" id="oldest" />
            <label htmlFor="oldest" className="text-sm font-medium text-gray-900">
              Oldest
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="price-low" id="price-low" />
            <label htmlFor="price-low" className="text-sm font-medium text-gray-900">
              Price: Low to High
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="price-high" id="price-high" />
            <label htmlFor="price-high" className="text-sm font-medium text-gray-900">
              Price: High to Low
            </label>
          </div>
        </RadioGroup>
      </div>

      {/* Clear Filters */}
      <div>
        <Button variant="outline" className="w-full" onClick={onClearFilters}>
          Clear Filters
        </Button>
      </div>
    </div>
  );
};
