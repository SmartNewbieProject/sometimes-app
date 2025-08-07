import {usePortone} from "@/src/features/payment/hooks/use-portone";
import {type PaymentResponse, Product} from "@/src/features/payment/types";
import {RematchingTicket} from "@/src/features/payment/ui/rematching-ticket";
import {useModal} from "@/src/shared/hooks/use-modal";
import Layout from "@features/layout";
import Payment from "@features/payment";
import type {PortOneController} from "@portone/react-native-sdk";
import {Show, Text} from "@shared/ui";
import {createRef, useEffect, useState} from "react";
import {Alert, BackHandler, ScrollView, View} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {GemStore} from "@features/payment/ui";
import {useCurrentGem, useGemProducts} from "@features/payment/hooks";
import {GemStoreWidget} from "@/src/widgets";
import {usePortoneStore} from "@features/payment/hooks/use-portone-store";

const {ui, services} = Payment;
const {PaymentView} = ui;
const {createUniqueId} = services;


export default function GemStoreScreen() {
  const insets = useSafeAreaInsets();
  const { data: gem } = useCurrentGem();
  const { data: gemProducts, isLoading, error } = useGemProducts();
  const [productCount, setProductCount] = useState<number>();
  const [totalPrice, setTotalPrice] = useState<number>();
  const [showPayment, setShowPayment] = useState<boolean>(false);
  const controller = createRef<PortOneController>();
  const {showErrorModal} = useModal();
  const [paymentId, setPaymentId] = useState<string>(createUniqueId());
  const { setGemCount } = usePortoneStore();

  const {handlePaymentComplete} = usePortone();

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
            onComplete={(result: unknown) => onCompletePayment(result as PaymentResponse)}
            onCancel={() => {
              console.log("onCancel Payment");
              setShowPayment(false);
            }}
        />
    );
  }

  return (
      <Layout.Default
          className="flex flex-1 flex-col"
          style={{backgroundColor: "white", paddingTop: insets.top }}
      >
        <GemStore.Header gemCount={gem?.totalGem ?? 0} />
        <ScrollView>
          <GemStore.Banner/>

          <RematchingTicket.ContentLayout>
            <View className="flex-1 flex flex-col px-[16px] mt-4">
              <View className="flex flex-col mb-2">
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
                                  setGemCount(product.totalGems);
                                  onPurchase({
                                    totalPrice: metadata.totalPrice,
                                    count: 1
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
      </Layout.Default>
  );
}
