import { useAuth } from "@/src/features/auth";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { usePortone } from "@/src/features/payment/hooks/use-portone";
import { type PaymentResponse, Product } from "@/src/features/payment/types";
import { useScrollIndicator } from "@/src/shared/hooks";
import { useModal } from "@/src/shared/hooks/use-modal";
import { GemStoreWidget } from "@/src/widgets";
import { mixpanelAdapter } from "@/src/shared/libs/mixpanel";
import Payment from "@features/payment";
import { useCurrentGem, useGemProducts } from "@features/payment/hooks";
import { usePortoneStore } from "@features/payment/hooks/use-portone-store";
import { FirstSaleCard, GemStore } from "@features/payment/ui";
import type { PortOneController } from "@portone/react-native-sdk";
import { ScrollDownIndicator, Show, Text } from "@shared/ui";
import { createRef, lazy, useEffect, useState } from "react";
import { Alert, BackHandler, Platform, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

const { ui, services } = Payment;
const { PaymentView } = ui;
const { createUniqueId } = services;

export default function GemStoreScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { data: gem } = useCurrentGem();
  const { data: gemProducts, isLoading, error } = useGemProducts();
  const [productCount, setProductCount] = useState<number>();
  const [totalPrice, setTotalPrice] = useState<number>();
  const [showPayment, setShowPayment] = useState<boolean>(false);
  const controller = createRef<PortOneController>();
  const { showErrorModal } = useModal();
  const [paymentId, setPaymentId] = useState<string>(() => createUniqueId());
  const { setGemCount, clearEventType } = usePortoneStore();
  const { my } = useAuth();
  const { showIndicator, handleScroll, scrollViewRef } = useScrollIndicator();

  const { handlePaymentComplete } = usePortone();

  const onPurchase = async (metadata: {
    totalPrice: number;
    count: number;
  }) => {
    try {
      setTotalPrice(metadata.totalPrice);
      setProductCount(metadata.count);
      setShowPayment(true);
    } catch (error) {
      Alert.alert("오류", t("apps.purchase.gem_store.error_alert_message"));
      setShowPayment(false);
    }
  };

  const onError = async (error: unknown) => {
    console.error(t("apps.purchase.gem_store.payment_error_console"), error);
    const id = createUniqueId();
    console.debug(t("apps.purchase.gem_store.payment_error_debug"), id);
    setPaymentId(id);
    setShowPayment(false);
    showErrorModal(
      error instanceof Error
        ? error.message
        : t("apps.purchase.gem_store.error_alert_message"),
      "error"
    );
  };

  const onCompletePayment = (result: PaymentResponse) => {
    setShowPayment(false);
    handlePaymentComplete(result, {
      productCount,
      onError,
      showSuccessModal: true,
    });
    setPaymentId(createUniqueId());
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (controller.current?.canGoBack) {
          controller.current.webview?.goBack();
          return true;
        }
        return false;
      }
    );
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    if (!showPayment) {
      setProductCount(undefined);
      setTotalPrice(undefined);
    }
  }, [showPayment]);

  useEffect(() => {
    mixpanelAdapter.track("GemStore_Entered", {
      who: my,
      env: process.env.EXPO_PUBLIC_TRACKING_MODE,
    });

    return () => {
      mixpanelAdapter.track("GemStore_Exited", {
        who: my,
        env: process.env.EXPO_PUBLIC_TRACKING_MODE,
      });
    };
  }, []);

  if (showPayment) {
    return (
      <PaymentView
        payMode="gem"
        productType={Product.REMATCHING}
        ref={controller}
        productCount={productCount ?? 0}
        paymentId={paymentId}
        orderName="구슬"
        totalAmount={totalPrice ?? 0}
        productName="구슬"
        onError={onError}
        onComplete={(result: unknown) =>
          onCompletePayment(result as PaymentResponse)
        }
        onCancel={() => {
          console.log("onCancel Payment");
          setShowPayment(false);
        }}
      />
    );
  }

  if (Platform.OS === "ios") {
    const AppleGemStore =
      require("@/src/features/payment/ui/apple-gem-store/apple-gem-store").default;
    return <AppleGemStore />;
  }
  return (
    <View style={[styles.container, { backgroundColor: semanticColors.surface.background, paddingTop: insets.top }]}>
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
          <View style={styles.contentWrapper}>
            <View style={styles.titleSection}>
              <View style={styles.firstSaleWrapper}>
                <FirstSaleCard
                  onOpenPayment={(metadata) => {
                    setGemCount(metadata.gemProduct.totalGems);
                    onPurchase({
                      totalPrice: metadata.totalPrice,
                      count: 1,
                    });
                  }}
                />
              </View>

              <Text weight="semibold" size="20" textColor="black">
                {t("apps.purchase.gem_store.title")}
              </Text>
            </View>

            <View style={styles.productList}>
              <Show when={isLoading}>
                <View style={styles.centered}>
                  <Text>{t("apps.purchase.gem_store.loading_gems")}</Text>
                </View>
              </Show>
              <Show when={!!error}>
                <View style={styles.centered}>
                  <Text>{t("apps.purchase.gem_store.failed_to_load_gems")}</Text>
                </View>
              </Show>
              <Show when={!isLoading}>
                <GemStoreWidget.Provider>
                  {gemProducts
                    ?.sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((product, index) => (
                      <GemStoreWidget.Item
                        key={product.id}
                        gemProduct={product}
                        onOpenPayment={(metadata) => {
                          mixpanelAdapter.track("GemStore_Product_Clicked", {
                            who: my,
                            product: metadata,
                            env: process.env.EXPO_PUBLIC_TRACKING_MODE,
                          });
                          setGemCount(product.totalGems);
                          clearEventType();
                          onPurchase({
                            totalPrice: metadata.totalPrice,
                            count: 1,
                          });
                        }}
                        hot={index === 2}
                      />
                    ))}
                </GemStoreWidget.Provider>
              </Show>
            </View>
          </View>
        </View>
      </ScrollView>
      <ScrollDownIndicator visible={showIndicator} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  contentWrapper: {
    flex: 1,
    flexDirection: "column",
    paddingHorizontal: 16,
    marginTop: 16,
  },
  titleSection: {
    flexDirection: "column",
    marginBottom: 8,
  },
  firstSaleWrapper: {
    marginBottom: 30,
  },
  productList: {
    flexDirection: "column",
    gap: 16,
    justifyContent: "center",
    paddingBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
