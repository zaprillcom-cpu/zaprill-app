"use client";

/**
 * useAnalytics.ts
 *
 * React hook that exposes all analytics tracking functions.
 * Also syncs user identity from the auth session automatically.
 *
 * Usage:
 *   const { trackJobApplied } = useAnalytics();
 *   trackJobApplied({ job_id: '...', ... });
 */

import { useEffect } from "react";
import {
  clearUserId,
  setUserId,
  track,
  trackAnalysisComplete,
  trackAnalysisError,
  trackAnalysisSaved,
  trackAnalysisStart,
  trackException,
  trackFilterApplied,
  trackFilterCleared,
  trackFilterPanelOpen,
  trackGapAnalysisComplete,
  trackHistoryItemClicked,
  trackHistoryPageViewed,
  trackJobApplied,
  trackJobCardClicked,
  trackJobCardImpression,
  trackJobListViewed,
  trackJobSearchComplete,
  trackLocationSearch,
  trackLogin,
  trackLoginStart,
  trackOAuthProviderSelected,
  trackPageView,
  trackResourceLinkClicked,
  trackResumeFileSelected,
  trackResumeParseFailure,
  trackResumeParseSuccess,
  trackResumeReplaced,
  trackResumeUploadStart,
  trackRoadmapItemExpanded,
  trackSavedProfileUsed,
  trackSessionExpired,
  trackSignUp,
  trackSignUpStart,
  trackSortChanged,
  trackTabViewed,
} from "@/lib/analytics";
import { useSession } from "@/lib/auth-client";

export function useAnalytics() {
  const { data: session } = useSession();

  // Sync user identity whenever session changes
  useEffect(() => {
    if (session?.user?.id) {
      setUserId(session.user.id);
    } else {
      clearUserId();
    }
  }, [session?.user?.id]);

  return {
    // Generic
    track,
    trackPageView,

    // Auth
    trackSignUpStart,
    trackSignUp,
    trackLoginStart,
    trackLogin,
    trackOAuthProviderSelected,
    trackSessionExpired,

    // Resume
    trackResumeFileSelected,
    trackResumeUploadStart,
    trackResumeParseSuccess,
    trackResumeParseFailure,
    trackSavedProfileUsed,
    trackResumeReplaced,

    // Analysis
    trackAnalysisStart,
    trackJobSearchComplete,
    trackGapAnalysisComplete,
    trackAnalysisComplete,
    trackAnalysisError,
    trackLocationSearch,

    // Job interactions
    trackJobListViewed,
    trackJobCardImpression,
    trackJobCardClicked,
    trackJobApplied,

    // Filters
    trackFilterPanelOpen,
    trackFilterApplied,
    trackFilterCleared,
    trackSortChanged,

    // Content
    trackTabViewed,
    trackRoadmapItemExpanded,
    trackResourceLinkClicked,

    // Save & history
    trackAnalysisSaved,
    trackHistoryPageViewed,
    trackHistoryItemClicked,

    // Errors
    trackException,
  };
}
