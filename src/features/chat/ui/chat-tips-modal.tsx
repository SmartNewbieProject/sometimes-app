import BulbIcon from '@assets/icons/bulb.svg';
import ReloadingIcon from '@assets/icons/reloading.svg';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import React from 'react';
import {
	ActivityIndicator,
	Modal,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ChatTip } from '../apis';
import { useTranslation } from 'react-i18next';

interface ChatTipsModalProps {
	visible: boolean;
	onClose: () => void;
	tips: ChatTip[];
	isLoading: boolean;
	onSelectTip: (question: string) => void;
	onRefresh: () => void;
}

function ChatTipsModal({
	visible,
	onClose,
	tips,
	isLoading,
	onSelectTip,
	onRefresh,
}: ChatTipsModalProps) {
	const insets = useSafeAreaInsets();
	const { t } = useTranslation();

	const handleSelectTip = (question: string) => {
		onSelectTip(question);
		onClose();
	};

	return (
		<Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
			<Pressable style={styles.overlay} onPress={onClose}>
				<View
					style={[styles.modalContainer, { paddingBottom: insets.bottom + 20 }]}
					onStartShouldSetResponder={() => true}
				>
					<View style={styles.handle} />

					<View style={styles.header}>
						<View style={styles.headerLeft}>
							<BulbIcon width={24} height={24} />
							<Text style={styles.headerTitle}>{t('features.chat.ui.tips_modal.header_title')}</Text>
						</View>
						<View style={styles.aiBadge}>
							<Text style={styles.aiBadgeText}>{t('features.chat.ui.tips_modal.ai_badge')}</Text>
						</View>
					</View>

					{isLoading ? (
						<View style={styles.loadingContainer}>
							<ActivityIndicator size="small" color={semanticColors.brand.primary} />
							<Text style={styles.loadingText}>{t('features.chat.ui.tips_modal.loading')}</Text>
						</View>
					) : (
						<View style={styles.tipsContainer}>
							{tips.map((tip, index) => (
								<TouchableOpacity
									key={`tip-${index}`}
									style={styles.tipItem}
									onPress={() => handleSelectTip(tip.question)}
								>
									<Text style={styles.tipText}>"{tip.question}"</Text>
									<Text style={styles.arrowIcon}>→</Text>
								</TouchableOpacity>
							))}
						</View>
					)}

					<TouchableOpacity
						style={styles.refreshButton}
						onPress={onRefresh}
						disabled={isLoading}
					>
						<ReloadingIcon width={20} height={20} />
						<Text style={styles.refreshButtonText}>{t('features.chat.ui.tips_modal.refresh_button')}</Text>
					</TouchableOpacity>

					<Text style={styles.footerText}>
						{t('features.chat.ui.tips_modal.footer_text')}
					</Text>
				</View>
			</Pressable>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		justifyContent: 'flex-end',
		...(Platform.OS === 'web' && {
			maxWidth: 468,
			left: '50%',
			marginLeft: -234,
		}),
	},
	modalContainer: {
		backgroundColor: semanticColors.surface.background,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		paddingTop: 12,
		paddingHorizontal: 20,
	},
	handle: {
		width: 40,
		height: 4,
		backgroundColor: semanticColors.text.disabled,
		borderRadius: 2,
		alignSelf: 'center',
		marginBottom: 20,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 16,
	},
	headerLeft: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: semanticColors.text.primary,
		fontFamily: 'Pretendard-SemiBold',
	},
	aiBadge: {
		backgroundColor: semanticColors.surface.tertiary,
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 12,
	},
	aiBadgeText: {
		fontSize: 12,
		fontWeight: '500',
		color: semanticColors.brand.primary,
		fontFamily: 'Pretendard-Medium',
	},
	loadingContainer: {
		paddingVertical: 40,
		alignItems: 'center',
		gap: 12,
	},
	loadingText: {
		fontSize: 14,
		color: semanticColors.text.muted,
		fontFamily: 'Pretendard-Regular',
	},
	tipsContainer: {
		gap: 8,
	},
	tipItem: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: semanticColors.surface.surface,
		paddingVertical: 16,
		paddingHorizontal: 16,
		borderRadius: 12,
	},
	tipText: {
		flex: 1,
		fontSize: 15,
		color: semanticColors.text.secondary,
		fontFamily: 'Pretendard-Regular',
		lineHeight: 22,
		marginRight: 8,
	},
	arrowIcon: {
		fontSize: 18,
		color: semanticColors.text.disabled,
	},
	refreshButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		paddingVertical: 16,
		marginTop: 16,
		borderWidth: 1,
		borderColor: semanticColors.border.smooth,
		borderRadius: 12,
	},
	refreshButtonText: {
		fontSize: 15,
		fontWeight: '500',
		color: semanticColors.brand.primary,
		fontFamily: 'Pretendard-Medium',
	},
	footerText: {
		fontSize: 13,
		color: semanticColors.text.disabled,
		fontFamily: 'Pretendard-Regular',
		textAlign: 'center',
		marginTop: 16,
	},
});

export default ChatTipsModal;
