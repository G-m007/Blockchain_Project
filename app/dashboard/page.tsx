"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useBlockchain, UserProperty, RentalProperty } from "../../lib/useBlockchain";
import UserPropertyCard from "../../components/Dashboard/PropertyCard";
import RentalCard from "../../components/Dashboard/RentalCard";
import EmptyState from "../../components/Dashboard/EmptyState";
import PortfolioSummary from "../../components/Dashboard/PortfolioSummary";
import { Loader2, WalletIcon, Filter } from "lucide-react";
import { toast } from "sonner";

export default function DashboardPage() {
  const { getUserProperties, getUserRentals, isConnected, connectWallet, account, payRent } =
    useBlockchain();
  const [userProperties, setUserProperties] = useState<UserProperty[]>([]);
  const [userRentals, setUserRentals] = useState<RentalProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate portfolio summary
  const totalProperties = userProperties.length;
  const totalTokens = userProperties.reduce(
    (sum, prop) => sum + prop.userTokens,
    0
  );
  const totalValue = userProperties.reduce(
    (sum, prop) => sum + prop.investmentValue,
    0
  );

  // Fetch user properties and rentals on mount
  useEffect(() => {
    const loadUserData = async () => {
      if (!isConnected) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [properties, rentals] = await Promise.all([
          getUserProperties(),
          getUserRentals()
        ]);
        console.log("User properties:", properties);
        console.log("User rentals:", rentals);
        setUserProperties(properties);
        setUserRentals(rentals);
        setError(null);
      } catch (error) {
        console.error("Error loading user data:", error);
        setError("Failed to load your investments and rentals");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [isConnected, getUserProperties, getUserRentals, account]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const [properties, rentals] = await Promise.all([
        getUserProperties(),
        getUserRentals()
      ]);
      setUserProperties(properties);
      setUserRentals(rentals);
      setError(null);
    } catch (error) {
      console.error("Error refreshing data:", error);
      setError("Failed to refresh your investments and rentals");
    } finally {
      setLoading(false);
    }
  };

  const handlePayRent = async (rentalId: number) => {
    try {
      const success = await payRent(rentalId);
      if (success) {
        toast.success("Rent payment successful!");
        handleRefresh();
      } else {
        toast.error("Failed to pay rent");
      }
    } catch (error) {
      console.error("Error paying rent:", error);
      toast.error("Error paying rent");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1029] via-[#111633] to-[#0f172a] text-white pt-32 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Dashboard Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Investment Dashboard
          </h1>
          {isConnected ? (
            <p className="text-gray-400">
              Welcome back,{" "}
              <span className="text-blue-400">
                {account?.substring(0, 6)}...{account?.substring(38)}
              </span>
            </p>
          ) : (
            <p className="text-gray-400">
              Connect your wallet to view your investments
            </p>
          )}
        </motion.div>

        {/* Connect Wallet State */}
        {!isConnected && (
          <motion.div
            className="bg-[#111633]/50 border border-blue-500/20 rounded-xl p-8 text-center my-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <WalletIcon className="h-16 w-16 mx-auto mb-4 text-blue-400 opacity-70" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Connect Your Wallet
            </h3>
            <p className="text-gray-400 max-w-lg mx-auto mb-6">
              Please connect your wallet to view your investment portfolio and
              track your property tokens.
            </p>
            <button
              onClick={connectWallet}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 mx-auto"
            >
              <WalletIcon size={18} />
              Connect Wallet
            </button>
          </motion.div>
        )}

        {/* Loading State */}
        {isConnected && loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-10 w-10 text-blue-400 animate-spin mb-4" />
            <p className="text-gray-300">
              Loading your investment portfolio...
            </p>
          </div>
        )}

        {/* Error State */}
        {isConnected && error && !loading && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg mb-8">
            <p>{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Portfolio Content */}
        {isConnected && !loading && !error && (
          <>
            {/* Portfolio Summary */}
            <PortfolioSummary
              totalProperties={totalProperties}
              totalTokens={totalTokens}
              totalValue={totalValue}
            />

            {/* Investments Section */}
            <div className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Your Investments</h2>
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-1 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-colors"
                >
                  <Filter size={16} />
                  Refresh
                </button>
              </div>

              {/* Empty State for Investments */}
              {userProperties.length === 0 && <EmptyState />}

              {/* Property Grid */}
              {userProperties.length > 0 && (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {userProperties.map((property, index) => (
                    <UserPropertyCard
                      key={property.propertyId}
                      property={property}
                      index={index}
                    />
                  ))}
                </motion.div>
              )}
            </div>

            {/* Rentals Section */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Your Rentals</h2>
              </div>

              {/* Empty State for Rentals */}
              {userRentals.length === 0 && (
                <div className="bg-[#111633]/50 border border-blue-500/20 rounded-xl p-8 text-center">
                  <h3 className="text-xl font-semibold text-white mb-2">No Active Rentals</h3>
                  <p className="text-gray-400">
                    You haven't rented any properties yet. Visit the rent page to explore available properties.
                  </p>
                </div>
              )}

              {/* Rentals Grid */}
              {userRentals.length > 0 && (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {userRentals.map((rental, index) => (
                    <RentalCard
                      key={rental.rentalId}
                      rental={rental}
                      index={index}
                      onPayRent={handlePayRent}
                    />
                  ))}
                </motion.div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
