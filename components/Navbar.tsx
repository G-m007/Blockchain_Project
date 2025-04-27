"use client";

import { useBlockchain } from "@/lib/useBlockchain";
import { motion } from "framer-motion";
import {
  HomeIcon,
  LayoutDashboardIcon,
  ShoppingBagIcon,
  WalletIcon,
  MenuIcon,
  XIcon,
  BuildingIcon,
  VoteIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { account, isConnected, connectWallet } = useBlockchain();
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0f172a]/90 backdrop-blur-md shadow-md"
          : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <motion.div
                className="text-2xl font-bold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                Block<span className="text-blue-400">Estate</span>
              </motion.div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/properties"
              className="font-medium hover:text-blue-400 transition-colors duration-200"
            >
              <div className="flex items-center gap-1">
                <HomeIcon size={18} />
                <span>Properties</span>
              </div>
            </Link>
            <Link
              href="/marketplace"
              className="font-medium hover:text-blue-400 transition-colors duration-200"
            >
              <div className="flex items-center gap-1">
                <ShoppingBagIcon size={18} />
                <span>Marketplace</span>
              </div>
            </Link>
            <Link
              href="/vote"
              className="font-medium hover:text-blue-400 transition-colors duration-200"
            >
              <div className="flex items-center gap-1">
                <VoteIcon size={18} />
                <span>Vote Rent</span>
              </div>
            </Link>
            <Link
              href="/rent"
              className="font-medium hover:text-blue-400 transition-colors duration-200"
            >
              <div className="flex items-center gap-1">
                <BuildingIcon size={18} />
                <span>Rent</span>
              </div>
            </Link>
            <Link
              href="/dashboard"
              className="font-medium hover:text-blue-400 transition-colors duration-200"
            >
              <div className="flex items-center gap-1">
                <LayoutDashboardIcon size={18} />
                <span>Dashboard</span>
              </div>
            </Link>
          </nav>

          {/* Connect Wallet Button */}
          <motion.button
            className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-lg ${
              isConnected
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-colors duration-200"
            }`}
            onClick={connectWallet}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <WalletIcon size={18} />
            {isConnected
              ? `${account?.substring(0, 6)}...${account?.substring(38)}`
              : "Connect Wallet"}
          </motion.button>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-blue-400 focus:outline-none"
            >
              {mobileMenuOpen ? (
                <XIcon className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <motion.div
          className="md:hidden bg-[#0a1029]/95 backdrop-blur-md"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="px-4 pt-2 pb-4 space-y-4">
            <Link
              href="/properties"
              className="block font-medium hover:text-blue-400 py-2"
            >
              <div className="flex items-center gap-2">
                <HomeIcon size={18} />
                <span>Properties</span>
              </div>
            </Link>
            <Link
              href="/marketplace"
              className="block font-medium hover:text-blue-400 py-2"
            >
              <div className="flex items-center gap-2">
                <ShoppingBagIcon size={18} />
                <span>Marketplace</span>
              </div>
            </Link>
            <Link
              href="/vote"
              className="block font-medium hover:text-blue-400 py-2"
            >
              <div className="flex items-center gap-2">
                <VoteIcon size={18} />
                <span>Vote Rent</span>
              </div>
            </Link>
            <Link
              href="/rent"
              className="block font-medium hover:text-blue-400 py-2"
            >
              <div className="flex items-center gap-2">
                <BuildingIcon size={18} />
                <span>Rent</span>
              </div>
            </Link>
            <Link
              href="/dashboard"
              className="block font-medium hover:text-blue-400 py-2"
            >
              <div className="flex items-center gap-2">
                <LayoutDashboardIcon size={18} />
                <span>Dashboard</span>
              </div>
            </Link>
            <button
              className={`flex w-full items-center gap-2 px-4 py-2 rounded-lg ${
                isConnected
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
              }`}
              onClick={connectWallet}
            >
              <WalletIcon size={18} />
              {isConnected
                ? `${account?.substring(0, 6)}...${account?.substring(38)}`
                : "Connect Wallet"}
            </button>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
