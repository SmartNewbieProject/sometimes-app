import { useFonts } from 'expo-font';
import { Platform } from 'react-native';

const ROULETTE_FONTS = {
	'Gmarket-Sans-Medium': require('../../../../assets/fonts/GmarketSansTTFMedium.ttf'),
	'Gmarket-Sans-Bold': require('../../../../assets/fonts/GmarketSansTTFBold.ttf'),
	'Gmarket-Sans-Light': require('../../../../assets/fonts/GmarketSansTTFLight.ttf'),
	StyleScript: require('../../../../assets/fonts/StyleScript-Regular.ttf'),
};

export function useRouletteFonts() {
	const [fontsLoaded] = useFonts(Platform.OS === 'web' ? {} : ROULETTE_FONTS);

	return Platform.OS === 'web' ? true : fontsLoaded;
}
