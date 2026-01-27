import colors from '@/src/shared/constants/colors';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { useModal } from '@/src/shared/hooks/use-modal';
import { Text as CustomText } from '@/src/shared/ui';
import RedEmergencyIcon from '@assets/icons/red-emergency.svg';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useChatRoomDetail from '../../queries/use-chat-room-detail';
import useLeaveChatRoom from '../../queries/use-leave-chat-room';

interface ChatMenuModalProps {
	visible: boolean;
	onClose: () => void;
}

const ChatMenuModal = ({ visible, onClose }: ChatMenuModalProps) => {
	const { t } = useTranslation();
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id: string }>();
	const { data: roomDetail } = useChatRoomDetail(id);

	const { showModal, hideModal } = useModal();
	const mutate = useLeaveChatRoom();
	const handleOutChat = () => {
		onClose();
		showModal({
			showLogo: true,
			customTitle: (
				<View
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						width: '100%',
					}}
				>
					<CustomText textColor="black" weight="bold" size="20">
						{t('features.chat.ui.menu_modal.leave_chat_title')}
					</CustomText>
				</View>
			),
			children: (
				<View style={styles.leaveWarningContainer}>
					<Text style={styles.leaveWarningText}>
						{t('features.chat.ui.menu_modal.leave_chat_warning_1')}
					</Text>
					<Text style={styles.leaveWarningText}>
						{t('features.chat.ui.menu_modal.leave_chat_warning_2')}
					</Text>
				</View>
			),
			primaryButton: {
				text: t('features.chat.ui.menu_modal.cancel'),
				onClick: hideModal,
			},
			secondaryButton: {
				text: t('features.chat.ui.menu_modal.leave'),
				onClick: () => {
					mutate.mutateAsync({ chatRoomId: id });
					router.navigate('/chat');
				},
			},
		});
	};

	const handleReport = () => {
		router.navigate({
			pathname: '/partner/ban-report',
			params: {
				partnerId: roomDetail?.partnerId,
				partnerName: roomDetail?.partner.name,
				partnerAge: roomDetail?.partner.age,
				partnerUniv: roomDetail?.partner.university,
				partnerProfileImage: roomDetail?.partner.mainProfileImageUrl,
				chatRoomId: id,
			},
		});
	};
	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
			<View style={[styles.overlay, { paddingBottom: insets.bottom }]}>
				<View style={[styles.modalContainer, { bottom: insets.bottom + 74 }]}>
					<TouchableOpacity onPress={handleReport} style={styles.option}>
						<RedEmergencyIcon />
						<Text style={[styles.optionText, { color: semanticColors.state.error }]}>
							{t('features.chat.ui.menu_modal.report_and_leave')}
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={handleOutChat}
						style={[
							styles.option,
							{
								borderTopWidth: 0.5,
								borderTopColor: '#F3EDFF',
							},
						]}
					>
						<Text style={[styles.optionText, { color: semanticColors.text.disabled }]}>
							{t('features.chat.ui.menu_modal.leave_chat')}
						</Text>
					</TouchableOpacity>
				</View>
				<TouchableOpacity
					onPress={onClose}
					style={[styles.closeButton, { bottom: insets.bottom + 12 }]}
				>
					<Text style={styles.closeText}>{t('features.chat.ui.menu_modal.close')}</Text>
				</TouchableOpacity>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.4)',
		position: 'relative',
		...(Platform.OS === 'web' && {
			maxWidth: 468,
			left: '50%',
			marginLeft: -234, // 468 / 2 = 234 (maxWidth의 절반)
		}),
	},
	modalContainer: {
		backgroundColor: semanticColors.surface.background,

		marginHorizontal: 30,
		bottom: 0,
		left: 0,

		right: 0,
		position: 'absolute',
		borderRadius: 16,
	},
	option: {
		paddingVertical: 16,
		alignItems: 'center',
		flexDirection: 'row',
		gap: 10,
		justifyContent: 'center',
	},
	optionText: {
		fontSize: 20,
		fontWeight: 500,
		lineHeight: 20,
		marginTop: 4,
		fontFamily: 'Pretendard-Medium',
	},
	closeButton: {
		backgroundColor: colors.primaryPurple,
		marginHorizontal: 30,
		bottom: 0,
		left: 0,
		paddingVertical: 16,
		right: 0,
		position: 'absolute',
		borderRadius: 16,
		alignItems: 'center',
	},
	closeText: {
		color: semanticColors.text.inverse,
		fontFamily: 'Pretendard-Bold',
		fontWeight: 700,
		fontSize: 16,
	},
	info: {
		position: 'absolute',
		zIndex: 1000,
		left: 0,
		right: 0,
		alignItems: 'center',
	},
	leaveWarningContainer: {
		display: 'flex',
		flexDirection: 'column',
		width: '100%',
		alignItems: 'center',
		marginTop: 8,
		height: 40,
	},
	leaveWarningText: {
		color: semanticColors.text.disabled,
		fontSize: 12,
	},
	infoText: {
		color: semanticColors.text.inverse,
		textAlign: 'center',
		fontSize: 15,
		fontFamily: 'Pretendard-Light',
		fontWeight: 300,
		lineHeight: 18,
	},
});

export default ChatMenuModal;
