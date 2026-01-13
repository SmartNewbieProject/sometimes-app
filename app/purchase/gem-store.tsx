import { useAuth } from "@/src/features/auth";
import { usePortone } from "@/src/features/payment/hooks/use-portone";
import { type PaymentResponse, Product } from "@/src/features/payment/types";
import { useModal } from "@/src/shared/hooks/use-modal";
import { useGlobalLoading } from "@/src/shared/hooks/use-global-loading";
import { GemStoreWidget } from "@/src/widgets";
import { mixpanelAdapter } from "@/src/shared/libs/mixpanel";
import Payment from "@features/payment";
import { useCurrentGem, useGemProducts, useGemMissions } from "@features/payment/hooks";
import { useRouter } from "expo-router";
import { usePortoneStore } from "@features/payment/hooks/use-portone-store";
import { FirstSaleCard, GemStore } from "@features/payment/ui";
import type { PortOneController } from "@portone/react-native-sdk";
import { Show, Text } from "@shared/ui";
import { createRef, useEffect, useState } from "react";
import { Alert, BackHandler, Platform, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

const { ui, services } = Payment;
const { PaymentView } = ui;
const { createUniqueId } = services;

export default function GemStoreScreen() {
  const { t } = useTranslation();
  const { data: gem } = useCurrentGem();
  const { data: gemProducts, isLoading, error } = useGemProducts();
  const [productCount, setProductCount] = useState<number>();
  const [totalPrice, setTotalPrice] = useState<number>();
  const [showPayment, setShowPayment] = useState<boolean>(false);
  const controller = createRef<PortOneController>();
  const { showErrorModal } = useModal();
  const { showLoading, hideLoading } = useGlobalLoading();
  const [paymentId, setPaymentId] = useState<string>(() => createUniqueId());
  const { setGemCount, clearEventType } = usePortoneStore();
  const { my } = useAuth();

  const { handlePaymentComplete } = usePortone();
  const { missions } = useGemMissions();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
    return () => hideLoading();
  }, [isLoading]);

  const handleMissionPress = (mission: { navigateTo?: string }) => {
    if (mission.navigateTo) {
      router.push(mission.navigateTo as any);
    }
  };

  const onPurchase = async (metadata: {
    totalPrice: number;
    count: number;
  }) => {
    try {
      setTotalPrice(metadata.totalPrice);
      setProductCount(metadata.count);
      setShowPayment(true);
    } catch (error) {
      Alert.alert(t("apps.purchase.gem_store.error_alert_title"), t("apps.purchase.gem_store.error_alert_message"));
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
        orderName={t("apps.purchase.gem_store.gem")}
        totalAmount={totalPrice ?? 0}
        productName={t("apps.purchase.gem_store.gem")}
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
    <GemStore.Layout
      gemCount={gem?.totalGem ?? 0}
      title={t("apps.purchase.gem_store.title")}
      renderSaleCard={() => (
        <FirstSaleCard
          onOpenPayment={(metadata) => {
            setGemCount(metadata.gemProduct.totalGems);
            onPurchase({
              totalPrice: metadata.totalPrice,
              count: 1,
            });
          }}
        />
      )}
      renderProductList={() => (
        <>
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
          <Show when={!isLoading && !error}>
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
        </>
      )}
      renderMissionSection={() => (
        <GemStore.MissionSection
          missions={missions}
          onMissionPress={handleMissionPress}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
