import React from "react";
import { useWeeklyProgressQuery, useLatestMomentReportQuery } from "../../../queries";
import { MomentStatusCard } from "./moment-status-card";
import { LatestMomentCard } from "./latest-moment-card";

export const RecentMoment = () => {
  const { data: weeklyProgress, isLoading: weeklyProgressLoading } = useWeeklyProgressQuery();
  const { data: latestReport, isLoading: reportLoading } = useLatestMomentReportQuery();

  return (
    <>
      <LatestMomentCard
        momentReport={latestReport}
        isLoading={reportLoading}
      />
      <MomentStatusCard
        weeklyProgress={weeklyProgress}
        isLoading={weeklyProgressLoading}
      />
    </>
  );
};
