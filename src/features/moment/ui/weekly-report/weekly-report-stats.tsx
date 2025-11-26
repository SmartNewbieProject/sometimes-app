import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from '@/src/shared/ui';
import colors from '@/src/shared/constants/colors';
import { StatItem } from '../../apis';

interface WeeklyReportStatsProps {
  stats: StatItem[];
}

export const WeeklyReportStats: React.FC<WeeklyReportStatsProps> = ({ stats }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'INCREASE':
        return '↗️';
      case 'DECREASE':
        return '↘️';
      case 'MAINTAIN':
        return '→';
      default:
        return '→';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'INCREASE':
        return colors.green || '#10B981';
      case 'DECREASE':
        return colors.red || '#EF4444';
      case 'MAINTAIN':
        return colors.gray;
      default:
        return colors.gray;
    }
  };

  return (
    <View style={styles.container}>
      <Text size="lg" weight="bold" textColor="black" style={styles.title}>
        📊 이번 주 성장 지표
      </Text>

      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={[styles.statCard, { borderLeftColor: getStatusColor(stat.status) }]}>
            {/* 카테고리명 */}
            <Text size="sm" weight="bold" textColor="black" style={styles.category}>
              {stat.category}
            </Text>

            {/* 점수 표시 */}
            <View style={styles.scoreContainer}>
              <Text size="xl" weight="bold" textColor="black">
                {stat.currentScore}
              </Text>
              
              <View style={styles.changeContainer}>
                <Text size="lg" style={{ color: getStatusColor(stat.status) }}>
                  {getStatusIcon(stat.status)}
                </Text>
                <Text 
                  size="sm" 
                  style={{ color: getStatusColor(stat.status) }}
                >
                  {stat.status === 'INCREASE' && '+'}
                  {stat.currentScore - stat.prevScore}
                </Text>
              </View>
            </View>

            {/* 지난 주 점수 */}
            <Text size="12" textColor="gray">
              지난 주: {stat.prevScore}점
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -8,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 8,
    borderWidth: 1,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  category: {
    marginBottom: 8,
    textAlign: 'center',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});