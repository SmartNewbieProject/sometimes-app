import { NotificationIcon } from '@/src/features/notification/ui/notification-icon';
import { router } from 'expo-router';
import type React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Header } from '../header';

interface HeaderWithNotificationProps {
	title?: React.ReactNode;
	centerContent?: React.ReactNode;
	showBackButton?: boolean;
	backButtonAction?: () => void;
	rightContent?: React.ReactNode;
	backgroundColor?: string;
	style?: any;
}

export const HeaderWithNotification: React.FC<HeaderWithNotificationProps> = ({
	title,
	centerContent,
	showBackButton = true,
	backButtonAction,
	rightContent,
	backgroundColor = 'transparent',
	style,
}) => {
	const defaultBackAction = () => {
		router.back();
	};

	return (
		<Header.Container style={[{ backgroundColor }, style]}>
			<Header.LeftContent>
				{showBackButton && (
					<TouchableOpacity
						onPress={backButtonAction || defaultBackAction}
						style={styles.backButton}
					>
						<Header.LeftButton visible={true} onPress={backButtonAction || defaultBackAction} />
					</TouchableOpacity>
				)}
			</Header.LeftContent>

			<Header.CenterContent>{centerContent || title}</Header.CenterContent>

			<Header.RightContent>{rightContent || <NotificationIcon size={41} />}</Header.RightContent>
		</Header.Container>
	);
};

const styles = StyleSheet.create({
	backButton: {
		padding: 4,
	},
});
