import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Text } from '@/src/shared/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import type { SessionStatus } from '../types';

interface SupportChatStatusBannerProps {
	status: SessionStatus;
	isTyping?: boolean;
}

function SupportChatStatusBanner({ status, isTyping = false }: SupportChatStatusBannerProps) {
	const { t } = useTranslation();

	const getStatusConfig = () => {
		if (isTyping) {
			return {
				text: t('features.support-chat.status.typing'),
				backgroundColor: '#E8F5E9',
				textColor: '#2E7D32',
				dotColor: '#4CAF50',
			};
		}

		switch (status) {
			case 'bot_handling':
				return {
					text: t('features.support-chat.status.bot_handling'),
					backgroundColor: '#F0F4FF',
					textColor: '#5C6BC0',
					dotColor: '#7986CB',
				};
			case 'waiting_admin':
				return {
					text: t('features.support-chat.status.waiting_admin'),
					backgroundColor: '#FFF8E1',
					textColor: '#F57C00',
					dotColor: '#FFB74D',
				};
			case 'admin_handling':
				return {
					text: t('features.support-chat.status.admin_handling'),
					backgroundColor: '#E8F5E9',
					textColor: '#2E7D32',
					dotColor: '#4CAF50',
				};
			case 'admin_resolved':
				return {
					text: t('features.support-chat.status.admin_resolved'),
					backgroundColor: '#E8F5E9',
					textColor: '#2E7D32',
					dotColor: '#4CAF50',
				};
			case 'user_closed':
				return {
					text: t('features.support-chat.status.user_closed'),
					backgroundColor: '#ECEFF1',
					textColor: '#607D8B',
					dotColor: '#90A4AE',
				};
			case 'resolved':
				return {
					text: t('features.support-chat.status.resolved'),
					backgroundColor: '#ECEFF1',
					textColor: '#607D8B',
					dotColor: '#90A4AE',
				};
			default:
				return {
					text: '',
					backgroundColor: 'transparent',
					textColor: semanticColors.text.muted,
					dotColor: semanticColors.text.muted,
				};
		}
	};

	const config = getStatusConfig();

	if (!config.text) return null;

	return (
		<View style={[styles.container, { backgroundColor: config.backgroundColor }]}>
			<View style={[styles.dot, { backgroundColor: config.dotColor }]} />
			<Text style={[styles.text, { color: config.textColor }]}>{config.text}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 8,
		paddingHorizontal: 16,
		gap: 8,
	},
	dot: {
		width: 8,
		height: 8,
		borderRadius: 4,
	},
	text: {
		fontSize: 13,
		fontFamily: 'Pretendard-Medium',
		fontWeight: '500',
	},
});

export default SupportChatStatusBanner;
