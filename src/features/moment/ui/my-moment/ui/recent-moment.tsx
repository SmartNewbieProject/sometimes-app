import { useWeeklyProgressQuery, useLatestMomentReportQuery } from "../../../queries";
import { MomentStatusCard } from "./moment-status-card";
import { LatestMomentCard } from "./latest-moment-card";

export const RecentMoment = () => {
  const { data: weeklyProgress, isLoading: weeklyProgressLoading } = useWeeklyProgressQuery();
  const { data: latestReport, isLoading: reportLoading } = useLatestMomentReportQuery();

  console.log({ latestReport, weeklyProgress })

  return (
    <>
      <MomentStatusCard
        weeklyProgress={weeklyProgress}
        isLoading={weeklyProgressLoading}
        latestReport={latestReport}
        reportLoading={reportLoading}
      />
    </>
  );
};
