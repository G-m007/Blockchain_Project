"use client";

import { motion } from "framer-motion";
import { ethers } from "ethers";
import { MapPin, Coins, Tag, Users } from "lucide-react";

interface PropertyStatsProps {
  location: string;
  totalCost: ethers.BigNumberish;
  totalNumberOfTokens: number;
  pricePerToken: ethers.BigNumberish;
}

export default function PropertyStats({
  location,
  totalCost,
  totalNumberOfTokens,
  pricePerToken,
}: PropertyStatsProps) {
  // Format ETH value
  const formatEth = (value: ethers.BigNumberish) => {
    return ethers.formatEther(value);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div
        className="bg-[#111633] p-4 rounded-xl border border-blue-500/20"
        variants={item}
      >
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/20 p-2 rounded-lg">
            <MapPin className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Location</p>
            <p className="font-semibold">{location}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="bg-[#111633] p-4 rounded-xl border border-blue-500/20"
        variants={item}
      >
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/20 p-2 rounded-lg">
            <Coins className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Total Value</p>
            <p className="font-semibold">Ξ {formatEth(totalCost)} ETH</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="bg-[#111633] p-4 rounded-xl border border-blue-500/20"
        variants={item}
      >
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/20 p-2 rounded-lg">
            <Users className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Total Tokens</p>
            <p className="font-semibold">{totalNumberOfTokens}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="bg-[#111633] p-4 rounded-xl border border-blue-500/20"
        variants={item}
      >
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/20 p-2 rounded-lg">
            <Tag className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Price Per Token</p>
            <p className="font-semibold">Ξ {formatEth(pricePerToken)} ETH</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
