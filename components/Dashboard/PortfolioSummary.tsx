"use client";

import { motion } from "framer-motion";
import { Wallet, Building, TrendingUp, PieChart } from "lucide-react";

interface PortfolioSummaryProps {
  totalProperties: number;
  totalTokens: number;
  totalValue: number;
}

export default function PortfolioSummary({
  totalProperties,
  totalTokens,
  totalValue,
}: PortfolioSummaryProps) {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-[#111633] p-5 rounded-xl border border-blue-500/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-blue-500/20 p-2 rounded-lg">
            <Building className="h-5 w-5 text-blue-400" />
          </div>
          <p className="font-medium">Properties</p>
        </div>
        <p className="text-3xl font-bold">{totalProperties}</p>
      </div>

      <div className="bg-[#111633] p-5 rounded-xl border border-blue-500/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-blue-500/20 p-2 rounded-lg">
            <PieChart className="h-5 w-5 text-blue-400" />
          </div>
          <p className="font-medium">Total Tokens</p>
        </div>
        <p className="text-3xl font-bold">{totalTokens}</p>
      </div>

      <div className="bg-[#111633] p-5 rounded-xl border border-blue-500/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-blue-500/20 p-2 rounded-lg">
            <Wallet className="h-5 w-5 text-blue-400" />
          </div>
          <p className="font-medium">Portfolio Value</p>
        </div>
        <p className="text-3xl font-bold">Ξ {totalValue.toFixed(4)}</p>
      </div>
    </motion.div>
  );
}
