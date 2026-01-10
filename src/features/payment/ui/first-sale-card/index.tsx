import { useAuth } from '@/src/features/auth';
import { EventType } from '@/src/features/event/types';
import colors from '@/src/shared/constants/colors';
import { useMixpanel } from '@/src/shared/hooks';
import { useTimer } from '@/src/shared/hooks/use-timer';
import { formatTime } from '@/src/shared/libs';
import { PAYMENT_KEYS } from '@/src/shared/libs/locales/keys';
import { GlowingCard, Show, Text } from '@/src/shared/ui';
import { GemStoreWidget } from '@/src/widgets';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, View } from 'react-native';
import Animated, {
	Easing,
	ReduceMotion,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming,
} from 'react-native-reanimated';
import { FIRST_SALE_PRODUCTS } from '../../constants/first-sale-products';
import { usePortoneStore } from '../../hooks/use-portone-store';
import { useFirstSaleEvents } from '../../hooks/useFirstSaleEvents';
import type { GemMetadata } from '../../types';

type FirstSaleCardProps = {
	onOpenPayment: (gemProduct: GemMetadata) => void;
};

export const FirstSaleCard = ({ onOpenPayment }: FirstSaleCardProps) => {
	const { totalExpiredAt, show, setShow, event16Expired } = useFirstSaleEvents();
	const { seconds } = useTimer(totalExpiredAt, {
		autoStart: !!totalExpiredAt,
		onComplete: () => {
			setShow(false);
		},
	});
	const { setEventType } = usePortoneStore();
	const { my } = useAuth();
	const { paymentEvents } = useMixpanel();

	const translateYAnim = useSharedValue(0);
	const { t, i18n } = useTranslation();
	const isJapanese = i18n.language === 'ja';

	useEffect(() => {
		translateYAnim.value = withRepeat(
			withTiming(-5, {
				duration: 800,
				easing: Easing.inOut(Easing.ease),
				reduceMotion: ReduceMotion.System,
			}),
			-1,
			true,
		);
	}, []);

	const animatedStyle = useAnimatedStyle(() => {
		return {
			transform: [{ translateY: translateYAnim.value }],
		};
	});

	if (!show) return null;
	if (!FIRST_SALE_PRODUCTS.SALE_16) return null;

	return (
		<GlowingCard>
			<View style={styles.headerRow}>
				<Text textColor="black" weight="bold" size="20">
					{t(PAYMENT_KEYS.uiAppleFirstSaleCardTimeSaleTitle)}
				</Text>
				<Text weight="bold" size="20" style={styles.timerText}>
					{formatTime(seconds)}
				</Text>
			</View>

			<View style={styles.paymentList}>
				<View style={styles.saleMiho}>
					<View style={{ position: 'relative' }}>
						<Image
							source={require('@/assets/images/gem-store-fox-sale.webp')}
							style={{ width: 113, height: 113 }}
							resizeMode="contain"
						/>
						<Animated.View style={[styles.bubble, animatedStyle]}>
							<Text
								textColor="purple"
								weight="semibold"
								style={[styles.bubbleTextFirst, isJapanese ? styles.bubbleTextJa : {}]}
							>
								{t(PAYMENT_KEYS.uiAppleFirstSaleCardCheerMessage)}
							</Text>
							<Text
								textColor="purple"
								weight="semibold"
								style={[styles.bubbleText, isJapanese ? styles.bubbleTextJa : {}]}
							>
								{t(PAYMENT_KEYS.uiAppleFirstSaleCardNewMemberDiscount)}
							</Text>
							<View style={styles.bubbleTail} />
						</Animated.View>
					</View>
				</View>

				<Show when={!event16Expired}>
					<GemStoreWidget.Item
						gemProduct={FIRST_SALE_PRODUCTS.SALE_16}
						onOpenPayment={(metadata) => {
							paymentEvents.trackItemSelected('gems', FIRST_SALE_PRODUCTS.SALE_16.totalGems);
							setEventType(EventType.FIRST_SALE_16);
							onOpenPayment(metadata);
						}}
						hot={false}
					/>
				</Show>
			</View>
		</GlowingCard>
	);
};

const styles = StyleSheet.create({
	headerRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	timerText: {
		color: '#DC2626',
	},
	paymentList: {
		flexDirection: 'column',
		position: 'relative',
		alignItems: 'center',
		rowGap: 4,
		marginTop: 100,
	},
	saleMiho: {
		position: 'absolute',
		top: -90,
		width: '100%',
		left: 0,
		zIndex: 1,
	},
	bubble: {
		paddingVertical: 11,
		paddingHorizontal: 16,
		backgroundColor: colors.white,
		borderRadius: 20,
		textDecorationColor: colors.primaryPurple,
		display: 'flex',
		flexDirection: 'column',
		position: 'absolute',
		left: 113,
		top: 0,
	},
	bubbleTextFirst: {
		fontSize: 15,
		marginBottom: 4,
	},
	bubbleText: {
		fontSize: 15,
	},
	bubbleTextJa: {
		fontSize: 13,
	},
	bubbleTail: {
		position: 'absolute',
		bottom: 20,
		left: -8,
		width: 0,
		height: 0,
		borderTopWidth: 8,
		borderBottomWidth: 8,
		borderRightWidth: 8,
		borderTopColor: 'transparent',
		borderBottomColor: 'transparent',
		borderRightColor: colors.white,
	},
});
