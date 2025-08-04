import { platform } from './platform';
//default는 안드로이드, ios를 의미
function dataURLtoBlob(dataURL: string): Blob {
	return platform({
		web: () => {
			console.log('dataURL', dataURL);
			const parts = dataURL.split(';base64,');
			const contentType = parts[0].split(':')[1];
			const raw = window.atob(parts[1]);
			const rawLength = raw.length;
			const uInt8Array = new Uint8Array(rawLength);

			for (let i = 0; i < rawLength; ++i) {
				uInt8Array[i] = raw.charCodeAt(i);
			}

			return new Blob([uInt8Array], { type: contentType });
		},
		default: () => {
			throw new Error('dataURLtoBlob should not be used in React Native');
		},
	});
}

function createFileFromBlob(blob: Blob, fileName: string): File {
	return platform({
		web: () => new File([blob], fileName, { type: blob.type, lastModified: Date.now() }),
		default: () => {
			throw new Error('createFileFromBlob should not be used in React Native');
		},
	});
}

function createNativeFileObject(uri: string, fileName: string, type = 'image/png') {
	return { uri, name: fileName, type } as any;
}

const fileUtils = {
	dataURLtoBlob,
	toFile: createFileFromBlob,
	createNativeFileObject,
};

export default fileUtils;
