import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Text } from '@/src/shared/ui';
import type { SenderType } from '../types';

interface SupportChatMessageProps {
	content: string;
	senderType: SenderType;
	createdAt: string;
}

function SupportChatMessage({ content, senderType, createdAt }: SupportChatMessageProps) {
	const { t } = useTranslation();
	const isUser = senderType === 'user';
	const isBot = senderType === 'bot';
	const isAdmin = senderType === 'admin';

	const formatTime = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleTimeString('ko-KR', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: true,
		});
	};

	const getSenderLabel = () => {
		if (isBot) return t('features.support-chat.message.bot_label');
		if (isAdmin) return t('features.support-chat.message.admin_label');
		return null;
	};

	const senderLabel = getSenderLabel();

	return (
		<View style={[styles.container, isUser ? styles.containerRight : styles.containerLeft]}>
			{!isUser && senderLabel && <Text style={styles.senderLabel}>{senderLabel}</Text>}
			<View style={styles.messageRow}>
				{isUser && <Text style={styles.time}>{formatTime(createdAt)}</Text>}
				<View
					style={[
						styles.bubble,
						isUser ? styles.userBubble : styles.otherBubble,
						isBot && styles.botBubble,
						isAdmin && styles.adminBubble,
					]}
				>
					<Text style={[styles.messageText, isUser ? styles.userText : styles.otherText]}>
						{content}
					</Text>
				</View>
				{!isUser && <Text style={styles.time}>{formatTime(createdAt)}</Text>}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginVertical: 4,
		maxWidth: '85%',
	},
	containerLeft: {
		alignSelf: 'flex-start',
	},
	containerRight: {
		alignSelf: 'flex-end',
	},
	senderLabel: {
		fontSize: 12,
		color: semanticColors.text.muted,
		marginBottom: 4,
		marginLeft: 4,
		fontFamily: 'Pretendard-Medium',
	},
	messageRow: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		gap: 6,
	},
	bubble: {
		paddingHorizontal: 15,
		paddingVertical: 10,
		borderRadius: 18,
		flexShrink: 1,
		...Platform.select({
			ios: {
				shadowColor: '#000',
				shadowOffset: { width: 0, height: 1 },
				shadowOpacity: 0.05,
				shadowRadius: 2,
			},
			android: {
				elevation: 2,
			},
		}),
	},
	userBubble: {
		backgroundColor: semanticColors.brand.primary,
		borderTopRightRadius: 6,
	},
	otherBubble: {
		backgroundColor: semanticColors.surface.background,
		borderTopLeftRadius: 6,
	},
	botBubble: {
		backgroundColor: '#F0F4FF',
	},
	adminBubble: {
		backgroundColor: semanticColors.surface.background,
	},
	messageText: {
		fontSize: 14,
		fontWeight: '400',
		lineHeight: 21,
		fontFamily: 'Pretendard-Regular',
	},
	userText: {
		color: semanticColors.text.inverse,
	},
	otherText: {
		color: semanticColors.text.primary,
	},
	time: {
		fontSize: 11,
		color: semanticColors.text.muted,
		fontFamily: 'Pretendard-Regular',
	},
});

export default SupportChatMessage;
