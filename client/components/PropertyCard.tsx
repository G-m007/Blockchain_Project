"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ethers } from "ethers";
import { Property } from "@/lib/useBlockchain";

interface PropertyCardProps {
  property: Property;
  index?: number;
}

export default function PropertyCard({
  property,
  index = 0,
}: PropertyCardProps) {
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
      whileHover={{ y: -10 }}
    >
      <div className="relative h-56 w-full">
        <Image
          src={property.imageURI}
          alt={property.name}
          fill
          style={{ objectFit: "cover" }}
        />
        <div className="absolute top-4 right-4 bg-blue-500/90 text-white text-sm px-2 py-1 rounded-lg">
          Ξ {formatEth(property.pricePerToken)} ETH per token
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-1">{property.name}</h3>
        <p className="text-gray-400 text-sm mb-3">{property.location}</p>
        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
          {property.description}
        </p>

        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-gray-400">Available</p>
            <p className="font-bold">{property.totalNumberOfTokens} tokens</p>
          </div>
          <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: `100%` }}></div>
          </div>
        </div>

        <Link href={`/properties/${property.propertyId}`}>
          <button className="w-full py-2 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-colors duration-200">
            View Details
          </button>
        </Link>
      </div>
    </motion.div>
  );
}
