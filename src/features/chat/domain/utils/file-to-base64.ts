export type RNFileLike = File | Blob | string;

export const fileToBase64Payload = async (
  file: RNFileLike,
): Promise<{ base64: string; mimeType: string }> => {
  let base64: string;
  let mimeType = 'image/*';

  const toBase64 = (blob: Blob) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string; // data:*/*;base64,XXXX
        const [, payload] = result.split(',');
        resolve(payload || '');
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  if (typeof file === 'string') {
    base64 = file;
  } else {
    mimeType = (file as File).type || mimeType;
    base64 = await toBase64(file);
  }

  return { base64, mimeType };
};

