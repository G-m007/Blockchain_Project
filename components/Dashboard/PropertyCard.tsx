"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ethers } from "ethers";
import { Coins, Building } from "lucide-react";
import { UserProperty } from "@/lib/useBlockchain";

interface UserPropertyCardProps {
  property: UserProperty;
  index: number;
}

export default function UserPropertyCard({
  property,
  index,
}: UserPropertyCardProps) {
  // Format ETH value
  const formatEth = (value: ethers.BigNumberish) => {
    return ethers.formatEther(value);
  };

  return (
    <motion.div
      className="bg-[#111633] rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-blue-500/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
    >
      <div className="relative h-40 w-full">
        <Image
          src={property.imageURI}
          alt={property.name}
          fill
          style={{ objectFit: "cover" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4">
          <h3 className="text-xl font-bold text-white">{property.name}</h3>
          <p className="text-gray-300 text-sm">{property.location}</p>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-[#0a1029]/60 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Building className="h-4 w-4 text-blue-400" />
              <p className="text-xs text-gray-400">Your Tokens</p>
            </div>
            <p className="font-bold text-lg">{property.userTokens}</p>
          </div>

          <div className="bg-[#0a1029]/60 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Coins className="h-4 w-4 text-blue-400" />
              <p className="text-xs text-gray-400">Value</p>
            </div>
            <p className="font-bold text-lg">
              Ξ {property.investmentValue.toFixed(4)}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-400 mt-2 mb-3">
          <span>Price per token:</span>
          <span>Ξ {formatEth(property.pricePerToken)}</span>
        </div>

        <Link href={`/properties/${property.propertyId}`}>
          <button className="w-full py-2 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-colors duration-200">
            View Property
          </button>
        </Link>
      </div>
    </motion.div>
  );
}
