// import { useIAP } from "expo-iap";
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

import { useModal } from "@/src/shared/hooks/use-modal";
import paymentApis from "../../api";
import { useCurrentGem } from "../../hooks";
import { useAppleInApp } from "../../hooks/use-apple-in-app";
import { AppleFirstSaleCard } from "../first-sale-card/apple";
import { GemStore } from "../gem-store";
import { RematchingTicket } from "../rematching-ticket";

function AppleGemStore() {
  const insets = useSafeAreaInsets();
  const { showIndicator, handleScroll, scrollViewRef } = useScrollIndicator();
  const { data: gem } = useCurrentGem();
  const [purchasing, setPurchasing] = useState(false);
  const appleInAppMutation = useAppleInApp();
  const { showErrorModal } = useModal();
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
        // 1. 백엔드에 영수증 검증 요청
        const serverResponse = await appleInAppMutation.mutateAsync(
          purchase?.jwsRepresentationIOS ?? ""
        );

        // 2. 백엔드가 '성공'이라고 응답했을 때만 트랜잭션 완료
        if (serverResponse.success) {
          const result = await finishTransaction({
            purchase: currentPurchase,
            isConsumable: true,
          });
        } else {
          // 3. 백엔드가 '실패'라고 응답한 경우
          console.error("서버 검증 실패");
          // 사용자에게 "결제 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." 알림 표시
        }
      } catch (error) {
        console.error("Failed to complete purchase:", error);
        showErrorModal("결제 처리 중 오류가 발생했습니다", "announcement");
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
