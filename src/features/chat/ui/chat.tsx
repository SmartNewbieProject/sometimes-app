import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { BottomNavigation } from '@/src/shared/ui';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ChatHeader from './chat-header';
import ConnectionStatusBanner from './connection-status-banner';
import ChatRoomList from './room-list/chat-room-list';

function Chat() {
	const insets = useSafeAreaInsets();

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
