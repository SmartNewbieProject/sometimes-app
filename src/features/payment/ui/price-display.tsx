import { StyleSheet, View } from "react-native";
import { Text } from '@shared/ui';
import { useTranslation } from 'react-i18next';


type Props = {
  classNames?: string;
  totalPrice: number;
  originalPrice?: number;
  salesPercent?: number;
}

export const PriceDisplay = ({ classNames, totalPrice, originalPrice, salesPercent }: Props) => {
  const showSales = (originalPrice && salesPercent && originalPrice > totalPrice && salesPercent) !== 0;
  const { t } = useTranslation();

  return (
    <View style={classNames ? undefined : styles.container}>
      <View style={styles.priceRow}>
        <Text weight="semibold" textColor="black" style={styles.marginRight}>
          {t("features.payment.ui.price_display.total_prefix")}
        </Text>
        <Text weight="semibold" size="lg" textColor="purple">
          {totalPrice.toLocaleString()}
        </Text>
        <Text weight="semibold" textColor="black" style={styles.marginLeft}>
          {t("features.payment.ui.price_display.currency_suffix")}
        </Text>
      </View>

      {showSales && (
        <View style={styles.salesRow}>
          <Text size="sm" textColor="light" style={styles.lineThrough}>
            {originalPrice?.toLocaleString()}{t("features.payment.ui.price_display.currency_suffix")}
          </Text>
          <Text size="sm" textColor="purple" weight="semibold">
            {salesPercent}{t("features.payment.ui.price_display.discount_suffix")}
          </Text>
        </View>
      )}

    </View>
  )
};

const styles = StyleSheet.create({
  container: {},
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  marginRight: {
    marginRight: 8,
  },
  marginLeft: {
    marginLeft: 4,
  },
  salesRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  lineThrough: {
    textDecorationLine: 'line-through',
    marginRight: 4,
  },
});

