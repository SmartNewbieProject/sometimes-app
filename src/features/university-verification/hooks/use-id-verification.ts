import { useState, useCallback } from "react";
// import * as FileSystem from "expo-file-system";
import { uploadUniversityVerificationImage } from "../apis";

function guessName(uri: string, fallback = "university_document.jpg") {
  const last = uri.split(/[\\/]/).pop();
  return last || fallback;
}
function guessMime(uri: string) {
  const l = uri.toLowerCase();
  if (l.endsWith(".png")) return "image/png";
  if (l.endsWith(".webp")) return "image/webp";
  if (l.endsWith(".heic") || l.endsWith(".heif")) return "image/heic";
  return "image/jpeg";
}

export function useVerification() {
  const [submitting, setSubmitting] = useState(false);

  const submitOne = useCallback(async (uri: string, note?: string) => {
    setSubmitting(true);
    try {
      const uploaded = await uploadUniversityVerificationImage({
        uri,
        name: guessName(uri),
        type: guessMime(uri),
      });

      return uploaded;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return { submitOne, submitting };
}
