import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, StyleSheet } from 'react-native';
import { Text, LineChart } from '@/src/shared/ui';
import colors from '@/src/shared/constants/colors';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import type { ReportHistoryItem } from '../../apis/index';
import { convertReportsToChartData } from './growth-chart.utils';

interface GrowthChartProps {
  reports: ReportHistoryItem[];
  maxWeeks?: number;
}

const CHART_HEIGHT = 140;

export const GrowthChart = ({ reports, maxWeeks = 5 }: GrowthChartProps) => {
  const { t } = useTranslation();

  const chartData = convertReportsToChartData(reports, maxWeeks);

  const hasValidData = chartData.some(point => point.value > 0);
  const subtitle = reports.length > 0
    ? `최근 ${Math.min(reports.length, maxWeeks)}주간의 모먼트 변화를 보여줘요!`
    : t("common.아직_모먼트_기록이_없어요_오늘의_질문에_답변해보세요");

  return (
    <View style={styles.container}>
      <Text size="18" weight="bold" textColor="purple" style={styles.title}>
        나의 성장 트렌드
      </Text>
      <Text size="12" weight="normal" textColor="purple" style={styles.subtitle}>
        {subtitle}
      </Text>

      {hasValidData ? (
        <LineChart
          data={chartData}
          height={CHART_HEIGHT}
          minValue={0}
          maxValue={100}
          lineColor={semanticColors.brand.primary}
          yAxisLabels={['100', '50', '0']}
          showTrendIndicators={true}
        />
      ) : (
        <View style={styles.emptyChart}>
          <LineChart
            data={chartData.length > 0 ? chartData : [{ value: 0, label: t("common.데이터_없음") }]}
            height={CHART_HEIGHT}
            minValue={0}
            maxValue={100}
            lineColor={semanticColors.brand.primary}
            yAxisLabels={['100', '50', '0']}
            showTrendIndicators={false}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.moreLightPurple,
    borderRadius: 20,
    padding: 20,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 20,
    opacity: 0.8,
  },
  emptyChart: {
    opacity: 0.5,
  },
});
