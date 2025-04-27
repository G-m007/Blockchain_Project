"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useBlockchain, SellOrder } from "@/lib/useBlockchain";
import { ethers } from "ethers";
import {
  Loader2,
  Building,
  Coins,
  Filter,
  WalletIcon,
  PlusCircle,
  User,
  ShoppingBag,
  RefreshCcw,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";

export default function MarketplacePage() {
  const {
    isConnected,
    connectWallet,
    loading,
    error,
    account,
    getMarketplaceSellOrders,
    buyFromSellOrder,
  } = useBlockchain();

  const [sellOrders, setSellOrders] = useState<SellOrder[]>([]);
  const [marketplaceLoading, setMarketplaceLoading] = useState(true);
  const [marketplaceError, setMarketplaceError] = useState<string | null>(null);
  const [processingOrder, setProcessingOrder] = useState<number | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  // Load marketplace sell orders
  useEffect(() => {
    const loadMarketplace = async () => {
      if (!isConnected) {
        setMarketplaceLoading(false);
        return;
      }

      setMarketplaceLoading(true);
      try {
        const orders = await getMarketplaceSellOrders();
        console.log("Marketplace sell orders:", orders);
        setSellOrders(orders);
        setMarketplaceError(null);
      } catch (error) {
        console.error("Error loading marketplace:", error);
        setMarketplaceError("Failed to load marketplace listings");
      } finally {
        setMarketplaceLoading(false);
      }
    };

    loadMarketplace();
  }, [isConnected, getMarketplaceSellOrders]);

  // Format ETH value
  const formatEth = (value: ethers.BigNumberish) => {
    return ethers.formatEther(value);
  };

  // Handle buying tokens from a sell order
  const handleBuyTokens = async (order: SellOrder) => {
    if (!isConnected) return;

    setProcessingOrder(order.orderId);
    setPurchaseSuccess(false);

    try {
      // Calculate total cost
      const totalCost =
        ethers.toBigInt(order.pricePerToken) *
        ethers.toBigInt(order.tokenAmount);

      // Buy the tokens
      const result = await buyFromSellOrder(order.orderId, totalCost);

      if (result) {
        setPurchaseSuccess(true);
        // Refresh the marketplace after successful purchase
        const updatedOrders = await getMarketplaceSellOrders();
        setSellOrders(updatedOrders);
      }
    } catch (error) {
      console.error("Error buying tokens:", error);
      setMarketplaceError("Failed to purchase tokens");
    } finally {
      setProcessingOrder(null);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setMarketplaceLoading(true);
    try {
      const orders = await getMarketplaceSellOrders();
      setSellOrders(orders);
      setMarketplaceError(null);
    } catch (error) {
      console.error("Error refreshing marketplace:", error);
      setMarketplaceError("Failed to refresh marketplace listings");
    } finally {
      setMarketplaceLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1029] via-[#111633] to-[#0f172a] text-white pb-20">
      <PageHeader
        title="P2P Marketplace"
        description="Buy property tokens directly from other investors"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Action Buttons */}
        <div className="flex justify-between mb-6">
          <button
            onClick={handleRefresh}
            disabled={marketplaceLoading}
            className="flex items-center gap-2 px-4 py-2 bg-[#111633] text-gray-300 rounded-lg hover:bg-[#1a2046] transition-colors"
          >
            <RefreshCcw
              size={16}
              className={marketplaceLoading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <Link href="/marketplace/sell">
            <motion.button
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <PlusCircle size={18} />
              Create Sell Order
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
            <WalletIcon className="h-16 w-16 mx-auto mb-4 text-blue-400 opacity-70" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Connect Your Wallet
            </h3>
            <p className="text-gray-400 max-w-lg mx-auto mb-6">
              Please connect your wallet to browse marketplace listings and
              purchase tokens.
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
        {isConnected && marketplaceLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-10 w-10 text-blue-400 animate-spin mb-4" />
            <p className="text-gray-300">Loading marketplace listings...</p>
          </div>
        )}

        {/* Error State */}
        {isConnected && marketplaceError && !marketplaceLoading && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg mb-8">
            <p>{marketplaceError}</p>
          </div>
        )}

        {/* Purchase Success */}
        {purchaseSuccess && (
          <motion.div
            className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-lg mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} />
              <p>
                Tokens purchased successfully! They have been added to your
                portfolio.
              </p>
            </div>
          </motion.div>
        )}

        {/* Market Summary */}
        {isConnected && !marketplaceLoading && !marketplaceError && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-[#111633] p-5 rounded-xl border border-blue-500/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <ShoppingBag className="h-5 w-5 text-blue-400" />
                </div>
                <p className="font-medium">Active Listings</p>
              </div>
              <p className="text-3xl font-bold">{sellOrders.length}</p>
            </div>

            <div className="bg-[#111633] p-5 rounded-xl border border-blue-500/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <User className="h-5 w-5 text-blue-400" />
                </div>
                <p className="font-medium">Current Connected Account</p>
              </div>
              <p className="text-lg font-bold">
                {account
                  ? `${account.substring(0, 6)}...${account.substring(38)}`
                  : "Not connected"}
              </p>
            </div>
          </motion.div>
        )}

        {/* Properties Section Header */}
        {isConnected && !marketplaceLoading && !marketplaceError && (
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Marketplace Listings</h2>
          </div>
        )}

        {/* Empty State */}
        {isConnected &&
          !marketplaceLoading &&
          !marketplaceError &&
          sellOrders.length === 0 && (
            <div className="bg-[#111633]/50 border border-blue-500/20 rounded-xl p-8 text-center my-10">
              <Building className="h-16 w-16 mx-auto mb-4 text-blue-400 opacity-70" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No Active Listings
              </h3>
              <p className="text-gray-400 max-w-lg mx-auto">
                There are currently no active sell orders in the marketplace.
                Create a sell order to list your tokens for sale.
              </p>
            </div>
          )}

        {/* Sell Orders Grid */}
        {isConnected &&
          !marketplaceLoading &&
          !marketplaceError &&
          sellOrders.length > 0 && (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {sellOrders.map((order, index) => (
                <motion.div
                  key={order.orderId}
                  className="bg-[#111633] rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-blue-500/10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  {order.property && (
                    <div className="relative h-40 w-full">
                      <Image
                        src={order.property.imageURI}
                        alt={order.property.name}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 p-4">
                        <h3 className="text-xl font-bold text-white">
                          {order.property.name}
                        </h3>
                        <p className="text-gray-300 text-sm">
                          {order.property.location}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-[#0a1029]/60 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Coins className="h-4 w-4 text-blue-400" />
                          <p className="text-xs text-gray-400">
                            Tokens for Sale
                          </p>
                        </div>
                        <p className="font-bold text-lg">{order.tokenAmount}</p>
                      </div>

                      <div className="bg-[#0a1029]/60 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Coins className="h-4 w-4 text-blue-400" />
                          <p className="text-xs text-gray-400">
                            Price Per Token
                          </p>
                        </div>
                        <p className="font-bold text-lg">
                          Ξ {formatEth(order.pricePerToken)}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <p className="text-gray-400">Seller</p>
                        <p className="text-gray-300">{`${order.seller.substring(
                          0,
                          6
                        )}...${order.seller.substring(38)}`}</p>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <p className="text-gray-400">Total Cost</p>
                        <p className="text-gray-300">
                          Ξ{" "}
                          {(
                            Number(formatEth(order.pricePerToken)) *
                            order.tokenAmount
                          ).toFixed(4)}
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleBuyTokens(order)}
                        disabled={
                          processingOrder === order.orderId ||
                          order.seller.toLowerCase() === account?.toLowerCase()
                        }
                        className={`flex-grow py-2 rounded-lg font-medium flex items-center justify-center gap-2
                        ${
                          processingOrder === order.orderId
                            ? "bg-gray-500/50 cursor-not-allowed"
                            : order.seller.toLowerCase() ===
                              account?.toLowerCase()
                            ? "bg-gray-500/50 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-600 transition-colors"
                        }`}
                      >
                        {processingOrder === order.orderId ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Processing...
                          </>
                        ) : order.seller.toLowerCase() ===
                          account?.toLowerCase() ? (
                          "Your Listing"
                        ) : (
                          <>
                            <ShoppingBag size={16} />
                            Buy Tokens
                          </>
                        )}
                      </button>

                      <Link href={`/properties/${order.propertyId}`}>
                        <button className="py-2 px-3 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-colors duration-200">
                          Details
                        </button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
      </div>
    </div>
  );
}
