import EyesIcon from '@/assets/icons/ph_eyes-fill.svg';
import { ARTICLE_CATEGORY_LABELS, type ArticleListItem } from '@/src/features/article/types';
import colors from '@/src/shared/constants/colors';
import { useMixpanel } from '@/src/shared/hooks/use-mixpanel';
import dayUtils from '@/src/shared/libs/day';
import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface SometimeArticleCardProps {
	article: ArticleListItem;
	embedded?: boolean;
}

export const SometimeArticleCard = ({ article, embedded }: SometimeArticleCardProps) => {
	const router = useRouter();
	const { sometimeStoryEvents } = useMixpanel();

	const handlePress = () => {
		if (embedded) {
			// 커뮤니티에서 접근한 경우 트래킹
			sometimeStoryEvents.trackCommunityArticleClicked(article.id, article.slug, article.title);
			// 뒤로가기 시 커뮤니티로 이동
			router.push(`/article/${article.slug}?returnPath=/community`);
		} else {
			router.push(`/article/${article.slug}`);
		}
	};

	const categoryLabel = ARTICLE_CATEGORY_LABELS[article.category];
	const formattedDate = article.publishedAt
		? dayUtils.create(article.publishedAt).format('M월 D일')
		: '';

	return (
		<Pressable
			style={({ pressed }) => [
				styles.container,
				embedded && styles.containerEmbedded,
				pressed && styles.pressed,
			]}
			onPress={handlePress}
		>
			{/* 썸네일 이미지 */}
			<ExpoImage
				source={{ uri: article.thumbnail.url }}
				style={styles.thumbnail}
				contentFit="cover"
				transition={200}
			/>

			{/* 콘텐츠 */}
			<View style={styles.content}>
				{/* 카테고리 · 날짜 */}
				<View style={styles.meta}>
					<Text style={styles.category}>{categoryLabel}</Text>
					<Text style={styles.separator}>·</Text>
					<Text style={styles.date}>{formattedDate}</Text>
				</View>

				{/* 제목 */}
				<Text style={styles.title} numberOfLines={2}>
					{article.title}
				</Text>

				{/* 부제목 */}
				{article.subtitle && (
					<Text style={styles.subtitle} numberOfLines={1}>
						{article.subtitle}
					</Text>
				)}

				{/* 조회수 */}
				<View style={styles.stats}>
					<EyesIcon width={14} height={14} fill={colors.text.muted} />
					<Text style={styles.viewCount}>{article.viewCount.toLocaleString()}</Text>
				</View>
			</View>
		</Pressable>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: colors.surface.background,
		borderRadius: 16,
		overflow: 'hidden',
		marginHorizontal: 20,
		marginBottom: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 3,
	},
	containerEmbedded: {
		marginHorizontal: 16,
		marginBottom: 16,
	},
	pressed: {
		opacity: 0.9,
		transform: [{ scale: 0.98 }],
	},
	thumbnail: {
		width: '100%',
		height: 200,
	},
	content: {
		padding: 16,
		gap: 8,
	},
	meta: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	category: {
		fontSize: 12,
		fontWeight: '600',
		color: colors.brand.primary,
		textTransform: 'uppercase',
	},
	separator: {
		fontSize: 12,
		color: colors.text.muted,
		marginHorizontal: 6,
	},
	date: {
		fontSize: 12,
		color: colors.text.muted,
	},
	title: {
		fontSize: 18,
		fontWeight: '700',
		color: colors.text.primary,
		lineHeight: 26,
	},
	subtitle: {
		fontSize: 14,
		color: colors.text.muted,
		lineHeight: 20,
	},
	stats: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 4,
		gap: 4,
	},
	viewCount: {
		fontSize: 13,
		color: colors.text.muted,
	},
});
