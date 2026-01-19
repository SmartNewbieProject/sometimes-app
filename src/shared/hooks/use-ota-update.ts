import * as Updates from 'expo-updates';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

interface UseOTAUpdateOutput {
	isUpdateAvailable: boolean;
	isUpdatePending: boolean;
	isChecking: boolean;
	isDownloading: boolean;
	checkForUpdate: () => Promise<void>;
	downloadAndApply: () => Promise<void>;
}

export function useOTAUpdate(): UseOTAUpdateOutput {
	const { isUpdateAvailable, isUpdatePending, isDownloading } = Updates.useUpdates();

	const [isChecking, setIsChecking] = useState(false);

	useEffect(() => {
		if (isUpdatePending) {
			Updates.reloadAsync();
		}
	}, [isUpdatePending]);

	const checkForUpdate = useCallback(async () => {
		if (__DEV__ || Platform.OS === 'web') return;

		setIsChecking(true);
		try {
			await Updates.checkForUpdateAsync();
		} catch (error) {
			console.error('[OTA Update] Check failed:', error);
		} finally {
			setIsChecking(false);
		}
	}, []);

	const downloadAndApply = useCallback(async () => {
		if (__DEV__ || Platform.OS === 'web') return;

		try {
			await Updates.fetchUpdateAsync();
		} catch (error) {
			console.error('[OTA Update] Download failed:', error);
		}
	}, []);

	return {
		isUpdateAvailable,
		isUpdatePending,
		isChecking,
		isDownloading,
		checkForUpdate,
		downloadAndApply,
	};
}
