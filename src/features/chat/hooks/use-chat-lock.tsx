import { useAuth } from '@/src/features/auth';
import { useFeatureCost } from '@/src/features/payment/hooks';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { useModal } from '@/src/shared/hooks/use-modal';
import { useToast } from '@/src/shared/hooks/use-toast';
import { CHAT_KEYS } from '@/src/shared/libs/locales/keys';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import useChatRockQuery from '../queries/use-chat-lock-query';
import useLeaveChatRoom from '../queries/use-leave-chat-room';

function useChatLock(chatRoomId: string) {
	const { t } = useTranslation();
	const { showModal } = useModal();
	const { emitToast } = useToast();
	const router = useRouter();
	const { profileDetails } = useAuth();
	const { featureCosts } = useFeatureCost();
	const chatStartCost = profileDetails?.gender === 'MALE' ? (featureCosts?.CHAT_START ?? 0) : 0;
	const { mutateAsync: enterMutateAsync, isPending: isEntering } = useChatRockQuery(
		chatRoomId,
		chatStartCost,
	);
	const { mutateAsync: leaveMutateAsync, isPending: isLeaving } = useLeaveChatRoom({
		onCustomSuccess: () => {
			emitToast('채팅을 거절했습니다.');
			router.push('/chat');
		},
	});

	const handleUnlock = () => {
		if (isEntering || isLeaving) return;

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
					<Text style={styles.modalTitleText}>
						{t(CHAT_KEYS.hooksUseChatLockUnlockModalTitleLine1)}
					</Text>
					<Text style={styles.modalTitleText}>
						{t(CHAT_KEYS.hooksUseChatLockUnlockModalTitleLine2)}
					</Text>
				</View>
			),

			children: (
				<View style={styles.modalContentContainer}>
					<Text style={styles.modalContentText}>
						{profileDetails?.gender === 'MALE'
							? t(CHAT_KEYS.hooksUseChatLockUnlockModalContentGems, {
									cost: featureCosts?.CHAT_START,
								})
							: t(CHAT_KEYS.hooksUseChatLockUnlockModalContentFree)}
					</Text>
					<Text style={styles.modalContentText}>
						{t(CHAT_KEYS.hooksUseChatLockUnlockModalContentCta)}
					</Text>
				</View>
			),
			primaryButton: {
				text: t(CHAT_KEYS.hooksYesTry),
				onClick: async () => {
					if (isEntering) return;
					await enterMutateAsync();
				},
			},
			secondaryButton: {
				text: t(CHAT_KEYS.hooksNo),
				onClick: () => {},
			},
		});
	};

	const handleRemove = () => {
		if (isEntering || isLeaving) return;

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
					<Text style={styles.modalTitleText}>
						{t(CHAT_KEYS.hooksUseChatLockRemoveModalTitleLine1)}
					</Text>
					<Text style={styles.modalTitleText}>
						{t(CHAT_KEYS.hooksUseChatLockRemoveModalTitleLine2)}
					</Text>
				</View>
			),
			children: (
				<View style={styles.modalContentContainer}>
					<Text style={styles.modalContentText}>
						{t(CHAT_KEYS.hooksUseChatLockRemoveModalContentWarning)}
					</Text>
					<Text style={styles.modalContentText}>
						{t(CHAT_KEYS.hooksUseChatLockRemoveModalContentConfirm)}
					</Text>
				</View>
			),
			primaryButton: {
				text: t(CHAT_KEYS.hooksCancel),
				onClick: () => {},
			},
			secondaryButton: {
				text: t(CHAT_KEYS.hooksDelete),
				onClick: async () => {
					if (isLeaving) return;
					await leaveMutateAsync({ chatRoomId });
				},
			},
			reverse: true,
		});
	};

	return {
		handleUnlock,
		handleRemove,
		isEntering,
		isLeaving,
	};
}

const styles = StyleSheet.create({
	modalContentContainer: {
		width: '100%',
		alignItems: 'center',
		marginTop: 8,
		height: 40,
	},
	modalContentText: {
		color: semanticColors.text.disabled,
		fontSize: 12,
	},
	modalTitleText: {
		fontSize: 20,
		fontWeight: 600,
		fontFamily: 'Pretendard-Bold',
		lineHeight: 24,
	},
});

export default useChatLock;
