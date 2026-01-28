import colors from '@/src/shared/constants/colors';
import dayUtils from '@/src/shared/libs/day';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { usePathname, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { type ArticleSource } from '../hooks';
import { useArticleDetail } from '../queries';
import { ARTICLE_CATEGORY_LABELS } from '../types';
import { MarkdownRenderer } from './markdown-renderer';
import { ShareButtons } from './share-buttons';

interface ArticleDetailProps {
	idOrSlug: string;
	/** 뒤로가기 시 이동할 경로 (지정하지 않으면 router.back() 또는 /auth/login으로 이동) */
	returnPath?: string;
}

export const ArticleDetail = ({ idOrSlug, returnPath }: ArticleDetailProps) => {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { article, isLoading, isError } = useArticleDetail({ idOrSlug });

	// returnPath 기반으로 접근 경로 결정
	const articleSource: ArticleSource = useMemo(() => {
		if (!returnPath) return 'direct';
		if (returnPath.includes('community')) return 'community';
		if (returnPath.includes('auth')) return 'auth';
		return 'direct';
	}, [returnPath]);

	const handleBack = () => {
		if (returnPath) {
			router.replace(returnPath);
			return;
		}

		// 썸타임 이야기 목록으로 이동
		router.replace('/auth/sometimes');
	};

	if (isLoading) {
		return (
			<View style={[styles.loading, { paddingTop: insets.top }]}>
				<ActivityIndicator size="large" color={colors.brand.primary} />
			</View>
		);
	}

	if (isError || !article) {
		return (
			<View style={[styles.error, { paddingTop: insets.top }]}>
				<Text style={styles.errorText}>글을 불러올 수 없어요</Text>
				<Pressable style={styles.backButton} onPress={handleBack}>
					<Text style={styles.backButtonText}>돌아가기</Text>
				</Pressable>
			</View>
		);
	}

	const categoryLabel = ARTICLE_CATEGORY_LABELS[article.category];
	const formattedDate = article.publishedAt
		? dayUtils.create(article.publishedAt).format('YYYY.MM.DD')
		: '';

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			{/* 헤더 */}
			<View style={styles.header}>
				<Pressable style={styles.headerButton} onPress={handleBack} hitSlop={8}>
					<Ionicons name="chevron-back" size={24} color={colors.text.primary} />
				</Pressable>
				<View style={styles.headerSpacer} />
			</View>

			<ScrollView
				style={styles.scroll}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{/* 커버 이미지 */}
				{article.coverImage && (
					<ExpoImage
						source={{ uri: article.coverImage.url }}
						style={styles.coverImage}
						contentFit="cover"
						transition={300}
					/>
				)}

				{/* 메타 정보 */}
				<View style={styles.metaSection}>
					<Text style={styles.category}>{categoryLabel}</Text>
					<Text style={styles.title}>{article.title}</Text>
					{article.subtitle && <Text style={styles.subtitle}>{article.subtitle}</Text>}

					{/* 작성자 · 날짜 */}
					<View style={styles.authorRow}>
						{article.author.avatar && (
							<ExpoImage source={{ uri: article.author.avatar }} style={styles.authorAvatar} />
						)}
						<View style={styles.authorInfo}>
							<Text style={styles.authorName}>{article.author.name}</Text>
							<Text style={styles.publishDate}>{formattedDate}</Text>
						</View>
					</View>
				</View>

				{/* 본문 */}
				<View style={styles.contentSection}>
					<MarkdownRenderer content={article.content} />
				</View>
			</ScrollView>

			{/* 하단 고정 공유 섹션 */}
			<View style={[styles.fixedShareSection, { paddingBottom: insets.bottom + 16 }]}>
				<Text style={styles.shareLabel}>이 글이 마음에 드셨나요?</Text>
				<ShareButtons article={article} source={articleSource} />
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.surface.background,
	},
	loading: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: colors.surface.background,
	},
	error: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: colors.surface.background,
		gap: 16,
	},
	errorText: {
		fontSize: 16,
		color: colors.text.muted,
	},
	backButton: {
		paddingVertical: 12,
		paddingHorizontal: 24,
		backgroundColor: colors.brand.primary,
		borderRadius: 8,
	},
	backButtonText: {
		fontSize: 15,
		fontWeight: '600',
		color: colors.white,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: colors.border.smooth,
	},
	headerButton: {
		padding: 4,
	},
	headerSpacer: {
		flex: 1,
	},
	scroll: {
		flex: 1,
	},
	scrollContent: {
		paddingBottom: 40,
	},
	coverImage: {
		width: '100%',
		height: 240,
	},
	metaSection: {
		padding: 20,
		gap: 12,
	},
	category: {
		fontSize: 13,
		fontWeight: '700',
		color: colors.brand.primary,
		textTransform: 'uppercase',
		letterSpacing: 1,
	},
	title: {
		fontSize: 24,
		fontWeight: '700',
		color: colors.text.primary,
		lineHeight: 34,
	},
	subtitle: {
		fontSize: 16,
		color: colors.text.muted,
		lineHeight: 24,
	},
	authorRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 8,
		gap: 12,
	},
	authorAvatar: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: colors.surface.surface,
	},
	authorInfo: {
		gap: 2,
	},
	authorName: {
		fontSize: 14,
		fontWeight: '600',
		color: colors.text.primary,
	},
	publishDate: {
		fontSize: 13,
		color: colors.text.muted,
	},
	contentSection: {
		paddingHorizontal: 20,
		paddingTop: 8,
		paddingBottom: 16,
	},
	fixedShareSection: {
		borderTopWidth: 1,
		borderTopColor: colors.border.smooth,
		paddingTop: 16,
		gap: 12,
		backgroundColor: colors.surface.background,
	},
	shareLabel: {
		fontSize: 15,
		fontWeight: '600',
		color: colors.text.primary,
		textAlign: 'center',
	},
});
