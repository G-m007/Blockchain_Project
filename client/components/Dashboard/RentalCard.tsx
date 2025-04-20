import { RentalProperty } from "../../lib/useBlockchain";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
import { formatEther } from "ethers";
import { formatDistanceToNow } from "date-fns";

interface RentalCardProps {
  rental: RentalProperty;
  index: number;
  onPayRent: (rentalId: number) => Promise<void>;
}

export default function RentalCard({ rental, index, onPayRent }: RentalCardProps) {
  const isRentDue = () => {
    const lastPayment = new Date(rental.lastRentPayment * 1000);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return lastPayment < oneMonthAgo;
  };

  const lastPaymentDate = new Date(rental.lastRentPayment * 1000);
  const endDate = new Date(rental.endDate * 1000);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="bg-[#111633]/50 border-blue-500/20 overflow-hidden">
        <div className="relative h-48">
          <img
            src={rental.imageURI}
            alt={rental.name}
            className="w-full h-full object-cover"
          />
          {isRentDue() && (
            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm">
              Rent Due
            </div>
          )}
        </div>
        <CardHeader>
          <CardTitle className="text-xl text-white">{rental.name}</CardTitle>
          <p className="text-gray-400">{rental.location}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-[#0a1029]/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Monthly Rent:</span>
              <span className="text-white font-mono">
                {Number(formatEther(rental.monthlyRent)).toFixed(2)} ETH
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Last Payment:</span>
              <span className="text-white">
                {formatDistanceToNow(lastPaymentDate)} ago
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Lease Ends:</span>
              <span className="text-white">
                {formatDistanceToNow(endDate, { addSuffix: true })}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => onPayRent(rental.rentalId)}
            className="w-full bg-blue-500 hover:bg-blue-600"
            disabled={!isRentDue()}
          >
            {isRentDue() ? "Pay Rent" : "Rent Paid"}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
} 