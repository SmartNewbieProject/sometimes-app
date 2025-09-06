import { useAuth } from "@/src/features/auth";
import { usePortone } from "@/src/features/payment/hooks/use-portone";
import { type PaymentResponse, Product } from "@/src/features/payment/types";
import { RematchingTicket } from "@/src/features/payment/ui/rematching-ticket";
import { useScrollIndicator } from "@/src/shared/hooks";
import { useModal } from "@/src/shared/hooks/use-modal";
import { GemStoreWidget } from "@/src/widgets";
import { track } from "@amplitude/analytics-react-native";
import Layout from "@features/layout";
import Payment from "@features/payment";
import { useCurrentGem, useGemProducts } from "@features/payment/hooks";
import { usePortoneStore } from "@features/payment/hooks/use-portone-store";
import { FirstSaleCard, GemStore } from "@features/payment/ui";
import type { PortOneController } from "@portone/react-native-sdk";
import { ScrollDownIndicator, Show, Text } from "@shared/ui";
import { createRef, lazy, useEffect, useState } from "react";
import { Alert, BackHandler, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { ui, services } = Payment;
const { PaymentView } = ui;
const { createUniqueId } = services;

export default function GemStoreScreen() {
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
      Alert.alert("오류", "결제 처리 중 오류가 발생했습니다.");
      setShowPayment(false);
    }
  };

  const onError = async (error: unknown) => {
    console.error("결제 오류:", error);
    const id = createUniqueId();
    console.debug("결제 오류 발생 시 새로운 orderId 생성:", id);
    setPaymentId(id);
    setShowPayment(false);
    showErrorModal(
      error instanceof Error
        ? error.message
        : "결제 처리 중 오류가 발생했습니다.",
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
    track("GemStore_Entered", {
      who: my,
      env: process.env.EXPO_PUBLIC_TRACKING_MODE,
    });

    return () => {
      track("GemStore_Exited", {
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
                구슬 구매
              </Text>
            </View>

            <View className="flex flex-col gap-y-4 justify-center mb-auto">
              <Show when={isLoading}>
                <View className="flex-1 justify-center items-center">
                  <Text>젬 상품을 불러오는 중...</Text>
                </View>
              </Show>
              <Show when={!!error}>
                <View className="flex-1 justify-center items-center">
                  <Text>젬 상품을 불러오는데 실패했습니다.</Text>
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
                          track("GemStore_Product_Clicked", {
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
        </RematchingTicket.ContentLayout>
      </ScrollView>
      <ScrollDownIndicator visible={showIndicator} />
    </Layout.Default>
  );
}
