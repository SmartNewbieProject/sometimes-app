import colors from '@/src/shared/constants/colors';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
	BackHandler,
	Dimensions,
	Keyboard,
	Platform,
	StyleSheet,
	TouchableWithoutFeedback,
	View,
} from 'react-native';
import Animated, {
	Easing,
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FeedbackLetterContent } from './feedback-letter-content';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = Platform.OS === 'web'
	? Math.min(600, SCREEN_HEIGHT * 0.75)
	: SCREEN_HEIGHT * 0.75;
const ANIMATION_DURATION = 300;

// visible prop 제거 — 마운트 = 열림, onClose() 호출 시 부모가 언마운트
type FeedbackDrawerProps = {
	onClose: () => void;
	onSuccess: () => void;
	onError?: () => void;
};

// ─── 웹용 ────────────────────────────────────────────────────────────────────
function WebFeedbackDrawer({ onClose, onSuccess, onError }: FeedbackDrawerProps) {
	const insets = useSafeAreaInsets();
	const [isOpen, setIsOpen] = useState(false);

	// 마운트 직후 open 애니메이션
	useEffect(() => {
		const raf1 = requestAnimationFrame(() => {
			const raf2 = requestAnimationFrame(() => setIsOpen(true));
			return () => cancelAnimationFrame(raf2);
		});
		return () => cancelAnimationFrame(raf1);
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	const handleClose = useCallback(() => {
		setIsOpen(false);
		setTimeout(onClose, ANIMATION_DURATION);
	}, [onClose]);

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
					{ paddingBottom: Math.max(0, insets.bottom - 42) },
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

// ─── 네이티브용 ───────────────────────────────────────────────────────────────
// 마운트 = 자동 열림, 오버레이/뒤로가기 → 닫기 애니메이션 → onClose() → 부모가 언마운트
// visible/isMounted 같은 중간 상태 없음 → "열렸다 닫힘" 버그 원천 차단
function NativeFeedbackDrawer({ onClose, onSuccess, onError }: FeedbackDrawerProps) {
	const insets = useSafeAreaInsets();
	const translateY = useSharedValue(SHEET_HEIGHT);
	const backdropOpacity = useSharedValue(0);
	const isClosingRef = useRef(false);
	const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// 마운트 시 한 번만 열림 애니메이션
	useEffect(() => {
		const timer = setTimeout(() => {
			translateY.value = withTiming(0, {
				duration: ANIMATION_DURATION,
				easing: Easing.out(Easing.cubic),
			});
			backdropOpacity.value = withTiming(1, { duration: ANIMATION_DURATION });
		}, 16);
		return () => clearTimeout(timer);
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	// 언마운트 시 fallback timer 정리
	useEffect(() => {
		return () => {
			if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
		};
	}, []);

	const handleClose = useCallback(() => {
		if (isClosingRef.current) return;
		isClosingRef.current = true;
		Keyboard.dismiss();

		// 닫기 애니메이션 완료 → onClose() → 부모에서 setDrawerMounted(false) → 이 컴포넌트 언마운트
		translateY.value = withTiming(SHEET_HEIGHT, {
			duration: ANIMATION_DURATION - 50,
			easing: Easing.in(Easing.cubic),
		}, () => { runOnJS(onClose)(); });
		backdropOpacity.value = withTiming(0, { duration: ANIMATION_DURATION - 50 });

		// 애니메이션 완료 콜백이 실행되지 않을 경우 fallback
		fallbackTimerRef.current = setTimeout(() => {
			fallbackTimerRef.current = null;
			onClose();
		}, ANIMATION_DURATION + 100);
	}, [translateY, backdropOpacity, onClose]);

	// Android 뒤로가기
	useEffect(() => {
		const sub = BackHandler.addEventListener('hardwareBackPress', () => {
			handleClose();
			return true;
		});
		return () => sub.remove();
	}, [handleClose]);

	const backdropAnimStyle = useAnimatedStyle(() => ({ opacity: backdropOpacity.value }));
	const sheetAnimStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: translateY.value }],
	}));

	return (
		<View style={[StyleSheet.absoluteFill, styles.container]}>
			<TouchableWithoutFeedback onPress={handleClose}>
				<Animated.View style={[styles.backdrop, backdropAnimStyle]} />
			</TouchableWithoutFeedback>

			<Animated.View
				style={[styles.sheet, sheetAnimStyle, { paddingBottom: insets.bottom }]}
			>
				<View style={styles.handleContainer}>
					<View style={styles.handle} />
				</View>
				<FeedbackLetterContent onSuccess={onSuccess} onError={onError} />
			</Animated.View>
		</View>
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
		height: SHEET_HEIGHT,
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
