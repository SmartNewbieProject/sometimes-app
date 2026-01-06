import * as Updates from 'expo-updates';
import { useEffect } from 'react';
import { Platform } from 'react-native';

export function OTAUpdateHandler() {
	const { isUpdatePending } = Updates.useUpdates();

	useEffect(() => {
		if (__DEV__ || Platform.OS === 'web') return;

		if (isUpdatePending) {
			Updates.reloadAsync();
		}
	}, [isUpdatePending]);

	return null;
}
