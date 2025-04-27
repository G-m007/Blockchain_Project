"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ethers } from "ethers";
import { useBlockchain } from "@/lib/useBlockchain";

// Icons
import {
  WalletIcon,
  ChevronRightIcon,
  BuildingIcon,
  UsersIcon,
  ShieldIcon,
  GlobeIcon,
  Loader2Icon,
} from "lucide-react";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const {
    account,
    isConnected,
    properties,
    loading,
    error,
    connectWallet,
    loadProperties,
  } = useBlockchain();

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

  // Display only first 3 properties
  const displayProperties = properties.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1029] via-[#111633] to-[#0f172a] text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:py-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-white">
                Fractional <span className="text-blue-400">Real Estate</span>{" "}
                Investing on the Blockchain
              </h1>
              <p className="mt-6 text-lg text-gray-300 max-w-lg">
                Own pieces of premium properties without the traditional
                barriers. Invest any amount, anywhere, anytime with full
                transparency and liquidity.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <motion.button
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Explore Properties
                  <ChevronRightIcon size={18} />
                </motion.button>
                <motion.button
                  className="px-6 py-3 bg-transparent border border-blue-500/30 text-blue-400 rounded-lg font-medium flex items-center justify-center gap-2"
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  How It Works
                </motion.button>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-400">500+</p>
                  <p className="text-sm text-gray-400">Properties</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-400">15K+</p>
                  <p className="text-sm text-gray-400">Investors</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-400">$50M+</p>
                  <p className="text-sm text-gray-400">Managed</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop"
                  alt="Luxury Real Estate"
                  fill
                  style={{ objectFit: "cover" }}
                  className="rounded-2xl"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6">
                  <div className="bg-white/10 backdrop-blur-lg p-4 rounded-lg border border-white/20 w-full max-w-xs">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-semibold">Featured Property</p>
                      <div className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                        Selling Fast
                      </div>
                    </div>
                    <h3 className="text-xl font-bold">Oceanfront Mansion</h3>
                    <p className="text-gray-300 text-sm">Beverly Hills, CA</p>
                    <div className="mt-2 flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-400">Token Price</p>
                        <p className="font-bold">Ξ 0.25 ETH</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Available</p>
                        <p className="font-bold">870/1000</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <motion.div
                className="absolute -top-10 -right-10 bg-blue-500/10 backdrop-blur-md p-4 rounded-xl border border-blue-500/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <BuildingIcon className="h-6 w-6 text-blue-400" />
              </motion.div>
              <motion.div
                className="absolute -bottom-6 -left-6 bg-blue-500/10 backdrop-blur-md p-4 rounded-xl border border-blue-500/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <UsersIcon className="h-6 w-6 text-blue-400" />
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Background elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-500/10 rounded-full filter blur-3xl"></div>
      </section>

      {/* Features section */}
      <section className="py-16 bg-[#0a1029]/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-4">Why Choose BlockEstate?</h2>
            <p className="text-gray-400">
              Our platform revolutionizes property investment through blockchain
              technology, making real estate more accessible, transparent, and
              liquid.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              className="bg-[#111633] p-6 rounded-xl border border-blue-500/20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <BuildingIcon className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Fractional Ownership</h3>
              <p className="text-gray-400">
                Invest in high-value properties with as little as $100. Own
                exactly the portion you can afford.
              </p>
            </motion.div>

            <motion.div
              className="bg-[#111633] p-6 rounded-xl border border-blue-500/20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <ShieldIcon className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Blockchain Security</h3>
              <p className="text-gray-400">
                All transactions and ownership records are secured and verified
                on the blockchain, ensuring transparency.
              </p>
            </motion.div>

            <motion.div
              className="bg-[#111633] p-6 rounded-xl border border-blue-500/20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <GlobeIcon className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Global Access</h3>
              <p className="text-gray-400">
                Invest in properties worldwide without geographical restrictions
                or complex legal processes.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Properties Section - Now using blockchain data */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="flex justify-between items-center mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold">Featured Properties</h2>
            {isConnected ? (
              <button
                onClick={loadProperties}
                className="flex items-center gap-1 text-blue-400 hover:underline"
              >
                Refresh <ChevronRightIcon size={16} />
              </button>
            ) : (
              <button
                onClick={connectWallet}
                className="flex items-center gap-1 text-blue-400 hover:underline"
              >
                Connect to view <WalletIcon size={16} />
              </button>
            )}
          </motion.div>

          {/* Loading or error states */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2Icon className="h-10 w-10 text-blue-400 animate-spin mb-4" />
              <p className="text-gray-400">
                Loading properties from blockchain...
              </p>
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg mb-6">
              <p>{error}</p>
              {!isConnected && (
                <button
                  onClick={connectWallet}
                  className="mt-2 px-4 py-2 bg-red-500/20 rounded-lg text-sm"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          )}

          {/* No properties found but connected */}
          {isConnected && !loading && !error && properties.length === 0 && (
            <div className="bg-blue-500/10 border border-blue-500/30 text-blue-400 p-6 rounded-lg text-center">
              <BuildingIcon className="h-10 w-10 mx-auto mb-2" />
              <p className="font-medium">
                No properties found on the blockchain
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Properties will appear here once they're added to the contract
              </p>
            </div>
          )}

          {/* Properties grid from blockchain */}
          {!loading && !error && properties.length > 0 && (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              {displayProperties.map((property, index) => (
                <motion.div
                  key={property.propertyId}
                  className="bg-[#111633] rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-blue-500/10"
                  variants={item}
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
                    <p className="text-gray-400 text-sm mb-3">
                      {property.location}
                    </p>
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                      {property.description}
                    </p>

                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-sm text-gray-400">Available</p>
                        <p className="font-bold">
                          {property.totalNumberOfTokens} tokens
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Total Cost</p>
                        <p className="font-bold">
                          {formatEth(property.totalCost)} ETH
                        </p>
                      </div>
                    </div>

                    <button className="w-full py-2 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-colors duration-200">
                      View Details
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Show view all button if there are more than 3 properties */}
          {properties.length > 3 && (
            <div className="mt-10 text-center">
              <Link href="/properties">
                <motion.button
                  className="px-6 py-3 bg-transparent border border-blue-500/30 text-blue-400 rounded-lg font-medium flex items-center justify-center gap-2 mx-auto"
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  View All Properties
                  <ChevronRightIcon size={18} />
                </motion.button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="relative bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-2xl p-8 md:p-12 overflow-hidden border border-blue-500/20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative z-10 max-w-3xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to start your real estate investment journey?
              </h2>
              <p className="text-gray-300 mb-8">
                Join thousands of investors already growing their portfolio
                through fractional ownership.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={connectWallet}
                >
                  {isConnected
                    ? "Start Investing Now"
                    : "Connect Wallet & Start Investing"}
                </motion.button>
                <motion.button
                  className="px-6 py-3 bg-transparent border border-white/20 text-white rounded-lg font-medium"
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  Learn More
                </motion.button>
              </div>
            </div>

            {/* Background elements */}
            <div className="absolute top-0 right-0 w-1/2 h-full">
              <div className="absolute top-10 right-10 w-40 h-40 bg-blue-500/30 rounded-full filter blur-3xl"></div>
              <div className="absolute bottom-10 right-40 w-60 h-60 bg-indigo-500/30 rounded-full filter blur-3xl"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#0a1029]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-2xl font-bold mb-4">
                Block<span className="text-blue-400">Estate</span>
              </div>
              <p className="text-gray-400 mb-4">
                Revolutionizing real estate investment through blockchain
                technology.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <rect
                      width="20"
                      height="20"
                      x="2"
                      y="2"
                      rx="5"
                      ry="5"
                    ></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect width="4" height="12" x="2" y="9"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                  >
                    Properties
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                  >
                    Marketplace
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                  >
                    Dashboard
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                  >
                    How It Works
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                  >
                    FAQ
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                  >
                    Whitepaper
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                  >
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-2">
                <li className="text-gray-400">info@blockestate.io</li>
                <li className="text-gray-400">+1 (888) 555-0123</li>
                <li className="text-gray-400">
                  123 Blockchain Ave
                  <br />
                  San Francisco, CA 94103
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © 2023 BlockEstate. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-500 hover:text-blue-400 text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-400 text-sm">
                Terms of Service
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-400 text-sm">
                Legal
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
