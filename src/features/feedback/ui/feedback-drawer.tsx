import colors from '@/src/shared/constants/colors';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
	Dimensions,
	Keyboard,
	Modal,
	Platform,
	StyleSheet,
	TouchableWithoutFeedback,
	View,
} from 'react-native';
import Animated, {
	Easing,
	cancelAnimation,
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FeedbackLetterContent } from './feedback-letter-content';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = Platform.OS === 'web'
	? Math.min(700, SCREEN_HEIGHT * 0.88)
	: SCREEN_HEIGHT * 0.88;
const ANIMATION_DURATION = 300;

type FeedbackDrawerProps = {
	visible: boolean;
	onClose: () => void;
	onSuccess: () => void;
	onError?: () => void;
};

// ─── 웹용 (CSS transition, Portal 내부에서 렌더링 — body/ScrollView 간섭 없음) ──
function WebFeedbackDrawer({ visible, onClose, onSuccess, onError }: FeedbackDrawerProps) {
	const insets = useSafeAreaInsets();
	const [isMounted, setIsMounted] = useState(false);
	const [animState, setAnimState] = useState<'closed' | 'opening' | 'open' | 'closing'>('closed');

	useEffect(() => {
		if (visible && !isMounted) {
			setIsMounted(true);
			setAnimState('opening');
			requestAnimationFrame(() => {
				requestAnimationFrame(() => setAnimState('open'));
			});
		}
	}, [visible, isMounted]);

	const handleClose = useCallback(() => {
		setAnimState('closing');
		setTimeout(() => {
			setIsMounted(false);
			setAnimState('closed');
			onClose();
		}, ANIMATION_DURATION);
	}, [onClose]);

	if (!isMounted) return null;

	const isOpen = animState === 'open';

	// Portal host가 이미 absoluteFill로 루트에 배치되므로 flex 컨테이너로만 사용
	return (
		<View style={styles.container}>
			<TouchableWithoutFeedback onPress={handleClose}>
				<View
					style={[
						styles.backdrop,
						{
							opacity: isOpen ? 1 : 0,
							transition: `opacity ${ANIMATION_DURATION}ms ease-out`,
						} as any,
					]}
				/>
			</TouchableWithoutFeedback>

			<View
				style={[
					styles.sheet,
					{ paddingBottom: insets.bottom + 16 },
					{
						transform: isOpen ? 'translateY(0%)' : 'translateY(100%)',
						transition: `transform ${ANIMATION_DURATION}ms cubic-bezier(0.33, 1, 0.68, 1)`,
					} as any,
				]}
			>
				<View style={styles.handleContainer}>
					<View style={styles.handle} />
				</View>
				<FeedbackLetterContent onSuccess={onSuccess} onError={onError} />
			</View>
		</View>
	);
}

