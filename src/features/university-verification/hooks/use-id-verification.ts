import { useState, useCallback } from "react";
// import * as FileSystem from "expo-file-system";
import { uploadUniversityVerificationImage } from "../apis";
import { useKpiAnalytics } from "@/src/shared/hooks/use-kpi-analytics";

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
  const { onboardingEvents } = useKpiAnalytics();

  const submitOne = useCallback(async (uri: string, note?: string) => {
    setSubmitting(true);

    // KPI 이벤트: 대학 인증 시작
    onboardingEvents.trackUniversityVerificationStarted();

    try {
      const uploaded = await uploadUniversityVerificationImage({
        uri,
        name: guessName(uri),
        type: guessMime(uri),
      });

      // KPI 이벤트: 대학 인증 완료
      onboardingEvents.trackUniversityVerificationCompleted('document_upload');

      return uploaded;
    } finally {
      setSubmitting(false);
    }
  }, [onboardingEvents]);

  return { submitOne, submitting };
}
