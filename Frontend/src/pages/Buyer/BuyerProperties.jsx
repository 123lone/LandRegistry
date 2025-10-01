import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LandPlot } from 'lucide-react';
import PropertyCard from '../../components/PropertyCard'; 

// Real estate placeholder images
const placeholderImages = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1560184897-43d3d0d1f9d2?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1599423300746-b62533397364?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80"
];


// Pick random placeholder
const getRandomPlaceholder = () =>
  placeholderImages[Math.floor(Math.random() * placeholderImages.length)];

const BuyerProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/properties/my-properties",
          { credentials: "include" }
        );

        if (!response.ok) throw new Error("Failed to fetch properties");

        const data = await response.json();

        // 🔹 Normalize data with correct `image` field
        const processed = data.map((p) => ({
          ...p,
          title: p.title || `Property #${p._id}`,
          location: p.location || p.district || "Unknown Location",
          uniqueId: p.uniqueId || p.surveyNumber || p._id,

          image: getRandomPlaceholder(), // 👈 fixed (was url before)
        }));

        setProperties(processed);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  if (loading) return <p className="text-center text-lg py-8">Loading properties...</p>;
  if (error) return <p className="text-center text-red-600 py-8">Error: {error}</p>;

  const hasProperties = properties.length > 0;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">My Properties</h1>
        <p className="text-lg text-gray-600">
          A record of all the properties you own on the blockchain.
        </p>
      </div>

      {!hasProperties ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center flex flex-col items-center justify-center min-h-[40vh]">
          <LandPlot className="w-20 h-20 text-blue-500 mb-6" />
          <h2 className="text-2xl font-semibold mb-2">You don't own any properties yet.</h2>
          <p className="text-gray-600 mb-4">
            Start your journey by browsing the marketplace and making your first purchase.
          </p>
          <Link
            to="/buyer-dashboard/browse"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <PropertyCard key={property._id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BuyerProperties;
