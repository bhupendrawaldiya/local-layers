
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: () => void;
}

export const Hero = ({ searchTerm, onSearchChange, onSearch }: HeroProps) => {
  return (
    <section className="pt-16 sm:pt-20 pb-24 sm:pb-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto pt-16 sm:pt-20">
        <div className="text-center space-y-6 sm:space-y-8 fade-in opacity-0 translate-y-4 transition-all duration-700">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 px-4">
            Discover Local Treasures
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Buy and sell unique items in your neighborhood. Connect with local sellers and find hidden gems.
          </p>
          
          <div className="max-w-xl sm:max-w-2xl mx-auto mt-8 px-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-hover:text-gray-600" />
              <input
                type="text"
                placeholder="Search for items near you..."
                className="w-full pl-12 pr-24 sm:pr-32 py-3 sm:py-4 rounded-full border border-gray-200 shadow-sm 
                         focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                         transition-all duration-200 text-base sm:text-lg bg-white/80 backdrop-blur-sm hover:bg-white"
                value={searchTerm}
                onChange={onSearchChange}
                onKeyPress={(e) => e.key === 'Enter' && onSearch()}
              />
              <Button 
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-4 sm:px-6 py-2
                         bg-primary hover:bg-primary/90 transition-all duration-200
                         text-white font-medium shadow-lg hover:shadow-xl text-sm sm:text-base"
                onClick={onSearch}
              >
                Search
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Try searching for "vintage", "handmade", or browse by location
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
