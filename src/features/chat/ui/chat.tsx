import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { BottomNavigation } from '@/src/shared/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ChatHeader from './chat-header';
import ConnectionStatusBanner from './connection-status-banner';
import ChatRoomList from './room-list/chat-room-list';

function Chat() {
	const insets = useSafeAreaInsets();
	const queryClient = useQueryClient();
	const { isAuthorized } = useAuth();
	const hasRefetchedOnMount = useRef(false);

	useEffect(() => {
		if (isAuthorized && !hasRefetchedOnMount.current) {
			hasRefetchedOnMount.current = true;
			queryClient.invalidateQueries({ queryKey: ['chat-room'] });
		}
	}, [isAuthorized, queryClient]);

	useFocusEffect(
		useCallback(() => {
			if (isAuthorized) {
				queryClient.refetchQueries({ queryKey: ['chat-room'] });
			}
		}, [queryClient, isAuthorized]),
	);

	return (
		<View
			style={{
				backgroundColor: semanticColors.surface.background,
				flex: 1,
				paddingTop: insets.top,
				position: 'relative',
			}}
		>
			<ConnectionStatusBanner />
			<ChatHeader />

			<View style={{ flex: 1 }}>
				<ChatRoomList />
			</View>
			<BottomNavigation />
		</View>
	);
}

export default Chat;
