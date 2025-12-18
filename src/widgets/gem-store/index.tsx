import { View, StyleSheet, Pressable } from "react-native";
import { Show, Text } from "@shared/ui";
import { calculateDiscount, dropHundred, toKRW } from "./utils";
import colors, { semanticColors } from "@/src/shared/constants/colors";
import type { GemDetails } from "@/src/features/payment/api";
import { ImageResource } from "@ui/image-resource";
import { ImageResources } from "@shared/libs";
import { GemMetadata } from "@/src/features/payment/types";
import i18n from "@/src/shared/libs/i18n";

export type GemItemProps = {
  onOpenPayment: (metadata: GemMetadata) => void;
  hot?: boolean;
  gemProduct: GemDetails;
};

const GemStoreProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <View style={styles.provider}>
      {children}
    </View>
  );
}

const GemStoreItem = ({ gemProduct, hot, onOpenPayment }: GemItemProps) => {
  const { price, discountRate, totalGems } = gemProduct;
  const discountedPrice = calculateDiscount(price, discountRate);
  return (
    <Pressable
      onPress={() => onOpenPayment({ totalPrice: discountedPrice, gemProduct })}
      style={[
        styles.itemContainer,
        {
          borderWidth: hot ? 3 : 1,
          borderColor: hot ? '#8B5CF6' : '#E6DBFF',
        }
      ]}
    >
      <View style={styles.itemContent}>
        <View style={styles.gemInfo}>
          <ImageResource resource={ImageResources.GEM} width={42} height={42} />
          <View style={styles.gemCountWrapper}>
            <Text style={styles.gemCountText}>{totalGems}{i18n.t('widgets.gem-store.common.unit_piece')}</Text>
          </View>
        </View>

        <View style={styles.priceSection}>
          <Show when={Math.floor(discountRate) !== 0}>
            <View style={styles.discountRow}>
              <Text style={styles.originalPrice}>
                {dropHundred(price)}{i18n.t('widgets.gem-store.common.unit_currency')}
              </Text>
              <Text style={styles.discountRate}>
                {Math.ceil(discountRate)}{i18n.t('widgets.gem-store.common.discount_suffix')}
              </Text>
            </View>
          </Show>

          <Text size="18" style={styles.finalPrice}>
            {toKRW(discountedPrice)}{i18n.t('widgets.gem-store.common.unit_currency')}
          </Text>
        </View>
      </View>
      {hot && (
        <View style={styles.hotBadge}>
          <Text style={styles.hotBadgeText}>{i18n.t('widgets.gem-store.common.popular_badge')}</Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  provider: {
    flexDirection: 'column',
    gap: 10,
    width: '100%',
  },
  itemContainer: {
    backgroundColor: semanticColors.surface.background,
    padding: 16,
    height: 59,
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    marginVertical: 4,
    borderRadius: 8,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  gemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  gemCountWrapper: {
    flex: 1,
  },
  gemCountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: semanticColors.text.primary,
  },
  priceSection: {
    flexDirection: 'column',
    gap: 6,
  },
  discountRow: {
    flexDirection: 'row',
    gap: 6,
  },
  originalPrice: {
    fontSize: 10,
    color: semanticColors.text.disabled,
    textDecorationLine: 'line-through',
  },
  discountRate: {
    fontSize: 10,
    color: colors.black,
  },
  finalPrice: {
    color: semanticColors.text.primary,
    fontWeight: 'bold',
    alignSelf: 'flex-end',
  },
  hotBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: semanticColors.brand.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  hotBadgeText: {
    color: semanticColors.text.inverse,
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export const GemStoreWidget = {
  Provider: GemStoreProvider,
  Item: GemStoreItem,
};
