import colors from '@/src/shared/constants/colors';
import { Text } from '@/src/shared/ui';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface DayIndicatorProps {
	answeredThisWeek: number;
	dayOfWeek: number;
	hasTodayAnswer: boolean;
}

const DAY_LABELS = ['월', '화', '수', '목', '금'];

export const DayIndicator = ({
	answeredThisWeek,
	dayOfWeek,
	hasTodayAnswer,
}: DayIndicatorProps) => {
	// 주말이면 금요일(5)까지만 표시
	const maxAvailableDay = dayOfWeek > 5 ? 5 : dayOfWeek;

	const getDotStyle = (day: number) => {
		// 완료된 날 (answeredThisWeek 기반 — 처음 N개 완료)
		const completedCount = hasTodayAnswer ? answeredThisWeek : Math.max(0, answeredThisWeek);
		if (day <= completedCount) {
			return { dot: styles.dotCompleted, label: styles.labelCompleted };
		}
		// 오늘이고 아직 미답변 (활성)
		if (day === maxAvailableDay && !hasTodayAnswer && answeredThisWeek < 5) {
			return { dot: styles.dotActive, label: styles.labelActive };
		}
		// 미래
		if (day > maxAvailableDay) {
			return { dot: styles.dotFuture, label: styles.labelFuture };
		}
		// 지나갔지만 미답변
		return { dot: styles.dotMissed, label: styles.labelMissed };
	};

	return (
		<View style={styles.container}>
			{DAY_LABELS.map((label, index) => {
				const day = index + 1;
				const { dot, label: labelStyle } = getDotStyle(day);
				return (
					<View key={day} style={styles.dayItem}>
						<View style={[styles.dot, dot]} />
						<Text size="11" weight="medium" style={[styles.label, labelStyle]}>
							{label}
						</Text>
					</View>
				);
			})}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 16,
		marginHorizontal: 20,
		marginBottom: 20,
		paddingVertical: 12,
		paddingHorizontal: 20,
		backgroundColor: 'rgba(122, 74, 226, 0.06)',
		borderRadius: 12,
	},
	dayItem: {
		alignItems: 'center',
		gap: 4,
	},
	dot: {
		width: 28,
		height: 28,
		borderRadius: 14,
	},
	dotCompleted: {
		backgroundColor: colors.primaryPurple,
	},
	dotActive: {
		backgroundColor: colors.primaryPurple,
		opacity: 0.7,
		borderWidth: 2,
		borderColor: colors.primaryPurple,
	},
	dotFuture: {
		backgroundColor: '#D1D5DB',
	},
	dotMissed: {
		backgroundColor: '#F97316',
		opacity: 0.7,
	},
	label: {
		fontSize: 11,
	},
	labelCompleted: {
		color: colors.primaryPurple,
	},
	labelActive: {
		color: colors.primaryPurple,
	},
	labelFuture: {
		color: '#9CA3AF',
	},
	labelMissed: {
		color: '#F97316',
	},
});
