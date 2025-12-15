import { usePortone } from "@/src/features/payment/hooks/use-portone";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { type PaymentResponse, Product } from "@/src/features/payment/types";
import { RematchingTicket } from "@/src/features/payment/ui/rematching-ticket";
import { useModal } from "@/src/shared/hooks/use-modal";
import { Ticket, TicketDetails } from "@/src/widgets";
import { Selector } from "@/src/widgets/selector";
import { track } from "@/src/shared/libs/amplitude-compat";
import { useAuth } from "@features/auth";
import Layout from "@features/layout";
import Payment from "@features/payment";
import type { PortOneController } from "@portone/react-native-sdk";
import { Button, PalePurpleGradient, Text } from "@shared/ui";
import { createRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, BackHandler, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import i18n from "@shared/libs/i18n";
const { ui, services } = Payment;
const { PaymentView } = ui;
const { createUniqueId } = services;

const OPTIONS = {
  name: i18n.t("apps.purchase.tickets.rematch.rematch_ticket_name"),
  price: 5900,
};

export default function RematchingTicketSellingScreen() {
  const { t } = useTranslation();
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
      track(t("apps.purchase.rematch.purchase_count_tracking"), {
        count: metadata.count,
        who: my,
        env: process.env.EXPO_PUBLIC_TRACKING_MODE,
      });
    } catch (error) {
      Alert.alert(t("global.error"), t("apps.purchase.tickets.rematch.error_alert_message"));
      setShowPayment(false);
    }
  };

  const onError = async (error: unknown) => {
    console.error(t("apps.purchase.tickets.rematch.payment_error_console"), error);
    const id = createUniqueId();
    console.debug(t("apps.purchase.tickets.rematch.payment_error_debug"), id);
    setPaymentId(id);
    setShowPayment(false);
    showErrorModal(
      error instanceof Error
        ? error.message
        : t("apps.purchase.tickets.rematch.payment_error_modal"),
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
          productCount
            ? t("apps.purchase.tickets.rematch.order_name_multiple", {
                productCount,
              })
            : t("apps.purchase.tickets.rematch.order_name_single")
        }
        totalAmount={totalPrice ?? 0}
        productName={t("apps.purchase.tickets.rematch.order_name_single")}
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
                {t("apps.purchase.tickets.rematch.title_1")}
              </Text>
              <Text weight="semibold" size="20" textColor="black">
                {t("apps.purchase.tickets.rematch.title_2")}
              </Text>
            </View>

            <View className="flex flex-col gap-y-4 mt-4 justify-center mb-auto">
              <Ticket.Provider
                name={t("apps.purchase.tickets.rematch.rematch_ticket_name")}
                price={OPTIONS.price}
              >
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
