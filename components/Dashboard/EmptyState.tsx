"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Building, ChevronRight } from "lucide-react";

export default function EmptyState() {
  return (
    <motion.div
      className="bg-[#111633]/50 border border-blue-500/20 rounded-xl p-10 text-center my-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Building className="h-16 w-16 mx-auto mb-4 text-blue-400 opacity-70" />
      <h3 className="text-xl font-semibold text-white mb-2">
        No Investments Yet
      </h3>
      <p className="text-gray-400 max-w-lg mx-auto mb-6">
        You haven't invested in any properties yet. Start building your real
        estate portfolio by exploring available properties.
      </p>
      <Link href="/properties">
        <button className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 mx-auto">
          Browse Properties
          <ChevronRight size={18} />
        </button>
      </Link>
    </motion.div>
  );
}
