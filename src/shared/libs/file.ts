import { platform } from './platform';
import i18n from "@/src/shared/libs/i18n";
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
			throw new Error(i18n.t('shareds.hooks.file.data_url_to_blob_error'));
		},
	});
}

function createFileFromBlob(blob: Blob, fileName: string): File {
	return platform({
		web: () => new File([blob], fileName, { type: blob.type, lastModified: Date.now() }),
		default: () => {
			throw new Error(i18n.t('shareds.hooks.file.create_file_from_blob_error'));
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
