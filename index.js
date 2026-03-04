// FCM 백그라운드 핸들러는 React가 마운트되기 전에 등록해야 합니다.
// expo-router/entry보다 먼저 실행됩니다.
import messaging from '@react-native-firebase/messaging';
import * as Updates from 'expo-updates';

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
	if (remoteMessage.data?.type === 'ota_update') {
		try {
			const update = await Updates.checkForUpdateAsync();
			if (update.isAvailable) {
				await Updates.fetchUpdateAsync();
				// 다음 앱 실행 시 OTAUpdateHandler의 isUpdatePending → reloadAsync() 처리
			}
		} catch (e) {
			console.error('[OTA] background silent push update failed:', e);
		}
	}
});

// expo-router 진입점 위임
import 'expo-router/entry';
