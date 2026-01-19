import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Text } from '@/src/shared/ui';

function SupportMenu() {
	const { t } = useTranslation();
	const router = useRouter();

	const handleChatbotPress = () => {
		router.push('/support-chat' as never);
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>{t('features.mypage.support.title')}</Text>
			<View style={styles.bar} />
			<Pressable onPress={handleChatbotPress} style={styles.cardContainer}>
				<View style={styles.leftContent}>
					<Text style={styles.icon}>💬</Text>
					<View style={styles.textContainer}>
						<Text style={styles.cardTitle}>{t('features.mypage.support.chatbot_title')}</Text>
						<Text style={styles.cardDescription}>
							{t('features.mypage.support.chatbot_description')}
						</Text>
					</View>
				</View>
				<View style={styles.arrowContainer}>
					<View style={styles.arrow} />
				</View>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		width: '100%',
		marginTop: 24,
	},
	title: {
		color: semanticColors.text.primary,
		fontSize: 18,
		fontFamily: 'Pretendard-SemiBold',
		fontWeight: '600',
		lineHeight: 21.6,
	},
	bar: {
		marginTop: 5,
		marginBottom: 10,
		height: 1,
		width: '100%',
		backgroundColor: semanticColors.surface.background,
	},
	cardContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: semanticColors.surface.secondary,
		borderRadius: 12,
		padding: 16,
	},
	leftContent: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
	},
	icon: {
		fontSize: 24,
		marginRight: 12,
	},
	textContainer: {
		flex: 1,
	},
	cardTitle: {
		color: semanticColors.text.primary,
		fontSize: 16,
		fontFamily: 'Pretendard-SemiBold',
		fontWeight: '600',
		lineHeight: 20,
	},
	cardDescription: {
		color: semanticColors.text.muted,
		fontSize: 13,
		fontFamily: 'Pretendard-Regular',
		lineHeight: 18,
		marginTop: 2,
	},
	arrowContainer: {
		width: 24,
		height: 24,
		position: 'relative',
	},
	arrow: {
		width: 8,
		height: 8,
		top: 6,
		left: 6,
		position: 'absolute',
		borderRightWidth: 2,
		borderRightColor: '#BAC1CB',
		borderBottomWidth: 2,
		borderBottomColor: '#BAC1CB',
		transform: [{ rotate: '-45deg' }],
		borderRadius: 2,
	},
});

export default SupportMenu;
