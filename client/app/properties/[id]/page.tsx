"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useBlockchain } from "@/lib/useBlockchain";
import { Property } from "@/lib/useBlockchain";
import PropertyImage from "@/components/PropertyDetails/PropertyImage";
import PropertyStats from "@/components/PropertyDetails/PropertyStats";
import PurchaseForm from "@/components/PropertyDetails/PurchaseForm";
import { ArrowLeft, Loader2, Building, AlertTriangle } from "lucide-react";

export default function PropertyDetailsPage() {
  const { getPropertyById, isConnected, connectWallet, loading } =
    useBlockchain();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pathname = usePathname();
  const router = useRouter();

  // Extract property ID from the URL - property IDs can be 0 or greater
  const propertyIdStr = pathname ? pathname.split("/").pop() || "" : "";
  const propertyId = propertyIdStr !== "" ? parseInt(propertyIdStr) : -1; // Use -1 as invalid marker
  console.log(property);
  useEffect(() => {
    const fetchProperty = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Property ID can be 0 (valid) or greater
        if (propertyId >= 0) {
          // Changed from "if (propertyId)"
          const propertyData = await getPropertyById(propertyId);
          if (propertyData) {
            setProperty(propertyData);
          } else {
            setError("Property not found");
          }
        } else {
          setError("Invalid property ID");
        }
      } catch (error: any) {
        setError(error.message || "Failed to load property details");
        console.error("Error fetching property:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId, getPropertyById]);

  const handleBack = () => {
    router.push("/properties");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1029] via-[#111633] to-[#0f172a] text-white pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 text-blue-400 animate-spin mb-4" />
            <p className="text-xl text-gray-300">Loading property details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1029] via-[#111633] to-[#0f172a] text-white pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-6 rounded-lg my-10 text-center max-w-2xl mx-auto">
            <AlertTriangle size={48} className="mx-auto mb-4" />
            <p className="font-medium text-lg mb-2">Error Loading Property</p>
            <p className="text-sm opacity-90 mb-6">{error}</p>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Properties
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1029] via-[#111633] to-[#0f172a] text-white pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111633]/50 border border-blue-500/20 rounded-xl p-10 text-center my-10 max-w-2xl mx-auto">
            <Building className="h-16 w-16 mx-auto mb-4 text-blue-400 opacity-70" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Property Not Found
            </h3>
            <p className="text-gray-400 mb-6">
              The property you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Properties
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1029] via-[#111633] to-[#0f172a] text-white pt-32 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <motion.button
          onClick={handleBack}
          className="mb-6 flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ArrowLeft size={16} />
          Back to Properties
        </motion.button>

        {/* Property Name */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {property.name}
          </h1>
          <p className="text-gray-400 text-lg mb-6">{property.location}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Property Image */}
            <PropertyImage
              imageUrl={property.imageURI}
              propertyName={property.name}
            />

            {/* Property Stats */}
            <PropertyStats
              location={property.location}
              totalCost={property.totalCost}
              totalNumberOfTokens={property.totalNumberOfTokens}
              pricePerToken={property.pricePerToken}
            />

            {/* Property Description */}
            <motion.div
              className="bg-[#111633] p-6 rounded-xl border border-blue-500/20 mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <h2 className="text-xl font-bold mb-4">About This Property</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed">
                  {property.description}
                </p>

                {/* Additional property details section */}
                <div className="mt-6 pt-6 border-t border-blue-500/10">
                  <h3 className="text-lg font-semibold mb-3">
                    Investment Highlights
                  </h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• Premium location with high appreciation potential</li>
                    <li>
                      • Professionally managed with predictable maintenance
                      costs
                    </li>
                    <li>• Tokenized ownership with flexible exit options</li>
                    <li>
                      • Verified legal structure and transparent documentation
                    </li>
                    <li>
                      • Regular performance updates and community governance
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Purchase Form */}
          <div className="lg:col-span-1">
            <PurchaseForm
              propertyId={propertyId}
              pricePerToken={property.pricePerToken}
              totalTokens={property.totalNumberOfTokens}
            />

            {/* Property Status */}
            <motion.div
              className="bg-[#111633] p-6 rounded-xl border border-blue-500/20 mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <h3 className="text-xl font-bold mb-4">Property Status</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Status:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      property.isActive
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {property.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Available Tokens:</span>
                  <span>{property.totalNumberOfTokens}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Property ID:</span>
                  <span className="font-mono text-sm">#{propertyId}</span>
                </div>
              </div>
            </motion.div>

            {/* Help Card */}
            <motion.div
              className="bg-blue-500/10 p-6 rounded-xl border border-blue-500/20 mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <h3 className="text-lg font-semibold mb-3">Need Help?</h3>
              <p className="text-gray-300 text-sm mb-4">
                If you have any questions about this property or the purchase
                process, our team is here to help.
              </p>
              <button className="w-full py-2 bg-transparent border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/10 transition-colors">
                Contact Support
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
