import { View } from "react-native";
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
    <View className={classNames}>
      <View className="flex-row items-center">
        <Text weight="semibold" textColor="black" className="mr-2">
          {t("ui.price_display.total_prefix")}
        </Text>
        <Text weight="semibold" size="lg" textColor="purple">
          {totalPrice.toLocaleString()}
        </Text>
        <Text weight="semibold" textColor="black" className="ml-1">
          {t("ui.price_display.currency_suffix")}
        </Text>
      </View>

      {showSales && (
        <View className="flex-row justify-end mb-1">
          <Text size="sm" textColor="light" className="line-through mr-1">
            {originalPrice?.toLocaleString()}{t("ui.price_display.currency_suffix")}
          </Text>
          <Text size="sm" textColor="purple" weight="semibold">
            {salesPercent}{t("ui.price_display.discount_suffix")}
          </Text>
        </View>
      )}

    </View>
  )
};