// ─── 네이티브용 (Reanimated) ─────────────────────────────────────────────────
function NativeFeedbackDrawer({ visible, onClose, onSuccess, onError }: FeedbackDrawerProps) {
	const insets = useSafeAreaInsets();
	const [isModalVisible, setIsModalVisible] = useState(false);
	const translateY = useSharedValue(SHEET_HEIGHT);
	const backdropOpacity = useSharedValue(0);

	const isClosingRef = useRef(false);
	const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const animateCloseCallbackRef = useRef<(() => void) | null>(null);

	const animateOpen = useCallback(() => {
		translateY.value = withTiming(0, {
			duration: ANIMATION_DURATION,
			easing: Easing.out(Easing.cubic),
		});
		backdropOpacity.value = withTiming(1, { duration: ANIMATION_DURATION });
	}, [translateY, backdropOpacity]);

	const forceCleanup = useCallback(() => {
		if (closeTimeoutRef.current) {
			clearTimeout(closeTimeoutRef.current);
			closeTimeoutRef.current = null;
		}
		isClosingRef.current = false;
		cancelAnimation(translateY);
		cancelAnimation(backdropOpacity);
		translateY.value = SHEET_HEIGHT;
		backdropOpacity.value = 0;
		setIsModalVisible(false);
	}, [translateY, backdropOpacity]);

	const onAnimationComplete = useCallback(() => {
		if (closeTimeoutRef.current) {
			clearTimeout(closeTimeoutRef.current);
			closeTimeoutRef.current = null;
		}
		isClosingRef.current = false;
		animateCloseCallbackRef.current?.();
	}, []);

	const animateClose = useCallback(
		(callback: () => void) => {
			if (isClosingRef.current) return;
			isClosingRef.current = true;
			animateCloseCallbackRef.current = callback;
			Keyboard.dismiss();

			closeTimeoutRef.current = setTimeout(() => {
				closeTimeoutRef.current = null;
				if (isClosingRef.current) {
					forceCleanup();
					callback();
				}
			}, ANIMATION_DURATION + 100);

			translateY.value = withTiming(SHEET_HEIGHT, {
				duration: ANIMATION_DURATION - 50,
				easing: Easing.in(Easing.cubic),
			});
			backdropOpacity.value = withTiming(
				0,
				{ duration: ANIMATION_DURATION - 50 },
				() => { runOnJS(onAnimationComplete)(); },
			);
		},
		[translateY, backdropOpacity, forceCleanup, onAnimationComplete],
	);

	useEffect(() => {
		if (visible) {
			isClosingRef.current = false;
			translateY.value = SHEET_HEIGHT;
			backdropOpacity.value = 0;
			setIsModalVisible(true);
			const timer = setTimeout(animateOpen, 16);
			return () => clearTimeout(timer);
		}
		forceCleanup();
	}, [visible, animateOpen, translateY, backdropOpacity, forceCleanup]);

	useEffect(() => {
		return () => {
			if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
		};
	}, []);

	const handleClose = useCallback(() => {
		animateClose(() => {
			setIsModalVisible(false);
			onClose();
		});
	}, [animateClose, onClose]);

	const backdropAnimStyle = useAnimatedStyle(() => ({ opacity: backdropOpacity.value }));
	// translateY만 담당 — 높이는 styles.sheet에서 고정
	const sheetAnimStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: translateY.value }],
	}));

	if (!isModalVisible) return null;

	return (
		<Modal
			transparent
			visible={isModalVisible}
			animationType="none"
			onRequestClose={handleClose}
			statusBarTranslucent
		>
			<View style={styles.container}>
				<TouchableWithoutFeedback onPress={handleClose}>
					<Animated.View style={[styles.backdrop, backdropAnimStyle]} />
				</TouchableWithoutFeedback>

				{/* sheet 스타일을 Animated.View에 직접 적용 — 높이가 확정되어야 내부 ScrollView가 스크롤됨 */}
				<Animated.View
					style={[styles.sheet, sheetAnimStyle, { paddingBottom: insets.bottom + 16 }]}
				>
					<View style={styles.handleContainer}>
						<View style={styles.handle} />
					</View>
					<FeedbackLetterContent onSuccess={onSuccess} onError={onError} />
				</Animated.View>
			</View>
		</Modal>
	);
}

// ─── 플랫폼 분기 ─────────────────────────────────────────────────────────────
export function FeedbackDrawer(props: FeedbackDrawerProps) {
	if (Platform.OS === 'web') {
		return <WebFeedbackDrawer {...props} />;
	}
	return <NativeFeedbackDrawer {...props} />;
}

// ─── 공통 스타일 ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'flex-end',
	},
	backdrop: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	sheet: {
		width: '100%',
		height: SHEET_HEIGHT,      // maxHeight → height 고정: ScrollView가 스크롤 영역을 정확히 계산
		backgroundColor: colors.white,
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		...Platform.select({
			ios: {
				shadowColor: '#000',
				shadowOffset: { width: 0, height: -3 },
				shadowOpacity: 0.12,
				shadowRadius: 8,
			},
			android: { elevation: 20 },
		}),
	},
	handleContainer: {
		alignItems: 'center',
		paddingTop: 12,
		paddingBottom: 4,
	},
	handle: {
		width: 40,
		height: 4,
		backgroundColor: '#E0E0E0',
		borderRadius: 2,
	},
});
