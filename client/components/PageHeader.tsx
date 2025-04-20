"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  children?: ReactNode;
}

export default function PageHeader({
  title,
  description,
  children,
}: PageHeaderProps) {
  return (
    <div className="relative py-16 md:py-24 bg-[#0a1029]/70">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 w-96 h-96 bg-blue-500/5 rounded-full filter blur-3xl"></div>
        <div className="absolute right-1/4 bottom-0 w-80 h-80 bg-indigo-500/5 rounded-full filter blur-3xl"></div>
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {title}
          </h1>
          <p className="text-xl text-gray-300 mb-8">{description}</p>
          {children}
        </motion.div>
      </div>
    </div>
  );
}
