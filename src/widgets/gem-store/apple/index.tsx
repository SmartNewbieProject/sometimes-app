import type { AppleGemDetails, GemDetails } from "@/src/features/payment/api";
import type { GemMetadata } from "@/src/features/payment/types";
import colors from "@/src/shared/constants/colors";
import { semanticColors } from "@/src/shared/constants/semantic-colors";
import { ImageResources } from "@shared/libs";
import { Show, Text } from "@shared/ui";
import { ImageResource } from "@ui/image-resource";
import type { Product } from "expo-iap";
import { Pressable, StyleSheet as RNStyleSheet, TouchableOpacity, View } from "react-native";
import { calculateDiscount, dropHundred, toKRW } from "../utils";
import {
  containsSale,
  extractNumber,
  getPriceAndDiscount,
  getPriceAndDiscountFromServer,
} from "../utils/apple";

export type GemItemProps = {
  onOpenPurchase: (productId: string) => void;
  hot?: boolean;
  gemProduct: Product;
  serverGemProducts?: GemDetails[]; // 서버 데이터 추가
};

const AppleGemStoreProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "column",
        columnGap: 10,
        width: "100%",
      }}
    >
      {children}
    </View>
  );
};

const AppleGemStoreItem = ({
  gemProduct,
  hot,
  onOpenPurchase,
  serverGemProducts,
}: GemItemProps) => {
  // 서버 데이터가 있으면 서버 데이터 기반으로 할인율/원가 표시
  const priceAndDiscount = serverGemProducts
    ? getPriceAndDiscountFromServer(gemProduct.id, serverGemProducts)
    : getPriceAndDiscount(gemProduct.id);

  return (
    <Pressable
      onPress={() => onOpenPurchase(gemProduct.id)}
      style={{
        backgroundColor: semanticColors.surface.background,
        padding: 16,
        height: 59,
        display: "flex",
        flexDirection: "row",
        width: "100%",
        alignItems: "center",
        marginVertical: 4,
        borderRadius: 8,
        borderWidth: hot ? 3 : 1,
        borderColor: hot ? "#8B5CF6" : "#E6DBFF",
      }}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", width: "100%" }}
      >
        <View
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "row",
            flex: 1,
          }}
        >
          <ImageResource resource={ImageResources.GEM} width={42} height={42} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: semanticColors.text.primary }}>
              {extractNumber(gemProduct.title)}개
            </Text>
          </View>
        </View>

        <View style={{ display: "flex", flexDirection: "column", rowGap: 6 }}>
          <Show when={priceAndDiscount && priceAndDiscount.discountRate > 0}>
            <View
              style={{ display: "flex", flexDirection: "row", columnGap: 6 }}
            >
              <Text style={styles.originalPrice}>
                {toKRW(priceAndDiscount?.price ?? 0)}원
              </Text>
              <Text style={styles.discountRate}>
                {priceAndDiscount?.discountRate}% 할인
              </Text>
            </View>
          </Show>

          <Text
            size="18"
            style={{
              color: semanticColors.text.primary,
              fontWeight: "bold",
              alignSelf: "flex-end",
            }}
          >
            {toKRW(gemProduct.price ?? 0)}원
          </Text>
        </View>
      </View>
      {hot && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            backgroundColor: semanticColors.brand.primary,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderTopLeftRadius: 4,
            borderBottomRightRadius: 4,
          }}
        >
          <Text style={{ color: semanticColors.text.inverse, fontSize: 10, fontWeight: "bold" }}>
            인기
          </Text>
        </View>
      )}
    </Pressable>
  );
};

export const AppleGemStoreWidget = {
  Provider: AppleGemStoreProvider,
  Item: AppleGemStoreItem,
};

const styles = RNStyleSheet.create({
  originalPrice: {
    fontSize: 10,
    color: semanticColors.text.disabled,
    textDecorationLine: "line-through",
  },
  discountRate: {
    fontSize: 10,
  },
});
