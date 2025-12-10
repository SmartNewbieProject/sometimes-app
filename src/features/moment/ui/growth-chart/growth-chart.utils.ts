import type { DataPoint } from '@/src/shared/ui/line-chart';
import type { ReportHistoryItem, ChartData } from '../../apis/index';

const CATEGORY_LABELS = {
  emotionalOpenness: '감정 개방성',
  valueClarity: '가치 명확성',
  openAttitude: '열린 태도',
  relationshipStability: '관계 안정감',
  conflictMaturity: '갈등 성숙도',
} as const;

export const calculateAverageFromChartData = (chartData: ChartData): number => {
  const { categoryScores } = chartData;
  const scores = Object.values(categoryScores);
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
};

export const getTrendFromChangeValue = (change: number): 'up' | 'down' | 'stable' => {
  if (change > 0) return 'up';
  if (change < 0) return 'down';
  return 'stable';
};

export const convertReportsToChartData = (
  reports: ReportHistoryItem[],
  maxPoints: number = 5
): DataPoint[] => {
  const recentReports = reports.slice(-maxPoints);

  return recentReports.map((report, index) => {
    if (report.chartData) {
      const prevReport = index > 0 ? recentReports[index - 1] : null;
      const prevAvg = prevReport?.chartData?.averageScore ?? report.chartData.averageScore;
      const change = report.chartData.averageScore - prevAvg;

      return {
        value: report.chartData.averageScore,
        label: `${report.weekNumber}주차`,
        trend: getTrendFromChangeValue(change),
      };
    }

    return createFallbackDataPoint(report);
  });
};

const createFallbackDataPoint = (report: ReportHistoryItem): DataPoint => {
  const growthStat = report.stats?.find(stat => stat.label === '주차별 성장');

  if (growthStat && typeof growthStat.value === 'string') {
    const match = growthStat.value.match(/(\d+)단계/);
    const baseValue = match ? parseInt(match[1], 10) * 20 : 0;

    return {
      value: baseValue,
      label: `${report.weekNumber}주차`,
      trend: growthStat.trend,
    };
  }

  return {
    value: 0,
    label: `${report.weekNumber}주차`,
    trend: 'stable',
  };
};

export const getCategoryLabel = (key: keyof typeof CATEGORY_LABELS): string => {
  return CATEGORY_LABELS[key];
};
