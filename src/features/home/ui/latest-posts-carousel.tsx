import CommentIcon from '@/assets/icons/engagement.svg';
import HeartIcon from '@/assets/icons/heart.svg';
import { useHomeLatestArticles } from '@/src/features/community/hooks/use-home';
import type { Article } from '@/src/features/community/types';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Text } from '@/src/shared/ui';
import { IconWrapper } from '@/src/shared/ui/icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

const CARD_WIDTH = 280;
const CARD_GAP = 12;
const SNAP_INTERVAL = CARD_WIDTH + CARD_GAP;
const SIDE_PADDING = 20;

function formatRelativeTime(dateString: string): string {
	const now = Date.now();
	const diff = now - new Date(dateString).getTime();
	const minutes = Math.floor(diff / 60000);
	if (minutes < 1) return '방금 전';
	if (minutes < 60) return `${minutes}분 전`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}시간 전`;
	const days = Math.floor(hours / 24);
	if (days < 7) return `${days}일 전`;
	return `${Math.floor(days / 7)}주 전`;
}

interface LatestPostsCarouselProps {
	onGestureStateChange?: (isDragging: boolean) => void;
}

export function LatestPostsCarousel({ onGestureStateChange }: LatestPostsCarouselProps) {
	const { t } = useTranslation();
	const { articles, isLoading, isError } = useHomeLatestArticles(10);

	if (isLoading) {
		return <View style={styles.placeholder} />;
	}

	if (isError || !articles.length) {
		return null;
	}

	return (
		<View style={styles.section}>
			<View style={styles.header}>
				<Text style={styles.headerTitle}>{t('features.home.ui.latest_posts_carousel.title')}</Text>
				<TouchableOpacity
					activeOpacity={0.7}
					onPress={() => router.push('/community?category=general')}
					style={styles.viewAllButton}
				>
					<Text style={styles.viewAll}>{t('features.home.ui.latest_posts_carousel.view_all')}</Text>
				</TouchableOpacity>
			</View>

			<View style={styles.carouselWrapper}>
				<FlatList
					data={articles}
					keyExtractor={(item) => item.id}
					horizontal
					directionalLockEnabled
					showsHorizontalScrollIndicator={false}
					snapToInterval={SNAP_INTERVAL}
					snapToAlignment="start"
					decelerationRate="fast"
					contentContainerStyle={styles.listContent}
					renderItem={({ item }) => <LatestPostCard item={item} />}
					onScrollBeginDrag={() => onGestureStateChange?.(true)}
					onScrollEndDrag={() => onGestureStateChange?.(false)}
					onMomentumScrollEnd={() => onGestureStateChange?.(false)}
				/>
			</View>
		</View>
	);
}

function LatestPostCard({ item }: { item: Article }) {
	return (
		<TouchableOpacity
			activeOpacity={0.85}
			onPress={() => router.push(`/community/${item.id}`)}
			style={styles.card}
		>
			<Text numberOfLines={2} style={styles.cardTitle}>
				{item.title}
			</Text>
			<Text numberOfLines={1} style={styles.cardContent}>
				{item.content}
			</Text>
			<View style={styles.cardMeta}>
				<Text style={styles.metaText}>{formatRelativeTime(item.createdAt)}</Text>
				{item.commentCount > 0 && (
					<View style={styles.metaItem}>
						<IconWrapper size={14}>
							<CommentIcon strokeWidth={1} stroke="#9CA3AF" />
						</IconWrapper>
						<Text style={styles.metaText}>{item.commentCount}</Text>
					</View>
				)}
				{item.likeCount > 0 && (
					<View style={styles.metaItem}>
						<IconWrapper size={14}>
							<HeartIcon stroke="#9CA3AF" />
						</IconWrapper>
						<Text style={styles.metaText}>{item.likeCount}</Text>
					</View>
				)}
			</View>
		</TouchableOpacity>
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
		gap: 6,
	},
	cardTitle: {
		fontSize: 15,
		fontWeight: '600',
		lineHeight: 21,
		color: semanticColors.text.primary,
	},
	cardContent: {
		fontSize: 13,
		fontWeight: '400',
		lineHeight: 18,
		color: semanticColors.text.secondary,
	},
	cardMeta: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		marginTop: 2,
	},
	metaItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 3,
	},
	metaText: {
		fontSize: 12,
		fontWeight: '400',
		color: semanticColors.text.muted,
	},
});
