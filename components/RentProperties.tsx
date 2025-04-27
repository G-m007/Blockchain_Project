'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useBlockchain } from "@/lib/useBlockchain";
import { ethers } from "ethers";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Property {
  propertyId: number;
  name: string;
  location: string;
  description: string;
  imageURI: string;
  totalCost: ethers.BigNumberish;
  totalNumberOfTokens: number;
  pricePerToken: ethers.BigNumberish;
  isActive: boolean;
  isRentable: boolean;
  monthlyRent: ethers.BigNumberish;
  lastRentPayment: number;
  totalRentCollected: ethers.BigNumberish;
}

export function RentProperties() {
  const { properties, loading, error, handlePayRent } = useBlockchain();
  const [rentableProperties, setRentableProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [rentalStartDate, setRentalStartDate] = useState<Date | null>(null);

  useEffect(() => {
    // Filter only rentable properties
    const filtered = properties.filter(p => p.isRentable);
    setRentableProperties(filtered);
  }, [properties]);

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
    setShowConfirmation(true);
  };

  const handleConfirmRental = async () => {
    if (!selectedProperty) return;

    try {
      // Pay first month's rent
      const monthlyRentInEther = ethers.formatEther(selectedProperty.monthlyRent);
      await handlePayRent(selectedProperty.propertyId, monthlyRentInEther);
      
      // Set rental start date
      setRentalStartDate(new Date());
      
      toast.success("Rental agreement confirmed! You have committed to a 1-year rental period.");
      setShowConfirmation(false);
    } catch (error) {
      console.error("Error confirming rental:", error);
      toast.error("Failed to confirm rental. Please try again.");
    }
  };

  if (loading) {
    return <div>Loading properties...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Rent a Property</h1>
        <p className="text-gray-400">Select a property to rent. All rentals require a 1-year minimum commitment.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rentableProperties.map((property) => (
          <RentablePropertyCard
            key={property.propertyId}
            property={property}
            onSelect={handlePropertySelect}
          />
        ))}
      </div>

      {/* Rental Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Rental Agreement</DialogTitle>
            <DialogDescription>
              Please review the rental terms before proceeding.
            </DialogDescription>
          </DialogHeader>

          {selectedProperty && (
            <div className="space-y-4">
              <div className="aspect-video relative mb-4">
                <Image
                  src={selectedProperty.imageURI}
                  alt={selectedProperty.name}
                  fill
                  className="object-cover rounded-md"
                />
              </div>

              <div className="space-y-2">
                <h3 className="font-bold">{selectedProperty.name}</h3>
                <p className="text-gray-400">{selectedProperty.location}</p>
                <p className="text-sm">{selectedProperty.description}</p>
                
                <div className="mt-4 space-y-2">
                  <p>
                    <span className="font-semibold">Monthly Rent:</span>{" "}
                    {ethers.formatEther(selectedProperty.monthlyRent)} ETH
                  </p>
                  <p>
                    <span className="font-semibold">Minimum Term:</span>{" "}
                    1 Year
                  </p>
                  <p>
                    <span className="font-semibold">Total Commitment:</span>{" "}
                    {ethers.formatEther(ethers.toBigInt(selectedProperty.monthlyRent) * BigInt(12))} ETH
                  </p>
                </div>

                <div className="mt-4 p-4 bg-yellow-500/10 rounded-lg">
                  <p className="text-yellow-500 text-sm">
                    By confirming, you agree to rent this property for a minimum period of 1 year.
                    You will be required to pay the monthly rent of {ethers.formatEther(selectedProperty.monthlyRent)} ETH each month.
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmation(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmRental}>
              Confirm Rental
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RentablePropertyCard({ 
  property, 
  onSelect 
}: { 
  property: Property; 
  onSelect: (property: Property) => void;
}) {
  return (
    <Card className="overflow-hidden hover:border-blue-500/50 transition-colors cursor-pointer" onClick={() => onSelect(property)}>
      <CardHeader>
        <CardTitle>{property.name}</CardTitle>
        <CardDescription>{property.location}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="aspect-video relative mb-4">
          <Image
            src={property.imageURI}
            alt={property.name}
            fill
            className="object-cover rounded-md"
          />
        </div>
        <p className="text-sm mb-2">{property.description}</p>
        <div className="space-y-2">
          <p>
            <span className="font-semibold">Monthly Rent:</span>{" "}
            {ethers.formatEther(property.monthlyRent)} ETH
          </p>
          <p>
            <span className="font-semibold">Last Payment:</span>{" "}
            {property.lastRentPayment
              ? new Date(property.lastRentPayment * 1000).toLocaleDateString()
              : "No payments yet"}
          </p>
          <p>
            <span className="font-semibold">Total Rent Collected:</span>{" "}
            {ethers.formatEther(property.totalRentCollected)} ETH
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full"
          disabled={!property.isRentable}
        >
          Select Property
        </Button>
      </CardFooter>
    </Card>
  );
} 