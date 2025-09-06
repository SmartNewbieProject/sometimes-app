import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';
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

export async function uriToBase64(uri: string) {
	try {
		let fileUri: string | null = uri;

		if (Platform.OS === 'ios' && uri.startsWith('ph://')) {
			const assetId = uri.split('/')[2];
			if (!assetId) return null;

			const asset = await MediaLibrary.getAssetInfoAsync(assetId);
			fileUri = asset.localUri ?? null;
			if (!fileUri) return null;
		}

		if (Platform.OS === 'android' && uri.startsWith('content://')) {
			const tempUri = `${FileSystem.cacheDirectory}${Date.now()}.jpg`;
			await FileSystem.copyAsync({ from: uri, to: tempUri });
			fileUri = tempUri;
		}

		if (!fileUri) return null;

		const base64 = await FileSystem.readAsStringAsync(fileUri, {
			encoding: FileSystem.EncodingType.Base64,
		});

		return `data:image/jpeg;base64,${base64}`;
	} catch (e) {
		console.warn('Base64 변환 실패:', e);
		return null;
	}
}
