// FCM 백그라운드 핸들러는 React가 마운트되기 전에 등록해야 합니다.
// expo-router/entry보다 먼저 실행됩니다.
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';

// Expo Go는 Firebase 네이티브 모듈을 포함하지 않으므로 스킵
if (Constants.appOwnership !== 'expo') {
	const messaging = require('@react-native-firebase/messaging').default;
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
}

// expo-router 진입점 위임
import 'expo-router/entry';
