import messaging from '@react-native-firebase/messaging';
import * as Updates from 'expo-updates';
import { useEffect } from 'react';
import { Platform } from 'react-native';

export function OTAUpdateHandler() {
	const { isUpdatePending } = Updates.useUpdates();

	// 업데이트 다운로드 완료 시 재시작
	useEffect(() => {
		if (__DEV__ || Platform.OS === 'web') return;

		if (isUpdatePending) {
			Updates.reloadAsync();
		}
	}, [isUpdatePending]);

	// 포그라운드 silent push 처리 (앱이 열려 있을 때)
	useEffect(() => {
		if (__DEV__ || Platform.OS === 'web') return;

		const unsubscribe = messaging().onMessage(async (remoteMessage) => {
			if (remoteMessage.data?.type === 'ota_update') {
				try {
					const update = await Updates.checkForUpdateAsync();
					if (update.isAvailable) {
						await Updates.fetchUpdateAsync();
					}
				} catch (e) {
					console.error('[OTA] foreground silent push update failed:', e);
				}
			}
		});

		return unsubscribe;
	}, []);

	return null;
}
