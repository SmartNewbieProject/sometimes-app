import { semanticColors } from '@/src/shared/constants/semantic-colors';
import ChevronLeft from '@assets/icons/chevron-left.svg';
import VerticalEllipsisIcon from '@assets/icons/vertical-ellipsis.svg';
import { Image } from 'expo-image';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../auth';
import useChatRoomDetail from '../queries/use-chat-room-detail';
import ChatInfoModalContainer from './modal/info-modal-container';

const REFUND_GOOGLE_FORM_URL =
	'https://docs.google.com/forms/d/1cPdZEU7zL09b7Z-x8h5NpCk_8oJieYbnCHHw5LuhAc8';
function ChatRoomHeader() {
	const router = useRouter();
	const [isVisible, setVisible] = useState(false);
	const { id } = useLocalSearchParams<{ id: string }>();
	const { my: user } = useAuth();

	const { data: partner } = useChatRoomDetail(id);
	const handleClose = useCallback(() => {
		setVisible(false);
	}, []);

	const handleProfilePress = () => {
		if (!partner) return;
		const isExpired = !(partner.roomActivation || partner.hasLeft);
		if (isExpired) return;
		router.push({
			pathname: '/partner/view/[id]',
			params: { id: partner.matchId, redirectTo: encodeURIComponent('/chat') },
		});
	};

	const handleRefundPress = () => {
		Linking.openURL(REFUND_GOOGLE_FORM_URL);
	};

	const isMale = user?.gender === 'MALE';
	const showRefundButton = isMale && partner?.canRefund;

	return (
		<>
			<ChatInfoModalContainer visible={isVisible} onClose={handleClose} />
			<View style={[styles.container]}>
				<Pressable onPress={() => router.navigate('/chat')} style={styles.backButton}>
					<ChevronLeft width={20} height={20} />
				</Pressable>
				<Pressable onPress={handleProfilePress} style={styles.profilePressable}>
					<Image source={partner?.partner.mainProfileImageUrl ?? ''} style={styles.profileImage} />
					<View style={styles.profileContainer}>
						<View style={styles.nameRow}>
							<Text style={styles.name}>{partner?.partner.name}</Text>
							{showRefundButton && (
								<Pressable onPress={handleRefundPress} style={styles.refundButton}>
									<Text style={styles.refundButtonText}>환불 가능</Text>
								</Pressable>
							)}
						</View>
						<View style={styles.schoolContainer}>
							<Text style={styles.school}>{partner?.partner.university}</Text>
							<Text style={styles.school}>{partner?.partner.department}</Text>
						</View>
					</View>
				</Pressable>
				<Pressable
					style={{
						width: 36,
						height: 36,
						justifyContent: 'center',
						alignItems: 'center',
					}}
					onPress={() => setVisible(true)}
				>
					<VerticalEllipsisIcon />
				</Pressable>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		width: '100%',
		height: 68,
		backgroundColor: semanticColors.surface.background,
		flexDirection: 'row',
		paddingHorizontal: 16,
		alignItems: 'center',
	},
	backButton: {
		width: 44,
		height: 44,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 4,
	},
	profilePressable: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
	},
	profileImage: {
		width: 34,
		marginLeft: 12,
		marginRight: 10,
		height: 34,
		borderRadius: 34,
	},
	headerIcon: {
		width: 24,
		height: 24,

		tintColor: '#000',
	},
	profileContainer: {
		flex: 1,

		gap: 2,
	},
	nameRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	name: {
		color: semanticColors.text.primary,
		fontWeight: 700,
		fontFamily: 'Pretendard-ExtraBold',
		fontSize: 18,
		lineHeight: 19,
	},
	refundButton: {
		backgroundColor: semanticColors.brand.primary,
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4,
	},
	refundButtonText: {
		color: semanticColors.text.inverse,
		fontSize: 11,
		fontWeight: '600',
		lineHeight: 13,
	},
	school: {
		color: semanticColors.text.disabled,
		fontSize: 13,
		lineHeight: 19,
		fontFamily: 'Pretendard-Medium',
	},
	schoolContainer: {
		flexDirection: 'row',
		gap: 2,
	},
});

export default ChatRoomHeader;
