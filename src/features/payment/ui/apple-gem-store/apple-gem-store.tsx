import { useIAP, finishTransaction, type Purchase } from "expo-iap";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import React, { useCallback, useEffect, useRef, useState } from "react";
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

import { participateEvent } from "@/src/features/event/api";
import { useModal } from "@/src/shared/hooks/use-modal";
import { usePathname, useRouter } from "expo-router";
import paymentApis from "../../api";
import { useCurrentGem , useGemProducts } from "../../hooks";
import { useAppleInApp } from "../../hooks/use-apple-in-app";
import { usePortoneStore } from "../../hooks/use-portone-store";
import { AppleFirstSaleCard } from "../first-sale-card/apple";
import { GemStore } from "../gem-store";
import { useMixpanel } from "@/src/shared/hooks/use-mixpanel";
import { devLogWithTag } from "@/src/shared/utils";

function AppleGemStore() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showIndicator, handleScroll, scrollViewRef } = useScrollIndicator();
  const pathname = usePathname();
  const { data: gem } = useCurrentGem();
  const { data: serverGemProducts, isLoading: isLoadingServer } = useGemProducts();
  const [purchasing, setPurchasing] = useState(false);
  const appleInAppMutation = useAppleInApp();
  const { showErrorModal } = useModal();
  const { eventType } = usePortoneStore();
  const { paymentEvents, conversionEvents } = useMixpanel();

  const productsRef = useRef<any[]>([]);

  const handlePurchaseSuccess = useCallback(async (purchase: Purchase) => {
    setPurchasing(true);
    try {
      const extendedPurchase = purchase as ExtendedProductPurchase;
      const transactionReceipt = extendedPurchase?.transactionReceipt || extendedPurchase?.jwsRepresentationIOS;

      if (!transactionReceipt || transactionReceipt.trim() === "") {
        console.error("❌ Invalid transactionReceipt:", { transactionReceipt, purchase });
        showErrorModal("결제 정보가 올바르지 않습니다. 다시 시도해주세요.", "error");
        setPurchasing(false);
        return;
      }

      devLogWithTag('Apple IAP', 'Sending receipt');

      const serverResponse = await appleInAppMutation.mutateAsync(transactionReceipt);

      if (serverResponse.success) {
        await finishTransaction({ purchase, isConsumable: true });

        const purchasedProduct = productsRef.current?.find(p => p.productId === purchase?.productId);
        if (purchasedProduct?.price) {
          const amount = Number.parseFloat(purchasedProduct.price);
          paymentEvents.trackPaymentCompleted(
            purchase?.transactionId || transactionReceipt || 'unknown',
            'apple_iap',
            amount,
            [{ type: 'gem', quantity: serverResponse?.grantedQuantity || 0, price: amount }]
          );
        }

        if (eventType) {
          try {
            await participateEvent(eventType);
            devLogWithTag('Payment Event', '참여 완료:', eventType);
          } catch (error) {
            console.error("이벤트 참여 실패:", error);
          }
          const { clearEventType } = usePortoneStore.getState();
          clearEventType();
          router.replace(pathname as any);
        }
      } else {
        console.error("서버 검증 실패");
        showErrorModal("결제 검증에 실패했습니다", "error");
      }
    } catch (error) {
      console.error("Failed to complete purchase:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown Apple IAP error';
      conversionEvents.trackPaymentFailed('apple_iap', errorMessage);
      showErrorModal("결제 처리 중 오류가 발생했습니다", "announcement");
    } finally {
      setPurchasing(false);
    }
  }, [appleInAppMutation, eventType, pathname, paymentEvents, conversionEvents, showErrorModal, router]);

  const handlePurchaseError = useCallback((error: any) => {
    console.error("Purchase error:", error);
    const errorMessage = error?.message || 'Unknown error';
    const isCancellation = errorMessage.toLowerCase().includes('cancel') ||
                           errorMessage.toLowerCase().includes('취소');

    if (isCancellation) {
      conversionEvents.trackPaymentCancelled(errorMessage, 'apple_iap_dialog');
    } else {
      conversionEvents.trackPaymentFailed('apple_iap', errorMessage);
    }
    setPurchasing(false);
  }, [conversionEvents]);

  const {
    connected,
    products,
    fetchProducts,
    requestPurchase,
  } = useIAP({
    onPurchaseSuccess: handlePurchaseSuccess,
    onPurchaseError: handlePurchaseError,
  });

  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  const productIds = [
    "gem_sale_7",
    "gem_sale_16",
    "gem_sale_27",
    "gem_12",
    "gem_27",
    "gem_39",
    "gem_54",
    "gem_67",
  ];

  const { sale, normal } = products
    ? splitAndSortProducts(products)
    : { sale: [], normal: [] };

  useEffect(() => {
    if (connected) {
      fetchProducts({ skus: productIds, type: "inapp" });
    }
  }, [connected]);

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

      // Apple IAP 취소/실패 이벤트 추적
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isCancellation = errorMessage.toLowerCase().includes('cancel') ||
                             errorMessage.toLowerCase().includes('취소');

      if (isCancellation) {
        conversionEvents.trackPaymentCancelled(errorMessage, 'apple_iap_dialog');
      } else {
        conversionEvents.trackPaymentFailed('apple_iap', errorMessage);
      }

      setPurchasing(false);
    }
  };

  return (
    <Layout.Default
      style={[styles.layoutContainer, { backgroundColor: semanticColors.surface.background, paddingTop: insets.top }]}
    >
      <GemStore.Header gemCount={gem?.totalGem ?? 0} />
      <ScrollView
        ref={scrollViewRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        <GemStore.Banner />
        <View style={styles.contentCard}>
          <View style={styles.contentContainer}>
            <View style={styles.headerSection}>
              <View style={styles.saleCardContainer}>
                <Show when={sale.length > 0}>
                  <AppleFirstSaleCard
                    gemProducts={sale}
                    serverGemProducts={serverGemProducts}
                    onOpenPurchase={handlePurchase}
                  />
                </Show>
              </View>

              <Text weight="semibold" size="20" textColor="black">
                구슬 구매
              </Text>
            </View>

            <View style={styles.productListContainer}>
              <Show when={isLoadingServer || !products || products?.length === 0}>
                <View style={styles.loadingContainer}>
                  <Text>젬 상품을 불러오는 중...</Text>
                </View>
              </Show>

              <Show when={!isLoadingServer && normal && normal?.length > 0}>
                <AppleGemStoreWidget.Provider>
                  {normal.map((product, index) => (
                    <AppleGemStoreWidget.Item
                      key={product.id}
                      gemProduct={product}
                      serverGemProducts={serverGemProducts}
                      onOpenPurchase={handlePurchase}
                      hot={index === 2}
                    />
                  ))}
                </AppleGemStoreWidget.Provider>
              </Show>
            </View>
          </View>
        </View>
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
  layoutContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 40,
  },
  contentCard: {
    backgroundColor: semanticColors.surface.secondary,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginTop: -32,
    paddingTop: 32,
    paddingBottom: 28,
    minHeight: 400,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  headerSection: {
    flexDirection: 'column',
    marginBottom: 8,
  },
  saleCardContainer: {
    marginBottom: 30,
  },
  productListContainer: {
    flexDirection: 'column',
    gap: 16,
    justifyContent: 'center',
    marginBottom: 'auto',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppleGemStore;
