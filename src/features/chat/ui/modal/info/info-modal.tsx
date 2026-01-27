import { semanticColors } from '@/src/shared/constants/semantic-colors';
import ChatBellOffIcon from '@assets/icons/chat-bell-off.svg';
import ChatBellOnIcon from '@assets/icons/chat-bell-on.svg';
import { useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import React, { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useChatRoomDetail from '../../../queries/use-chat-room-detail';
import useChatSnoozeQuery from '../../../queries/use-chat-snooze-query';
import type { ChatRoomDetail, Partner } from '../../../types/chat';
import ChatMenuModal from '../menu-modal';

export function Header() {
	const mutate = useChatSnoozeQuery();
	const { id } = useLocalSearchParams<{ id: string }>();
	const queryClient = useQueryClient();
	const { data } = useChatRoomDetail(id);
	const handleSnooze = () => {
		queryClient.setQueryData(['chat-detail', id], (oldData: ChatRoomDetail) => {
			return {
				...oldData,
				snooze: !oldData.snooze,
			};
		});
		mutate.mutate(
			{ snooze: !data?.snooze, chatRoomId: id },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: ['chat-detail', id] });
				},
			},
		);
	};

	return (
		<View style={styles.headerContainer}>
			<Pressable onPress={handleSnooze}>
				{data?.snooze ? <ChatBellOffIcon /> : <ChatBellOnIcon />}
			</Pressable>
		</View>
	);
}

export function Body() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { data } = useChatRoomDetail(id);
	const partner = data?.partner;
	return (
		<View style={styles.bodyContainer}>
			<Image
				source={partner?.mainProfileImageUrl}
				contentFit="cover"
				contentPosition="center"
				style={styles.profileImage}
			/>
			<View style={styles.textContainer}>
				<Text style={styles.ageText}>만 {partner?.age}세</Text>
				<Text style={styles.univText}>{partner?.university}</Text>
			</View>
		</View>
	);
}

export function Footer({
	handleOpenMenuModal,
}: {
	handleOpenMenuModal: () => void;
}) {
	const insets = useSafeAreaInsets();

	return (
		<>
			<Pressable
				onPress={handleOpenMenuModal}
				style={[styles.footerContainer, { marginBottom: insets.bottom }]}
			>
				<Text style={styles.footerText}>채팅방 나가기</Text>
			</Pressable>
		</>
	);
}

export default function ChatInfoModal({ children }: { children: ReactNode }) {
	return <View style={{ flex: 1 }}>{children}</View>;
}

ChatInfoModal.Header = Header;
ChatInfoModal.Body = Body;
ChatInfoModal.Footer = Footer;

const styles = StyleSheet.create({
	headerContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		height: 48,
		justifyContent: 'flex-end',
		paddingHorizontal: 16,
		borderBottomColor: '#E7E9EC',
		borderBottomWidth: 1,
	},
	footerContainer: {
		flexDirection: 'row',
		marginHorizontal: 16,
		alignItems: 'center',
		height: 48,
		justifyContent: 'center',
		paddingHorizontal: 16,
		borderTopColor: '#E7E9EC',
		borderTopWidth: 1,
	},
	bodyContainer: {
		flex: 1,
		paddingVertical: 16,
		paddingLeft: 26,
	},
	profileImage: {
		width: 80,
		height: 80,
		borderRadius: 80,
		overflow: 'hidden',
		marginBottom: 16,
	},
	nameText: {
		color: semanticColors.text.secondary,
		fontSize: 20,
		fontWeight: 500,
		fontFamily: 'Pretendard-Medium',
		lineHeight: 24,
	},
	univText: {
		color: semanticColors.text.muted,
		fontSize: 16,
		lineHeight: 20,
	},
	ageText: {
		color: semanticColors.text.muted,
		fontSize: 14,
		lineHeight: 20,
	},
	textContainer: {
		gap: 5,
	},
	footerText: {
		fontSize: 20,
		lineHeight: 20,
		color: semanticColors.state.error,
		fontWeight: 500,
		fontFamily: 'Pretendard-Medium',
	},
});
