import { isJapanese } from '@/src/shared/libs/local';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const JP_AGE_CONFIRMED_KEY = 'jp_age_confirmed';

export function useJpAgeConfirmation() {
	const [isAgeConfirmed, setIsAgeConfirmed] = useState<boolean | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const isJP = isJapanese();

	useEffect(() => {
		const checkAgeConfirmation = async () => {
			if (!isJP) {
				setIsAgeConfirmed(true);
				setIsLoading(false);
				return;
			}

			try {
				const confirmed = await AsyncStorage.getItem(JP_AGE_CONFIRMED_KEY);
				setIsAgeConfirmed(confirmed === 'true');
			} catch (error) {
				setIsAgeConfirmed(false);
			} finally {
				setIsLoading(false);
			}
		};

		checkAgeConfirmation();
	}, [isJP]);

	const confirmAge = useCallback(async () => {
		try {
			await AsyncStorage.setItem(JP_AGE_CONFIRMED_KEY, 'true');
			setIsAgeConfirmed(true);
			return true;
		} catch (error) {
			return false;
		}
	}, []);

	const needsAgeConfirmation = isJP && !isAgeConfirmed && !isLoading;

	return {
		isJP,
		isAgeConfirmed,
		isLoading,
		needsAgeConfirmation,
		confirmAge,
	};
}
