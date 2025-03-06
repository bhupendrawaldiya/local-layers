
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SlidersHorizontal, X, Search } from "lucide-react";
import { useState } from "react";

interface ProductFiltersProps {
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  locations: string[];
  selectedLocations: string[];
  setSelectedLocations: (locations: string[]) => void;
  categories: string[];
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  condition: string;
  setCondition: (condition: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  onClearFilters: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSearch: () => void;
}

export const ProductFilters = ({
  priceRange,
  setPriceRange,
  locations,
  selectedLocations,
  setSelectedLocations,
  categories,
  selectedCategories,
  setSelectedCategories,
  condition,
  setCondition,
  sortBy,
  setSortBy,
  onClearFilters,
  searchTerm,
  setSearchTerm,
  onSearch
}: ProductFiltersProps) => {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const handleLocationChange = (location: string) => {
    if (selectedLocations.includes(location)) {
      setSelectedLocations(selectedLocations.filter(loc => loc !== location));
    } else {
      setSelectedLocations([...selectedLocations, location]);
    }
  };

  const handleCategoryChange = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(cat => cat !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const filtersContent = (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 -translate 
y-1/2 text-gray-400 h-5 w-5" />
      </div>

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

      {/* Categories Filter */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center">
              <Checkbox
                id={`category-${category}`}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => handleCategoryChange(category)}
              />
              <Label
                htmlFor={`category-${category}`}
                className="ml-2"
              >
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Condition Filter */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Condition</h3>
        <div className="space-y-2">
          {['New', 'Like New', 'Good', 'Fair', 'Poor'].map((conditionOption) => (
            <div key={conditionOption} className="flex items-center">
              <input
                type="radio"
                id={`condition-${conditionOption}`}
                name="condition"
                checked={condition === conditionOption}
                onChange={() => setCondition(conditionOption)}
                className="h-4 w-4 text-primary border-gray-300"
              />
              <Label
                htmlFor={`condition-${conditionOption}`}
                className="ml-2"
              >
                {conditionOption}
              </Label>
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
                className="ml-2"
              >
                {location}
              </Label>
            </div>
          ))}
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
            { value: "price-high", label: "Price: High to Low" },
            { value: "rating-high", label: "Highest Rated" }
          ].map((option) => (
            <div key={option.value} className="flex items-center">
              <input
                type="radio"
                id={option.value}
                name="sortBy"
                checked={sortBy === option.value}
                onChange={() => setSortBy(option.value)}
                className="h-4 w-4 text-primary border-gray-300"
              />
              <label htmlFor={option.value} className="ml-3 text-sm text-gray-600">
                {option.label}
              </label>
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
