import { ImageResources, cn } from "@/src/shared/libs";
import { semanticColors } from '../../../shared/constants/colors';
import { Button, ImageResource , Text } from "@/src/shared/ui";
import { Text as RNText, StyleSheet, View } from "react-native";
import type { MatchDetails } from "../../idle-match-timer/types";

import { useFeatureCost } from "@features/payment/hooks";
import { useModal } from "@hooks/use-modal";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth";
import { useKpiAnalytics } from "@/src/shared/hooks";
import { useMatchingEfficiency } from "../../matching/hooks/use-matching-efficiency";
import useLike from "../hooks/use-like";


type LikeButtonProps = {
  connectionId: string;
  className?: string;
};

export const LikeButton = ({
  connectionId,
  className = "",
}: LikeButtonProps) => {
  const { profileDetails } = useAuth();
  const { showModal, hideModal } = useModal();
  const { featureCosts } = useFeatureCost();
  const { onLike } = useLike();
  const { matchingEvents, paymentEvents } = useKpiAnalytics();
  const {
    statistics,
    trackMatchingAttempt,
    trackMatchingSuccess,
    trackMatchingFailure,
    getPerformanceMetrics
  } = useMatchingEfficiency();
  const { t } = useTranslation();
  const showPartnerLikeAnnouncement = () => {
    showModal({
      showLogo: true,
      customTitle: (
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Text textColor="black" weight="bold" size="20">
            {t("features.like.ui.like_button.modal.title_line1")}
          </Text>
          <Text textColor="black" weight="bold" size="20">
            {profileDetails?.gender === "MALE"
              ? t("features.like.ui.like_button.modal.title_line2_male", {
                  cost: featureCosts?.LIKE_MESSAGE,
                })
              : t("features.like.ui.like_button.modal.title_line2_default")}
          </Text>
        </View>
      ),
      children: (
        <View className="flex flex-col w-full items-center mt-[5px]">
          <Text className="text-text-disabled text-[12px]">
            {t("features.like.ui.like_button.modal.body_line1")}
          </Text>
          <Text className="text-text-disabled text-[12px]">
            {t("features.like.ui.like_button.modal.body_line2")}
          </Text>
        </View>
      ),
      primaryButton: {
        text: t("features.like.ui.like_button.modal.primary_button"),
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        onClick: async () => {
          const gemCost = profileDetails?.gender === "MALE" ? featureCosts?.LIKE_MESSAGE : 0;
          const currentTime = new Date().getHours();
          const isPeakTime = currentTime >= 20 && currentTime <= 23;

          // 매칭 효율성 분석: 시도 트래킹
          trackMatchingAttempt(connectionId!, {
            gemBalance: 0, // TODO: 실제 잔액 가져오기
            timeOfDay: currentTime,
            isPeakTime,
            userTier: profileDetails?.tier
          });

          // 기존 KPI 이벤트: 매칭 요청
          matchingEvents.trackMatchingRequested(connectionId!, gemCost);

          // 구슬 사용 이벤트 (남성의 경우)
          if (profileDetails?.gender === "MALE" && gemCost > 0) {
            paymentEvents.trackGemUsed('matching', gemCost);
          }

          // 성공/실패 트래킹은 useLike 훅에서 처리됨
          const startTime = Date.now();

          try {
            await onLike(connectionId!);

            // 성공 시간 측정 및 트래킹
            const responseTime = Date.now() - startTime;
            trackMatchingSuccess(connectionId!, {
              matchType: 'mutual_like',
              responseTime
            });
          } catch (error: any) {
            // 실패 원인 분석 (useLike에서 이미 처리됨)
            const failureReason = {
              type: error.type || 'UNKNOWN_ERROR',
              category: 'SYSTEM',
              userAction: 'RETRY_LATER',
              recoverable: true,
              severity: 'MEDIUM',
              serverMessage: error.message || '알 수 없는 오류'
            };

            trackMatchingFailure(connectionId!, failureReason);
          }
        },
      },
      secondaryButton: {
        text: t("global.no"),
        onClick: hideModal,
      },
    });
  };

  return (
    <Button
      onPress={showPartnerLikeAnnouncement}
      variant="primary"
      className={cn("flex-1 items-center", className)}
      prefix={
        profileDetails?.gender === "MALE" ? (
          <ImageResource resource={ImageResources.GEM} width={23} height={23} />
        ) : (
          <></>
        )
      }
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {profileDetails?.gender === "MALE" ? (
          <RNText style={styles.subText}>x{featureCosts?.LIKE_MESSAGE}</RNText>
        ) : (
          <></>
        )}
        <RNText className="text-md text-text-inverse whitespace-nowrap">
          {t("features.like.ui.like_button.button_label")}
        </RNText>
      </View>
    </Button>
  );
};

const styles = StyleSheet.create({
  subText: {
    fontSize: 15,
    fontFamily: "Pretendard-Thin",
    fontWeight: 300,
    lineHeight: 18,
    marginLeft: -5,
    marginRight: 6,
    color: semanticColors.brand.accent,
  },
});