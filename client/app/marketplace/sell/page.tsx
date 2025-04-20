"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useBlockchain, UserProperty } from "@/lib/useBlockchain";
import { ethers } from "ethers";
import Image from "next/image";
import {
  Loader2,
  ArrowLeft,
  Building,
  Coins,
  AlertTriangle,
  Check,
  Tag,
  ShoppingBag,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Link from "next/link";

export default function SellTokensPage() {
  const router = useRouter();
  const {
    getUserProperties,
    isConnected,
    connectWallet,
    loading,
    error,
    createSellOrder,
    account,
  } = useBlockchain();
  const [userProperties, setUserProperties] = useState<UserProperty[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<UserProperty | null>(
    null
  );
  const [tokensToSell, setTokensToSell] = useState<number>(1);
  const [pricePerToken, setPricePerToken] = useState<string>("");
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionSuccess, setTransactionSuccess] = useState(false);

  // Format ETH value
  const formatEth = (value: ethers.BigNumberish) => {
    return ethers.formatEther(value);
  };

  // Load user properties
  useEffect(() => {
    const loadUserProperties = async () => {
      if (!isConnected) {
        setPageLoading(false);
        return;
      }

      setPageLoading(true);
      try {
        const properties = await getUserProperties();
        setUserProperties(properties);
        setPageError(null);
      } catch (error) {
        console.error("Error loading user properties:", error);
        setPageError("Failed to load your properties");
      } finally {
        setPageLoading(false);
      }
    };

    loadUserProperties();
  }, [isConnected, getUserProperties]);

  // Set default price when property is selected
  useEffect(() => {
    if (selectedProperty) {
      // Set initial price to the original token price by default
      setPricePerToken(formatEth(selectedProperty.pricePerToken));
    }
  }, [selectedProperty]);

  // Handle property selection
  const handleSelectProperty = (property: UserProperty) => {
    setSelectedProperty(property);
    setTokensToSell(1); // Reset tokens to sell when selecting a property
  };

  // Handle token amount change
  const handleTokenAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (
      selectedProperty &&
      value >= 1 &&
      value <= selectedProperty.userTokens
    ) {
      setTokensToSell(value);
    }
  };

  // Handle price change
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only valid numbers with up to 18 decimals
    if (/^\d*\.?\d{0,18}$/.test(value) || value === "") {
      setPricePerToken(value);
    }
  };

  // Calculate total sale value
  const calculateSaleValue = () => {
    if (!selectedProperty || !pricePerToken) return 0;
    return parseFloat(pricePerToken) * tokensToSell;
  };

  // Handle create sell order
  const handleCreateSellOrder = async () => {
    if (!selectedProperty || !isConnected || !pricePerToken) return;

    setIsProcessing(true);
    setPageError(null);

    try {
      // Convert price to wei
      const priceInWei = ethers.parseEther(pricePerToken);

      // Create sell order
      const result = await createSellOrder(
        selectedProperty.propertyId,
        tokensToSell,
        priceInWei
      );

      if (result) {
        setTransactionSuccess(true);
        // Refresh the properties list after successful transaction
        const updatedProperties = await getUserProperties();
        setUserProperties(updatedProperties);

        // Reset selected property if user sold all tokens
        const updatedProperty = updatedProperties.find(
          (p) => p.propertyId === selectedProperty.propertyId
        );

        if (!updatedProperty) {
          setSelectedProperty(null);
        } else {
          setSelectedProperty(updatedProperty);
          if (tokensToSell > updatedProperty.userTokens) {
            setTokensToSell(updatedProperty.userTokens);
          }
        }
      } else {
        setPageError("Transaction failed. Please try again.");
      }
    } catch (error) {
      console.error("Error creating sell order:", error);
      setPageError("Failed to create sell order");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1029] via-[#111633] to-[#0f172a] text-white pb-20">
      <PageHeader
        title="Create Sell Order"
        description="List your property tokens for sale on the marketplace"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/marketplace">
            <motion.button
              className="flex items-center gap-2 px-4 py-2 bg-[#111633] text-gray-300 rounded-lg hover:bg-[#1a2046] transition-colors"
              whileHover={{ x: -5 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <ArrowLeft size={16} />
              Back to Marketplace
            </motion.button>
          </Link>
        </div>

        {/* Connect Wallet State */}
        {!isConnected && (
          <motion.div
            className="bg-[#111633]/50 border border-blue-500/20 rounded-xl p-8 text-center my-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Building className="h-16 w-16 mx-auto mb-4 text-blue-400 opacity-70" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Connect Your Wallet
            </h3>
            <p className="text-gray-400 max-w-lg mx-auto mb-6">
              Please connect your wallet to view your properties and create sell
              orders.
            </p>
            <button
              onClick={connectWallet}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 mx-auto"
            >
              <Coins size={18} />
              Connect Wallet
            </button>
          </motion.div>
        )}

        {/* Loading State */}
        {isConnected && pageLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-10 w-10 text-blue-400 animate-spin mb-4" />
            <p className="text-gray-300">Loading your properties...</p>
          </div>
        )}

        {/* Error State */}
        {isConnected && pageError && !pageLoading && !transactionSuccess && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg mb-8">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} />
              <p>{pageError}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {transactionSuccess && (
          <motion.div
            className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-lg mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2">
              <Check size={18} />
              <p>
                Sell order created successfully! Your tokens are now listed on
                the marketplace.
              </p>
            </div>
          </motion.div>
        )}

        {/* No Properties */}
        {isConnected &&
          !pageLoading &&
          !pageError &&
          userProperties.length === 0 && (
            <div className="bg-[#111633]/50 border border-blue-500/20 rounded-xl p-8 text-center my-10">
              <Building className="h-16 w-16 mx-auto mb-4 text-blue-400 opacity-70" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No Properties Found
              </h3>
              <p className="text-gray-400 max-w-lg mx-auto">
                You don't own any property tokens yet. Visit the marketplace to
                invest in properties.
              </p>
              <Link href="/properties">
                <button className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium">
                  Browse Properties
                </button>
              </Link>
            </div>
          )}

        {/* Properties and Sell Form */}
        {isConnected &&
          !pageLoading &&
          !pageError &&
          userProperties.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Properties List */}
              <div className="lg:col-span-1">
                <h2 className="text-xl font-bold mb-4">Your Properties</h2>
                <div className="space-y-4">
                  {userProperties.map((property) => (
                    <motion.div
                      key={property.propertyId}
                      className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedProperty?.propertyId === property.propertyId
                          ? "bg-blue-500/20 border border-blue-500/40"
                          : "bg-[#111633] border border-blue-500/10 hover:border-blue-500/30"
                      }`}
                      onClick={() => handleSelectProperty(property)}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 rounded-md overflow-hidden flex-shrink-0">
                          <Image
                            src={property.imageURI}
                            alt={property.name}
                            fill
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-medium text-white">
                            {property.name}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {property.location}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-blue-400">
                            {property.userTokens}
                          </p>
                          <p className="text-xs text-gray-400">tokens</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Sell Form */}
              <div className="lg:col-span-2">
                {selectedProperty ? (
                  <motion.div
                    className="bg-[#111633] rounded-xl overflow-hidden border border-blue-500/20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="relative h-48 w-full">
                      <Image
                        src={selectedProperty.imageURI}
                        alt={selectedProperty.name}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 p-6">
                        <h3 className="text-2xl font-bold text-white">
                          {selectedProperty.name}
                        </h3>
                        <p className="text-gray-300">
                          {selectedProperty.location}
                        </p>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="grid grid-cols-2 gap-6 mb-6">
                        <div className="bg-[#0a1029]/60 p-4 rounded-lg">
                          <p className="text-sm text-gray-400 mb-1">
                            Your Tokens
                          </p>
                          <p className="text-2xl font-bold">
                            {selectedProperty.userTokens}
                          </p>
                        </div>
                        <div className="bg-[#0a1029]/60 p-4 rounded-lg">
                          <p className="text-sm text-gray-400 mb-1">
                            Original Price
                          </p>
                          <p className="text-2xl font-bold">
                            Ξ {formatEth(selectedProperty.pricePerToken)}
                          </p>
                        </div>
                      </div>

                      <div className="mb-6">
                        <label className="block text-gray-400 mb-2">
                          Number of Tokens to Sell
                        </label>
                        <div className="flex items-center">
                          <input
                            type="range"
                            min="1"
                            max={selectedProperty.userTokens}
                            value={tokensToSell}
                            onChange={handleTokenAmountChange}
                            className="w-full h-2 bg-[#0a1029] rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <input
                            type="number"
                            min="1"
                            max={selectedProperty.userTokens}
                            value={tokensToSell}
                            onChange={handleTokenAmountChange}
                            className="w-24 bg-[#0a1029] border border-blue-500/20 rounded-md px-3 py-2 text-white"
                          />
                          <p className="text-gray-400">
                            of {selectedProperty.userTokens} tokens
                          </p>
                        </div>
                      </div>

                      <div className="mb-6">
                        <label className="block text-gray-400 mb-2">
                          Price per Token (ETH)
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Tag className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            value={pricePerToken}
                            onChange={handlePriceChange}
                            placeholder="0.0"
                            className="w-full pl-10 py-2 bg-[#0a1029] border border-blue-500/20 rounded-md px-3 text-white"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Original token price: Ξ{" "}
                          {formatEth(selectedProperty.pricePerToken)}
                        </p>
                      </div>

                      <div className="bg-[#0a1029]/60 p-4 rounded-lg mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-gray-400">Total Value</p>
                          <p className="font-bold text-xl">
                            Ξ {calculateSaleValue().toFixed(4)}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">
                          You will receive approximately{" "}
                          {calculateSaleValue().toFixed(4)} ETH when someone
                          buys your tokens
                        </p>
                      </div>

                      <button
                        onClick={handleCreateSellOrder}
                        disabled={
                          isProcessing ||
                          tokensToSell < 1 ||
                          !pricePerToken ||
                          parseFloat(pricePerToken) <= 0
                        }
                        className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 
                        ${
                          isProcessing ||
                          !pricePerToken ||
                          parseFloat(pricePerToken) <= 0
                            ? "bg-gray-500/50 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-600 transition-colors"
                        }`}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Processing Transaction...
                          </>
                        ) : (
                          <>
                            <ShoppingBag size={18} />
                            Create Sell Order
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="bg-[#111633]/50 border border-blue-500/20 rounded-xl p-8 text-center h-full flex flex-col justify-center">
                    <Building className="h-12 w-12 mx-auto mb-4 text-blue-400 opacity-70" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Select a Property
                    </h3>
                    <p className="text-gray-400">
                      Choose a property from the list to create a sell order
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
