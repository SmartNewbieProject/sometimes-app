import type { AppleGemDetails, GemDetails } from "@/src/features/payment/api";
import type { GemMetadata } from "@/src/features/payment/types";
import colors from "@/src/shared/constants/colors";
import { ImageResources } from "@shared/libs";
import { Show, Text } from "@shared/ui";
import { ImageResource } from "@ui/image-resource";
import type { Product } from "expo-iap";
import { Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import { calculateDiscount, dropHundred, toKRW } from "../utils";
import {
  containsSale,
  extractNumber,
  getPriceAndDiscount,
} from "../utils/apple";

export type GemItemProps = {
  onOpenPurchase: (productId: string) => void;
  hot?: boolean;
  gemProduct: Product;
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
}: GemItemProps) => {
  return (
    <Pressable
      onPress={() => onOpenPurchase(gemProduct.id)}
      style={{
        backgroundColor: "white",
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
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "black" }}>
              {extractNumber(gemProduct.title)}개
            </Text>
          </View>
        </View>

        <View style={{ display: "flex", flexDirection: "column", rowGap: 6 }}>
          <Show when={gemProduct.id !== "gem_12"}>
            <View
              style={{ display: "flex", flexDirection: "row", columnGap: 6 }}
            >
              <Text className="text-[10px] text-[#969696] line-through">
                {toKRW(getPriceAndDiscount(gemProduct.id)?.price ?? 0)}원
              </Text>
              <Text className="text-[10px]">
                {getPriceAndDiscount(gemProduct.id)?.discountRate}% 할인
              </Text>
            </View>
          </Show>

          <Text
            size="18"
            style={{
              color: "black",
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
            backgroundColor: "#8B5CF6",
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderTopLeftRadius: 4,
            borderBottomRightRadius: 4,
          }}
        >
          <Text style={{ color: "white", fontSize: 10, fontWeight: "bold" }}>
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
