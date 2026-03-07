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
    event10Expired,
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

  const handlePurchase = () => {
    paymentEvents.trackItemSelected('gem_10', 10);
    setEventType(EventType.FIRST_SALE_10);
    onOpenPurchase(gemProducts[0].id);
  };

  return (
    <GlowingCard onPress={handlePurchase}>
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

        <Show when={!event10Expired}>
          <AppleGemStoreWidget.Item
            gemProduct={gemProducts[0]}
            serverGemProducts={serverGemProducts}
            onOpenPurchase={handlePurchase}
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
    rowGap: 8,
    marginTop: 12,
  },
  saleMiho: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  bubble: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 20,
    flexDirection: "column",
    marginLeft: 8,
  },
  bubbleTail: {
    position: "absolute",
    top: "50%",
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
