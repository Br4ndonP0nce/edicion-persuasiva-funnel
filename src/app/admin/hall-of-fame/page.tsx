// src/app/admin/hall-of-fame/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";

// Direct Firestore imports
import {
  doc,
  updateDoc,
  increment,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Star,
  Trophy,
  User,
  Globe,
  Eye,
  EyeOff,
} from "lucide-react";

// Types
interface WinCategory {
  id: "learning" | "brand" | "results" | "monetization";
  name: string;
  emoji: string;
  points: number;
  description: string;
}

interface UserProfile {
  discordId: string;
  username: string;
  displayName: string;
  portfolioUrl?: string;
  socialMediaUrl?: string;
  totalPoints: number;
  monthlyPoints: Record<string, number>;
  level: string;
  joinedAt: string;
  lastActive: string;
}

interface WinSubmission {
  id: string;
  userId: string;
  username: string;
  userDisplayName?: string;
  category: "learning" | "brand" | "results" | "monetization";
  points: number;
  evidenceType: "image" | "video" | "link" | "drive_file";
  evidenceUrl: string;
  evidencePreview?: string;
  platform?: string;
  fileName?: string;
  fileSize?: number;
  status: "pending" | "approved" | "rejected";
  hallOfFameSelected: boolean;
  monthCycle: string;
  timestamp: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

interface EnhancedSubmission extends WinSubmission {
  userProfile?: UserProfile;
}

// Constants
const WIN_CATEGORIES: Record<string, WinCategory> = {
  learning: {
    id: "learning",
    name: "Aprendizaje",
    emoji: "🎓",
    points: 10,
    description: "Ejercicios del curso, módulos completados",
  },
  brand: {
    id: "brand",
    name: "Marca Personal",
    emoji: "📢",
    points: 20,
    description: "Contenido en redes sobre tu aprendizaje",
  },
  results: {
    id: "results",
    name: "Resultados",
    emoji: "🚀",
    points: 40,
    description: "Visibilidad, interacciones, seguidores",
  },
  monetization: {
    id: "monetization",
    name: "Monetización",
    emoji: "💰",
    points: 100,
    description: "Clientes cerrados, ventas, proyectos",
  },
};

const getCurrentMonthCycle = (): string => {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
};

const getMonthName = (monthCycle: string): string => {
  const [year, month] = monthCycle.split("-");
  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
};

const getUserLevel = (totalPoints: number): string => {
  if (totalPoints >= 500) return "Master Persuasivo";
  if (totalPoints >= 300) return "Conquistador Visual";
  if (totalPoints >= 200) return "Influencer";
  if (totalPoints >= 100) return "Editor en Acción";
  return "Aprendiz Creativo";
};

// Helper function to safely format timestamps from Firestore
const formatTimestamp = (timestamp: any): string => {
  if (!timestamp) return "N/A";

  try {
    // Handle Firestore Timestamp objects
    if (timestamp.toDate && typeof timestamp.toDate === "function") {
      return timestamp.toDate().toLocaleString();
    }
    // Handle string or Date objects
    return new Date(timestamp).toLocaleString();
  } catch (error) {
    console.error("Error formatting timestamp:", error);
    return "Invalid date";
  }
};

export default function HallOfFameAdminPage() {
  const { userProfile } = useAuth();
  const [pendingSubmissions, setPendingSubmissions] = useState<
    EnhancedSubmission[]
  >([]);
  const [recentSubmissions, setRecentSubmissions] = useState<
    EnhancedSubmission[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Stats state
  const [stats, setStats] = useState({
    totalPending: 0,
    approvedToday: 0,
    rejectedToday: 0,
    hallOfFameCount: 0,
  });

  // Direct Firestore queries
  const fetchSubmissions = async (status: string, limitCount: number = 50) => {
    try {
      const submissionsRef = collection(db, "ep_submissions");
      const q = query(
        submissionsRef,
        where("status", "==", status),
        orderBy("timestamp", "desc"),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const submissions: WinSubmission[] = [];

      snapshot.forEach((doc) => {
        submissions.push({
          id: doc.id,
          ...doc.data(),
        } as WinSubmission);
      });

      return submissions;
    } catch (error) {
      console.error(`Error fetching ${status} submissions:`, error);
      return [];
    }
  };

  const fetchRecentApproved = async (
    monthCycle: string,
    limitCount: number = 20
  ) => {
    try {
      const submissionsRef = collection(db, "ep_submissions");
      const q = query(
        submissionsRef,
        where("status", "==", "approved"),
        where("monthCycle", "==", monthCycle),
        orderBy("timestamp", "desc"),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const submissions: WinSubmission[] = [];

      snapshot.forEach((doc) => {
        submissions.push({
          id: doc.id,
          ...doc.data(),
        } as WinSubmission);
      });

      return submissions;
    } catch (error) {
      console.error("Error fetching recent approved submissions:", error);
      return [];
    }
  };

  const fetchUserProfile = async (
    userId: string
  ): Promise<UserProfile | null> => {
    try {
      const userRef = doc(db, "ep_users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        return userSnap.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  const enhanceSubmissionsWithUserData = async (
    submissions: WinSubmission[]
  ): Promise<EnhancedSubmission[]> => {
    const enhanced: EnhancedSubmission[] = [];

    for (const submission of submissions) {
      try {
        const userProfileData = await fetchUserProfile(submission.userId);
        enhanced.push({
          ...submission,
          userProfile: userProfileData || undefined,
        });
      } catch (error) {
        console.error(
          `Error fetching user profile for ${submission.userId}:`,
          error
        );
        enhanced.push(submission);
      }
    }

    return enhanced;
  };

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [pending, recent, rejected] = await Promise.all([
        fetchSubmissions("pending", 50),
        fetchRecentApproved(getCurrentMonthCycle(), 20),
        fetchSubmissions("rejected", 100),
      ]);

      // Enhance with user profiles
      const [enhancedPending, enhancedRecent] = await Promise.all([
        enhanceSubmissionsWithUserData(pending),
        enhanceSubmissionsWithUserData(recent),
      ]);

      setPendingSubmissions(enhancedPending);
      setRecentSubmissions(enhancedRecent);

      // Calculate stats
      const today = new Date().toISOString().split("T")[0];

      // Helper function to safely check if a timestamp is from today
      const isFromToday = (timestamp: any): boolean => {
        if (!timestamp) return false;

        let dateStr: string;

        // Handle Firestore Timestamp objects
        if (timestamp.toDate && typeof timestamp.toDate === "function") {
          dateStr = timestamp.toDate().toISOString().split("T")[0];
        }
        // Handle string timestamps
        else if (typeof timestamp === "string") {
          dateStr = timestamp.split("T")[0];
        }
        // Handle Date objects
        else if (timestamp instanceof Date) {
          dateStr = timestamp.toISOString().split("T")[0];
        } else {
          return false;
        }

        return dateStr === today;
      };

      const approvedToday = recent.filter((s) =>
        isFromToday(s.reviewedAt)
      ).length;
      const rejectedToday = rejected.filter((s) =>
        isFromToday(s.reviewedAt)
      ).length;

      const hallOfFameCount = recent.filter((s) => s.hallOfFameSelected).length;

      setStats({
        totalPending: pending.length,
        approvedToday,
        rejectedToday,
        hallOfFameCount,
      });
    } catch (err) {
      console.error("Error fetching Hall of Fame admin data:", err);
      setError("Failed to load Hall of Fame data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleCardExpansion = (cardId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId);
    } else {
      newExpanded.add(cardId);
    }
    setExpandedCards(newExpanded);
  };

  // Optimized update functions that only update specific items
  const updateSubmissionStatus = async (
    submissionId: string,
    status: "approved" | "rejected",
    reason?: string
  ) => {
    try {
      // Get submission data first
      const submissionRef = doc(db, "ep_submissions", submissionId);
      const submissionSnap = await getDoc(submissionRef);

      if (!submissionSnap.exists()) {
        throw new Error(`Submission ${submissionId} not found`);
      }

      const submissionData = submissionSnap.data() as WinSubmission;

      // Update submission status
      const updateData: any = {
        status,
        reviewedAt: serverTimestamp(),
        reviewedBy: userProfile?.email || "admin",
      };

      if (status === "rejected" && reason) {
        updateData.rejectionReason = reason;
      }

      await updateDoc(submissionRef, updateData);

      // If approved, award points to user
      if (status === "approved") {
        const userRef = doc(db, "ep_users", submissionData.userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data() as UserProfile;
          const newTotalPoints = userData.totalPoints + submissionData.points;
          const newLevel = getUserLevel(newTotalPoints);

          // Update user points and level
          await updateDoc(userRef, {
            totalPoints: newTotalPoints,
            level: newLevel,
            [`monthlyPoints.${submissionData.monthCycle}`]: increment(
              submissionData.points
            ),
            lastActive: serverTimestamp(),
          });

          console.log(
            `Awarded ${submissionData.points} points to ${submissionData.username}`
          );
        }
      }

      // Optimized update: only remove from pending list instead of full refresh
      setPendingSubmissions((prev) =>
        prev.filter((s) => s.id !== submissionId)
      );

      // Update stats
      setStats((prev) => ({
        ...prev,
        totalPending: prev.totalPending - 1,
        [status === "approved" ? "approvedToday" : "rejectedToday"]:
          prev[status === "approved" ? "approvedToday" : "rejectedToday"] + 1,
      }));

      return true;
    } catch (err) {
      console.error("Error updating submission:", err);
      setError("Failed to update submission");
      return false;
    }
  };

  const updateHallOfFameStatus = async (
    submissionId: string,
    currentStatus: boolean
  ) => {
    try {
      const submissionRef = doc(db, "ep_submissions", submissionId);

      await updateDoc(submissionRef, {
        hallOfFameSelected: !currentStatus,
        hallOfFameToggledAt: serverTimestamp(),
        hallOfFameToggledBy: userProfile?.email || "admin",
      });

      // Optimized update: only update the specific submission
      setRecentSubmissions((prev) =>
        prev.map((s) =>
          s.id === submissionId
            ? { ...s, hallOfFameSelected: !currentStatus }
            : s
        )
      );

      // Update stats
      setStats((prev) => ({
        ...prev,
        hallOfFameCount: !currentStatus
          ? prev.hallOfFameCount + 1
          : prev.hallOfFameCount - 1,
      }));

      return true;
    } catch (err) {
      console.error("Error toggling hall of fame:", err);
      setError("Failed to update hall of fame status");
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredPermissions={["users:write"]}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Hall of Fame Admin</h1>
            <p className="text-gray-600">
              Manage Discord submissions and Hall of Fame -{" "}
              {getMonthName(getCurrentMonthCycle())}
            </p>
          </div>
          <Button onClick={fetchData} variant="outline">
            Refresh Data
          </Button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="flex items-center p-6">
              <Clock className="h-8 w-8 text-amber-500 mr-4" />
              <div>
                <p className="text-2xl font-bold">{stats.totalPending}</p>
                <p className="text-gray-600">Pending Review</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <CheckCircle className="h-8 w-8 text-green-500 mr-4" />
              <div>
                <p className="text-2xl font-bold">{stats.approvedToday}</p>
                <p className="text-gray-600">Approved Today</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <XCircle className="h-8 w-8 text-red-500 mr-4" />
              <div>
                <p className="text-2xl font-bold">{stats.rejectedToday}</p>
                <p className="text-gray-600">Rejected Today</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <Trophy className="h-8 w-8 text-purple-500 mr-4" />
              <div>
                <p className="text-2xl font-bold">{stats.hallOfFameCount}</p>
                <p className="text-gray-600">Hall of Fame</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Submissions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Pending Submissions ({pendingSubmissions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingSubmissions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No pending submissions
              </p>
            ) : (
              <div className="space-y-4">
                {pendingSubmissions.map((submission) => (
                  <PendingSubmissionCard
                    key={submission.id}
                    submission={submission}
                    onStatusUpdate={updateSubmissionStatus}
                    isExpanded={expandedCards.has(submission.id)}
                    onToggleExpand={() => toggleCardExpansion(submission.id)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Approved Submissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Recent Approved Submissions
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSubmissions.map((submission) => (
                <ApprovedSubmissionCard
                  key={submission.id}
                  submission={submission}
                  onHallOfFameUpdate={updateHallOfFameStatus}
                  isExpanded={expandedCards.has(`approved-${submission.id}`)}
                  onToggleExpand={() =>
                    toggleCardExpansion(`approved-${submission.id}`)
                  }
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}

// Optimized component that handles its own state
interface PendingSubmissionCardProps {
  submission: EnhancedSubmission;
  onStatusUpdate: (
    id: string,
    status: "approved" | "rejected",
    reason?: string
  ) => Promise<boolean>;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function PendingSubmissionCard({
  submission,
  onStatusUpdate,
  isExpanded,
  onToggleExpand,
}: PendingSubmissionCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const category = WIN_CATEGORIES[submission.category];
  const userProfile = submission.userProfile;

  const handleApprove = async () => {
    setIsProcessing(true);
    const success = await onStatusUpdate(submission.id, "approved");
    if (!success) {
      setIsProcessing(false);
    }
    // If successful, the card will be removed from the list
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;

    setIsProcessing(true);
    const success = await onStatusUpdate(
      submission.id,
      "rejected",
      rejectionReason
    );
    if (success) {
      setRejectionReason("");
      setShowRejectForm(false);
    } else {
      setIsProcessing(false);
    }
  };

  return (
    <div className="border rounded-lg bg-white overflow-hidden">
      {/* Compact Header */}
      <div className="p-3 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Category and Points */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-lg">{category.emoji}</span>
              <Badge variant="outline" className="text-xs">
                {category.name}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {category.points}pts
              </Badge>
            </div>

            {/* User Info - Compact */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-purple-700">
                    {(userProfile?.displayName || submission.username)
                      ?.charAt(0)
                      ?.toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">
                    {userProfile?.displayName ||
                      submission.userDisplayName ||
                      submission.username}
                  </p>
                  {userProfile && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="truncate">@{submission.username}</span>
                      <span>•</span>
                      <span>{userProfile.level}</span>
                      <span>•</span>
                      <span>{userProfile.totalPoints}pts</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="ghost"
              onClick={onToggleExpand}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="sm"
              onClick={handleApprove}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1 h-8"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              {isProcessing ? "Processing..." : "Approve"}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setShowRejectForm(true)}
              disabled={isProcessing}
              className="text-xs px-2 py-1 h-8"
            >
              <XCircle className="h-3 w-3 mr-1" />
              Reject
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* User Details */}
          {userProfile && (
            <div className="bg-purple-50 rounded-lg p-3">
              <h4 className="font-medium text-sm mb-2 flex items-center">
                <User className="h-4 w-4 mr-1" />
                User Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Display Name:</span>
                  <p className="font-medium">{userProfile.displayName}</p>
                </div>
                <div>
                  <span className="text-gray-600">Username:</span>
                  <p className="font-medium">@{submission.username}</p>
                </div>
                <div>
                  <span className="text-gray-600">Level:</span>
                  <p className="font-medium">{userProfile.level}</p>
                </div>
                <div>
                  <span className="text-gray-600">Total Points:</span>
                  <p className="font-medium">{userProfile.totalPoints}</p>
                </div>
                {userProfile.portfolioUrl && (
                  <div className="md:col-span-2">
                    <span className="text-gray-600">Portfolio:</span>
                    <a
                      href={userProfile.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline ml-2 inline-flex items-center"
                    >
                      <Globe className="h-3 w-3 mr-1" />
                      View Portfolio
                    </a>
                  </div>
                )}
                {userProfile.socialMediaUrl && (
                  <div className="md:col-span-2">
                    <span className="text-gray-600">Social Media:</span>
                    <a
                      href={userProfile.socialMediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline ml-2 inline-flex items-center"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View Profile
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Evidence Preview */}
          <div>
            <h4 className="font-medium text-sm mb-2">Evidence</h4>
            <div className="bg-gray-50 rounded-lg p-3">
              {submission.evidenceType === "image" && (
                <img
                  src={submission.evidencePreview || submission.evidenceUrl}
                  alt="Evidence"
                  className="w-full max-w-md h-32 object-cover rounded border"
                />
              )}
              {submission.evidenceType === "video" && (
                <div className="flex items-center gap-2">
                  <span>🎥</span>
                  <a
                    href={submission.evidenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View Video ({submission.platform})
                  </a>
                </div>
              )}
              {submission.evidenceType === "drive_file" && (
                <div className="flex items-center gap-2">
                  <span>📁</span>
                  <a
                    href={submission.evidenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    {submission.fileName || "View File"}
                  </a>
                </div>
              )}
              {submission.evidenceType === "link" && (
                <a
                  href={submission.evidenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View Link
                </a>
              )}
            </div>
          </div>

          {/* Submission Details */}
          <div className="text-xs text-gray-500 border-t pt-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span>Submitted:</span>{" "}
                {new Date(submission.timestamp).toLocaleString()}
              </div>
              <div>
                <span>Month:</span> {submission.monthCycle}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection form */}
      {showRejectForm && (
        <div className="bg-red-50 p-3 m-3 rounded border border-red-200">
          <Textarea
            placeholder="Reason for rejection..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="mb-2 text-sm"
            rows={2}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleReject}
              variant="destructive"
              className="text-xs"
              disabled={isProcessing || !rejectionReason.trim()}
            >
              {isProcessing ? "Processing..." : "Confirm Reject"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowRejectForm(false)}
              className="text-xs"
              disabled={isProcessing}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Optimized approved submission component
interface ApprovedSubmissionCardProps {
  submission: EnhancedSubmission;
  onHallOfFameUpdate: (id: string, currentStatus: boolean) => Promise<boolean>;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function ApprovedSubmissionCard({
  submission,
  onHallOfFameUpdate,
  isExpanded,
  onToggleExpand,
}: ApprovedSubmissionCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const category = WIN_CATEGORIES[submission.category];
  const userProfile = submission.userProfile;

  const handleToggleHallOfFame = async () => {
    setIsProcessing(true);
    const success = await onHallOfFameUpdate(
      submission.id,
      submission.hallOfFameSelected
    );
    setIsProcessing(false);
  };

  return (
    <div className="border rounded-lg bg-white overflow-hidden">
      {/* Compact Header */}
      <div className="p-3 border-b bg-green-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Category and Status */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-lg">{category.emoji}</span>
              <Badge variant="outline" className="text-xs">
                {category.name}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {category.points}pts
              </Badge>
              {submission.hallOfFameSelected && (
                <Badge className="bg-purple-600 text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  HoF
                </Badge>
              )}
            </div>

            {/* User Info - Compact */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-green-700">
                    {(userProfile?.displayName || submission.username)
                      ?.charAt(0)
                      ?.toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">
                    {userProfile?.displayName ||
                      submission.userDisplayName ||
                      submission.username}
                  </p>
                  {userProfile && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="truncate">@{submission.username}</span>
                      <span>•</span>
                      <span>{userProfile.level}</span>
                      <span>•</span>
                      <span>{userProfile.totalPoints}pts</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="ghost"
              onClick={onToggleExpand}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="sm"
              variant={
                submission.hallOfFameSelected ? "destructive" : "default"
              }
              onClick={handleToggleHallOfFame}
              disabled={isProcessing}
              className={`text-xs px-2 py-1 h-8 ${
                submission.hallOfFameSelected
                  ? ""
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              <Star className="h-3 w-3 mr-1" />
              {isProcessing
                ? "Processing..."
                : submission.hallOfFameSelected
                ? "Remove"
                : "Add HoF"}
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* User Details */}
          {userProfile && (
            <div className="bg-green-50 rounded-lg p-3">
              <h4 className="font-medium text-sm mb-2 flex items-center">
                <User className="h-4 w-4 mr-1" />
                User Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Display Name:</span>
                  <p className="font-medium">{userProfile.displayName}</p>
                </div>
                <div>
                  <span className="text-gray-600">Username:</span>
                  <p className="font-medium">@{submission.username}</p>
                </div>
                <div>
                  <span className="text-gray-600">Level:</span>
                  <p className="font-medium">{userProfile.level}</p>
                </div>
                <div>
                  <span className="text-gray-600">Total Points:</span>
                  <p className="font-medium">{userProfile.totalPoints}</p>
                </div>
                {userProfile.portfolioUrl && (
                  <div className="md:col-span-2">
                    <span className="text-gray-600">Portfolio:</span>
                    <a
                      href={userProfile.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline ml-2 inline-flex items-center"
                    >
                      <Globe className="h-3 w-3 mr-1" />
                      View Portfolio
                    </a>
                  </div>
                )}
                {userProfile.socialMediaUrl && (
                  <div className="md:col-span-2">
                    <span className="text-gray-600">Social Media:</span>
                    <a
                      href={userProfile.socialMediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline ml-2 inline-flex items-center"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View Profile
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Evidence Preview */}
          <div>
            <h4 className="font-medium text-sm mb-2">Evidence</h4>
            <div className="bg-gray-50 rounded-lg p-3">
              {submission.evidenceType === "image" && (
                <img
                  src={submission.evidencePreview || submission.evidenceUrl}
                  alt="Evidence"
                  className="w-full max-w-md h-32 object-cover rounded border"
                />
              )}
              {submission.evidenceType === "video" && (
                <div className="flex items-center gap-2">
                  <span>🎥</span>
                  <a
                    href={submission.evidenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View Video ({submission.platform})
                  </a>
                </div>
              )}
              {submission.evidenceType === "drive_file" && (
                <div className="flex items-center gap-2">
                  <span>📁</span>
                  <a
                    href={submission.evidenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    {submission.fileName || "View File"}
                  </a>
                </div>
              )}
              {submission.evidenceType === "link" && (
                <a
                  href={submission.evidenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View Link
                </a>
              )}
            </div>
          </div>

          {/* Approval Details */}
          <div className="text-xs text-gray-500 border-t pt-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span>Approved:</span>{" "}
                {submission.reviewedAt
                  ? new Date(submission.reviewedAt).toLocaleString()
                  : "N/A"}
              </div>
              <div>
                <span>Reviewed by:</span> {submission.reviewedBy || "System"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
