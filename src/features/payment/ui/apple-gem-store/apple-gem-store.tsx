import { Platform, StyleSheet, View } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';

// iOS 프로덕션에서만 expo-iap import (웹/안드로이드/개발환경에서는 스킵)
let useIAP: any;
let finishTransaction: any;
type Purchase = any;

if (Platform.OS === 'ios' && !__DEV__) {
	const iapModule = require('expo-iap');
	useIAP = iapModule.useIAP;
	finishTransaction = iapModule.finishTransaction;
}

import { Show, Text } from '@/src/shared/ui';
import { AppleGemStoreWidget } from '@/src/widgets/gem-store/apple';
import {
	type ExtendedProductPurchase,
	splitAndSortProducts,
} from '@/src/widgets/gem-store/utils/apple';

import { participateEvent } from '@/src/features/event/api';
import { useModal } from '@/src/shared/hooks/use-modal';
import { useGlobalLoading } from '@/src/shared/hooks/use-global-loading';
import { usePathname, useRouter } from 'expo-router';
import { useCurrentGem, useGemProducts, useGemMissions } from '../../hooks';
import { useAppleInApp } from '../../hooks/use-apple-in-app';
import { usePortoneStore } from '../../hooks/use-portone-store';
import { AppleFirstSaleCard } from '../first-sale-card/apple';
import { GemStore } from '../gem-store';
import { useMixpanel } from '@/src/shared/hooks/use-mixpanel';
import { devLogWithTag } from '@/src/shared/utils';
import { useTranslation } from 'react-i18next';
import { getAppleProductIds } from '../../constants/apple-product-ids';

