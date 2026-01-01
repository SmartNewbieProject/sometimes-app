import * as Location from 'expo-location';
import i18n from '@/src/shared/libs/i18n';

const BUSAN = { lat: 35.1796, lon: 129.0756 };
const DAEJEON = { lat: 36.3504, lon: 127.3845 };
export const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
	const R = 6371;
	const toRad = (value: number) => (value * Math.PI) / 180;

	const dLat = toRad(lat2 - lat1);
	const dLon = toRad(lon2 - lon1);

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	return R * c;
};

export const getNearestCity = async (): Promise<string | null> => {
	try {
		const { status } = await Location.requestForegroundPermissionsAsync();
		if (status !== 'granted') {
			console.error(i18n.t('shareds.hooks.gps.permission_denied'));
			return null;
		}

		const location = await Location.getCurrentPositionAsync({
			accuracy: Location.Accuracy.High,
		});

		const { latitude, longitude } = location.coords;
		console.log('lat', latitude, longitude);
		const distToBusan = getDistance(latitude, longitude, BUSAN.lat, BUSAN.lon);
		const distToDaejeon = getDistance(latitude, longitude, DAEJEON.lat, DAEJEON.lon);

		return distToBusan < distToDaejeon ? i18n.t('common.부산') : i18n.t('common.대전');
	} catch (error) {
		console.error(i18n.t('shareds.hooks.gps.cannot_get_location'), error);
		return null;
	}
};
