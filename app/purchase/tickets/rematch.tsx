import { Button, Header, PalePurpleGradient, Text } from '@shared/ui';
import Layout from '@features/layout';
import { Alert, BackHandler, Image, View } from 'react-native';
import { ImageResources, imageUtils } from '@/src/shared/libs';
import { Selector } from '@/src/widgets/selector';
import { createRef, useEffect, useState } from 'react';
import Payment from '@features/payment';
import type { PortOneController } from '@portone/react-native-sdk';
import type { PaymentResponse } from '@/src/types/payment';
import { useModal } from '@/src/shared/hooks/use-modal';
import { Product } from '@/src/features/payment/types';
import { router } from 'expo-router';
import { usePortone } from '@/src/features/payment/hooks/use-portone';

const { ui, apis } = Payment;
const { PriceDisplay, PaymentView } = ui;

const PRICE = 4000;

export default function RematchingTicketSellingScreen() {
	const [productCount, setProductCount] = useState<number>();
	const [totalPrice, setTotalPrice] = useState<number>();
	const [salesPercent, setSalesPercent] = useState<number>(0);
	const [showPayment, setShowPayment] = useState<boolean>(false);
	const controller = createRef<PortOneController>();
	const rawPrice = productCount ? productCount * PRICE : 0;
	const { showErrorModal, showModal } = useModal();
	const [paymentId, setPaymentId] = useState<string>(() => {
		const { nanoid } = require('nanoid');
		return nanoid();
	});

  const { initialize, handlePaymentComplete } = usePortone();

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
		const discountedPrice = Math.floor((rawAmount * (100 - discount)) / 100);
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

	const onError = async (error: unknown) => {
		console.error('결제 오류:', error);
		const { nanoid } = await import('nanoid');
		const id = nanoid();
		console.debug('결제 오류 발생 시 새로운 orderId 생성:', id);
		setPaymentId(id);
		setShowPayment(false);
		showErrorModal(error instanceof Error ? error.message : '결제 처리 중 오류가 발생했습니다.', 'error');
	}

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

  useEffect(() => {
    initialize(process.env.EXPO_PUBLIC_IMP as string);
  }, []);

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
		<Layout.Default className="flex h-full flex-col">
			<PalePurpleGradient />
			<Header.Container>
				<Header.LeftContent>
					<Header.LeftButton onPress={router.back} visible />
				</Header.LeftContent>
			</Header.Container>

			<View className="flex-1 flex flex-col px-4 pb-4">
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

				<View className="flex flex-col gap-y-3 mb-2">
					<Text size="sm" textColor="pale-purple">
						연인 매칭권 결제
					</Text>
					<Text size="md" textColor="black" weight="semibold">
						구매하실 상품을 선택해주세요
					</Text>
				</View>

				<View className="flex flex-col gap-y-2 justify-center mb-auto">
					<Selector
						value={productCount?.toString()}
						options={purchaseOptions}
						onChange={onChangeItem}
						direction="vertical"
						buttonProps={{
							size: 'md',
						}}
						buttonStyle={{
							width: '100%',
							flexDirection: 'row',
						}}
					/>
				</View>

				<View className="mt-4">
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
						{!productCount ? '상품을 선택해주세요.' : '결제하기'}
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
