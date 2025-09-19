import { GlowingCard, ImageResource, Show, Text } from "@/src/shared/ui";
import { formatTime, ImageResources } from "@/src/shared/libs";
import { useTimer } from "@/src/shared/hooks/use-timer";
import { useEventControl } from "@/src/features/event/hooks";
import { EventType } from "@/src/features/event/types";
import { StyleSheet, View } from "react-native";
import { GemStoreWidget } from "@/src/widgets";
import { GemItemProps } from "@/src/widgets/gem-store";
import colors from "@/src/shared/constants/colors";
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";
import { useFirstSaleEvents } from "../../hooks/useFirstSaleEvents";
import type { GemMetadata } from "../../types";
import { usePortoneStore } from "../../hooks/use-portone-store";
import { track } from "@amplitude/analytics-react-native";
import { useAuth } from "@/src/features/auth";
import { useTranslation } from "react-i18next";


type FirstSaleCardProps = {
  onOpenPayment: (gemProduct: GemMetadata) => void;
}

export const FirstSaleCard = ({ onOpenPayment }: FirstSaleCardProps) => {
  const { totalExpiredAt, show, setShow, event6Expired, event20Expired, event40Expied } = useFirstSaleEvents();
  const { seconds } = useTimer(totalExpiredAt, { autoStart: !!totalExpiredAt, onComplete: () => {
    setShow(false);
  } });
  const { setEventType } = usePortoneStore();
  const { my } = useAuth();

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

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text textColor="black" weight="bold" size="20" className="text-[20px]">
        {t("ui.apple_first_sale_card.time_sale_title")}
      </Text>
      <Text weight="bold" size="20" className="text-rose-600">
        {formatTime(seconds)}
      </Text>
      </View>

      <View style={styles.paymentList}>
        <View style={styles.saleMiho}>
          <View style={{ position: 'relative' }}>
            <ImageResource resource={ImageResources.SALE_MIHO} width={120} height={140} />
            <Animated.View style={[styles.bubble, animatedStyle]}>
              <Text textColor="purple" weight="semibold" className="text-[15px] mb-1">
                {t("ui.apple_first_sale_card.cheer_message")}
              </Text>
              <Text textColor="purple" weight="semibold" className="text-[15px]">
                {t("ui.apple_first_sale_card.new_member_discount")}
              </Text>
              <View style={styles.bubbleTail} />
            </Animated.View>
          </View>
        </View>

        <Show when={!event6Expired}>
          <GemStoreWidget.Item gemProduct={{
            id: 'sale-6',
            sortOrder: 0,
            price: 5900,
            discountRate: 50.9,
            totalGems: 6,
            bonusGems: 0,
            gemAmount: 0,
            productName: t("ui.first_sale_card.product_name_6_gems"),
          }} onOpenPayment={(metadata) => {
            track('GemStore_FirstSale_6', {
              who: my,
              env: process.env.EXPO_PUBLIC_TRACKING_MODE,
            })
            setEventType(EventType.FIRST_SALE_6);
            onOpenPayment(metadata);
          }} hot={false} />
        </Show>
        <Show when={!event20Expired}>
          <GemStoreWidget.Item gemProduct={{
            id: 'sale-20',
            sortOrder: 1,
            price: 14700,
            discountRate: 53.2,
            totalGems: 20,
            bonusGems: 0,
            gemAmount: 0,
            productName: t("ui.first_sale_card.product_name_6_gems"),
          }} onOpenPayment={(metadata) => {
            track('GemStore_FirstSale_20', {
              who: my,
              env: process.env.EXPO_PUBLIC_TRACKING_MODE,
            })
            setEventType(EventType.FIRST_SALE_20);
            onOpenPayment(metadata);
          }} hot={false} />
        </Show>
         <Show when={!event40Expied}>
          <GemStoreWidget.Item gemProduct={{
            id: 'sale-40',
            sortOrder: 2,
            price: 29400,
            discountRate: 56.2,
            totalGems: 40,
            bonusGems: 0,
            gemAmount: 0,
            productName: t("ui.first_sale_card.product_name_6_gems"),
          }} onOpenPayment={(metadata) => {
            track('GemStore_FirstSale_40', {
              who: my,
              env: process.env.EXPO_PUBLIC_TRACKING_MODE,
            })
            setEventType(EventType.FIRST_SALE_40);
            onOpenPayment(metadata);
          }} hot={false} />
        </Show>
      </View>

    </GlowingCard>
  );
};

const styles = StyleSheet.create({
  paymentList: {
    flexDirection: 'column',
    position: 'relative',
    alignItems: 'center',
    rowGap: 4,
    marginTop: 120,
  },
  saleMiho: {
    position: 'absolute',
    top: -106,
    width: '100%',
    left: 0,
    zIndex: 1,
  },
  bubble: {
    paddingVertical: 11,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 20,
    textDecorationColor: colors.primaryPurple,
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    left: 120
  },
  bubbleTail: {
    position: 'absolute',
    bottom: 20,
    left: -8,
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderRightWidth: 8,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: colors.white,
  }
});
