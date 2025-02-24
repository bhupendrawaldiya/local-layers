
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: () => void;
}

export const Hero = ({ searchTerm, onSearchChange, onSearch }: HeroProps) => {
  return (
    <section className="pt-20 pb-32 px-4">
      <div className="max-w-7xl mx-auto pt-20">
        <div className="text-center space-y-8 fade-in opacity-0 translate-y-4 transition-all duration-700">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
            Discover Local Treasures
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Buy and sell unique items in your neighborhood. Connect with local sellers and find hidden gems.
          </p>
          
          <div className="max-w-xl mx-auto mt-8">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for items near you..."
                className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:border-gray-300 transition-all"
                value={searchTerm}
                onChange={onSearchChange}
                onKeyPress={(e) => e.key === 'Enter' && onSearch()}
              />
              <Button 
                className="absolute right-2 top-2"
                onClick={onSearch}
              >
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
