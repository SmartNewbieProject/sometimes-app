import messaging from '@react-native-firebase/messaging';
import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import * as Updates from 'expo-updates';
import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus, Platform } from 'react-native';

export function OTAUpdateHandler() {
	const { isUpdatePending } = Updates.useUpdates();
	const appStateRef = useRef<AppStateStatus>(AppState.currentState);
	const pendingReload = useRef(false);

	useEffect(() => {
		if (__DEV__ || Platform.OS === 'web') return;

		if (isUpdatePending) {
			if (appStateRef.current === 'active') {
				pendingReload.current = true;
			} else {
				Updates.reloadAsync();
			}
		}
	}, [isUpdatePending]);

	useEffect(() => {
		if (__DEV__ || Platform.OS === 'web') return;

		const sub = AppState.addEventListener('change', (nextState) => {
			if (appStateRef.current.match(/inactive|background/) && nextState === 'active') {
				if (pendingReload.current) {
					Updates.reloadAsync();
				}
			}
			appStateRef.current = nextState;
		});

		return () => sub.remove();
	}, []);

	useEffect(() => {
		if (__DEV__ || Platform.OS === 'web') return;

			const unsubscribe = messaging().onMessage(async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
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
