import { Button, PalePurpleGradient, Text } from "@shared/ui";
import Layout from "@features/layout";
import { Alert, BackHandler, Image, Platform, View } from "react-native";
import { ImageResources, imageUtils, tryCatch } from "@/src/shared/libs";
import { Selector } from "@/src/widgets/selector";
import { createRef, useEffect, useMemo, useState } from "react";
import Payment from '@features/payment';
import { PortOneController } from "@portone/react-native-sdk";
import { PaymentResponse } from "@/src/types/payment";
import { useModal } from "@/src/shared/hooks/use-modal";
import { Product } from "@/src/features/payment/types";
import { router } from "expo-router";

const { ui, apis } = Payment;
const { PriceDisplay, PaymentView } = ui;


const PRICE = 1000;

export default function RematchingTicketSellingScreen() {
  const [productCount, setProductCount] = useState<number>();
  const [totalPrice, setTotalPrice] = useState<number>();
  const [salesPercent, setSalesPercent] = useState<number>(0);
  const [showPayment, setShowPayment] = useState<boolean>(false);
  const controller = createRef<PortOneController>();
  const rawPrice = productCount ? productCount * PRICE : 0;
  const { showErrorModal, showModal } = useModal();
  const paymentId = useMemo(() => Date.now().toString(16), []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (controller.current?.canGoBack) {
          controller.current.webview?.goBack();
          return true;
        }
        return false;
      },
    );
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    if (showPayment === false) {
      // 결제 정보 초기화
      setProductCount(undefined);
      setTotalPrice(undefined);
      setSalesPercent(0);

      // 결제 모듈 초기화
      if (Platform.OS === 'web') {
        // 웹 환경에서는 IMP 객체 초기화 상태 리셋
        if (typeof window !== 'undefined' && window.IMP) {
          // 웹 환경에서 IMP 객체 재초기화
          const merchantID = process.env.EXPO_PUBLIC_IMP || 'imp00000000';
          Payment.web.initializeIMP(merchantID);
        }
      } else {
        // 네이티브 환경에서는 controller 초기화
        // controller는 createRef로 생성되어 있으므로 새로운 참조가 자동으로 생성됨
      }
    }
  }, [showPayment]);

  const calculateDiscount = (count: number): number => {
    if (count === 3) return 10;
    if (count === 5) return 15;
    if (count === 10) return 25;
    return 0;
  };

  const onChangeItem = (value: string) => {
    const count = Number(value);
    setProductCount(count);

    const discount = calculateDiscount(count);
    setSalesPercent(discount);

    const rawAmount = count * PRICE;
    const discountedPrice = Math.floor(rawAmount * (100 - discount) / 100);
    setTotalPrice(discountedPrice);
  };

  const onPurchase = async () => {
    if (!totalPrice || !productCount) return;

    try {
      setShowPayment(true);
    } catch (error) {
      Alert.alert('오류', '결제 처리 중 오류가 발생했습니다.');
      setShowPayment(false);
    }
  };

  const onCompletePayment = (result: PaymentResponse) => {
    console.log({ result });
    setShowPayment(false);
    if (result?.error_msg) {
      console.error({
        code: result.error_code,
        message: result.error_msg,
      });
      showErrorModal(result.error_msg, 'error');
    }

    tryCatch(async () => {
      await apis.pay({ impUid: result.imp_uid, merchantUid: result.merchant_uid });

      // 결제 성공 정보 - 현재는 모달로 처리하고 있지만 추후 페이지 리다이렉션으로 처리할 수 있음

      showModal({
        title: "구매 완료",
        children: (
          <View className="flex flex-col gap-y-1">
            <Text textColor="pale-purple" weight="semibold">연인 재매칭권 {productCount} 개 구매를 완료했어요</Text>
            <Text textColor="pale-purple" weight="semibold">결제가 완료되었으니 홈으로 이동할게요</Text>
          </View>
        ),
        primaryButton: {
          text: "홈으로 이동",
          onClick: () => router.push('/home'),
        }
      });
      // router.navigate({
        // pathname: '/purchase/complete',
        // params: payload,
      // });
    }, ({ error }) => {
      showErrorModal(error, "error");
    });
  }

  if (showPayment) {
    return (
      <PaymentView
        productType={Product.REMATCHING}
        ref={controller}
        productCount={productCount!}
        paymentId={paymentId}
        orderName={"연인 재매칭권 x" + productCount}
        totalAmount={totalPrice!}
        productName="연인 재매칭권"
        onError={(error) => {
          console.error(error);
          console.log('onError Payment');
          setShowPayment(false)
        }}
        onComplete={onCompletePayment}
        onCancel={() => {
          console.log('onCancel Payment');
          setShowPayment(false)
        }}
      />
    );
  }

  return (
    <Layout.Default className="flex h-full flex-col">
      <PalePurpleGradient />

      <View className="h-full flex flex-col px-4">
        <Image
          source={{ uri: imageUtils.get(ImageResources.TICKET) }}
          style={{ width: 81, height: 81 }}
        />

        <View className="flex flex-col my-2 mb-4">
          <Text weight="semibold" size="20" textColor="black">
            연인 재매칭권을 구매하면
          </Text>
          <Text weight="semibold" size="20" textColor="black">
            재매칭을 통해 이상형을 찾을 수 있어요
          </Text>
        </View>

        <View className="flex flex-col gap-y-3 mb-4">
          <Text size="sm" textColor="pale-purple">
          연인 매칭권 결제
          </Text>
          <Text size="md" textColor="black" weight="semibold">
            구매하실 상품을 선택해주세요
          </Text>
        </View>

        <View className="flex flex-1 flex-col gap-y-2 justify-center">
          <Selector
            value={productCount?.toString()}
            options={purchaseOptions}
            onChange={onChangeItem}
            direction="vertical"
            buttonClassName="w-[300px]"
            buttonProps={{
              size: "sm"
            }}
          />
        </View>

        <View className="mb-4">
          {!!totalPrice && (
            <View className="w-full flex flex-row justify-end my-1.5">
              <PriceDisplay
                totalPrice={totalPrice}
                originalPrice={rawPrice}
                salesPercent={salesPercent}
              />
            </View>
          )}

          <Button
            disabled={!productCount}
            className="w-full"
            variant="primary"
            onPress={onPurchase}
          >
            {!productCount ? "상품을 선택해주세요." : "결제하기"}
          </Button>
        </View>

      </View>
    </Layout.Default>
  );
}

const purchaseOptions = [
  { label: '연인 매칭권 x1', value: '1' },
  { label: '연인 매칭권 x3', value: '3' },
  { label: '연인 매칭권 x5', value: '5' },
  { label: '연인 매칭권 x10', value: '10' },
];
