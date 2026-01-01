import { useAuth } from "@/src/features/auth";
import { useEventControl } from "@/src/features/event/hooks";
import { EventType } from "@/src/features/event/types";
import colors from "@/src/shared/constants/colors";
import { useTimer } from "@/src/shared/hooks/use-timer";
import { ImageResources, formatTime } from "@/src/shared/libs";
import { GlowingCard, ImageResource, Show, Text } from "@/src/shared/ui";
import { GemItemProps } from "@/src/widgets/gem-store";
import { AppleGemStoreWidget } from "@/src/widgets/gem-store/apple";
import type { Product } from "expo-iap";
import type { GemDetails } from "@/src/features/payment/api";
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
import { usePortoneStore } from "../../hooks/use-portone-store";
import { useFirstSaleEvents } from "../../hooks/useFirstSaleEvents";
import type { GemMetadata } from "../../types";
import { useTranslation } from "react-i18next";
import { useMixpanel } from "@/src/shared/hooks/use-mixpanel";

type AppleFirstSaleCardProps = {
  onOpenPurchase: (productId: string) => void;
  gemProducts: Product[];
  serverGemProducts?: GemDetails[]; // 서버 데이터 추가
};

export const AppleFirstSaleCard = ({
  onOpenPurchase,
  gemProducts,
  serverGemProducts,
}: AppleFirstSaleCardProps) => {
  console.log("gemProducts", gemProducts);
  const {
    totalExpiredAt,
    show,
    setShow,
    event16Expired,
  } = useFirstSaleEvents();
  const { seconds } = useTimer(totalExpiredAt, {
    autoStart: !!totalExpiredAt,
    onComplete: () => {
      setShow(false);
    },
  });
  const { setEventType } = usePortoneStore();
  const { my } = useAuth();
  const { t } = useTranslation();
  const { paymentEvents } = useMixpanel();

  const translateYAnim = useSharedValue(0);

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
  if (!gemProducts || gemProducts.length === 0) return null;
  if (!gemProducts[0]) return null;

  return (
    <GlowingCard>
      <View style={styles.headerRow}>
        <Text textColor="black" weight="bold" size="20" style={styles.fontSize20}>
          {t("features.payment.ui.apple_first_sale_card.time_sale_title")}
        </Text>
        <Text weight="bold" size="20" style={styles.roseText}>
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
                style={styles.bubbleTextTop}
              >
                {t("features.payment.ui.apple_first_sale_card.cheer_message")}
              </Text>
              <Text
                textColor="purple"
                weight="semibold"
                style={styles.bubbleText}
              >
                {t("features.payment.ui.apple_first_sale_card.new_member_discount")}
              </Text>
              <View style={styles.bubbleTail} />
            </Animated.View>
          </View>
        </View>

        <Show when={!event16Expired}>
          <AppleGemStoreWidget.Item
            gemProduct={gemProducts[0]}
            serverGemProducts={serverGemProducts}
            onOpenPurchase={() => {
              paymentEvents.trackItemSelected('gem_16', 16);
              setEventType(EventType.FIRST_SALE_16);
              onOpenPurchase(gemProducts[0].id);
            }}
            hot={false}
          />
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fontSize20: {
    fontSize: 20,
  },
  roseText: {
    color: '#f43f5e',
  },
  bubbleTextTop: {
    fontSize: 15,
    marginBottom: 4,
  },
  bubbleText: {
    fontSize: 15,
  },
});
