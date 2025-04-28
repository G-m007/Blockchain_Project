"use client";

import { useState, useEffect } from "react";
import { useBlockchain } from "../../lib/useBlockchain";
import { useVoteContract, RentApplication } from "@/lib/useVoteContract";
import { Property } from "../../lib/useBlockchain";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { formatEther } from "ethers";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

export default function RentPage() {
  const router = useRouter();
  const { properties, loading, error, isConnected, connectWallet, rentProperty } = useBlockchain();
  const { loadApplications, account } = useVoteContract();
  const [renting, setRenting] = useState<number | null>(null);
  const [rentedProperties, setRentedProperties] = useState<{ [key: number]: boolean }>({});
  const [userApplications, setUserApplications] = useState<{ [key: number]: RentApplication }>({});

  // Check rented status and user applications for each property
  useEffect(() => {
    const checkStatus = async () => {
      if (!isConnected) return;

      const rented: { [key: number]: boolean } = {};
      const applications: { [key: number]: RentApplication } = {};

      for (const property of properties) {
        if (property.isRentable) {
          try {
            // Check if property is rented
            rented[property.propertyId] = !property.isActive;

            // Check if user has applications
            if (account) {
              const propertyApplications = await loadApplications(property.propertyId);
              const userApplication = propertyApplications.find(
                (app: RentApplication) => app.applicant.toLowerCase() === account.toLowerCase()
              );
              if (userApplication) {
                applications[property.propertyId] = userApplication;
              }
            }
          } catch (error) {
            console.error("Error checking status:", error);
          }
        }
      }
      setRentedProperties(rented);
      setUserApplications(applications);
    };

    checkStatus();
  }, [isConnected, properties, account, loadApplications]);

  // Filter properties that user has applied for
  const appliedProperties = properties.filter(
    (property) => 
      property.isRentable && 
      property.isActive && 
      userApplications[property.propertyId] !== undefined
  );

  const handleRent = async (propertyId: number) => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    setRenting(propertyId);
    try {
      const success = await rentProperty(propertyId);
      if (success) {
        toast.success("Property rented successfully!");
        // Redirect to dashboard after successful rental
        router.push("/dashboard");
      } else {
        toast.error("Failed to rent property");
      }
    } catch (error) {
      console.error("Error renting property:", error);
      toast.error("Error renting property");
    } finally {
      setRenting(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-48 w-full rounded-t-lg" />
                <Skeleton className="h-6 w-3/4 mt-4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-3/4 mt-2" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8"></h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-end mb-8">
        {!isConnected && (
          <Button onClick={connectWallet} className="bg-primary hover:bg-primary/90">
            Connect Wallet to Rent
          </Button>
        )}
      </div>

      {/* Applied Properties Section */}
      {appliedProperties.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Your Applications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appliedProperties.map((property) => {
              const application = userApplications[property.propertyId];
              const isApproved = application.isActive;
              
              return (
                <Card key={property.propertyId} className={`overflow-hidden ${isApproved ? 'border-green-500/30' : 'border-yellow-500/30'}`}>
                  <div className="relative h-48">
                    <img
                      src={property.imageURI}
                      alt={property.name}
                      className="w-full h-full object-cover"
                    />
                    <Badge className={`absolute top-4 right-4 ${isApproved ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'}`}>
                      {isApproved ? 'Approved' : 'Pending'}
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle>{property.name}</CardTitle>
                    <CardDescription>{property.location}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 mb-4">{property.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center bg-gradient-to-r from-primary/10 to-primary/5 p-3 rounded-lg">
                        <span className="text-sm font-medium text-primary">Monthly Rent</span>
                        <span className="text-sm font-mono font-medium">
                          {Number(formatEther(property.monthlyRent)).toFixed(2)} ETH
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-gradient-to-r from-secondary/10 to-secondary/5 p-3 rounded-lg">
                        <span className="text-sm font-medium text-white">Total Property Value</span>
                        <span className="text-sm font-mono font-medium text-white">
                          {Number(formatEther(property.totalCost)).toFixed(2)} ETH
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-gradient-to-r from-gray-100 to-gray-50 p-3 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">Application Status</span>
                        <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                          isApproved
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {isApproved ? "Approved" : "Pending Review"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4">
                    <div className="w-full p-3 bg-primary/10 rounded-lg text-center">
                      <p className="text-xs text-primary/80 mb-1">Security Deposit Required</p>
                      <p className="text-sm font-semibold">1 Month's Rent</p>
                    </div>
                    <Button
                      className={`w-full ${isApproved ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 hover:bg-gray-500'}`}
                      onClick={() => handleRent(property.propertyId)}
                      disabled={!isConnected || renting === property.propertyId || !isApproved}
                    >
                      {renting === property.propertyId ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin">⚡</span> 
                          Processing...
                        </span>
                      ) : isApproved ? (
                        "Rent Property Now"
                      ) : (
                        "Waiting for Approval"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {appliedProperties.length === 0 && (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No Applications Found</h2>
          <p className="text-gray-500">
            You haven't applied for any properties yet. Visit the Vote page to submit rental applications.
          </p>
        </div>
      )}
    </div>
  );
} 