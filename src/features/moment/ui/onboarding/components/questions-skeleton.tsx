import colors from '@/src/shared/constants/colors';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Skeleton } from './skeleton';

export const OnboardingQuestionsSkeleton = () => {
	const insets = useSafeAreaInsets();

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			{/* 헤더 영역 */}
			<View style={styles.header}>
				<Skeleton width={24} height={24} borderRadius={4} />
				<Skeleton width={60} height={20} borderRadius={4} />
				<Skeleton width={30} height={16} borderRadius={4} />
			</View>

			{/* 프로그레스 바 */}
			<View style={styles.progressContainer}>
				<Skeleton width="100%" height={12} borderRadius={100} />
			</View>

			{/* 질문 카드 */}
			<View style={styles.content}>
				<View style={styles.questionCard}>
					<Skeleton width="90%" height={18} borderRadius={4} />
					<Skeleton width="60%" height={18} borderRadius={4} style={{ marginTop: 8 }} />
				</View>

				{/* 선택지 3개 */}
				<View style={styles.optionsContainer}>
					{[1, 2, 3].map((i) => (
						<View key={i} style={styles.optionItem}>
							<Skeleton width={22} height={22} borderRadius={11} />
							<Skeleton
								width={i === 2 ? '70%' : '85%'}
								height={16}
								borderRadius={4}
								style={{ marginLeft: 14 }}
							/>
						</View>
					))}
				</View>
			</View>

			{/* 하단 버튼 */}
			<View style={[styles.buttonContainer, { paddingBottom: insets.bottom + 24 }]}>
				<Skeleton width="100%" height={52} borderRadius={12} />
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.white,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		height: 52,
	},
	progressContainer: {
		paddingHorizontal: 24,
		paddingVertical: 16,
	},
	content: {
		flex: 1,
		paddingHorizontal: 24,
	},
	questionCard: {
		backgroundColor: '#F8F5FF',
		borderRadius: 16,
		padding: 24,
		alignItems: 'center',
		marginTop: 16,
		marginBottom: 32,
	},
	optionsContainer: {
		gap: 12,
	},
	optionItem: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#FFFFFF',
		borderRadius: 12,
		paddingVertical: 16,
		paddingHorizontal: 16,
		borderWidth: 1.5,
		borderColor: '#F0F0F0',
	},
	buttonContainer: {
		paddingHorizontal: 24,
		paddingTop: 16,
	},
});
