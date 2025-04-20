"use client";

import { motion } from "framer-motion";
import { Building, Loader2 } from "lucide-react";

export function PropertyLoading() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Loader2 className="h-12 w-12 text-blue-400 animate-spin mb-4" />
      <p className="text-xl text-gray-300">
        Loading properties from blockchain...
      </p>
      <p className="text-gray-400 mt-2">
        Please wait while we fetch the latest data
      </p>
    </motion.div>
  );
}

interface EmptyStateProps {
  message?: string;
  subMessage?: string;
}

export function EmptyState({
  message = "No properties found",
  subMessage = "Try adjusting your search or check back later for new listings",
}: EmptyStateProps) {
  return (
    <motion.div
      className="bg-[#111633]/50 border border-blue-500/20 rounded-xl p-10 text-center my-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Building className="h-16 w-16 mx-auto mb-4 text-blue-400 opacity-70" />
      <h3 className="text-xl font-semibold text-white mb-2">{message}</h3>
      <p className="text-gray-400 max-w-lg mx-auto">{subMessage}</p>
    </motion.div>
  );
}

export function ErrorState({ error }: { error: string }) {
  return (
    <motion.div
      className="bg-red-500/10 border border-red-500/30 text-red-400 p-6 rounded-lg my-10 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <p className="font-medium text-lg mb-2">Error Loading Properties</p>
      <p className="text-sm opacity-90">{error}</p>
    </motion.div>
  );
}
