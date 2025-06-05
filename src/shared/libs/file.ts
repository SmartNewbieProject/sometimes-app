import { platform } from './platform';

function dataURLtoBlob(dataURL: string): Blob {
  return platform({
    web: () => {
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
      // React Native에서는 Blob을 사용하지 않고 URI를 직접 사용
      throw new Error('dataURLtoBlob should not be used in React Native');
    }
  });
}

function createFileFromBlob(blob: Blob, fileName: string): File {
  return platform({
    web: () => {
      return new File([blob], fileName, {
        type: blob.type,
        lastModified: Date.now()
      });
    },
    default: () => {
      // React Native에서는 File 객체를 사용하지 않고 URI를 직접 사용
      throw new Error('createFileFromBlob should not be used in React Native');
    }
  });
}

// React Native용 파일 객체 생성 함수
function createNativeFileObject(uri: string, fileName: string, type: string = 'image/png') {
  // React Native FormData는 이 형식을 요구합니다
  return {
    uri,
    name: fileName,
    type
  } as any;
}

const fileUtils = {
  dataURLtoBlob,
  toFile: createFileFromBlob,
  createNativeFileObject,
}

export default fileUtils;
