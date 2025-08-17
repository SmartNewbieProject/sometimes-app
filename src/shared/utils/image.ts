import * as ImageManipulator from 'expo-image-manipulator';

export async function convertToJpeg(uri: string) {
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
