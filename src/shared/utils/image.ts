import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';

export const isHeicBase64 = (uri: string) => {
	// Base64 헤더에 HEIC가 포함돼 있는지 체크
	// 예: data:image/heic;base64,...
	return uri.startsWith('data:image/heic');
};
export async function convertToJpeg(uri: string) {
	// 파일 확장자가 .heic인지 확인
	if (!uri.toLowerCase().endsWith('.heic') || Platform.OS !== 'ios') {
		return uri;
	}

	try {
		const result = await ImageManipulator.manipulateAsync(uri, [], {
			compress: 1,
			format: ImageManipulator.SaveFormat.JPEG,
		});
		return result.uri;
	} catch (e) {
		console.warn('이미지 변환 실패:', e);
		return uri;
	}
}
