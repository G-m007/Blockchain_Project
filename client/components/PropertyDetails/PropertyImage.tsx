"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Maximize2, X } from "lucide-react";

interface PropertyImageProps {
  imageUrl: string;
  propertyName: string;
}

export default function PropertyImage({
  imageUrl,
  propertyName,
}: PropertyImageProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <>
      <div className="relative rounded-xl overflow-hidden h-[300px] md:h-[400px] lg:h-[500px] w-full">
        <Image
          src={imageUrl}
          alt={propertyName}
          fill
          style={{ objectFit: "cover" }}
          className="transition-transform duration-700 hover:scale-105"
          priority
        />
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm p-2 rounded-lg text-white hover:bg-black/70 transition-colors"
          aria-label="View fullscreen"
        >
          <Maximize2 size={20} />
        </button>
      </div>

      {/* Fullscreen image modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-5xl h-[80vh]"
          >
            <Image
              src={imageUrl}
              alt={propertyName}
              fill
              style={{ objectFit: "contain" }}
              priority
            />
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition-colors"
              aria-label="Close fullscreen"
            >
              <X size={24} />
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
}
