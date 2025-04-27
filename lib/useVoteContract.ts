"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import {
  VOTE_CONTRACT_ADDRESS,
  REAL_ESTATE_CONTRACT_ADDRESS,
} from "../constants";
import VoteContractABI from "../../artifacts/contracts/Vote.sol/VoteContract.json";
import RealEstateBuy from "../../artifacts/contracts/RealEstateBuy.sol/RealEstateBuy.json";

export interface VoteProperty {
  propertyId: number;
  name: string;
  location: string;
  totalTokens: number;
  isActive: boolean;
  isRentable: boolean;
  monthlyRent: ethers.BigNumberish;
  mappedRealEstateId: number;
}

export interface RentApplication {
  applicationId: number;
  propertyId: number;
  applicant: string;
  name: string;
  description: string;
  votingEndTime: number;
  isActive: boolean;
  isApproved: boolean;
  selectedRenter: string;
}

export function useVoteContract() {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [properties, setProperties] = useState<VoteProperty[]>([]);
  const [applications, setApplications] = useState<RentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useRealEstateTokens, setUseRealEstateTokens] = useState(false);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    if (
      typeof window !== "undefined" &&
      typeof window.ethereum !== "undefined"
    ) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
        setIsConnected(true);
        return true;
      } catch (error) {
        console.error("User denied account access", error);
        setError("Failed to connect wallet. User denied access.");
        return false;
      }
    } else {
      setError(
        "MetaMask is not installed. Please install MetaMask to use this feature."
      );
      return false;
    }
  }, []);

  // Check if the vote contract is linked to RealEstateBuy
  const checkVoteContractStatus = useCallback(async () => {
    if (
      typeof window === "undefined" ||
      typeof window.ethereum === "undefined"
    ) {
      return false;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        VOTE_CONTRACT_ADDRESS,
        VoteContractABI.abi,
        provider
      );

      // Check if the contract is using the RealEstateBuy contract
      const isUsingRealEstate = await contract.useRealEstateContract();
      setUseRealEstateTokens(isUsingRealEstate);
      return isUsingRealEstate;
    } catch (error) {
      console.error("Error checking vote contract status:", error);
      return false;
    }
  }, []);

  // Load properties from the contract
  const loadProperties = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if MetaMask is available
      if (
        typeof window === "undefined" ||
        typeof window.ethereum === "undefined"
      ) {
        setError("MetaMask is not installed");
        return;
      }

      // Initialize provider and contract
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        VOTE_CONTRACT_ADDRESS,
        VoteContractABI.abi,
        provider
      );

      console.log("Fetching properties from blockchain...");

      try {
        // Check if the contract is using RealEstateBuy
        await checkVoteContractStatus();

        // Get all properties from the contract
        const allPropertiesCount = await contract.getPropertiesCount();
        console.log("Total properties:", Number(allPropertiesCount));

        const allProperties = await contract.getAllProperties();

        // Format the properties
        const formattedProperties = allProperties.map(
          (prop: any, index: number) => ({
            propertyId: Number(prop.propertyId),
            name: prop.name,
            location: prop.location,
            totalTokens: Number(prop.totalTokens),
            isActive: prop.isActive,
            isRentable: prop.isRentable,
            monthlyRent: prop.monthlyRent,
            mappedRealEstateId: Number(prop.mappedRealEstateId),
          })
        );

        console.log("Formatted properties:", formattedProperties);
        setProperties(formattedProperties);
      } catch (contractError: any) {
        console.error("Error calling contract:", contractError);
        setError(
          "Error loading properties: " +
            (contractError.message || String(contractError))
        );
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setError("Failed to load properties from blockchain");
    } finally {
      setLoading(false);
    }
  }, [checkVoteContractStatus]);

  // Load applications for a property
  const loadApplications = useCallback(
    async (propertyId: number) => {
      try {
        if (!isConnected) {
          throw new Error("Please connect your wallet first");
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(
          VOTE_CONTRACT_ADDRESS,
          VoteContractABI.abi,
          provider
        );

        // Get applications for the property
        const applications = await contract.getPropertyApplications(propertyId);

        // Format the applications
        const formattedApplications = applications.map((app: any) => ({
          applicationId: Number(app.applicationId),
          propertyId: Number(app.propertyId),
          applicant: app.applicant,
          name: app.name,
          description: app.description,
          votingEndTime: Number(app.votingEndTime),
          isActive: app.isActive,
          isApproved: app.isApproved,
          selectedRenter: app.selectedRenter,
        }));

        console.log("Applications for property:", formattedApplications);
        setApplications(formattedApplications);
        return formattedApplications;
      } catch (error: any) {
        console.error("Error loading applications:", error);
        setError(error.message || "Failed to load applications");
        return [];
      }
    },
    [isConnected]
  );

  // Apply for rent
  const applyForRent = useCallback(
    async (propertyId: number, name: string, description: string) => {
      if (!isConnected) {
        setError("Please connect your wallet first");
        return false;
      }

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          VOTE_CONTRACT_ADDRESS,
          VoteContractABI.abi,
          signer
        );

        console.log("Applying for rent:", {
          propertyId,
          name,
          description,
        });

        // Execute the transaction
        const tx = await contract.applyForRent(propertyId, name, description);
        console.log("Transaction hash:", tx.hash);
        const receipt = await tx.wait();
        console.log("Transaction confirmed:", receipt);

        return true;
      } catch (error: any) {
        console.error("Apply for rent error:", error);
        setError(error.reason || error.message || "Transaction failed");
        return false;
      }
    },
    [isConnected]
  );

  // Vote for a candidate
  const voteForRent = useCallback(
    async (applicationId: number, candidateAddress: string) => {
      if (!isConnected) {
        setError("Please connect your wallet first");
        return false;
      }

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          VOTE_CONTRACT_ADDRESS,
          VoteContractABI.abi,
          signer
        );

        console.log("Voting for candidate:", {
          applicationId,
          candidateAddress,
        });

        // Execute the transaction
        const tx = await contract.voteForRent(applicationId, candidateAddress);
        console.log("Transaction hash:", tx.hash);
        const receipt = await tx.wait();
        console.log("Transaction confirmed:", receipt);

        return true;
      } catch (error: any) {
        console.error("Vote error:", error);
        setError(error.reason || error.message || "Transaction failed");
        return false;
      }
    },
    [isConnected]
  );

  // Finalize application
  const finalizeApplication = useCallback(
    async (applicationId: number) => {
      if (!isConnected) {
        setError("Please connect your wallet first");
        return false;
      }

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          VOTE_CONTRACT_ADDRESS,
          VoteContractABI.abi,
          signer
        );

        console.log("Finalizing application:", applicationId);

        // Execute the transaction
        const tx = await contract.finalizeApplication(applicationId);
        console.log("Transaction hash:", tx.hash);
        const receipt = await tx.wait();
        console.log("Transaction confirmed:", receipt);

        return true;
      } catch (error: any) {
        console.error("Finalize application error:", error);
        setError(error.reason || error.message || "Transaction failed");
        return false;
      }
    },
    [isConnected]
  );

  // Get candidate votes
  const getCandidateVotes = useCallback(
    async (applicationId: number, candidateAddress: string) => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(
          VOTE_CONTRACT_ADDRESS,
          VoteContractABI.abi,
          provider
        );

        const votes = await contract.getCandidateVotes(
          applicationId,
          candidateAddress
        );
        return Number(votes);
      } catch (error: any) {
        console.error("Error getting votes:", error);
        return 0;
      }
    },
    []
  );

  // Get tokens owned - combines tokens from both contracts
  const getTokensOwned = useCallback(
    async (propertyId: number) => {
      if (!isConnected || !account) {
        return 0;
      }

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const voteContract = new ethers.Contract(
          VOTE_CONTRACT_ADDRESS,
          VoteContractABI.abi,
          provider
        );

        // Get the property to check if it's mapped
        const property = properties.find((p) => p.propertyId === propertyId);

        if (
          useRealEstateTokens &&
          property &&
          property.mappedRealEstateId > 0
        ) {
          // If the contract is linked and the property is mapped, get tokens directly from the contract
          const tokens = await voteContract.getTokensOwned(propertyId, account);
          return Number(tokens);
        } else {
          // Otherwise, just get the tokens from the vote contract
          const voteTokens = await voteContract.tokenOwnership(
            propertyId,
            account
          );

          // If we know the mapped property but the contract integration isn't set up, check both contracts
          if (property && property.mappedRealEstateId > 0) {
            try {
              const realEstateContract = new ethers.Contract(
                REAL_ESTATE_CONTRACT_ADDRESS,
                RealEstateBuy.abi,
                provider
              );

              const realEstateTokens = await realEstateContract.tokenOwnership(
                property.mappedRealEstateId,
                account
              );

              return Number(voteTokens) + Number(realEstateTokens);
            } catch (error) {
              console.error("Error checking RealEstateBuy tokens:", error);
              return Number(voteTokens);
            }
          }

          return Number(voteTokens);
        }
      } catch (error: any) {
        console.error("Error getting tokens:", error);
        return 0;
      }
    },
    [isConnected, account, properties, useRealEstateTokens]
  );

  // Check if user has voted
  const hasUserVoted = useCallback(
    async (applicationId: number) => {
      if (!isConnected || !account) {
        return false;
      }

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(
          VOTE_CONTRACT_ADDRESS,
          VoteContractABI.abi,
          provider
        );

        return await contract.hasTokenHolderVoted(applicationId, account);
      } catch (error: any) {
        console.error("Error checking vote status:", error);
        return false;
      }
    },
    [isConnected, account]
  );

  // Purchase tokens
  const purchaseTokens = useCallback(
    async (propertyId: number, tokensToPurchase: number) => {
      if (!isConnected) {
        setError("Please connect your wallet first");
        return false;
      }

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          VOTE_CONTRACT_ADDRESS,
          VoteContractABI.abi,
          signer
        );

        console.log("Purchasing tokens:", {
          propertyId,
          tokensToPurchase,
        });

        // Execute the transaction
        const tx = await contract.purchaseTokens(propertyId, tokensToPurchase);
        console.log("Transaction hash:", tx.hash);
        const receipt = await tx.wait();
        console.log("Transaction confirmed:", receipt);

        return true;
      } catch (error: any) {
        console.error("Purchase tokens error:", error);
        setError(error.reason || error.message || "Transaction failed");
        return false;
      }
    },
    [isConnected]
  );

  // Connect the contracts - admin function
  const connectContracts = useCallback(async () => {
    if (!isConnected) {
      setError("Please connect your wallet first");
      return false;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        VOTE_CONTRACT_ADDRESS,
        VoteContractABI.abi,
        signer
      );

      // Connect the contracts
      const tx = await contract.setRealEstateContract(
        REAL_ESTATE_CONTRACT_ADDRESS
      );
      console.log("Transaction hash:", tx.hash);
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      // Update the state
      setUseRealEstateTokens(true);

      return true;
    } catch (error: any) {
      console.error("Connect contracts error:", error);
      setError(error.reason || error.message || "Transaction failed");
      return false;
    }
  }, [isConnected]);

  // Initialize the component
  useEffect(() => {
    // Check if wallet is already connected
    const checkConnection = async () => {
      if (
        typeof window !== "undefined" &&
        typeof window.ethereum !== "undefined"
      ) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);
          }
        } catch (error) {
          console.error("Error checking connection:", error);
        }
      }
    };

    checkConnection();
  }, []);

  // Load properties when connected
  useEffect(() => {
    if (isConnected) {
      loadProperties();
    }
  }, [isConnected, loadProperties]);

  // Check if contracts are connected when loaded
  useEffect(() => {
    if (isConnected) {
      checkVoteContractStatus();
    }
  }, [isConnected, checkVoteContractStatus]);

  return {
    account,
    isConnected,
    properties,
    applications,
    loading,
    error,
    useRealEstateTokens,
    connectWallet,
    loadProperties,
    loadApplications,
    applyForRent,
    voteForRent,
    finalizeApplication,
    getCandidateVotes,
    getTokensOwned,
    hasUserVoted,
    purchaseTokens,
    connectContracts,
  };
}

// For TypeScript support
declare global {
  interface Window {
    ethereum: any;
  }
}
