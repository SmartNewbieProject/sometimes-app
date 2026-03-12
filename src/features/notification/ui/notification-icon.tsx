import { router } from 'expo-router';
import type React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { useUnreadCount } from '../queries/use-unread-count';

interface NotificationIconProps {
	size?: number;
	onPress?: () => void;
	testID?: string;
}

export const NotificationIcon: React.FC<NotificationIconProps> = ({
	size = 24,
	onPress,
	testID,
}) => {
	const { data: unreadCountData, isLoading } = useUnreadCount();
	const hasUnread = (unreadCountData?.data.unreadCount ?? 0) > 0;

	const handlePress = () => {
		if (onPress) {
			onPress();
		} else {
			router.push('/notification');
		}
	};

	const iconSource = hasUnread
		? require('@/assets/images/header/noti-exists.png')
		: require('@/assets/images/header/noti-no.png');

	return (
		<TouchableOpacity
			testID={testID}
			accessibilityLabel="알림"
			onPress={handlePress}
			disabled={isLoading}
		>
			<View>
				<Image
					source={iconSource}
					style={{
						width: size - 4,
						height: size + 6,
						resizeMode: 'contain',
					}}
				/>
			</View>
		</TouchableOpacity>
	);
};
