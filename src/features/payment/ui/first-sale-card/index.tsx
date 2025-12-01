import { EventType } from "@/src/features/event/types";
import colors from "@/src/shared/constants/colors";
import { useTimer } from "@/src/shared/hooks/use-timer";
import { ImageResources, formatTime } from "@/src/shared/libs";
import { GlowingCard, ImageResource, Show, Text } from "@/src/shared/ui";
import { GemStoreWidget } from "@/src/widgets";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useFirstSaleEvents } from "../../hooks/useFirstSaleEvents";
import type { GemMetadata } from "../../types";
import { usePortoneStore } from "../../hooks/use-portone-store";
import { useAuth } from "@/src/features/auth";
import { useKpiAnalytics } from "@/src/shared/hooks";
import { FIRST_SALE_PRODUCTS } from "../../constants/first-sale-products";
import { useTranslation } from "react-i18next";


type FirstSaleCardProps = {
  onOpenPayment: (gemProduct: GemMetadata) => void;
};

export const FirstSaleCard = ({ onOpenPayment }: FirstSaleCardProps) => {
  const { totalExpiredAt, show, setShow, event7Expired, event16Expired, event27Expired } = useFirstSaleEvents();
  const { seconds } = useTimer(totalExpiredAt, { autoStart: !!totalExpiredAt, onComplete: () => {
    setShow(false);
  } });
  const { setEventType } = usePortoneStore();
  const { my } = useAuth();
  const { paymentEvents } = useKpiAnalytics();

  const translateYAnim = useSharedValue(0);
  const { t } = useTranslation();

  useEffect(() => {
    translateYAnim.value = withRepeat(
      withTiming(-5, {
        duration: 800,
        easing: Easing.inOut(Easing.ease),
        reduceMotion: ReduceMotion.System,
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateYAnim.value }],
    };
  });

  if (!show) return null;

  return (
    <GlowingCard>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text textColor="black" weight="bold" size="20" className="text-[20px]">
            {t("features.payment.ui.apple_first_sale_card.time_sale_title")}
        </Text>
        <Text weight="bold" size="20" className="text-rose-600">
          {formatTime(seconds)}
        </Text>
      </View>

      <View style={styles.paymentList}>
        <View style={styles.saleMiho}>
          <View style={{ position: "relative" }}>
            <ImageResource
              resource={ImageResources.SALE_MIHO}
              width={120}
              height={140}
            />
            <Animated.View style={[styles.bubble, animatedStyle]}>
              <Text
                textColor="purple"
                weight="semibold"
                className="text-[15px] mb-1"
              >
                  {t("features.payment.ui.apple_first_sale_card.cheer_message")}
              </Text>
              <Text
                textColor="purple"
                weight="semibold"
                className="text-[15px]"
              >
                {t("features.payment.ui.apple_first_sale_card.new_member_discount")}
              </Text>
              <View style={styles.bubbleTail} />
            </Animated.View>
          </View>
        </View>

        <Show when={!event7Expired}>
          <GemStoreWidget.Item gemProduct={FIRST_SALE_PRODUCTS.SALE_7} onOpenPayment={(metadata) => {
            // KPI 이벤트: 결제 아이템 선택 (첫 구매)
paymentEvents.trackItemSelected('gems', FIRST_SALE_PRODUCTS.SALE_7.gemCount);

            // 기존 이벤트 호환성
            paymentEvents.trackStoreViewed('gem');

            setEventType(EventType.FIRST_SALE_7);
            onOpenPayment(metadata);
          }} hot={false} />
        </Show>
        <Show when={!event16Expired}>
          <GemStoreWidget.Item gemProduct={FIRST_SALE_PRODUCTS.SALE_16} onOpenPayment={(metadata) => {
            // KPI 이벤트: 결제 아이템 선택 (첫 구매)
paymentEvents.trackItemSelected('gems', FIRST_SALE_PRODUCTS.SALE_16.gemCount);
            setEventType(EventType.FIRST_SALE_16);
            onOpenPayment(metadata);
          }} hot={false} />
        </Show>
         <Show when={!event27Expired}>
          <GemStoreWidget.Item gemProduct={FIRST_SALE_PRODUCTS.SALE_27} onOpenPayment={(metadata) => {
            // KPI 이벤트: 결제 아이템 선택 (첫 구매)
paymentEvents.trackItemSelected('gems', FIRST_SALE_PRODUCTS.SALE_27.gemCount);
            setEventType(EventType.FIRST_SALE_27);
            onOpenPayment(metadata);
          }} hot={false} />
        </Show>
      </View>
    </GlowingCard>
  );
};

const styles = StyleSheet.create({
  paymentList: {
    flexDirection: "column",
    position: "relative",
    alignItems: "center",
    rowGap: 4,
    marginTop: 120,
  },
  saleMiho: {
    position: "absolute",
    top: -106,
    width: "100%",
    left: 0,
    zIndex: 1,
  },
  bubble: {
    paddingVertical: 11,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 20,
    textDecorationColor: colors.primaryPurple,
    display: "flex",
    flexDirection: "column",
    position: "absolute",
    left: 120,
  },
  bubbleTail: {
    position: "absolute",
    bottom: 20,
    left: -8,
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderRightWidth: 8,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderRightColor: colors.white,
  },
});
