"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Search,
  Workflow,
  Plus,
  ArrowRight,
  User,
  Users,
  Settings,
  Link as LinkIcon,
} from "lucide-react";

import { useVoteContract, VoteProperty } from "@/lib/useVoteContract";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import PageHeader from "@/components/PageHeader";
import { ethers } from "ethers";

export default function VotePage() {
  const router = useRouter();
  const {
    connectWallet,
    isConnected,
    properties,
    loading,
    error,
    account,
    useRealEstateTokens,
    connectContracts,
  } = useVoteContract();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // Check for account changes in MetaMask
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        window.location.reload();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);

      return () => {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      };
    }
  }, []);

  // Filter properties based on search query
  const filteredProperties = properties.filter(
    (property) =>
      property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Effect to check if current user might be admin
  useEffect(() => {
    // For demonstration purposes, set isAdmin to true for the first connected account
    // In a real app, you'd implement proper admin checks
    if (isConnected && account && properties.length > 0) {
      setIsAdmin(true); // Simplified for demo
    }
  }, [isConnected, account, properties]);

  // Connect wallet
  const handleConnectWallet = async () => {
    const success = await connectWallet();
    if (success) {
      toast.success("Wallet connected successfully!");
    } else {
      toast.error("Failed to connect wallet. Please try again.");
    }
  };

  // Handle property selection
  const handlePropertySelect = (propertyId: number) => {
    router.push(`/vote/property/${propertyId}`);
  };

  // Handle connecting the contracts (admin function)
  const handleConnectContracts = async () => {
    try {
      toast.loading("Connecting contracts...", { id: "connect-contracts" });
      const success = await connectContracts();

      if (success) {
        toast.success("Contracts connected successfully!", {
          id: "connect-contracts",
        });
      } else {
        toast.error("Failed to connect contracts", { id: "connect-contracts" });
      }
    } catch (error) {
      console.error("Error connecting contracts:", error);
      toast.error("An error occurred connecting contracts", {
        id: "connect-contracts",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-950 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Property Voting Portal"
          description="View available properties, submit rental applications, and vote on candidates."
        />

        {/* Admin Panel */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg border border-blue-500/30 bg-blue-950/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-400" />
                  Admin Controls
                </h3>
                <p className="text-sm text-gray-400">
                  Contract Status:{" "}
                  {useRealEstateTokens ? (
                    <span className="text-green-400">
                      Connected to RealEstateBuy
                    </span>
                  ) : (
                    <span className="text-amber-400">
                      Not connected to RealEstateBuy
                    </span>
                  )}
                </p>
              </div>

              {!useRealEstateTokens && (
                <Button
                  onClick={handleConnectContracts}
                  variant="outline"
                  className="bg-transparent border-blue-500 hover:bg-blue-800/30 text-blue-400"
                >
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Connect Contracts
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {/* Connect Wallet Banner */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-6 rounded-lg bg-blue-900/40 border border-blue-600/50 shadow-lg"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Connect your wallet
                </h3>
                <p className="text-blue-200">
                  Connect your wallet to view properties and participate in
                  voting
                </p>
              </div>
              <Button
                onClick={handleConnectWallet}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                size="lg"
              >
                Connect Wallet
              </Button>
            </div>
          </motion.div>
        )}

        {/* Search */}
        <div className="mb-6 relative">
          <div className="flex items-center border-b border-blue-500/30 pb-4">
            <Search className="mr-2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by property name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Properties */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              Available Properties
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card
                  key={i}
                  className="bg-gray-800/60 border-gray-700 overflow-hidden"
                >
                  <CardHeader className="pb-2">
                    <Skeleton className="h-6 w-2/3 bg-gray-700" />
                    <Skeleton className="h-4 w-1/2 bg-gray-700 mt-2" />
                  </CardHeader>
                  <CardContent className="pb-3">
                    <Skeleton className="h-4 w-full bg-gray-700 mt-2" />
                    <Skeleton className="h-4 w-full bg-gray-700 mt-2" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-9 w-full bg-gray-700 rounded-md" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/30 mb-4">
                <Workflow className="h-8 w-8 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-red-400 mb-2">
                Error Loading Properties
              </h3>
              <p className="text-gray-400 max-w-md mx-auto mb-6">{error}</p>
              <Button
                onClick={handleConnectWallet}
                variant="outline"
                className="border-red-500 text-red-400 hover:bg-red-900/20"
              >
                Try Again
              </Button>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-900/30 mb-4">
                <Home className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-blue-400 mb-2">
                No Properties Found
              </h3>
              <p className="text-gray-400 max-w-md mx-auto">
                {searchQuery
                  ? "No properties match your search criteria. Try a different search term."
                  : "There are no properties available at the moment. Please check back later."}
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {filteredProperties.map((property, index) => (
                  <motion.div
                    key={property.propertyId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: { delay: index * 0.1 },
                    }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Card className="bg-blue-950/40 hover:bg-blue-900/50 border-blue-800/50 transition-all overflow-hidden h-full flex flex-col">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-xl text-white">
                            {property.name}
                          </CardTitle>
                          <Badge
                            variant={property.isActive ? "default" : "outline"}
                            className={cn(
                              property.isActive
                                ? "bg-green-600/20 text-green-400 hover:bg-green-600/30 border-green-500/30"
                                : "bg-gray-700/20 text-gray-400 hover:bg-gray-700/30 border-gray-600/30"
                            )}
                          >
                            {property.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <CardDescription className="text-gray-400">
                          <Home className="h-3.5 w-3.5" />
                          <span>{property.location}</span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-4 flex-grow">
                        <div className="mt-2 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Monthly Rent:</span>
                            <span className="text-white font-medium">
                              {ethers.formatEther(property.monthlyRent)} ETH
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Total Tokens:</span>
                            <span className="text-white font-medium">
                              {property.totalTokens}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Mapped to ID:</span>
                            <span className="text-white font-medium">
                              {property.mappedRealEstateId >= 0
                                ? property.mappedRealEstateId
                                : "Not mapped"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Rentable:</span>
                            <span
                              className={cn(
                                "font-medium",
                                property.isRentable
                                  ? "text-green-400"
                                  : "text-red-400"
                              )}
                            >
                              {property.isRentable ? "Yes" : "No"}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <Button
                          onClick={() =>
                            handlePropertySelect(property.propertyId)
                          }
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          disabled={!isConnected || !property.isActive}
                        >
                          <Users className="mr-2 h-4 w-4" />
                          View Applications
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
