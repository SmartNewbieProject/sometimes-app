import { useHomeHots } from '@/src/features/community/hooks/use-home';
import { Text } from '@/src/shared/ui';
import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

type Props = {
	pageSize?: number;
};

export default function HotSlide({ pageSize = 5 }: Props) {
	const { t } = useTranslation();
	const { hots, total, isLoading, isError } = useHomeHots(pageSize);

	if (isLoading) {
		return (
			<View style={styles.container}>
				<View style={styles.labelContainer}>
					<Text style={styles.fireEmoji}>🔥</Text>
					<Text style={styles.labelText}>{t('features.community.ui.hot.label', '인기')}</Text>
				</View>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="small" color="#7a4ae2" />
				</View>
			</View>
		);
	}

	if (isError || !hots.length) {
		return null;
	}

	return (
		<View style={styles.container}>
			<View style={styles.labelContainer}>
				<Text style={styles.fireEmoji}>🔥</Text>
				<Text style={styles.labelText}>{t('features.community.ui.hot.label', '인기')}</Text>
			</View>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={styles.scrollContent}
			>
				{hots.slice(0, total).map((item) => (
					<TouchableOpacity
						key={item.id}
						activeOpacity={0.8}
						onPress={() => router.push(`/community/${item.id}`)}
						style={styles.card}
					>
						<Text numberOfLines={1} ellipsizeMode="tail" style={styles.titleText}>
							{item.title}
						</Text>
						<Text numberOfLines={1} ellipsizeMode="tail" style={styles.contentText}>
							{item.categoryName}
						</Text>
					</TouchableOpacity>
				))}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 8,
		paddingHorizontal: 16,
	},
	labelContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 8,
		width: 28,
	},
	fireEmoji: {
		fontSize: 22,
	},
	labelText: {
		fontFamily: 'Pretendard',
		fontSize: 15,
		fontWeight: '500' as any,
		color: '#7a4ae2',
		marginTop: 4,
	},
	loadingContainer: {
		flex: 1,
		height: 61,
		justifyContent: 'center',
		alignItems: 'center',
	},
	scrollContent: {
		flexDirection: 'row',
		gap: 8,
	},
	card: {
		width: 242,
		height: 61,
		backgroundColor: '#f3edff',
		borderRadius: 15,
		paddingHorizontal: 16,
		paddingVertical: 10,
		justifyContent: 'center',
	},
	titleText: {
		fontFamily: 'Pretendard',
		fontSize: 15,
		fontWeight: '600' as any,
		lineHeight: 18,
		color: '#000000',
		marginBottom: 4,
	},
	contentText: {
		fontFamily: 'Pretendard',
		fontSize: 12,
		fontWeight: '400' as any,
		lineHeight: 16.8,
		color: '#646464',
	},
});
