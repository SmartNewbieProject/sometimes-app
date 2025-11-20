import { usePortone } from "@/src/features/payment/hooks/use-portone";
import { semanticColors } from '../../../src/shared/constants/colors';
import { type PaymentResponse, Product } from "@/src/features/payment/types";
import { RematchingTicket } from "@/src/features/payment/ui/rematching-ticket";
import { useModal } from "@/src/shared/hooks/use-modal";
import { Ticket, TicketDetails } from "@/src/widgets";
import { Selector } from "@/src/widgets/selector";
import { track } from "@amplitude/analytics-react-native";
import { useAuth } from "@features/auth";
import Layout from "@features/layout";
import Payment from "@features/payment";
import type { PortOneController } from "@portone/react-native-sdk";
import { Button, PalePurpleGradient, Text } from "@shared/ui";
import { createRef, useEffect, useState } from "react";
import { Alert, BackHandler, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { ui, services } = Payment;
const { PaymentView } = ui;
const { createUniqueId } = services;

const OPTIONS = {
  name: "연인 매칭권",
  price: 5900,
};

export default function RematchingTicketSellingScreen() {
  const insets = useSafeAreaInsets();
  const [productCount, setProductCount] = useState<number>();
  const [totalPrice, setTotalPrice] = useState<number>();
  const [showPayment, setShowPayment] = useState<boolean>(false);
  const controller = createRef<PortOneController>();
  const { showErrorModal } = useModal();
  const [paymentId, setPaymentId] = useState<string>(() => {
    return createUniqueId();
  });
  const { my } = useAuth();

  const { handlePaymentComplete } = usePortone();

  const onPurchase = async (metadata: {
    totalPrice: number;
    count: number;
  }) => {
    try {
      setTotalPrice(metadata.totalPrice);
      setProductCount(metadata.count);
      setShowPayment(true);
      track("Purchase_Count", {
        count: metadata.count,
        who: my,
        env: process.env.EXPO_PUBLIC_TRACKING_MODE,
      });
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
    track("Purchase_Done", {
      who: my,
      env: process.env.EXPO_PUBLIC_TRACKING_MODE,
    });
    handlePaymentComplete(result, {
      productCount,
      onError,
    });
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
    if (showPayment === false) {
      setProductCount(undefined);
      setTotalPrice(undefined);
    }
  }, [showPayment]);
  if (showPayment) {
    return (
      <PaymentView
        productType={Product.REMATCHING}
        ref={controller}
        productCount={productCount ?? 0}
        paymentId={paymentId}
        orderName={
          productCount ? `연인 재매칭권 x${productCount}` : "연인 재매칭권"
        }
        totalAmount={totalPrice ?? 0}
        productName="연인 재매칭권"
        onError={onError}
        onComplete={onCompletePayment}
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
      style={{ backgroundColor: semanticColors.surface.background, paddingTop: insets.top }}
    >
      <RematchingTicket.Header />
      <ScrollView>
        <RematchingTicket.Banner />

        <RematchingTicket.ContentLayout>
          <View className="flex-1 flex flex-col px-[32px]">
            <View className="flex flex-col my-2 mb-4">
              <Text weight="semibold" size="20" textColor="black">
                연인 재매칭권을 구매하면
              </Text>
              <Text weight="semibold" size="20" textColor="black">
                재매칭을 통해 이상형을 찾을 수 있어요
              </Text>
            </View>

            <View className="flex flex-col gap-y-4 mt-4 justify-center mb-auto">
              <Ticket.Provider name={OPTIONS.name} price={OPTIONS.price}>
                <Ticket.Item count={1} onOpenPayment={onPurchase} />
                <Ticket.Item
                  count={2}
                  discount={16.2}
                  onOpenPayment={onPurchase}
                />
                <Ticket.Item
                  count={3}
                  discount={27.2}
                  onOpenPayment={onPurchase}
                  hot
                />
                <Ticket.Item
                  count={5}
                  discount={29.2}
                  onOpenPayment={onPurchase}
                />
                <Ticket.Item
                  count={10}
                  discount={37.5}
                  onOpenPayment={onPurchase}
                />
              </Ticket.Provider>
            </View>
          </View>
        </RematchingTicket.ContentLayout>
      </ScrollView>
    </Layout.Default>
  );
}
