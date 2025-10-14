import { useCallback, useRef } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { getProfileImageReviewStatus } from "@/src/features/mypage/apis";

export function useProfileReviewRedirect() {
  const router = useRouter();
  const navigatingRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const checkAndNavigate = async () => {
        try {
          const resp = await getProfileImageReviewStatus();

          if (!isActive || navigatingRef.current) return;

          switch (resp.reviewStatus) {
            case "approved":
              console.log("reviewStatus:", resp.reviewStatus);
              navigatingRef.current = true;
              router.replace("/my/approval-step/approved");
              break;
            case "rejected":
              console.log("reviewStatus:", resp.reviewStatus);
              navigatingRef.current = true;
              router.replace("/my/approval-step/rejected");
              break;
            default:
              console.log("reviewStatus:", resp.reviewStatus);
              break;
          }
        } catch {}
      };

      checkAndNavigate();
      return () => {
        isActive = false;
      };
    }, [router])
  );
}
