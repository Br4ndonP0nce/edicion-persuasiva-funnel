// components/hall-of-fame/EnhancedSubmissionCard.tsx - Simplified for public display
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";
import {
  WinSubmission,
  WIN_CATEGORIES,
  renderSubmissionPreview,
  UserProfile,
} from "@/lib/firebase/hall-of-fame";
import MediaPreview from "./MediaPreview";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

interface EnhancedSubmissionCardProps {
  submission: WinSubmission;
}

export const EnhancedSubmissionCard: React.FC<EnhancedSubmissionCardProps> = ({
  submission,
}) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const category = WIN_CATEGORIES[submission.category];
  const preview = renderSubmissionPreview(submission);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userRef = doc(db, "ep_users", submission.userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserProfile(userSnap.data() as UserProfile);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    if (submission.userId) {
      fetchUserProfile();
    } else {
      setIsLoadingProfile(false);
    }
  }, [submission.userId]);

  // Helper function to get display name
  const getDisplayName = () => {
    return (
      userProfile?.displayName ||
      submission.userDisplayName ||
      submission.username
    );
  };

  // Helper function to get avatar initials
  const getAvatarInitials = () => {
    const name = getDisplayName();
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  return (
    <motion.div
      key={submission.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-purple-900/20 border border-purple-700/30 rounded-lg overflow-hidden hover:border-purple-600/50 transition-colors"
    >
      {/* Media Preview */}
      <MediaPreview submission={submission} preview={preview} />

      {/* Card Content - Clean & Minimal */}
      <div className="p-4">
        {/* User Info Section - Simplified */}
        <div className="flex items-center justify-between mb-3">
          {/* Left: User Info */}
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-8 h-8 relative rounded-full overflow-hidden bg-purple-800/50 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-white">
                {getAvatarInitials()}
              </span>
            </div>

            {/* User Name and Level */}
            <div>
              <p className="font-medium text-white text-sm">
                {getDisplayName()}
              </p>

              {/* Level Badge - The Achievement */}
              {userProfile?.level && (
                <Badge
                  variant="outline"
                  className="text-xs text-purple-300 border-purple-400 bg-purple-500/10 mt-1"
                >
                  {userProfile.level}
                </Badge>
              )}
            </div>
          </div>

          {/* Right: Portfolio Link */}
          {userProfile?.portfolioUrl && (
            <a
              href={userProfile.portfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors text-xs"
              title="Ver Portfolio"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Portfolio</span>
            </a>
          )}
        </div>

        {/* Category Description - Bottom */}
        <div className="text-xs text-gray-400 border-t border-purple-800/30 pt-2">
          {WIN_CATEGORIES[submission.category]?.description}
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedSubmissionCard;
