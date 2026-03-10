import type { Href } from 'expo-router';
import { Slot, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '@/src/shared/constants/colors';
import { Header, Text } from '@/src/shared/ui';
import Layout from '@/src/features/layout';

const DISMISS_THRESHOLD = 120;

export default function LikeLetterLayout() {
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const { redirectTo } = useLocalSearchParams<{ redirectTo?: string }>();
	const { height: screenHeight } = useWindowDimensions();

	const translateY = useSharedValue(0);
	const opacity = useSharedValue(1);

	const handleBack = useCallback(() => {
		if (redirectTo) {
			router.replace(decodeURIComponent(redirectTo) as Href);
		} else {
			router.back();
		}
	}, [redirectTo, router]);

	const dismissScreen = useCallback(() => {
		handleBack();
	}, [handleBack]);

	const panGesture = Gesture.Pan()
		.activeOffsetY(10)
		.failOffsetX([-20, 20])
		.onUpdate((event) => {
			if (event.translationY > 0) {
				translateY.value = event.translationY;
				opacity.value = 1 - event.translationY / screenHeight;
			}
		})
		.onEnd((event) => {
			if (event.translationY > DISMISS_THRESHOLD) {
				translateY.value = withTiming(screenHeight, { duration: 250 });
				opacity.value = withTiming(0, { duration: 250 }, () => {
					runOnJS(dismissScreen)();
				});
			} else {
				translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
				opacity.value = withSpring(1);
			}
		});

	const handleHandleTap = useCallback(() => {
		translateY.value = withTiming(screenHeight, { duration: 250 });
		opacity.value = withTiming(0, { duration: 250 }, () => {
			runOnJS(dismissScreen)();
		});
	}, [translateY, opacity, screenHeight, dismissScreen]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: translateY.value }],
		opacity: opacity.value,
	}));

	return (
		<Layout.Default style={styles.container}>
			<Animated.View style={[styles.gestureArea, animatedStyle]}>
				<GestureDetector gesture={panGesture}>
					<Pressable onPress={handleHandleTap} style={styles.handleZone}>
						<View style={styles.handleBar} />
					</Pressable>
				</GestureDetector>

				<Header.Container style={styles.headerContainer}>
					<Header.LeftContent>
						<Pressable onPress={handleBack} style={styles.arrowContainer}>
							<View style={styles.backArrow} />
						</Pressable>
					</Header.LeftContent>
					<Header.CenterContent>
						<Text size="lg" weight="bold" textColor="black">
							편지 작성하기
						</Text>
					</Header.CenterContent>
					<Header.RightContent>
						<View style={{ width: 24 }} />
					</Header.RightContent>
				</Header.Container>

				<View style={[styles.content, { paddingBottom: Math.max(0, insets.bottom - 48) }]}>
					<Slot />
				</View>
			</Animated.View>
		</Layout.Default>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.white,
	},
	gestureArea: {
		flex: 1,
	},
	handleZone: {
		alignItems: 'center',
		paddingTop: 8,
		paddingBottom: 4,
	},
	handleBar: {
		width: 40,
		height: 4,
		borderRadius: 2,
		backgroundColor: '#D1D5DB',
	},
	headerContainer: {
		alignItems: 'center',
	},
	content: {
		flex: 1,
	},
	backArrow: {
		width: 12.6,
		height: 12.6,
		top: 3,
		left: 3,
		position: 'absolute',
		borderLeftWidth: 2,
		borderLeftColor: '#000',
		borderTopWidth: 2,
		borderTopColor: '#000',
		transform: [{ rotate: '-45deg' }],
		borderRadius: 2,
	},
	arrowContainer: {
		width: 24,
		height: 24,
	},
});
