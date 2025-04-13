function dataURLtoBlob(dataURL: string) {
  const parts = dataURL.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);
  
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  
  return new Blob([uInt8Array], { type: contentType });
}

function createFileFromBlob(blob: Blob, fileName: string) {
  return new File([blob], fileName, { type: blob.type });
}

const fileUtils = {
  dataURLtoBlob,
  toFile: createFileFromBlob,
}

export default fileUtils;
