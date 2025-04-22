"use client";

import { useEffect, useState } from "react";
import {
  useVoteContract,
  RentApplication,
  VoteProperty,
} from "@/lib/useVoteContract";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Vote,
  User,
  Users,
  ArrowLeft,
  Home,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function PropertyApplicationsPage() {
  const params = useParams();
  const propertyId = parseInt(params.id as string);

  const {
    isConnected,
    connectWallet,
    loading,
    error,
    loadApplications,
    getTokensOwned,
    voteForRent,
    hasUserVoted,
    getCandidateVotes,
    finalizeApplication,
    applyForRent,
    account,
  } = useVoteContract();

  const [applications, setApplications] = useState<RentApplication[]>([]);
  const [property, setProperty] = useState<VoteProperty | null>(null);
  const [userTokens, setUserTokens] = useState(0);
  const [candidateVotes, setCandidateVotes] = useState<{
    [key: string]: number;
  }>({});
  const [userVoted, setUserVoted] = useState<{ [key: number]: boolean }>({});
  const [votingFor, setVotingFor] = useState<{ [key: number]: boolean }>({});
  const [finalizing, setFinalizing] = useState<{ [key: number]: boolean }>({});
  const [dataLoading, setDataLoading] = useState(true);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [applicationName, setApplicationName] = useState("");
  const [applicationDescription, setApplicationDescription] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  // Check for account changes in MetaMask
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        window.location.reload();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);

      return () => {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      };
    }
  }, []);

  // Load property applications
  useEffect(() => {
    const fetchData = async () => {
      if (!isConnected || isNaN(propertyId)) return;

      setDataLoading(true);
      try {
        // Load applications for this property
        const apps = await loadApplications(propertyId);
        setApplications(apps);

        // Check user tokens for this property
        const tokens = await getTokensOwned(propertyId);
        setUserTokens(tokens);

        // Check if user has voted for each application
        const votedStatus: { [key: number]: boolean } = {};
        for (const app of apps) {
          votedStatus[app.applicationId] = await hasUserVoted(
            app.applicationId
          );
        }
        setUserVoted(votedStatus);

        // Get votes for each candidate in each application
        const votes: { [key: string]: number } = {};
        for (const app of apps) {
          votes[`${app.applicationId}-${app.applicant}`] =
            await getCandidateVotes(app.applicationId, app.applicant);
        }
        setCandidateVotes(votes);
      } catch (err) {
        console.error("Error loading applications:", err);
        toast.error("Failed to load applications");
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [
    propertyId,
    isConnected,
    loadApplications,
    getTokensOwned,
    hasUserVoted,
    getCandidateVotes,
    account,
  ]);

  // Handle applying for rent
  const handleApplyForRent = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (userTokens > 0) {
      toast.error("Token holders cannot apply for rent");
      return;
    }

    if (!applicationName || !applicationDescription) {
      toast.error("Please fill out all fields");
      return;
    }

    setIsApplying(true);
    try {
      const success = await applyForRent(
        propertyId,
        applicationName,
        applicationDescription
      );
      if (success) {
        toast.success("Application submitted successfully!");
        setApplyDialogOpen(false);
        // Refresh applications
        const apps = await loadApplications(propertyId);
        setApplications(apps);
        // Reset form
        setApplicationName("");
        setApplicationDescription("");
      } else {
        toast.error("Failed to submit application");
      }
    } catch (error) {
      console.error("Error applying for rent:", error);
      toast.error("Error submitting application");
    } finally {
      setIsApplying(false);
    }
  };

  // Handle voting for a candidate
  const handleVote = async (
    applicationId: number,
    candidateAddress: string
  ) => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (userTokens <= 0) {
      toast.error("You need tokens to vote");
      return;
    }

    if (userVoted[applicationId]) {
      toast.error("You have already voted for this application");
      return;
    }

    setVotingFor({ ...votingFor, [applicationId]: true });
    try {
      const success = await voteForRent(applicationId, candidateAddress);
      if (success) {
        toast.success("Vote submitted successfully!");
        // Update vote data
        setUserVoted({ ...userVoted, [applicationId]: true });
        const newVotes = await getCandidateVotes(
          applicationId,
          candidateAddress
        );
        setCandidateVotes({
          ...candidateVotes,
          [`${applicationId}-${candidateAddress}`]: newVotes,
        });
      } else {
        toast.error("Failed to submit vote");
      }
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Error submitting vote");
    } finally {
      setVotingFor({ ...votingFor, [applicationId]: false });
    }
  };

  // Handle finalizing an application
  const handleFinalize = async (applicationId: number) => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    setFinalizing({ ...finalizing, [applicationId]: true });
    try {
      const success = await finalizeApplication(applicationId);
      if (success) {
        toast.success("Application finalized successfully!");
        // Refresh applications to get updated status
        const apps = await loadApplications(propertyId);
        setApplications(apps);
      } else {
        toast.error("Failed to finalize application");
      }
    } catch (error) {
      console.error("Error finalizing application:", error);
      toast.error("Error finalizing application");
    } finally {
      setFinalizing({ ...finalizing, [applicationId]: false });
    }
  };

  // Animation variants
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

  // Check if user has already applied
  const hasUserApplied = applications.some(
    (app) => app.applicant.toLowerCase() === account?.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1029] via-[#111633] to-[#0f172a] text-white pb-20">
      <PageHeader
        title={`Rent Applications - Property #${propertyId}`}
        description="Review and vote for applicants who want to rent this property"
      >
        <div className="flex justify-center gap-4">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Vote size={18} />
            <span>Your voting power: {userTokens} Tokens</span>
          </motion.div>

          {isConnected && userTokens === 0 && !hasUserApplied && (
            <motion.button
              onClick={() => setApplyDialogOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-500/30 transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Plus size={18} />
              <span>Apply to Rent</span>
            </motion.button>
          )}

          {isConnected && hasUserApplied && (
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <CheckCircle size={18} />
              <span>You've Applied</span>
            </motion.div>
          )}
        </div>
      </PageHeader>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="mb-8">
          <Link
            href="/vote"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors mb-4"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Properties
          </Link>

          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-100">
                Applicants for Property #{propertyId}
              </h2>
              {userTokens === 0 && isConnected && (
                <p className="text-sm text-amber-500 mt-1">
                  You need tokens to vote on applications
                </p>
              )}
            </div>

            {!isConnected && (
              <Button
                onClick={connectWallet}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Connect Wallet to Vote
              </Button>
            )}
          </div>
        </div>

        {/* Apply for Rent Dialog */}
        <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Apply to Rent This Property
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Submit your application to rent this property. Token holders
                will vote on applications.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  value={applicationName}
                  onChange={(e) => setApplicationName(e.target.value)}
                  placeholder="Enter your full name"
                  className="bg-gray-800 border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Why do you want to rent this property?
                </Label>
                <Textarea
                  id="description"
                  value={applicationDescription}
                  onChange={(e) => setApplicationDescription(e.target.value)}
                  placeholder="Describe why you'd be a good tenant and how you plan to use the property..."
                  className="bg-gray-800 border-gray-700 min-h-[120px]"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setApplyDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApplyForRent}
                disabled={
                  isApplying || !applicationName || !applicationDescription
                }
                className="bg-green-600 hover:bg-green-700"
              >
                {isApplying ? (
                  <>
                    <Skeleton className="h-4 w-4 rounded-full animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Applications List */}
        {dataLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <Card key={i} className="bg-gray-800/60 border-gray-700">
                <CardHeader>
                  <Skeleton className="h-6 w-2/3 bg-gray-700" />
                  <Skeleton className="h-4 w-1/2 bg-gray-700 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full bg-gray-700 mt-2" />
                  <Skeleton className="h-4 w-full bg-gray-700 mt-2" />
                  <Skeleton className="h-4 w-3/4 bg-gray-700 mt-2" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full bg-gray-700 rounded-md" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center p-10 border border-dashed border-gray-700 rounded-xl bg-gray-800/20">
            <Home className="h-12 w-12 mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              No Applications Yet
            </h3>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              There are no rental applications for this property yet.
              {isConnected &&
                userTokens === 0 &&
                !hasUserApplied &&
                " Be the first to apply!"}
            </p>
            {isConnected && userTokens === 0 && !hasUserApplied && (
              <Button
                onClick={() => setApplyDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Apply to Rent
              </Button>
            )}
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {applications.map((application) => {
              const isVotingPeriodActive =
                new Date().getTime() < application.votingEndTime * 1000;
              const votesCount =
                candidateVotes[
                  `${application.applicationId}-${application.applicant}`
                ] || 0;

              return (
                <motion.div key={application.applicationId} variants={item}>
                  <Card className="bg-gray-800/40 border-gray-700 overflow-hidden h-full flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2 text-gray-100">
                            <User className="h-4 w-4 text-blue-400" />
                            {application.name}
                          </CardTitle>
                          <CardDescription className="text-gray-400 text-xs mt-1">
                            {isVotingPeriodActive ? (
                              <>
                                <Clock className="h-3 w-3" />
                                Voting ends{" "}
                                {formatDistanceToNow(
                                  new Date(application.votingEndTime * 1000),
                                  { addSuffix: true }
                                )}
                              </>
                            ) : application.isApproved ? (
                              <>
                                <CheckCircle className="h-3 w-3 text-green-400" />
                                Application approved
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-3 w-3 text-amber-400" />
                                Voting period ended
                              </>
                            )}
                          </CardDescription>
                        </div>

                        <Badge
                          variant="outline"
                          className={
                            application.isActive
                              ? "bg-blue-500/20 border-blue-500/30 text-blue-400"
                              : application.isApproved
                              ? "bg-green-500/20 border-green-500/30 text-green-400"
                              : "bg-red-500/20 border-red-500/30 text-red-400"
                          }
                        >
                          {application.isActive
                            ? "Active"
                            : application.isApproved
                            ? "Approved"
                            : "Closed"}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-grow">
                      <div className="text-sm text-gray-300 space-y-2">
                        <p>{application.description}</p>

                        <div className="mt-4 pt-3 border-t border-gray-700">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-400 text-xs">
                              Votes received:
                            </span>
                            <span className="font-medium text-blue-400">
                              {votesCount}
                            </span>
                          </div>
                          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{
                                width: `${Math.min(
                                  (votesCount / Math.max(userTokens, 1)) * 100,
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="border-t border-gray-700/50 pt-3">
                      {isConnected && (
                        <>
                          {application.isActive ? (
                            isVotingPeriodActive ? (
                              userTokens > 0 ? (
                                <Button
                                  onClick={() =>
                                    handleVote(
                                      application.applicationId,
                                      application.applicant
                                    )
                                  }
                                  disabled={
                                    votingFor[application.applicationId] ||
                                    userVoted[application.applicationId] ||
                                    userTokens === 0
                                  }
                                  className="w-full bg-blue-600 hover:bg-blue-700"
                                >
                                  {votingFor[application.applicationId] ? (
                                    <>
                                      <Skeleton className="h-4 w-4 rounded-full animate-spin mr-2" />
                                      Voting...
                                    </>
                                  ) : userVoted[application.applicationId] ? (
                                    <>
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Voted
                                    </>
                                  ) : (
                                    <>
                                      <Vote className="mr-2 h-4 w-4" />
                                      Vote for this Applicant
                                    </>
                                  )}
                                </Button>
                              ) : (
                                <div className="w-full text-center text-amber-400 text-sm">
                                  You need tokens to vote
                                </div>
                              )
                            ) : (
                              <Button
                                onClick={() =>
                                  handleFinalize(application.applicationId)
                                }
                                disabled={finalizing[application.applicationId]}
                                className="w-full bg-green-600 hover:bg-green-700"
                              >
                                {finalizing[application.applicationId] ? (
                                  <>
                                    <Skeleton className="h-4 w-4 rounded-full animate-spin mr-2" />
                                    Finalizing...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Finalize Application
                                  </>
                                )}
                              </Button>
                            )
                          ) : application.isApproved ? (
                            <div className="w-full text-center text-green-400 flex items-center justify-center gap-1">
                              <CheckCircle className="h-4 w-4" />
                              Approved Tenant
                            </div>
                          ) : (
                            <div className="w-full text-center text-gray-400 flex items-center justify-center gap-1">
                              <AlertCircle className="h-4 w-4" />
                              Application Closed
                            </div>
                          )}
                        </>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