function AppleGemStore() {
	const { t } = useTranslation();
	const router = useRouter();
	const pathname = usePathname();
	const { data: gem } = useCurrentGem();
	const { data: serverGemProducts, isLoading: isLoadingServer } = useGemProducts();
	const [purchasing, setPurchasing] = useState(false);
	const appleInAppMutation = useAppleInApp();
	const { showErrorModal } = useModal();
	const { showLoading, hideLoading } = useGlobalLoading();
	const { eventType } = usePortoneStore();
	const { paymentEvents, conversionEvents } = useMixpanel();
	const { missions } = useGemMissions();

	const productsRef = useRef<any[]>([]);
	const [isUsingFallback, setIsUsingFallback] = useState(false);
	const [fetchState, setFetchState] = useState<'idle' | 'primary' | 'fallback' | 'done'>('idle');
	const fetchStateRef = useRef(fetchState);
	fetchStateRef.current = fetchState;

	const handlePurchaseSuccess = useCallback(
		async (purchase: Purchase) => {
			setPurchasing(true);
			try {
				const extendedPurchase = purchase as ExtendedProductPurchase;
				const transactionReceipt = extendedPurchase?.purchaseToken;

				if (!transactionReceipt || transactionReceipt.trim() === '') {
					console.error('❌ Invalid transactionReceipt:', { transactionReceipt, purchase });
					showErrorModal(t('features.payment.ui.apple_gem_store.invalid_payment_info'), 'error');
					setPurchasing(false);
					return;
				}

				devLogWithTag('Apple IAP', 'Sending receipt');

				const serverResponse = await appleInAppMutation.mutateAsync(transactionReceipt);

				if (serverResponse.success) {
					await finishTransaction({ purchase, isConsumable: true });

					if (eventType) {
						try {
							await participateEvent(eventType);
							devLogWithTag('Payment Event', 'Event participation completed', eventType);
						} catch (error) {
							console.error('Event participation failed:', error);
						}
						const { clearEventType } = usePortoneStore.getState();
						clearEventType();
						router.replace(pathname as any);
					}
				} else {
					console.error('서버 검증 실패');
					showErrorModal(
						t('features.payment.ui.apple_gem_store.payment_verification_failed'),
						'error',
					);
				}
			} catch (error) {
				console.error('Failed to complete purchase:', error);
				const errorMessage = error instanceof Error ? error.message : 'Unknown Apple IAP error';
				conversionEvents.trackPaymentFailed('apple_iap', errorMessage);
				showErrorModal(
					t('features.payment.ui.payment_error.processing_error_message'),
					'announcement',
				);
			} finally {
				setPurchasing(false);
			}
		},
		[
			appleInAppMutation,
			eventType,
			pathname,
			paymentEvents,
			conversionEvents,
			showErrorModal,
			router,
		],
	);

	const handlePurchaseError = useCallback(
		(error: any) => {
			console.error('Purchase error:', error);
			const errorMessage = error?.message || 'Unknown error';
			const isCancellation = errorMessage.toLowerCase().includes('cancel');

			if (isCancellation) {
				conversionEvents.trackPaymentCancelled(errorMessage, 'apple_iap_dialog');
			} else {
				conversionEvents.trackPaymentFailed('apple_iap', errorMessage);
			}
			setPurchasing(false);
		},
		[conversionEvents],
	);

	const { connected, products, fetchProducts, requestPurchase } = useIAP
		? useIAP({
				onPurchaseSuccess: handlePurchaseSuccess,
				onPurchaseError: handlePurchaseError,
			})
		: {
				connected: false,
				products: [],
				fetchProducts: () => {},
				requestPurchase: () => {},
			};

	useEffect(() => {
		productsRef.current = products;
	}, [products]);

	const {
		primary: primaryProductIds,
		fallback: fallbackProductIds,
		expectedCount,
	} = getAppleProductIds();

	const { sale, normal } = products ? splitAndSortProducts(products) : { sale: [], normal: [] };

	useEffect(() => {
		if (!connected || fetchState !== 'idle') return;
		setFetchState('primary');
		fetchProducts({ skus: primaryProductIds, type: 'inapp' });

		const fallbackTimeout = setTimeout(() => {
			if (productsRef.current.length < expectedCount && fetchStateRef.current === 'primary') {
				devLogWithTag('Apple IAP', 'Primary products timeout, using fallback');
				conversionEvents.trackPaymentFailed('apple_iap', 'product_load_fallback:timeout');
				setIsUsingFallback(true);
				setFetchState('fallback');
				fetchProducts({ skus: fallbackProductIds, type: 'inapp' });
			}
		}, 5000);

		return () => clearTimeout(fallbackTimeout);
	}, [
		connected,
		fetchState,
		primaryProductIds,
		fallbackProductIds,
		expectedCount,
		fetchProducts,
		conversionEvents,
	]);

	useEffect(() => {
		if (fetchState !== 'primary' || !products || products.length === 0) return;

		const loadedCount = products.length;
		if (loadedCount >= expectedCount) {
			setFetchState('done');
			return;
		}

		devLogWithTag(
			'Apple IAP',
			`Product load incomplete: ${loadedCount}/${expectedCount}, using fallback`,
		);
		conversionEvents.trackPaymentFailed(
			'apple_iap',
			`product_load_fallback:${loadedCount}/${expectedCount}`,
		);
		setIsUsingFallback(true);
		setFetchState('fallback');
		fetchProducts({ skus: fallbackProductIds, type: 'inapp' });
	}, [fetchState, products, expectedCount, fallbackProductIds, fetchProducts, conversionEvents]);

	useEffect(() => {
		if (fetchState !== 'fallback' || !products || products.length === 0) return;
		setFetchState('done');
	}, [fetchState, products]);

	const handlePurchase = async (productId: string) => {
		if (purchasing) return;
		setPurchasing(true);
		try {
			await requestPurchase({
				request: {
					ios: { sku: productId },
					android: { skus: [productId] },
				},
				type: 'inapp',
			} as unknown as Parameters<typeof requestPurchase>[0]);
		} catch (error) {
			console.error('Purchase failed:', error);

			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			const isCancellation = errorMessage.toLowerCase().includes('cancel');

			if (isCancellation) {
				conversionEvents.trackPaymentCancelled(errorMessage, 'apple_iap_dialog');
			} else {
				conversionEvents.trackPaymentFailed('apple_iap', errorMessage);
			}

			setPurchasing(false);
		}
	};

	const isProductsLoading = isLoadingServer || !products || products?.length === 0;

	useEffect(() => {
		if (isProductsLoading) {
			showLoading();
		} else {
			hideLoading();
		}
		return () => hideLoading();
	}, [isProductsLoading]);

	const handleMissionPress = (mission: { navigateTo?: string }) => {
		if (mission.navigateTo) {
			router.push(mission.navigateTo as any);
		}
	};

	return (
		<GemStore.Layout
			gemCount={gem?.totalGem ?? 0}
			title={t('features.payment.ui.apple_gem_store.gem_purchase_title')}
			isLoading={purchasing}
			renderSaleCard={() => (
				<Show when={sale.length > 0}>
					<AppleFirstSaleCard
						gemProducts={sale}
						serverGemProducts={serverGemProducts}
						onOpenPurchase={handlePurchase}
					/>
				</Show>
			)}
			renderProductList={() => (
				<>
					<Show when={isProductsLoading}>
						<View style={styles.loadingContainer}>
							<Text>{t('features.payment.ui.apple_gem_store.loading_gem_products')}</Text>
						</View>
					</Show>

					<Show when={!isProductsLoading && normal && normal?.length > 0}>
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
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
});

export default AppleGemStore;
