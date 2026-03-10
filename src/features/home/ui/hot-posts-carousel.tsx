import { useHomeHots } from '@/src/features/community/hooks/use-home';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Badge, Text } from '@/src/shared/ui';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

import type { HotArticle } from '@/src/features/community/types';

const CARD_WIDTH = 280;
const CARD_GAP = 12;
const SNAP_INTERVAL = CARD_WIDTH + CARD_GAP;
const SIDE_PADDING = 20;

export function HotPostsCarousel() {
	const { t } = useTranslation();
	const { hots, isLoading, isError } = useHomeHots();

	const handleViewAllPress = useCallback(() => {
		router.push('/community');
	}, []);

	const handleCardPress = useCallback((itemId: string) => {
		router.push(`/community/${itemId}`);
	}, []);

	const renderItem = useCallback(
		({ item }: { item: HotArticle }) => (
			<TouchableOpacity
				activeOpacity={0.85}
				onPress={() => handleCardPress(item.id)}
				style={styles.card}
			>
				<Badge variant="approved">{item.categoryName}</Badge>
				<Text numberOfLines={2} style={styles.cardTitle}>
					{item.title}
				</Text>
			</TouchableOpacity>
		),
		[handleCardPress],
	);

	const keyExtractor = useCallback((item: HotArticle) => item.id, []);

	const getItemLayout = useCallback(
		(_: ArrayLike<HotArticle> | null | undefined, index: number) => ({
			length: SNAP_INTERVAL,
			offset: SNAP_INTERVAL * index,
			index,
		}),
		[],
	);

	if (isLoading) {
		return <View style={styles.placeholder} />;
	}

	if (isError || !hots.length) {
		return null;
	}

	return (
		<View style={styles.section}>
			<View style={styles.header}>
				<Text style={styles.headerTitle}>{t('features.home.ui.hot_posts_carousel.title')}</Text>
				<TouchableOpacity
					activeOpacity={0.7}
					onPress={handleViewAllPress}
					style={styles.viewAllButton}
				>
					<Text style={styles.viewAll}>{t('features.home.ui.hot_posts_carousel.view_all')}</Text>
				</TouchableOpacity>
			</View>

			<View style={styles.carouselWrapper}>
				<FlatList
					data={hots}
					keyExtractor={keyExtractor}
					horizontal
					directionalLockEnabled
					showsHorizontalScrollIndicator={false}
					snapToInterval={SNAP_INTERVAL}
					snapToAlignment="start"
					decelerationRate="fast"
					contentContainerStyle={styles.listContent}
					renderItem={renderItem}
					getItemLayout={getItemLayout}
					initialNumToRender={4}
					maxToRenderPerBatch={4}
					windowSize={3}
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	section: {
		marginTop: 8,
		overflow: 'hidden',
	},
	placeholder: {
		height: 130,
		marginTop: 8,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},
	headerTitle: {
		fontSize: 17,
		fontWeight: '700',
		color: semanticColors.text.primary,
	},
	viewAllButton: {
		paddingVertical: 13,
		paddingHorizontal: 8,
	},
	viewAll: {
		fontSize: 13,
		fontWeight: '500',
		color: semanticColors.text.muted,
	},
	carouselWrapper: {
		marginHorizontal: -SIDE_PADDING,
	},
	listContent: {
		paddingHorizontal: SIDE_PADDING,
		gap: CARD_GAP,
	},
	card: {
		width: CARD_WIDTH,
		backgroundColor: semanticColors.surface.secondary,
		borderRadius: 14,
		paddingHorizontal: 16,
		paddingVertical: 14,
		gap: 8,
	},
	cardTitle: {
		fontSize: 15,
		fontWeight: '600',
		lineHeight: 21,
		color: semanticColors.text.primary,
	},
});
