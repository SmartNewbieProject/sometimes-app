import { View, StyleSheet } from "react-native";
import { Text } from '@shared/ui';


type Props = {
  style?: any;
  totalPrice: number;
  originalPrice?: number;
  salesPercent?: number;
}

export const PriceDisplay = ({ style, totalPrice, originalPrice, salesPercent }: Props) => {
  const showSales = (originalPrice && salesPercent && originalPrice > totalPrice && salesPercent) !== 0;

  return (
    <View style={style}>
      <View style={styles.priceContainer}>
        <Text weight="semibold" textColor="black" style={styles.totalLabel}>
          총
        </Text>
        <Text weight="semibold" size="lg" textColor="purple">
          {totalPrice.toLocaleString()}
        </Text>
        <Text weight="semibold" textColor="black" style={styles.wonLabel}>
          원
        </Text>
      </View>

      {showSales && (
        <View style={styles.salesContainer}>
          <Text size="sm" textColor="light" style={styles.originalPrice}>
            {originalPrice?.toLocaleString()}원
          </Text>
          <Text size="sm" textColor="purple" weight="semibold">
            {salesPercent}% 할인
          </Text>
        </View>
      )}

    </View>
  )
};

const styles = StyleSheet.create({
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalLabel: {
    marginRight: 8,
  },
  wonLabel: {
    marginLeft: 4,
  },
  salesContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    marginRight: 4,
  },
});
