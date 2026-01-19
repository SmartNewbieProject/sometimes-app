import { useState, useEffect, useCallback } from 'react';
import { Linking, Alert, Platform } from 'react-native';
import { useModal } from '@/src/shared/hooks/use-modal';
import {
	getPushNotificationStatus,
	enablePushNotification,
	disablePushNotification,
	getNotificationPermissionStatus,
} from '@/src/shared/libs/notifications';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';

export const usePushNotification = () => {
	const { t } = useTranslation();
	const [isEnabled, setIsEnabled] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isUpdating, setIsUpdating] = useState(false);
	const { showModal } = useModal();

	const checkStatus = useCallback(async () => {
		try {
			setIsLoading(true);
			const response = await getPushNotificationStatus();
			setIsEnabled(response.isEnabled);
		} catch (error) {
			console.error(t('features.mypage.notification.status_check_failed'), error);
			setIsEnabled(false);
		} finally {
			setIsLoading(false);
		}
	}, [t]);

	const openAppSettings = useCallback(() => {
		Alert.alert(
			t('features.mypage.notification.permission_required_title'),
			t('features.mypage.notification.permission_required_message'),
			[
				{
					text: t('features.mypage.notification.open_settings'),
					onPress: () => Linking.openSettings(),
				},
				{ text: t('features.mypage.notification.cancel'), style: 'cancel' },
			],
		);
	}, [t]);

	const handleEnable = useCallback(async () => {
		if (isUpdating) return;

		setIsUpdating(true);
		const previousValue = isEnabled;
		setIsEnabled(true);

		try {
			if (Platform.OS !== 'web') {
				const permission = await getNotificationPermissionStatus();

				if (permission !== 'granted') {
					setIsEnabled(previousValue); // Rollback
					openAppSettings();
					return;
				}
			}

			await enablePushNotification();
			await checkStatus();
		} catch (error) {
			setIsEnabled(previousValue);
			console.error(t('features.mypage.notification.enable_failed'), error);

			const errorMessage =
				error instanceof Error
					? error.message
					: t('features.mypage.notification.activation_failed_title');

			if (errorMessage === 'NO_PUSH_TOKEN_REGISTERED') {
				if (Platform.OS === 'web') {
					showModal({
						title: t('features.mypage.notification.registration_required_title'),
						children: (
							<Text>{t('features.mypage.notification.registration_required_message')}</Text>
						),
						primaryButton: {
							text: t('features.mypage.notification.confirm'),
							onClick: () => {},
						},
					});
				} else {
					showModal({
						title: t('features.mypage.notification.registration_required_title'),
						children: (
							<Text>{t('features.mypage.notification.registration_required_message')}</Text>
						),
						primaryButton: {
							text: t('features.mypage.notification.go_to_settings'),
							onClick: () => Linking.openSettings(),
						},
						secondaryButton: {
							text: t('features.mypage.notification.cancel'),
							onClick: () => {},
						},
					});
				}
			} else {
				showModal({
					title: t('features.mypage.notification.activation_failed_title'),
					children: errorMessage,
					primaryButton: { text: t('features.mypage.notification.confirm'), onClick: () => {} },
				});
			}
		} finally {
			setIsUpdating(false);
		}
	}, [isUpdating, isEnabled, openAppSettings, checkStatus, showModal, t]);

	const handleDisable = useCallback(async () => {
		if (isUpdating) return;

		setIsUpdating(true);
		const previousValue = isEnabled;
		setIsEnabled(false);

		try {
			await disablePushNotification();
		} catch (error) {
			setIsEnabled(previousValue);
			console.error(t('features.mypage.notification.disable_failed'), error);
			showModal({
				title: t('features.mypage.notification.deactivation_failed_title'),
				children: t('features.mypage.notification.deactivation_failed_message'),
				primaryButton: { text: t('features.mypage.notification.confirm'), onClick: () => {} },
			});
		} finally {
			setIsUpdating(false);
		}
	}, [isUpdating, isEnabled, showModal, t]);

	const toggle = useCallback(async () => {
		if (isUpdating) return;

		if (isEnabled) {
			await handleDisable();
		} else {
			await handleEnable();
		}
	}, [isUpdating, isEnabled, handleEnable, handleDisable]);

	useEffect(() => {
		checkStatus();
	}, [checkStatus]);

	return {
		isEnabled,
		isLoading,
		isUpdating,
		toggle,
		refetch: checkStatus,
	};
};
