import {TouchableOpacity, View, StyleSheet, Pressable} from "react-native";
import {Show, Text} from "@shared/ui";
import {calculateDiscount, dropHundred, toKRW} from "./utils";
import colors , { semanticColors } from "@/src/shared/constants/colors";
import type { GemDetails } from "@/src/features/payment/api";
import {ImageResource} from "@ui/image-resource";
import {ImageResources} from "@shared/libs";
import { GemMetadata } from "@/src/features/payment/types";

export type GemItemProps = {
  onOpenPayment: (metadata: GemMetadata) => void;
  hot?: boolean;
  gemProduct: GemDetails;
};

const GemStoreProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <View style={{ display: 'flex', flexDirection: 'column', columnGap: 10, width: '100%' }}>
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
      style={{
        backgroundColor: semanticColors.surface.background,
        padding: 16,
        height: 59,
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        marginVertical: 4,
        borderRadius: 8,
        borderWidth: hot ? 3 : 1,
        borderColor: hot ? '#8B5CF6' : '#E6DBFF',
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
        <View style={{ display: 'flex', alignItems: 'center', flexDirection: 'row', flex: 1 }}>
          <ImageResource resource={ImageResources.GEM} width={42} height={42} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: semanticColors.text.primary }}>{totalGems}개</Text>
          </View>
        </View>

        <View style={{ display: 'flex', flexDirection: 'column', rowGap: 6 }}>

          <Show when={Math.floor(discountRate) !== 0}>
            <View style={{ display: 'flex', flexDirection: 'row', columnGap: 6 }}>
              <Text className="text-[10px] text-text-disabled line-through">
                {dropHundred(price)}원
              </Text>
              <Text className="text-[10px]">
                {Math.ceil(discountRate)}% 할인
              </Text>
            </View>
          </Show>

          <Text size="18" style={{ color: semanticColors.text.primary, fontWeight: 'bold', alignSelf: 'flex-end' }}>
            {toKRW(discountedPrice)}원
          </Text>
        </View>
      </View>
      {hot && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          backgroundColor: semanticColors.brand.primary,
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderTopLeftRadius: 4,
          borderBottomRightRadius: 4,
        }}>
          <Text style={{ color: semanticColors.text.inverse, fontSize: 10, fontWeight: 'bold' }}>인기</Text>
        </View>
      )}
    </Pressable>
  );
};

export const GemStoreWidget = {
  Provider: GemStoreProvider,
  Item: GemStoreItem,
};
