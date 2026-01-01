import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '@/src/shared/ui';
import colors from '@/src/shared/constants/colors';
import { InsightItem } from '../../apis';

interface WeeklyReportInsightsProps {
	insights: InsightItem[];
}

export const WeeklyReportInsights: React.FC<WeeklyReportInsightsProps> = ({ insights }) => {
	const { t } = useTranslation();

	const getScoreColor = (score: number) => {
		if (score >= 80) return colors.green || '#10B981';
		if (score >= 60) return colors.primaryPurple;
		if (score >= 40) return colors.orange || '#F59E0B';
		return colors.red || '#EF4444';
	};

	const getScoreLabel = (score: number) => {
		if (score >= 80) return t('common.매우_높음');
		if (score >= 60) return t('common.높음');
		if (score >= 40) return t('common.보통');
		return t('common.개선_필요');
	};

	return (
		<View style={styles.container}>
			<Text size="lg" weight="bold" textColor="black" style={styles.title}>
				🔍 상세 분석
			</Text>

			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={styles.insightsContainer}
			>
				{insights.map((insight, index) => {
					const score = insight.score ?? 0;
					return (
						<View
							key={index}
							style={[styles.insightCard, { borderTopColor: getScoreColor(score) }]}
						>
							{/* 점수와 레이블 */}
							<View style={styles.scoreHeader}>
								<Text size="lg" weight="bold" style={{ color: getScoreColor(score) }}>
									{score}점
								</Text>
								<Text size="12" textColor="gray" style={styles.scoreLabel}>
									{getScoreLabel(score)}
								</Text>
							</View>

							{/* 카테고리명 */}
							<Text size="md" weight="bold" textColor="black" style={styles.category}>
								{insight.category}
							</Text>

							{/* 정의 */}
							<Text size="12" textColor="gray" style={styles.definition}>
								{insight.definition}
							</Text>

							{/* 피드백 */}
							<Text size="sm" textColor="black" style={styles.feedback}>
								{insight.feedback}
							</Text>
						</View>
					);
				})}
			</ScrollView>
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
	insightsContainer: {
		paddingHorizontal: 8,
		gap: 12,
	},
	insightCard: {
		width: 280,
		backgroundColor: colors.white,
		borderRadius: 16,
		padding: 16,
		marginRight: 12,
		borderWidth: 1,
		borderTopWidth: 4,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	scoreHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 8,
	},
	scoreLabel: {
		backgroundColor: colors.lightGray,
		paddingHorizontal: 8,
		paddingVertical: 2,
		borderRadius: 4,
	},
	category: {
		marginBottom: 6,
	},
	definition: {
		marginBottom: 10,
		lineHeight: 16,
	},
	feedback: {
		lineHeight: 18,
	},
});
