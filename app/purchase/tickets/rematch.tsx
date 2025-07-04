import {Button, PalePurpleGradient, Text} from '@shared/ui';
import Layout from '@features/layout';
import {Alert, BackHandler, Platform, View} from 'react-native';
import {Selector} from '@/src/widgets/selector';
import {createRef, useEffect, useState} from 'react';
import Payment from '@features/payment';
import type {PortOneController} from '@portone/react-native-sdk';
import {useModal} from '@/src/shared/hooks/use-modal';
import {type PaymentResponse, Product} from '@/src/features/payment/types';
import {usePortone} from '@/src/features/payment/hooks/use-portone';
import {RematchingTicket} from '@/src/features/payment/ui/rematching-ticket';
import {Ticket, TicketDetails} from '@/src/widgets';

const {ui, services} = Payment;
const {PaymentView} = ui;
const {createUniqueId} = services;

const OPTIONS = {
  name: '연인 즉시 매칭권',
  price: 5900,
};

export default function RematchingTicketSellingScreen() {
  const [productCount, setProductCount] = useState<number>();
  const [totalPrice, setTotalPrice] = useState<number>();
  const [showPayment, setShowPayment] = useState<boolean>(false);
  const controller = createRef<PortOneController>();
  const {showErrorModal} = useModal();
  const [paymentId, setPaymentId] = useState<string>(() => {
    return createUniqueId();
  });

  const {handlePaymentComplete} = usePortone();

  const onPurchase = async (metadata: { totalPrice: number; count: number }) => {
    try {
      setTotalPrice(metadata.totalPrice);
      setProductCount(metadata.count);
      setShowPayment(true);
    } catch (error) {
      Alert.alert('오류', '결제 처리 중 오류가 발생했습니다.');
      setShowPayment(false);
    }
  };

  const onError = async (error: unknown) => {
    console.error('결제 오류:', error);
    const id = createUniqueId();
    console.debug('결제 오류 발생 시 새로운 orderId 생성:', id);
    setPaymentId(id);
    setShowPayment(false);
    showErrorModal(
        error instanceof Error ? error.message : '결제 처리 중 오류가 발생했습니다.',
        'error',
    );
  };

  const onCompletePayment = (result: PaymentResponse) => {
    setShowPayment(false);
    handlePaymentComplete(result, {
      productCount,
      onError,
    });
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (controller.current?.canGoBack) {
        controller.current.webview?.goBack();
        return true;
      }
      return false;
    });
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
            orderName={productCount ? `연인 재매칭권 x${productCount}` : '연인 재매칭권'}
            totalAmount={totalPrice ?? 0}
            productName="연인 재매칭권"
            onError={onError}
            onComplete={onCompletePayment}
            onCancel={() => {
              console.log('onCancel Payment');
              setShowPayment(false);
            }}
        />
    );
  }

  return (
      <Layout.Default className="flex h-full flex-col" style={{backgroundColor: '#DECDF9'}}>
        {Platform.OS === 'ios' && <View style={{marginTop: 56}}/>}
        {Platform.OS === 'android' && <View style={{marginTop: 0}}/>}
        <PalePurpleGradient/>
        <RematchingTicket.Header/>
        <RematchingTicket.Banner/>

        <RematchingTicket.ContentLayout>
          <View className="flex-1 flex flex-col px-[32px] pb-4">
            <View className="flex flex-col my-2 mb-4">
              <Text weight="semibold" size="20" textColor="black">
                연인 재매칭권을 구매하면
              </Text>
              <Text weight="semibold" size="20" textColor="black">
                재매칭을 통해 이상형을 찾을 수 있어요
              </Text>
            </View>

            <View className="flex flex-col gap-y-3 mb-2">
              <Text size="sm" textColor="pale-purple">
                연인 매칭권 결제
              </Text>
            </View>

            <View className="flex flex-col gap-y-4 justify-center mb-auto">
              <Ticket.Provider name={OPTIONS.name} price={OPTIONS.price}>
                <Ticket.Item count={1} onOpenPayment={onPurchase}/>
                <Ticket.Item count={2} discount={16.2} onOpenPayment={onPurchase}/>
                <Ticket.Item count={3} discount={27.2} onOpenPayment={onPurchase} hot/>
                <Ticket.Item count={5} discount={29.2} onOpenPayment={onPurchase}/>
                <Ticket.Item count={10} discount={37.5} onOpenPayment={onPurchase}/>
              </Ticket.Provider>
            </View>
          </View>
        </RematchingTicket.ContentLayout>
      </Layout.Default>
  );
}
