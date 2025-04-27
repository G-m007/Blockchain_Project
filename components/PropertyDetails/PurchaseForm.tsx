"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ethers } from "ethers";
import { Check, Loader2, AlertTriangle, Info } from "lucide-react";
import { useBlockchain } from "@/lib/useBlockchain";

interface PurchaseFormProps {
  propertyId: number;
  pricePerToken: ethers.BigNumberish;
  totalTokens: number;
}

export default function PurchaseForm({
  propertyId,
  pricePerToken,
  totalTokens,
}: PurchaseFormProps) {
  const [tokensToPurchase, setTokensToPurchase] = useState(1);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [lastPurchasedAmount, setLastPurchasedAmount] = useState(0);
  const { isConnected, connectWallet, purchaseTokens } = useBlockchain();

  // Format ETH value
  const formatEth = (value: ethers.BigNumberish) => {
    return ethers.formatEther(value);
  };

  // Calculate total cost
  const totalCost = parseFloat(formatEth(pricePerToken)) * tokensToPurchase;

  const handlePurchase = async () => {
    if (!isConnected) {
      await connectWallet();
      return;
    }

    setIsPurchasing(true);
    setPurchaseError(null);
    setPurchaseSuccess(false);

    try {
      const amountBeingPurchased = tokensToPurchase;

      const success = await purchaseTokens(propertyId, tokensToPurchase);

      if (success) {
        setLastPurchasedAmount(amountBeingPurchased);
        setPurchaseSuccess(true);
        setTokensToPurchase(1);
      } else {
        setPurchaseError("Transaction failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Purchase error:", error);
      setPurchaseError(
        error.message || "Transaction failed. Please try again."
      );
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <motion.div
      className="bg-[#111633] p-6 rounded-xl border border-blue-500/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <h3 className="text-xl font-bold mb-4">Purchase Tokens</h3>

      <div className="mb-6">
        <label className="block text-gray-300 mb-2">Number of Tokens</label>
        <div className="flex items-center">
          <button
            onClick={() => setTokensToPurchase((prev) => Math.max(1, prev - 1))}
            className="bg-[#0a1029] px-3 py-2 rounded-l-lg border-y border-l border-blue-500/20 text-white hover:bg-[#0f172a] transition-colors"
            disabled={isPurchasing}
          >
            -
          </button>
          <input
            type="number"
            value={tokensToPurchase}
            onChange={(e) => setTokensToPurchase(parseInt(e.target.value) || 1)}
            min="1"
            max={totalTokens}
            className="bg-[#0a1029] border-y border-blue-500/20 text-center py-2 px-4 text-white focus:outline-none w-20"
            disabled={isPurchasing}
          />
          <button
            onClick={() =>
              setTokensToPurchase((prev) => Math.min(totalTokens, prev + 1))
            }
            className="bg-[#0a1029] px-3 py-2 rounded-r-lg border-y border-r border-blue-500/20 text-white hover:bg-[#0f172a] transition-colors"
            disabled={isPurchasing}
          >
            +
          </button>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Price per token:</span>
          <span>Ξ {formatEth(pricePerToken)} ETH</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400">Quantity:</span>
          <span>{tokensToPurchase} tokens</span>
        </div>

        <div className="border-t border-blue-500/10 pt-3">
          <div className="flex justify-between items-center font-semibold">
            <span>Total Cost:</span>
            <span className="text-blue-400">Ξ {totalCost.toFixed(6)} ETH</span>
          </div>
        </div>
      </div>

      {purchaseSuccess && (
        <motion.div
          className="bg-green-500/10 border border-green-500/30 text-green-400 p-3 rounded-lg mb-4 flex items-center gap-2"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          <Check size={18} />
          <p>
            Purchase successful! You now own {lastPurchasedAmount}
            {" more "}
            {lastPurchasedAmount === 1 ? "token" : "tokens"} of this property.
          </p>
        </motion.div>
      )}

      {purchaseError && (
        <motion.div
          className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-4 flex items-center gap-2"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          <AlertTriangle size={18} />
          <p>{purchaseError}</p>
        </motion.div>
      )}

      <motion.div
        className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-lg mb-6 text-sm text-gray-300 flex items-start gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Info size={18} className="text-blue-400 mt-0.5 flex-shrink-0" />
        <p>
          By purchasing tokens, you're acquiring fractional ownership in this
          property. Each token represents a share of the property's value and
          potential returns.
        </p>
      </motion.div>

      <button
        onClick={handlePurchase}
        disabled={isPurchasing}
        className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
          isConnected
            ? "bg-blue-500 hover:bg-blue-600 text-white"
            : "bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30"
        }`}
      >
        {isPurchasing ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Processing...
          </>
        ) : isConnected ? (
          "Purchase Tokens"
        ) : (
          "Connect Wallet to Purchase"
        )}
      </button>
    </motion.div>
  );
}
