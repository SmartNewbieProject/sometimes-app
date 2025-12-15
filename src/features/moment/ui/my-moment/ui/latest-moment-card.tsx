import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import type { MomentReport, Report } from '../../../types';

interface LatestMomentCardProps {
  momentReport: MomentReport | Report | null;
  isLoading?: boolean;
}

export const LatestMomentCard: React.FC<LatestMomentCardProps> = ({
  momentReport,
  isLoading = false
}) => {
  // Handle both legacy MomentReport and new Report types
  const getReportData = (report: MomentReport | Report) => {
    if ('weekNumber' in report) {
      // Legacy MomentReport
      return {
        id: report.id,
        weekNumber: report.weekNumber,
        year: report.year,
        title: report.title,
        subTitle: report.subTitle,
        description: report.description,
        keywords: report.keywords,
        imageUrl: report.imageUrl,
        generatedAt: report.generatedAt,
      };
    } else {
      // New Report type
      return {
        id: report.id,
        weekNumber: report.week,
        year: report.year,
        title: report.narrative.title,
        subTitle: report.narrative.summary,
        description: report.narrative.highlights.join(' '),
        keywords: report.narrative.insights.slice(0, 5), // Use insights as keywords for now
        imageUrl: '', // New API doesn't include imageUrl
        generatedAt: report.generatedAt,
      };
    }
  };

  const handlePress = () => {
    if (momentReport) {
      router.push(`/moment/my-moment-record?id=${momentReport.id}`);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <View style={styles.skeleton} />
      </View>
    );
  }

  if (!momentReport) {
    return null;
  }

  const reportData = getReportData(momentReport);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.weekText}>
          {reportData.year}년 {reportData.weekNumber}주차
        </Text>
        <Text style={styles.dateText}>
          {new Date(reportData.generatedAt).toLocaleDateString('ko-KR', {
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.textSection}>
          <Text style={styles.title}>{reportData.title}</Text>
          <Text style={styles.subTitle}>{reportData.subTitle}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {reportData.description}
          </Text>

          <View style={styles.keywordContainer}>
            {reportData.keywords.slice(0, 3).map((keyword, index) => (
              <View key={index} style={styles.keyword}>
                <Text style={styles.keywordText}>{keyword}</Text>
              </View>
            ))}
          </View>
        </View>

        {reportData.imageUrl && (
          <View style={styles.imageSection}>
            <Image
              source={{ uri: reportData.imageUrl }}
              style={styles.image}
              contentFit="cover"
            />
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText} onPress={handlePress}>
          자세히 보기 →
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: semanticColors.surface.background,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
  },
  emptyContainer: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeleton: {
    height: 200,
    backgroundColor: semanticColors.surface.disabled,
    borderRadius: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: semanticColors.text.disabled,
    fontSize: 14,
    lineHeight: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  weekText: {
    fontSize: 16,
    fontWeight: '600',
    color: semanticColors.text.primary,
  },
  dateText: {
    fontSize: 14,
    color: semanticColors.text.disabled,
  },
  content: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  textSection: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: semanticColors.text.primary,
    marginBottom: 4,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: semanticColors.text.secondary,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: semanticColors.text.disabled,
    lineHeight: 20,
    marginBottom: 12,
  },
  keywordContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  keyword: {
    backgroundColor: semanticColors.brand.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  keywordText: {
    fontSize: 12,
    fontWeight: '500',
    color: semanticColors.brand.primary,
  },
  imageSection: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  footer: {
    alignItems: 'flex-end',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: semanticColors.brand.primary,
  },
});

export default LatestMomentCard;