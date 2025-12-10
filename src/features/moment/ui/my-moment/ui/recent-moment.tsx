import React from "react";
import { useWeeklyProgressQuery, useLatestReportQuery } from "../../../queries";
import { MomentStatusCard } from "./moment-status-card";
import { LatestMomentCard } from "./latest-moment-card";

export const RecentMoment = () => {
  const { data: weeklyProgress, isLoading: weeklyProgressLoading } = useWeeklyProgressQuery();
  const {
    data: latestReport,
    isLoading: reportLoading,
    error: reportError,
    isFetching,
    status,
    fetchStatus
  } = useLatestReportQuery();

  // 상세한 디버그 로그 추가
  console.log('🔍 RecentMoment Debug:', {
    latestReport,
    reportLoading,
    isFetching,
    status,
    fetchStatus,
    reportError: reportError?.message,
    reportErrorFull: reportError,
    weeklyProgress,
    weeklyProgressLoading
  });

  // Query 상태에 따른 로그
  console.log('📊 Query Status:', {
    isLoading: reportLoading,
    isFetching,
    status,
    fetchStatus,
    hasData: !!latestReport,
    hasError: !!reportError
  });

  return (
    <>
      <MomentStatusCard
        weeklyProgress={weeklyProgress}
        isLoading={weeklyProgressLoading}
        latestReport={latestReport}
        reportLoading={reportLoading}
        reportError={reportError}
      />
    </>
  );
};
