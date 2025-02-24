
import { MapPin, Users, Info } from "lucide-react";

export const AboutSection = () => {
  return (
    <section className="bg-white py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 fade-in opacity-0 translate-y-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">About LocalFinds</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connecting local buyers and sellers in a trusted community marketplace
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 fade-in opacity-0 translate-y-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-6">
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Local Focus</h3>
            <p className="text-gray-600">
              Discover unique items from sellers in your neighborhood and support your local community.
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Trusted Community</h3>
            <p className="text-gray-600">
              Join a verified network of buyers and sellers committed to safe and reliable transactions.
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-6">
              <Info className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Easy to Use</h3>
            <p className="text-gray-600">
              Simple and intuitive platform for buying, selling, and connecting with your community.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
