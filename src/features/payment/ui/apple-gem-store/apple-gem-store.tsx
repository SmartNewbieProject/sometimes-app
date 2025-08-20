import { useIAP } from "expo-iap";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Layout from "@/src/features/layout";
import { useScrollIndicator } from "@/src/shared/hooks";
import { ScrollDownIndicator, Show, Text } from "@/src/shared/ui";
import { AppleGemStoreWidget } from "@/src/widgets/gem-store/apple";
import {
  type ExtendedProductPurchase,
  splitAndSortProducts,
} from "@/src/widgets/gem-store/utils/apple";

import paymentApis from "../../api";
import { useCurrentGem } from "../../hooks";
import { AppleFirstSaleCard } from "../first-sale-card/apple";
import { GemStore } from "../gem-store";
import { RematchingTicket } from "../rematching-ticket";

function AppleGemStore() {
  const insets = useSafeAreaInsets();
  const { showIndicator, handleScroll, scrollViewRef } = useScrollIndicator();
  const { data: gem } = useCurrentGem();
  const [purchasing, setPurchasing] = useState(false);

  const {
    connected,
    products,
    requestProducts,
    requestPurchase,
    currentPurchase,
    finishTransaction,
  } = useIAP();
  const purchase: ExtendedProductPurchase =
    currentPurchase as ExtendedProductPurchase;

  const productIds = [
    "gem_sale_20",
    "gem_sale_40",
    "gem_sale_6",
    "gem_130",
    "gem_15",
    "gem_200",
    "gem_30",
    "gem_400",
    "gem_500",
    "gem_60",
    "gem_800",
    "gem_8",
  ];

  const { sale, normal } = products
    ? splitAndSortProducts(products)
    : { sale: [], normal: [] };

  useEffect(() => {
    if (connected) {
      requestProducts({ skus: productIds, type: "inapp" });
    }
  }, [connected]);

  useEffect(() => {
    if (!currentPurchase) return;
    const completePurchase = async () => {
      setPurchasing(true);
      try {
        console.log("Receipt:", purchase?.jwsRepresentationIOS);
        const res = await paymentApis.postAppleVerifyPurchase(
          purchase?.jwsRepresentationIOS ?? ""
        );
        console.log("서버 검증 결과:", res);

        const result = await finishTransaction({
          purchase: currentPurchase,
          isConsumable: true,
        });
        console.log("finishTransaction 결과:", result);
      } catch (error) {
        console.error("Failed to complete purchase:", error);
      } finally {
        setPurchasing(false);
      }
    };
    completePurchase();
  }, [currentPurchase]);

  const handlePurchase = async (productId: string) => {
    if (purchasing) return;
    setPurchasing(true);
    try {
      await requestPurchase({
        request: {
          ios: { sku: productId },
          android: { skus: [productId] },
        },
      });
    } catch (error) {
      console.error("Purchase failed:", error);
      setPurchasing(false);
    }
  };

  return (
    <Layout.Default
      className="flex flex-1 flex-col"
      style={{ backgroundColor: "white", paddingTop: insets.top }}
    >
      <GemStore.Header gemCount={gem?.totalGem ?? 0} />
      <ScrollView
        ref={scrollViewRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <GemStore.Banner />
        <RematchingTicket.ContentLayout>
          <View className="flex-1 flex flex-col px-[16px] mt-4">
            <View className="flex flex-col mb-2">
              <View style={{ marginBottom: 30 }}>
                <Show when={sale.length > 0}>
                  <AppleFirstSaleCard
                    gemProducts={sale}
                    onOpenPurchase={handlePurchase}
                  />
                </Show>
              </View>

              <Text weight="semibold" size="20" textColor="black">
                구슬 구매
              </Text>
            </View>

            <View className="flex flex-col gap-y-4 justify-center mb-auto">
              <Show when={!products || products?.length === 0}>
                <View className="flex-1 justify-center items-center">
                  <Text>젬 상품을 불러오는 중...</Text>
                </View>
              </Show>

              <Show when={normal && normal?.length > 0}>
                <AppleGemStoreWidget.Provider>
                  {normal.map((product, index) => (
                    <AppleGemStoreWidget.Item
                      key={product.id}
                      gemProduct={product}
                      onOpenPurchase={handlePurchase}
                      hot={index === 2}
                    />
                  ))}
                </AppleGemStoreWidget.Provider>
              </Show>
            </View>
          </View>
        </RematchingTicket.ContentLayout>
      </ScrollView>
      <ScrollDownIndicator visible={showIndicator} />

      {/* 화면 전체 로딩 UI */}
      <Show when={purchasing}>
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </Show>
    </Layout.Default>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
});

export default AppleGemStore;
