"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useBlockchain } from "@/lib/useBlockchain";
import PropertyCard from "@/components/PropertyCard";
import SearchBar from "@/components/SearchBar";
import {
  PropertyLoading,
  EmptyState,
  ErrorState,
} from "@/components/PropertyStates";
import PageHeader from "@/components/PageHeader";
import { Building, Filter, ArrowUpDown } from "lucide-react";
import { ethers } from "ethers";
// Sort options
type SortOption = "nameAsc" | "nameDesc" | "priceAsc" | "priceDesc";

const PropertiesPage = () => {
  const { properties, loading, error, loadProperties } = useBlockchain();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProperties, setFilteredProperties] = useState(properties);
  const [sortOption, setSortOption] = useState<SortOption>("nameAsc");
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  console.log(properties);
  // Filter and sort properties when dependencies change
  useEffect(() => {
    // First filter based on search query
    let results = properties;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = properties.filter(
        (property) =>
          property.name.toLowerCase().includes(query) ||
          property.location.toLowerCase().includes(query)
      );
    }

    // Then sort based on selected option
    results = [...results].sort((a, b) => {
      switch (sortOption) {
        case "nameAsc":
          return a.name.localeCompare(b.name);
        case "nameDesc":
          return b.name.localeCompare(a.name);
        case "priceAsc":
          return ethers.toBigInt(a.pricePerToken) <
            ethers.toBigInt(b.pricePerToken)
            ? -1
            : 1;
        case "priceDesc":
          return ethers.toBigInt(a.pricePerToken) >
            ethers.toBigInt(b.pricePerToken)
            ? -1
            : 1;
      }
    });

    setFilteredProperties(results);
  }, [properties, searchQuery, sortOption]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Handle sort change
  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
    setIsFilterMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1029] via-[#111633] to-[#0f172a] text-white pb-20">
      <PageHeader
        title="Explore Properties"
        description="Discover and invest in premium real estate properties from around the world"
      >
        <div className="flex justify-center">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Building size={18} />
            <span>{properties.length} Properties Available</span>
          </motion.div>
        </div>
      </PageHeader>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Search and Filter Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <SearchBar onSearch={handleSearch} />

          <div className="relative">
            <button
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0f172a]/60 border border-blue-500/20 rounded-lg hover:bg-[#0f172a] transition-colors"
            >
              <ArrowUpDown size={16} />
              <span>Sort Properties</span>
            </button>

            {isFilterMenuOpen && (
              <motion.div
                className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-[#111633] border border-blue-500/20 z-10"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="py-1">
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      sortOption === "nameAsc"
                        ? "bg-blue-500/20 text-blue-400"
                        : "text-gray-300 hover:bg-[#0f172a]"
                    }`}
                    onClick={() => handleSortChange("nameAsc")}
                  >
                    Name (A-Z)
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      sortOption === "nameDesc"
                        ? "bg-blue-500/20 text-blue-400"
                        : "text-gray-300 hover:bg-[#0f172a]"
                    }`}
                    onClick={() => handleSortChange("nameDesc")}
                  >
                    Name (Z-A)
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      sortOption === "priceAsc"
                        ? "bg-blue-500/20 text-blue-400"
                        : "text-gray-300 hover:bg-[#0f172a]"
                    }`}
                    onClick={() => handleSortChange("priceAsc")}
                  >
                    Price (Low to High)
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      sortOption === "priceDesc"
                        ? "bg-blue-500/20 text-blue-400"
                        : "text-gray-300 hover:bg-[#0f172a]"
                    }`}
                    onClick={() => handleSortChange("priceDesc")}
                  >
                    Price (High to Low)
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Status messages - loading, error, empty */}
        {loading && <PropertyLoading />}

        {error && !loading && <ErrorState error={error} />}

        {!loading && !error && filteredProperties.length === 0 && (
          <EmptyState
            message={
              searchQuery
                ? `No properties found for "${searchQuery}"`
                : "No properties available"
            }
            subMessage={
              searchQuery
                ? "Try a different search term or check back later"
                : "Connect your wallet and check back later for new listings"
            }
          />
        )}

        {/* Properties grid */}
        {!loading && !error && filteredProperties.length > 0 && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {filteredProperties.map((property, index) => (
              <PropertyCard
                key={property.propertyId}
                property={property}
                index={index}
              />
            ))}
          </motion.div>
        )}

        {/* Search results message */}
        {!loading && !error && searchQuery && filteredProperties.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-400">
            Showing {filteredProperties.length}{" "}
            {filteredProperties.length === 1 ? "property" : "properties"} for "
            {searchQuery}"
          </div>
        )}

        {/* Refresh button */}
        {!loading && (
          <div className="mt-12 text-center">
            <button
              onClick={loadProperties}
              className="px-6 py-3 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-colors duration-200 inline-flex items-center gap-2"
            >
              <Filter size={16} />
              Refresh Properties
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesPage;
