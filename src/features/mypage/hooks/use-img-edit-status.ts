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
            // REMOVED: rejected case - 사진 거절 기능이 사진관리 페이지로 통합됨 (2025-12-14)
            // 사진 거절 상태는 이제 프로필 수정 → 사진관리 페이지에서 확인
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
