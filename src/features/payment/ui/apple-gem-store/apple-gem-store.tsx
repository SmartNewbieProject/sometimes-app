import { semanticColors } from '@/src/shared/constants/semantic-colors';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// iOS에서만 expo-iap import (웹/안드로이드에서는 스킵)
let useIAP: any;
let finishTransaction: any;
type Purchase = any;

if (Platform.OS === 'ios') {
	const iapModule = require('expo-iap');
	useIAP = iapModule.useIAP;
	finishTransaction = iapModule.finishTransaction;
}

import Layout from '@/src/features/layout';
import { useScrollIndicator } from '@/src/shared/hooks';
import { ScrollDownIndicator, Show, Text } from '@/src/shared/ui';
import { AppleGemStoreWidget } from '@/src/widgets/gem-store/apple';
import {
	type ExtendedProductPurchase,
	splitAndSortProducts,
} from '@/src/widgets/gem-store/utils/apple';

import { participateEvent } from '@/src/features/event/api';
import { useModal } from '@/src/shared/hooks/use-modal';
import { usePathname, useRouter } from 'expo-router';
import paymentApis from '../../api';
import { useCurrentGem, useGemProducts } from '../../hooks';
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
	const insets = useSafeAreaInsets();
	const { showIndicator, handleScroll, scrollViewRef } = useScrollIndicator();
	const pathname = usePathname();
	const { data: gem } = useCurrentGem();
	const { data: serverGemProducts, isLoading: isLoadingServer } = useGemProducts();
	const [purchasing, setPurchasing] = useState(false);
	const appleInAppMutation = useAppleInApp();
	const { showErrorModal } = useModal();
	const { eventType } = usePortoneStore();
	const { paymentEvents, conversionEvents } = useMixpanel();

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

	const { sale, normal } = products ? splitAndSortProducts(products, t) : { sale: [], normal: [] };

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

	return (
		<Layout.Default
			style={[
				styles.layoutContainer,
				{ backgroundColor: semanticColors.surface.background, paddingTop: insets.top },
			]}
		>
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
					<View style={styles.contentContainer}>
						<View style={styles.headerSection}>
							<View style={styles.saleCardContainer}>
								<Show when={sale.length > 0}>
									<AppleFirstSaleCard
										gemProducts={sale}
										serverGemProducts={serverGemProducts}
										onOpenPurchase={handlePurchase}
									/>
								</Show>
							</View>

							<Text weight="semibold" size="20" textColor="black">
								{t('features.payment.ui.apple_gem_store.gem_purchase_title')}
							</Text>
						</View>

						<View style={styles.productListContainer}>
							<Show when={isLoadingServer || !products || products?.length === 0}>
								<View style={styles.loadingContainer}>
									<Text>{t('features.payment.ui.apple_gem_store.loading_gem_products')}</Text>
								</View>
							</Show>

							<Show when={!isLoadingServer && normal && normal?.length > 0}>
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
						</View>
					</View>
				</View>
			</ScrollView>
			<ScrollDownIndicator visible={showIndicator} />

			{/* 화면 전체 로딩 UI */}
			<Show when={purchasing}>
				<View style={styles.loadingOverlay}>
					<ActivityIndicator size="large" color="#fff" />
				</View>
			</Show>
		</Layout.Default>
	);
}

const styles = StyleSheet.create({
	loadingOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0,0,0,0.5)',
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 9999,
	},
	layoutContainer: {
		flex: 1,
		flexDirection: 'column',
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
	contentContainer: {
		flex: 1,
		flexDirection: 'column',
		paddingHorizontal: 16,
		marginTop: 16,
	},
	headerSection: {
		flexDirection: 'column',
		marginBottom: 8,
	},
	saleCardContainer: {
		marginBottom: 30,
	},
	productListContainer: {
		flexDirection: 'column',
		gap: 16,
		justifyContent: 'center',
		marginBottom: 'auto',
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
});

export default AppleGemStore;
