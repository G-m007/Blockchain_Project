"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const clearSearch = () => {
    setSearchQuery("");
    onSearch("");
  };

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto mb-10"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by property name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-[#0f172a]/60 border border-blue-500/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white placeholder:text-gray-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="absolute right-10 top-1/2 transform -translate-y-1/2 bg-blue-500/20 text-blue-400 px-3 py-1 rounded-md hover:bg-blue-500/30 transition-colors"
          style={{ display: searchQuery ? "block" : "none" }}
        >
          Search
        </button>
      </form>
    </motion.div>
  );
}
