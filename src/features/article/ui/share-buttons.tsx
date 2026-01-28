import KakaoLogo from '@/assets/icons/kakao-logo.svg';
import colors from '@/src/shared/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useShareArticle, type ArticleSource } from '../hooks';
import type { Article } from '../types';

interface ShareButtonsProps {
	article: Article | undefined;
	source?: ArticleSource;
}

export const ShareButtons = ({ article, source = 'direct' }: ShareButtonsProps) => {
	const { shareToKakao, copyLink, shareNative, isKakaoReady } = useShareArticle({ article, source });

	return (
		<View style={styles.container}>
			{/* 카카오 공유 */}
			<Pressable
				style={({ pressed }) => [styles.button, styles.kakaoButton, pressed && styles.pressed]}
				onPress={shareToKakao}
				disabled={!isKakaoReady}
			>
				<KakaoLogo width={20} height={20} />
				<Text style={styles.kakaoText}>카카오톡 공유</Text>
			</Pressable>

			{/* 링크 복사 */}
			<Pressable
				style={({ pressed }) => [styles.button, styles.linkButton, pressed && styles.pressed]}
				onPress={copyLink}
			>
				<Ionicons name="link-outline" size={18} color={colors.white} />
				<Text style={styles.linkText}>링크 복사</Text>
			</Pressable>

			{/* 네이티브 공유 (모바일만) */}
			{Platform.OS !== 'web' && (
				<Pressable
					style={({ pressed }) => [styles.button, styles.moreButton, pressed && styles.pressed]}
					onPress={shareNative}
				>
					<Ionicons name="share-outline" size={18} color={colors.text.primary} />
				</Pressable>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		gap: 12,
		paddingHorizontal: 20,
		paddingVertical: 16,
	},
	button: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 14,
		paddingHorizontal: 20,
		borderRadius: 12,
		gap: 8,
	},
	pressed: {
		opacity: 0.8,
	},
	kakaoButton: {
		flex: 1,
		backgroundColor: '#FEE500',
	},
	kakaoText: {
		fontSize: 15,
		fontWeight: '600',
		color: '#191919',
	},
	linkButton: {
		flex: 1,
		backgroundColor: colors.brand.primary,
	},
	linkText: {
		fontSize: 15,
		fontWeight: '600',
		color: colors.white,
	},
	moreButton: {
		backgroundColor: colors.surface.surface,
		paddingHorizontal: 14,
	},
});
