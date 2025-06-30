import { Alert, Linking, Platform } from 'react-native';

const INSTAGRAM_PACKAGE = Platform.OS === 'ios' ? 'instagram://' : 'intent://';
const INSTAGRAM_FALLBACK_URL =
	Platform.OS === 'ios'
		? 'https://apps.apple.com/app/instagram/id389801252'
		: 'https://play.google.com/store/apps/details?id=com.instagram.android';

export const openInstagram = async (instagramId: string) => {
	if (!instagramId) {
		Alert.alert('알림', '인스타그램 아이디가 없습니다.');
		return;
	}

	const username = instagramId.replace(/^@/, '').trim();
	const instagramProfileUrl = `https://www.instagram.com/${username}`;

	try {
		if (Platform.OS === 'web') {
			await Linking.openURL(instagramProfileUrl);
		} else {
			let appUrl = '';
			if (Platform.OS === 'ios') {
				appUrl = `instagram://user?username=${username}`;
			} else {
				appUrl = `intent://www.instagram.com/${username}/#Intent;package=com.instagram.android;scheme=https;end`;
			}
			try {
				await Linking.openURL(appUrl);
			} catch {
				await Linking.openURL(INSTAGRAM_FALLBACK_URL);
			}
		}
	} catch (error) {
		console.error('인스타그램 연결 오류:', error);
		Alert.alert('오류', '인스타그램에 연결할 수 없습니다.');
	}
};
