import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Text } from '@/src/shared/ui';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Platform, StyleSheet, View } from 'react-native';
import type { ConversationPhase, SenderType } from '../types';

interface SupportChatMessageProps {
	content: string;
	senderType: SenderType;
	createdAt: string;
	phase?: ConversationPhase;
	isStreaming?: boolean;
}

function StreamingCursor() {
	const opacity = useRef(new Animated.Value(1)).current;

	useEffect(() => {
		const animation = Animated.loop(
			Animated.sequence([
				Animated.timing(opacity, {
					toValue: 0,
					duration: 500,
					useNativeDriver: true,
				}),
				Animated.timing(opacity, {
					toValue: 1,
					duration: 500,
					useNativeDriver: true,
				}),
			]),
		);
		animation.start();
		return () => animation.stop();
	}, [opacity]);

	return <Animated.View style={[styles.streamingCursor, { opacity }]} />;
}

function SupportChatMessage({
	content,
	senderType,
	createdAt,
	phase,
	isStreaming,
}: SupportChatMessageProps) {
	const { t } = useTranslation();
	const isUser = senderType === 'user';
	const isBot = senderType === 'bot';
	const isAdmin = senderType === 'admin';
	const isAsking = isBot && phase === 'asking';

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
					<View style={styles.messageContent}>
						<Text style={[styles.messageText, isUser ? styles.userText : styles.otherText]}>
							{content}
						</Text>
						{isStreaming && <StreamingCursor />}
					</View>
					{isAsking && (
						<View style={styles.askingHint}>
							<Text style={styles.askingHintText}>
								{t('features.support-chat.message.asking_hint')}
							</Text>
						</View>
					)}
				</View>
				{!isUser && !isStreaming && <Text style={styles.time}>{formatTime(createdAt)}</Text>}
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
	messageContent: {
		flexDirection: 'row',
		alignItems: 'center',
		flexWrap: 'wrap',
	},
	messageText: {
		fontSize: 14,
		fontWeight: '400',
		lineHeight: 21,
		fontFamily: 'Pretendard-Regular',
		flexShrink: 1,
	},
	streamingCursor: {
		width: 2,
		height: 16,
		backgroundColor: semanticColors.brand.primary,
		marginLeft: 1,
		borderRadius: 1,
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
	askingHint: {
		marginTop: 8,
		paddingTop: 8,
		borderTopWidth: 1,
		borderTopColor: 'rgba(122, 74, 226, 0.15)',
	},
	askingHintText: {
		fontSize: 11,
		color: semanticColors.brand.primary,
		fontFamily: 'Pretendard-Medium',
	},
});

export default SupportChatMessage;
